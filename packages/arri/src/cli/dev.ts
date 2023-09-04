import fs from "node:fs/promises";
import { loadConfig } from "c12";
import chokidar from "chokidar";
import { defineCommand } from "citty";
import { createConsola } from "consola";
import { build } from "esbuild";
import { listenAndWatch } from "listhen";
import { ofetch } from "ofetch";
import path from "pathe";
import { DEV_DEFINITION_ENDPOINT } from "../app";
import { isApplicationDef } from "../codegen/utils";
import { type ResolvedArriConfig } from "../config";
import { createRoutesModule, setupWorkingDir, transpileFiles } from "./_common";

const logger = createConsola({
    fancy: true,
}).withTag("arri");

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
        const config = await loadConfig({
            configFile: path.resolve(args.config),
        });
        if (!config) {
            throw new Error("Unable to find config");
        }
        await startDevServer(config.config as ResolvedArriConfig);
    },
});

const startListener = (config: ResolvedArriConfig, showQr = false) =>
    listenAndWatch(path.resolve(config.rootDir, config.buildDir, "bundle.js"), {
        public: true,
        port: config.port,
        logger,
        qr: showQr,
    });

async function bundleFiles(config: ResolvedArriConfig) {
    await build({
        entryPoints: [
            path.resolve(config.rootDir, config.buildDir, "entry.js"),
        ],
        outfile: path.resolve(config.rootDir, config.buildDir, "bundle.js"),
        bundle: true,
        target: "node18",
        platform: "node",
    });
}

async function startDevServer(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    let fileWatcher: chokidar.FSWatcher | undefined;
    await Promise.all([
        createRoutesModule(config),
        createEntryModule(config),
        transpileFiles(config),
    ]);
    await bundleFiles(config);
    await startListener(config, true);
    setTimeout(async () => {
        await generateClients(config);
    }, 1000);

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
                    await transpileFiles(config);
                    await bundleFiles(config);
                    bundleCreated = true;
                } catch (err) {
                    logger.error("ERROR", err);
                    // logger.error(err);
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
        if (!isApplicationDef(result)) {
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
    app.registerRpc(route.id, route.route);
}

export default app.getH3Instance();`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "entry.js"),
        virtualEntry,
    );
}
