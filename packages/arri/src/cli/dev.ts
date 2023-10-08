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
    createRoutesModule,
    setupWorkingDir,
    transpileFilesContext,
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
    listenAndWatch(path.resolve(config.rootDir, ".output", "bundle.js"), {
        public: true,
        port: config.port,
        logger,
        qr: showQr,
    });

async function bundleFilesContext(config: ResolvedArriConfig) {
    return await esbuild.context({
        ...config.esbuild,
        entryPoints: [
            path.resolve(config.rootDir, config.buildDir, "entry.js"),
        ],
        outfile: path.resolve(config.rootDir, ".output", "bundle.js"),
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
    await Promise.all([createRoutesModule(config), createEntryModule(config)]);
    const transpileFiles = await transpileFilesContext(config);
    const bundleFiles = await bundleFilesContext(config);
    await transpileFiles.rebuild();
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
            transpileFiles.dispose(),
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
            fileWatcher.on("all", async (_event, file) => {
                await createRoutesModule(config);
                let bundleCreated = false;
                try {
                    logger.log(
                        "Change detected. Bundling files and restarting server....",
                    );
                    await transpileFiles.rebuild();
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
        const result = await ofetch(
            `http://127.0.0.1:${config.port}${DEV_DEFINITION_ENDPOINT}`,
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
        logger.log(
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
import routes from './routes';
import app from './${appImportParts.join(".")}';

for (const route of routes) {
    app.rpc({
        name: route.id,
        method: route.route.method,
        path: route.route.path,
        params: route.route.params,
        response: route.route.response,
        handler: route.route.handler,
        postHandler: route.route.postHandler,
    });
}

export default app.h3App;`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "entry.js"),
        virtualEntry,
    );
}
