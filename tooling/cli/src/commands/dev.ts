import { existsSync } from "node:fs";

import { AppDefinition } from "@arrirpc/codegen-utils";
import { listen, Listener } from "@joshmossas/listhen";
// import watcher from "@parcel/watcher";
// import type ParcelWatcher from "@parcel/watcher";
import { loadConfig } from "c12";
import { type FSWatcher } from "chokidar";
import { defineCommand } from "citty";
import * as esbuild from "esbuild";
import {
    App,
    dynamicEventHandler,
    fromNodeMiddleware,
    toNodeListener,
} from "h3";
import path from "pathe";

import {
    createAppWithRoutesModule,
    GEN_APP_FILE,
    isInsideDir,
    logger,
    OUT_APP_FILE,
    setupWorkingDir,
} from "../common";
import { isResolvedArriConfig, type ResolvedArriConfig } from "../config";

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/__definition`;

export default defineCommand({
    meta: {
        name: "dev",
        description: "Start the arri dev server",
    },
    args: {
        config: {
            type: "string",
            description: "Path to the arri config file",
            alias: "c",
            default: "./arri.config.ts",
        },
    },
    async run({ args }) {
        const { config } = await loadConfig({
            configFile: path.resolve(args.config),
        });
        if (!isResolvedArriConfig(config)) {
            throw new Error("Unable to find config");
        }
        const appEntry = path.resolve(
            config.rootDir,
            config.srcDir,
            config.entry,
        );
        if (!existsSync(appEntry)) {
            throw new Error(`Unable to find entry at ${appEntry}`);
        }
        await startDevServer(config);
    },
});

async function bundleFilesContext(config: ResolvedArriConfig) {
    return await esbuild.context({
        ...config.esbuild,
        entryPoints: [
            path.resolve(config.rootDir, config.buildDir, GEN_APP_FILE),
        ],
        outfile: path.resolve(config.rootDir, ".output", OUT_APP_FILE),
        format: "esm",
        bundle: true,
        packages: "external",
        sourcemap: config.esbuild.sourcemap ?? true,
        target: config.esbuild.target ?? "node20",
        platform: config.esbuild.platform ?? "node",
    });
}

type ArriApp = {
    h3App: App;
    getAppDefinition(): AppDefinition;
};

async function createDevServer(config: ResolvedArriConfig) {
    const h3 = await import("h3");
    const app = h3.createApp();
    const dynamicHandler = dynamicEventHandler(
        () => "<div>initializing server...</div>",
    );
    app.use(dynamicHandler);
    let ws: App["websocket"] | undefined;
    const listener = await listen(toNodeListener(app), {
        port: config.port,
        https: config.https,
        http2: config.http2,
        public: true,
        ws: {
            resolve(info) {
                if (ws?.resolve) {
                    return ws.resolve(info);
                }
                return {};
            },
        },
    });
    let secondaryListener: Listener | undefined;
    if (config.devServer.httpWithHttps) {
        secondaryListener = await listen(toNodeListener(app), {
            port: config.devServer.httpWithHttpsPort ?? config.port + 1,
            https: false,
            http2: config.http2,
            public: true,
            ws: {
                resolve(info) {
                    if (ws?.resolve) {
                        return ws.resolve(info);
                    }
                    return {};
                },
            },
            qr: false,
            showURL: false,
        });
        logger.info(
            `Serving unencrypted traffic from port ${secondaryListener.address.port}`,
        );
    }
    async function reload(): Promise<AppDefinition> {
        const appEntry = (
            await import(
                path.resolve(
                    config.rootDir,
                    ".output",
                    `${OUT_APP_FILE}?version=${Date.now()}`,
                )
            )
        ).default as ArriApp;
        dynamicHandler.set(fromNodeMiddleware(appEntry.h3App.handler as any));
        ws = appEntry.h3App.websocket;
        return appEntry.getAppDefinition();
    }
    await reload();
    return {
        h3App: app,
        listener,
        secondaryListener,
        reload,
        ws,
    };
}

async function startDevServer(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    const watcher = await import("chokidar");
    let fileWatcher: FSWatcher | undefined;
    await createAppWithRoutesModule(config);
    const context = await bundleFilesContext(config);
    await context.rebuild();
    const devServer = await createDevServer(config);
    let appDef = await devServer.reload();
    let appDefStr = JSON.stringify(appDef);
    if (config.generators.length) {
        logger.info(`Running generators...`);
        await generateClientsFromDefinition(appDef, config);
    } else {
        logger.warn(`No generators specified in config. Skipping codegen.`);
    }
    const cleanExit = async () => {
        process.exit();
    };
    process.on("exit", async () => {
        await Promise.allSettled([fileWatcher?.close(), context.dispose()]);
    });
    process.on("SIGINT", cleanExit);
    process.on("SIGTERM", cleanExit);
    async function load(_isRestart: boolean, _reason?: string) {
        if (fileWatcher) {
            await fileWatcher.close();
        }
        const srcDir = path.resolve(config.rootDir ?? "", config.srcDir);
        const dirsToWatch = [srcDir];
        if (config.esbuild.alias) {
            for (const key of Object.keys(config.esbuild.alias)) {
                const alias = config.esbuild.alias[key];
                if (alias) {
                    if (!isInsideDir(alias, srcDir)) {
                        dirsToWatch.push(alias);
                    }
                }
            }
        }
        if (config.devServer.additionalWatchDirs?.length) {
            for (const dir of config.devServer.additionalWatchDirs) {
                dirsToWatch.push(dir);
            }
        }
        const buildDir = path.resolve(config.rootDir, config.buildDir);
        const outDir = path.resolve(config.rootDir, ".output");
        fileWatcher = watcher.watch(dirsToWatch, {
            ignoreInitial: true,
            ignored: [
                buildDir,
                outDir,
                "**/.output",
                "**/dist/**",
                "**/node_modules/**",
                "**/.git/**",
            ],
        });
        fileWatcher.on("all", async (eventName, _path) => {
            if (eventName === "addDir" || eventName === "add") {
                return;
            }
            await createAppWithRoutesModule(config);
            try {
                const reloadStart = new Date().getTime();
                logger.log(
                    "Change detected. Bundling files and restarting server....",
                );
                await context.rebuild();
                const newAppDef = await devServer.reload();
                const newAppDefStr = JSON.stringify(newAppDef);
                logger.log(
                    `Server restarted in ${new Date().getTime() - reloadStart}ms`,
                );
                if (config.generators.length && newAppDefStr !== appDefStr) {
                    logger.info(
                        `App Definition updated. Regenerating clients...`,
                    );
                    await generateClientsFromDefinition(newAppDef, config);
                    appDef = newAppDef;
                    appDefStr = newAppDefStr;
                }
            } catch (err) {
                logger.error("ERROR", err);
            }
        });
    }
    await load(false);
}

export interface ArriServiceConfig {
    globPatterns: string[];
}

async function generateClientsFromDefinition(
    appDef: AppDefinition,
    config: ResolvedArriConfig,
) {
    const startTime = new Date().getTime();
    try {
        const clientCount = config.generators.length;
        await Promise.allSettled(
            config.generators.map((generator) =>
                generator.generator(appDef, true),
            ),
        );
        logger.success(
            `Generated ${clientCount} client${clientCount === 1 ? "" : "s"} in ${new Date().getTime() - startTime}ms`,
        );
    } catch (err) {
        logger.error(err);
    }
}
