import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { loadConfig } from "c12";
import chokidar from "chokidar";
import { defineCommand } from "citty";
import { globby } from "globby";
import path from "pathe";
import * as prettier from "prettier";
import { camelCase, kebabCase } from "scule";
import { removeDisallowedChars } from "../codegen/utils";
import { type ArriConfig, type ResolvedArriConfig } from "../config";

interface RpcRoute {
    name: string;
    importName: string;
    importPath: string;
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

async function virtualRoutesModule(config: ResolvedArriConfig) {
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

async function virtualEntryDev(config: ResolvedArriConfig) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.buildDir), appModule)
        .split(".");
    appImportParts.pop();
    const virtualEntry = `import { toNodeListener } from 'h3';
import { listen } from 'listhen';
import routes from './routes';
import app from './${appImportParts.join(".")}';

console.log(routes);
for (const route of routes) {
    app.registerRpc(route.id, route.route);
}
export default toNodeListener(app.getH3Instance());`;
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, "entry.ts"),
        virtualEntry,
    );
}

async function main(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    let fileWatcher: chokidar.FSWatcher | undefined;
    await Promise.all([virtualRoutesModule(config), virtualEntryDev(config)]);

    async function load(isRestart: boolean, reason?: string) {
        try {
            if (fileWatcher) {
                await fileWatcher.close();
            }
            const dirToWatch = path.resolve(
                config.rootDir ?? "",
                config.srcDir,
            );
            console.log("Dir to watch", dirToWatch);
            fileWatcher = chokidar.watch(path.resolve(dirToWatch), {
                ignoreInitial: true,
            });
            fileWatcher.on("all", async (_event, file) => {
                await virtualRoutesModule(config);
            });
        } catch (err) {}
    }
    await load(false);
}

export interface ArriServiceConfig {
    globPatterns: string[];
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

async function setupWorkingDir(config: ArriConfig) {
    const arriDir = path.resolve(config.rootDir ?? ".", ".arri");
    if (existsSync(arriDir)) {
        await fs.rm(arriDir, { recursive: true, force: true });
    }
    await fs.mkdir(arriDir);
}

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
        const config = await loadConfig({
            configFile: path.resolve(args.config),
        });
        console.log("CONFIG", config.config);
        await main(config.config as ResolvedArriConfig);
    },
});
