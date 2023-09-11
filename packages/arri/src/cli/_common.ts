import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { removeDisallowedChars } from "arri-codegen-utils";
import { build } from "esbuild";
import { globby } from "globby";
import path from "pathe";
import prettier from "prettier";
import { camelCase, kebabCase } from "scule";
import { type ResolvedArriConfig } from "../config";

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

export async function createRoutesModule(config: ResolvedArriConfig) {
    const routes: RpcRoute[] = [];
    const existingRoutes: string[] = [];
    await Promise.all(
        config.procedureGlobPatterns.map(async (pattern) => {
            const results = await getVirtualRouteBatch(pattern, config);
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
        path.resolve(config.rootDir, config.buildDir, "routes.js"),
        module,
    );
}

export async function getVirtualRouteBatch(
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
                .relative(path.resolve(config.rootDir, config.srcDir), file)
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

export async function transpileFiles(config: ResolvedArriConfig) {
    const outDir = path.resolve(config.rootDir, config.buildDir);
    const files = await globby(["**/*.ts"], {
        cwd: path.resolve(config.rootDir, config.srcDir),
    });
    await build({
        entryPoints: [
            ...files.map((file) =>
                path.resolve(config.rootDir, config.srcDir, file),
            ),
        ],
        outdir: outDir,
        bundle: false,
        format: "esm",
        target: "node18",
        platform: "node",
    });
}
