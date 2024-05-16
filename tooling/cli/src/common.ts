import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { removeDisallowedChars } from "@arrirpc/codegen-utils";
import { createConsola } from "consola";
import { type globby } from "globby";
import path from "pathe";
import prettier from "prettier";
import { camelCase, kebabCase } from "scule";
import { type ResolvedArriConfig } from "./config";

export const logger = createConsola().withTag("arri");

export const GEN_APP_FILE = "__arri_app.ts";
export const GEN_SERVER_ENTRY_FILE = "__arri_server.ts";
export const OUT_APP_FILE = "app.mjs";
export const OUT_SERVER_ENTRY = "server.mjs";
export const OUT_CODEGEN = "codegen.mjs";

export const VIRTUAL_MODULES = {
    APP: "virtual:arri/app",
} as const;

export async function setupWorkingDir(config: ResolvedArriConfig) {
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

interface RpcRoute {
    name: string;
    importName: string;
    importPath: string;
}

export async function createAppWithRoutesModule(config: ResolvedArriConfig) {
    const glob = await import("globby");
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.buildDir), appModule)
        .split(".");
    appImportParts.pop();
    const routes: RpcRoute[] = [];
    const existingRoutes: string[] = [];
    await Promise.all(
        config.procedureGlobPatterns.map(async (pattern) => {
            const results = await getFsRouteBatch(glob.globby, pattern, config);
            for (const result of results) {
                if (!existingRoutes.includes(result.name)) {
                    routes.push(result);
                    existingRoutes.push(result.name);
                }
            }
        }),
    );
    routes.sort((a, b) => (a.name < b.name ? -1 : 1));
    const module = await prettier.format(
        `import sourceMapSupport from 'source-map-support';
        sourceMapSupport.install();
        import app from '${appImportParts.join(".")}';
        ${routes
            .map(
                (route) =>
                    `import ${route.importName} from '${route.importPath}';`,
            )
            .join("\n")}
        const routes: {id: string; route: any}[] = [${routes
            .map(
                (route) =>
                    `{ id: '${route.name}', route: ${route.importName} }`,
            )
            .join(",\n")}
        ];
        for(const route of routes) {
            if(route.route.transport === 'http') {
                app.rpc({
                    name: route.id,
                    ...route.route,
                });
                continue;
            }
            if (route.route.transport === 'ws') {
                app.wsRpc({
                    name: route.id,
                    ...route.route,
                });
                continue;
            }
        }
        export default app`,
        { parser: "typescript", tabWidth: 4 },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, GEN_APP_FILE),
        module,
    );
}

export async function getFsRouteBatch(
    glob: typeof globby,
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
    const files = await glob(target, {
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
            importParts.push("js");
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
    config: ResolvedArriConfig,
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
        fileNameParts[0]!,
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

export function isInsideDir(dir: string, parentDir: string) {
    if (path.resolve(dir).startsWith(path.resolve(parentDir))) {
        return true;
    }
    return false;
}