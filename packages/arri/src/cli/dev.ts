import fs from "node:fs/promises";
import { isAppDefinition } from "arri-codegen-utils";
import { loadConfig } from "c12";
import chokidar from "chokidar";
import { defineCommand } from "citty";
import { createConsola } from "consola";
import * as esbuild from "esbuild";
import { listenAndWatch } from "listhen";
import { ofetch } from "ofetch";
import path from "pathe";
import { DEV_DEFINITION_ENDPOINT } from "../app";
import { isResolvedArriConfig, type ResolvedArriConfig } from "../config";
import {
    createAppWithRoutesModule,
    GEN_APP_FILE,
    GEN_SERVER_ENTRY_FILE,
    OUT_APP_FILE,
    OUT_SERVER_ENTRY,
    setupWorkingDir,
    transpileFiles,
} from "./_common";

const logger = createConsola().withTag("arri");

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
        sourcemap: true,
        target: "node18",
        platform: "node",
        packages: "external",
    });
}

async function startDevServer(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    let fileWatcher: chokidar.FSWatcher | undefined;
    await Promise.all([
        createEntryModule(config),
        createAppWithRoutesModule(config),
        transpileFiles(config),
    ]);
    const bundleFiles = await bundleFilesContext(config);
    await bundleFiles.rebuild();
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
            bundleFiles.dispose(),
        ]);
    });
    process.on("SIGINT", cleanExit);
    process.on("SIGTERM", cleanExit);
    async function load(isRestart: boolean, reason?: string) {
        try {
            if (fileWatcher) {
                await fileWatcher.close();
            }
            const dirToWatch = path.resolve(
                config.rootDir ?? "",
                config.srcDir,
            );
            const buildDir = path.resolve(config.rootDir, config.buildDir);
            const outDir = path.resolve(config.rootDir, ".output");
            fileWatcher = chokidar.watch([path.resolve(dirToWatch)], {
                ignored: [buildDir, outDir],
                ignoreInitial: true,
            });
            fileWatcher.on("all", async (event, file) => {
                if (event === "add" || event === "addDir") {
                    return;
                }
                await createAppWithRoutesModule(config);
                let bundleCreated = false;
                try {
                    logger.log(
                        "Change detected. Bundling files and restarting server....",
                    );
                    await transpileFiles(config);
                    await bundleFiles.rebuild();
                    bundleCreated = true;
                } catch (err) {
                    logger.error("ERROR", err);
                    bundleCreated = false;
                }
                if (bundleCreated && config.clientGenerators.length) {
                    setTimeout(async () => {
                        await generateClients(config);
                        bundleCreated = false;
                    }, 1000);
                }
            });
        } catch (err) {}
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
        const clientCount = config.clientGenerators.length;
        await Promise.all(
            config.clientGenerators.map((generator) =>
                generator.generator(result),
            ),
        );
        logger.success(
            `Generated ${clientCount} client${clientCount === 1 ? "" : "s"}`,
        );
    } catch (err) {
        console.error(err);
    }
}

async function createEntryModule(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualEntry = `import { toNodeListener } from 'h3';
import { listen } from 'listhen';
import app from './${GEN_APP_FILE}';

export default app.h3App;`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, GEN_SERVER_ENTRY_FILE),
        virtualEntry,
    );
}
