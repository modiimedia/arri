import { existsSync } from "node:fs";
import fs from "node:fs/promises";

import { isAppDefinition } from "@arrirpc/codegen-utils";
import { listenAndWatch } from "@joshmossas/listhen";
// import watcher from "@parcel/watcher";
// import type ParcelWatcher from "@parcel/watcher";
import { loadConfig } from "c12";
import { type FSWatcher } from "chokidar";
import { defineCommand } from "citty";
import * as esbuild from "esbuild";
import { ofetch } from "ofetch";
import path from "pathe";

import {
    createAppWithRoutesModule,
    GEN_APP_FILE,
    GEN_SERVER_ENTRY_FILE,
    isInsideDir,
    logger,
    OUT_APP_FILE,
    OUT_SERVER_ENTRY,
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
        process.env.ARRI_DEV_MODE = "true";
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

const startListener = (config: ResolvedArriConfig, showQr = false) =>
    listenAndWatch(path.resolve(config.rootDir, ".output", OUT_SERVER_ENTRY), {
        public: true,
        port: config.port,
        logger,
        qr: showQr,
        https: config.https,
        http2: config.http2,
        ws: true,
    });

async function bundleFilesContext(config: ResolvedArriConfig) {
    const serverContent = `import app from './${OUT_APP_FILE}';

export default app.h3App;`;
    await fs.writeFile(
        path.resolve(config.rootDir, ".output", OUT_SERVER_ENTRY),
        serverContent,
    );
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

async function startDevServer(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    const watcher = await import("chokidar");
    let fileWatcher: FSWatcher | undefined;
    await Promise.all([
        createEntryModule(config),
        createAppWithRoutesModule(config),
    ]);
    const context = await bundleFilesContext(config);
    await context.rebuild();
    const listener = await startListener(config, true);
    setTimeout(async () => {
        await generateClients(config);
    }, 1000);
    const cleanExit = async () => {
        process.exit();
    };
    process.on("exit", async () => {
        await Promise.allSettled([
            listener.close(),
            fileWatcher?.close(),
            context.dispose(),
        ]);
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
            let bundleCreated = false;
            try {
                logger.log(
                    "Change detected. Bundling files and restarting server....",
                );
                await context.rebuild();
                bundleCreated = true;
            } catch (err) {
                logger.error("ERROR", err);
                bundleCreated = false;
            }
            if (bundleCreated && config.generators.length) {
                setTimeout(async () => {
                    await generateClients(config);
                    bundleCreated = false;
                }, 1000);
            }
        });
    }
    await load(false);
}

export interface ArriServiceConfig {
    globPatterns: string[];
}

async function generateClients(config: ResolvedArriConfig) {
    try {
        const protocol =
            config.https === true || typeof config.https === "object"
                ? "https"
                : "http";
        if (protocol === "https") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }
        const result = await ofetch(
            `${protocol}://127.0.0.1:${config.port}${DEV_DEFINITION_ENDPOINT}`,
        );
        if (!isAppDefinition(result)) {
            return;
        }
        logger.log(`Generating client code...`);
        const clientCount = config.generators.length;
        await Promise.allSettled(
            config.generators.map((generator) =>
                generator.generator(result, true),
            ),
        );
        logger.success(
            `Generated ${clientCount} client${clientCount === 1 ? "" : "s"}`,
        );
    } catch (err) {
        logger.error(err);
    }
}

async function createEntryModule(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualEntry = `import { toNodeListener } from 'h3';
import app from './${GEN_APP_FILE}';

export default app.h3App;`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, GEN_SERVER_ENTRY_FILE),
        virtualEntry,
    );
}
