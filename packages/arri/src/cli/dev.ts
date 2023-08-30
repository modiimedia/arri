import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { loadConfig } from "c12";
import chokidar from "chokidar";
import { defineCommand } from "citty";
import { createConsola } from "consola";
import { build } from "esbuild";
import { globby } from "globby";
import { listenAndWatch } from "listhen";
import { ofetch } from "ofetch";
import path from "pathe";
import * as prettier from "prettier";
import { camelCase, kebabCase } from "scule";
import { DEV_DEFINITION_ENDPOINT } from "../app";
import {
    isApplicationDefinition,
    removeDisallowedChars,
} from "../codegen/utils";
import { type ArriConfig, type ResolvedArriConfig } from "../config";

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
        await main(config.config as ResolvedArriConfig);
    },
});

async function bundleFiles(config: ResolvedArriConfig) {
    const outDir = path.resolve(config.rootDir, ".output");
    await build({
        entryPoints: [
            path.resolve(config.rootDir, config.buildDir, "entry.ts"),
        ],
        outdir: outDir,
        bundle: true,
        target: "node18",
        platform: "node",
    });
}

async function main(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    let fileWatcher: chokidar.FSWatcher | undefined;
    await Promise.all([createRoutesModule(config), createEntryModule(config)]);
    await bundleFiles(config);
    await listenAndWatch(path.resolve(config.rootDir, ".output", "entry.js"), {
        public: true,
        port: config.port,
        logger,
    });

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
            fileWatcher = chokidar.watch(path.resolve(dirToWatch), {
                ignoreInitial: true,
            });
            fileWatcher.on("all", async (_event, file) => {
                await createRoutesModule(config);
                await bundleFiles(config);
                if (config.clientGenerators.length) {
                    setTimeout(async () => {
                        await generateClients(config);
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
        if (!isApplicationDefinition(result)) {
            return;
        }
        logger.info("Regenerating clients");
        await Promise.all(
            config.clientGenerators.map((generator) =>
                generator.generator(result),
            ),
        );
    } catch (err) {
        console.error(err);
    }
}

async function setupWorkingDir(config: ResolvedArriConfig) {
    const arriDir = path.resolve(config.rootDir, config.buildDir);
    const outDir = path.resolve(config.rootDir, ".output");
    if (existsSync(arriDir)) {
        await fs.rm(arriDir, { recursive: true, force: true });
    }
    if (existsSync(outDir)) {
        await fs.rm(outDir, { recursive: true, force: true });
    }
    await fs.mkdir(arriDir);
    await fs.mkdir(outDir);
}

async function createEntryModule(config: ResolvedArriConfig) {
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

export default app.getH3Instance();`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "entry.ts"),
        virtualEntry,
    );
}

interface RpcRoute {
    name: string;
    importName: string;
    importPath: string;
}

async function createRoutesModule(config: ResolvedArriConfig) {
    const routes: RpcRoute[] = [];
    await Promise.all(
        config.procedureGlobPatterns.map(async (pattern) => {
            const results = await getVirtualRouteBatch(pattern, config);
            for (const result of results) {
                routes.push(result);
            }
        }),
    );
    routes.sort((a, b) => (a.name < b.name ? -1 : 1));
    const module = await prettier.format(
        `${routes
            .map(
                (route) =>
                    `import ${route.importName} from '${route.importPath}';`,
            )
            .join("\n")}
        const routes = [${routes
            .map(
                (route) =>
                    `{ id: '${route.name}', route: ${route.importName} }`,
            )
            .join(",\n")}
        ];
        export default routes`,
        { parser: "typescript", tabWidth: 4 },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "routes.ts"),
        module,
    );
}

async function getVirtualRouteBatch(
    globPattern: string,
    config: ResolvedArriConfig,
): Promise<RpcRoute[]> {
    if (!config.procedureDir) {
        return [];
    }
    const target =
        `${config.rootDir}/${config.srcDir}/${config.procedureDir}/${globPattern}`
            .split("//")
            .join("/")
            .split("//")
            .join("/");
    const files = await globby(target, {
        onlyFiles: true,
    });
    const routes: RpcRoute[] = [];
    for (const file of files) {
        const meta = getRpcMetaFromPath(config, file);
        if (meta) {
            const importParts = path
                .relative(path.resolve(config.rootDir, config.buildDir), file)
                .split(".");
            importParts.pop();
            routes.push({
                name: meta.id,
                importName: camelCase(meta.id.split(".").join("_")),
                importPath: `./${importParts.join(".")}`,
            });
        }
    }
    return routes;
}

const disallowedNameChars = "~`!@#$%^&*()-+=[]{}\\|:;\"'<>,./";

export const getRpcMetaFromPath = (
    config: ArriConfig,
    filePath: string,
): { id: string; httpPath: string } | undefined => {
    if (!config.procedureDir) {
        return undefined;
    }
    const resolvedFilePath = filePath.split("./").join("/");
    const parts = resolvedFilePath.split("/");
    const reversedParts = [...parts].reverse();
    const nameParts: string[] = [];

    for (const part of reversedParts) {
        if (part === config.procedureDir) {
            break;
        }
        nameParts.push(part);
    }
    const fileName = nameParts.reverse().pop() ?? "";
    const serviceParts = nameParts
        .filter((part) => part.trim().length > 0)
        .map((part) => removeDisallowedChars(part, disallowedNameChars));
    const fileNameParts = fileName.split(".");
    if (!fileNameParts.length) {
        return undefined;
    }
    const rpcName = removeDisallowedChars(
        fileNameParts[0],
        disallowedNameChars,
    );
    const httpParts = [
        ...serviceParts.map((part) => kebabCase(part)),
        kebabCase(rpcName),
    ];
    return {
        id: [...serviceParts, rpcName].join("."),
        httpPath: `/${httpParts.join("/")}`,
    };
};
