import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { loadConfig } from "c12";
import { defineCommand } from "citty";
import { createConsola } from "consola";
import { build } from "esbuild";
import path from "pathe";
import prettier from "prettier";
import { isApplicationDef } from "../codegen/utils";
import { defaultConfig, type ResolvedArriConfig } from "../config";
import { createRoutesModule, setupWorkingDir } from "./_common";

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
        await startBuild(config);
    },
});

const logger = createConsola({
    fancy: true,
}).withTag("arri");

async function startBuild(config: ResolvedArriConfig) {
    logger.log("Bundling server....");
    await setupWorkingDir(config);
    await Promise.all([
        createRoutesModule(config),
        createBuildEntryModule(config),
        createBuildCodegenModule(config),
    ]);
    await bundleFiles(config);
    logger.log("Finished bundling");
    const clientCount = config.clientGenerators.length;
    const codegenModule = path.resolve(config.rootDir, ".output", "codegen.js");
    if (clientCount > 0) {
        logger.log("Generating clients");

        execSync(`node ${codegenModule}`);
        const defJson = path.resolve(
            config.rootDir,
            ".output",
            "__definition.json",
        );
        const def = JSON.parse(readFileSync(defJson, { encoding: "utf-8" }));
        if (isApplicationDef(def)) {
            await Promise.all(
                config.clientGenerators.map((plugin) => plugin.generator(def)),
            );
        }
        logger.log(`${clientCount} clients generated`);
    } else {
        logger.log("No client generators specified. Skipping codegen.");
    }
    logger.log("Cleaning up files");
    await fs.rm(codegenModule);
    logger.log(
        `Build finished! You can start your server by running "node .output/server.js"`,
    );
}

async function bundleFiles(config: ResolvedArriConfig) {
    await build({
        ...config.esbuild,

        entryPoints: [
            path.resolve(config.rootDir, config.buildDir, "server.ts"),
            path.resolve(config.rootDir, config.buildDir, "codegen.ts"),
        ],
        platform: config.esbuild.platform ?? "node",
        target: config.esbuild.target ?? "node18",

        bundle: true,
        outdir: path.resolve(config.rootDir, ".output"),
    });
}

async function createBuildEntryModule(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.buildDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualEntry = `import { toNodeListener } from 'h3';
import { listen } from 'listhen';
import routes from './routes';
import app from './${appImportParts.join(".")}';

for (const route of routes) {
    app.registerRpc(route.id, route.route);
}

void listen(toNodeListener(app.getH3Instance()), {
    port: process.env.PORT ?? ${config.port},
});`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "server.ts"),
        virtualEntry,
    );
}

async function createBuildCodegenModule(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.buildDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualModule = await prettier.format(
        `
    import { writeFileSync } from 'node:fs';
    import path from 'pathe';
    import app from './${appImportParts.join(".")}';

    const def = app.getAppDefinition();
    writeFileSync(
        path.resolve(__dirname, "__definition.json"),
        JSON.stringify(def),
    );`,
        { tabWidth: 4, parser: "typescript" },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "codegen.ts"),
        virtualModule,
    );
}
