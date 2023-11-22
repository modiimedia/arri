import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { isAppDefinition } from "arri-codegen-utils";
import { loadConfig } from "c12";
import { defineCommand } from "citty";
import consola, { createConsola } from "consola";
import { build } from "esbuild";
import path from "pathe";
import prettier from "prettier";
import { defaultConfig, type ResolvedArriConfig } from "../config";
import {
    OUT_CODEGEN,
    createAppWithRoutesModule,
    GEN_CODEGEN_FILE,
    GEN_SERVER_ENTRY_FILE,
    OUT_SERVER_ENTRY,
    setupWorkingDir,
    transpileFiles,
    GEN_APP_FILE,
    esbuildCustomResolve,
} from "./_common";

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
        await startBuild(config, args.skipCodegen);
    },
});

const logger = createConsola().withTag("arri");

async function startBuild(config: ResolvedArriConfig, skipCodeGen = false) {
    logger.log("Bundling server....");
    await setupWorkingDir(config);
    await Promise.all([
        createBuildEntryModule(config),
        createBuildCodegenModule(config),
        createAppWithRoutesModule(config),
        transpileFiles(config),
    ]);
    await bundleFiles(config);
    logger.log("Finished bundling");
    const clientCount = config.clientGenerators.length;
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
                config.clientGenerators.map((plugin) => plugin.generator(def)),
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

async function bundleFiles(config: ResolvedArriConfig, allowCodegen = true) {
    if (allowCodegen) {
        await build({
            ...config.esbuild,
            entryPoints: [
                path.resolve(config.rootDir, config.buildDir, GEN_CODEGEN_FILE),
            ],
            platform: config.esbuild.platform ?? "node",
            target: config.esbuild.target ?? "node20",
            packages: "external",
            bundle: true,
            format: "esm",
            sourcemap: false,
            minifyWhitespace: false,
            banner: {
                js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);`,
            },
            outfile: path.resolve(config.rootDir, ".output", OUT_CODEGEN),
        });
    }
    let buildEntry = path.resolve(
        config.rootDir,
        config.buildDir,
        GEN_SERVER_ENTRY_FILE,
    );

    if (config.buildEntry) {
        const parts = config.buildEntry.split(".");
        parts.pop();
        const mergedParts = `${parts.join(".")}.js`;
        buildEntry = path.resolve(config.rootDir, config.buildDir, mergedParts);
    }
    const appEntry = path.relative(
        buildEntry,
        path.resolve(config.rootDir, config.buildDir, GEN_APP_FILE),
    );
    consola.info(`Using build entry from ${buildEntry}`);
    await build({
        ...config.esbuild,
        entryPoints: [buildEntry],
        platform: config.esbuild.platform ?? "node",
        target: config.esbuild.target ?? "node20",
        bundle: true,
        packages: "external",
        format: "esm",
        sourcemap: true,
        minifyWhitespace: true,
        banner: {
            js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);`,
        },
        plugins: [
            esbuildCustomResolve([["virtual:arri/app", appEntry]], config),
        ],
        allowOverwrite: true,
        outfile: path.resolve(config.rootDir, ".output", OUT_SERVER_ENTRY),
    });
}

async function createBuildEntryModule(config: ResolvedArriConfig) {
    if (config.buildEntry) {
        return;
    }
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualEntry = `import { toNodeListener } from 'arri';
import { listen } from 'listhen';
import app from './${GEN_APP_FILE}';

void listen(toNodeListener(app.h3App), {
    port: process.env.PORT ?? ${config.port},
    public: true,
});`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, GEN_SERVER_ENTRY_FILE),
        virtualEntry,
    );
}

async function createBuildCodegenModule(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualModule = await prettier.format(
        `
    
    import { writeFileSync } from 'node:fs';
    import path from 'pathe';
    import app from './${GEN_APP_FILE}';

    const __dirname = new URL(".", import.meta.url).pathname;
    const def = app.getAppDefinition();
    writeFileSync(
        path.resolve(__dirname, "../.output", "__definition.json"),
        JSON.stringify(def),
    );`,
        { tabWidth: 4, parser: "typescript" },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, GEN_CODEGEN_FILE),
        virtualModule,
    );
}
