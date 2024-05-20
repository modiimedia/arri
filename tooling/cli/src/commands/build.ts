import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";

import { isAppDefinition } from "@arrirpc/codegen-utils";
import { loadConfig } from "c12";
import { defineCommand } from "citty";
import { build } from "esbuild";
import { replace } from "esbuild-plugin-replace";
import path from "pathe";
import prettier from "prettier";

import {
    createAppWithRoutesModule,
    GEN_APP_FILE,
    logger,
    OUT_APP_FILE,
    OUT_CODEGEN,
    OUT_SERVER_ENTRY,
    setupWorkingDir,
} from "../common";
import { defaultConfig, type ResolvedArriConfig } from "../config";

export default defineCommand({
    args: {
        config: {
            type: "string",
            description: "Path to the arri config file",
            alias: "c",
            default: "./arri.config.ts",
        },
        skipCodegen: {
            type: "boolean",
            default: false,
        },
    },
    async run({ args }) {
        const { config } = await loadConfig({
            configFile: args.config,
            defaultConfig,
        });
        if (!config) {
            throw new Error("Unable to find arri config");
        }
        const appEntry = path.resolve(
            config.rootDir,
            config.srcDir,
            config.entry,
        );
        if (!existsSync(appEntry)) {
            throw new Error(`Unable to find entry at ${appEntry}`);
        }
        await startBuild(config, args.skipCodegen);
    },
});

async function startBuild(config: ResolvedArriConfig, skipCodeGen = false) {
    logger.log("Bundling server....");
    const appEntry = path.resolve(config.rootDir, config.srcDir, config.entry);
    if (
        !existsSync(path.resolve(config.rootDir, config.srcDir, config.entry))
    ) {
        logger.error(`Unabled to find entry at ${appEntry}`);
        process.exit(1);
    }
    await setupWorkingDir(config);
    await Promise.all([
        createAppWithRoutesModule(config),
        createServerEntryFile(config),
        createCodegenEntryFile(config),
    ]);
    await bundleAppEntry(config);
    logger.log("Finished bundling");
    const clientCount = config.generators.length;
    const codegenModule = path.resolve(config.rootDir, ".output", OUT_CODEGEN);
    if (!skipCodeGen) {
        logger.log("Generating Arri app definition (__definition.json)");
        execSync(`node ${codegenModule}`, { env: process.env });
        const defJson = path.resolve(
            config.rootDir,
            ".output",
            "__definition.json",
        );
        const def = JSON.parse(readFileSync(defJson, { encoding: "utf-8" }));
        if (isAppDefinition(def) && clientCount > 0) {
            logger.log(`Generating ${clientCount} clients`);
            await Promise.all(
                config.generators.map((plugin) => plugin.generator(def)),
            );
            logger.log(`${clientCount} clients generated`);
        } else {
            logger.warn(
                "No client generators specified. Skipping client codegen.",
            );
        }
    } else {
        logger.log("Skipping codegen");
    }
    logger.log("Cleaning up files");
    await fs.rm(codegenModule);
    logger.success(
        `Build finished! You can start your server by running "node .output/${OUT_SERVER_ENTRY}"`,
    );
}

async function bundleAppEntry(
    config: ResolvedArriConfig,
    _allowCodegen = true,
) {
    const appEntry = path.resolve(
        config.rootDir,
        config.buildDir,
        GEN_APP_FILE,
    );
    await build({
        ...config.esbuild,
        entryPoints: [appEntry],
        platform: config.esbuild.platform ?? "node",
        target: config.esbuild.target ?? "node20",
        bundle: true,
        packages: "external",
        format: "esm",
        sourcemap: config.esbuild.sourcemap ?? true,
        minify: config.esbuild.minify ?? true,
        banner: {
            js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);`,
        },
        allowOverwrite: true,
        outfile: path.resolve(config.rootDir, ".output", OUT_APP_FILE),
    });
}

async function createServerEntryFile(config: ResolvedArriConfig) {
    if (config.serverEntry) {
        const buildEntry = path.resolve(
            config.rootDir,
            config.srcDir,
            config.serverEntry,
        );
        await build({
            ...config.esbuild,
            entryPoints: [buildEntry],
            platform: config.esbuild.platform ?? "node",
            target: config.esbuild.target ?? "node20",
            bundle: false,
            packages: "external",
            format: "esm",
            sourcemap: true,
            minifyWhitespace: true,
            banner: {
                js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);`,
            },
            plugins: [replace({ "virtual:arri/app": "./app.mjs" })],
            allowOverwrite: true,
            outfile: path.resolve(config.rootDir, ".output", OUT_SERVER_ENTRY),
        });
        return;
    }
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split(".");
    appImportParts.pop();
    let httpsString = ``;
    if (config.https === true) {
        httpsString = `https: true,`;
    } else if (typeof config.https === "object") {
        httpsString = `https: { cert: '${config.https.cert}', key: '${
            config.https.key
        }', passphrase: ${
            config.https.passphrase
                ? `'${config.https.passphrase}'`
                : "undefined"
        }},`;
    }
    const virtualEntry = `import { toNodeListener } from 'arri';
import { listen } from '@joshmossas/listhen';
import app from './${OUT_APP_FILE}';

void listen(toNodeListener(app.h3App), {
    port: process.env.PORT ?? ${config.port},
    public: true,
    ws: {
        resolve(info) {
            if (app.h3App.websocket?.resolve) {
                return app.h3App.websocket.resolve(info);
            }
            return app.h3App.websocket?.hooks ?? app.h3App.handler?.__websocket__ ?? {};
        }
    },
    http2: ${config.http2 ?? false},
    ${httpsString}
});`;
    await fs.writeFile(
        path.resolve(config.rootDir, ".output", OUT_SERVER_ENTRY),
        virtualEntry,
    );
}

async function createCodegenEntryFile(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualModule = await prettier.format(
        `
    import { writeFileSync } from 'node:fs';
    import path from 'pathe';
    import app from './${OUT_APP_FILE}';

    const __dirname = new URL(".", import.meta.url).pathname;
    const def = app.getAppDefinition();
    writeFileSync(
        path.resolve(__dirname, "../.output", "__definition.json"),
        JSON.stringify(def),
    );`,
        { tabWidth: 4, parser: "typescript" },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, ".output", OUT_CODEGEN),
        virtualModule,
    );
}
