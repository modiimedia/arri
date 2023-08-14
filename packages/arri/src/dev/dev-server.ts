/* eslint-disable @typescript-eslint/no-misused-promises */
import path from "pathe";
import { mkdirSync, existsSync } from "node:fs";
import fs from "node:fs/promises";
import { defineConfig } from "vite";
import { getAllRoutes } from "./routes";
import { watch } from "chokidar";
import type { MappedArriRoute } from "./routes";
import type { ArriConfig } from "../config";
import type { RouterMethod } from "h3";

export async function build(config: ArriConfig) {
    const rollupConfig = defineConfig({});
    console.log(rollupConfig);
}

function entryPointFromRoutes(routeList: MappedArriRoute[]): string {
    function routeSubMap(method: RouterMethod) {
        return routeList
            .filter((route) => route.content.method === method)
            .map(
                (route) =>
                    `        '${route.content.path as string}': typeof ${
                        route.importName
                    },`
            )
            .join("\n");
    }
    const result = `
import { handleRoute } from 'arri';
${routeList
    .map((route) => `import ${route.importName} from '${route.importPath}';`)
    .join("\n")}

export interface ApiDefinition {
    get: {
${routeSubMap("get")}
    },
    head: {
${routeSubMap("head")}
    },
    patch: {
${routeSubMap("patch")}
    },
    post: {
${routeSubMap("post")}
    },
    put: {
${routeSubMap("put")}
    },
    delete: {
${routeSubMap("delete")}
    },
    connect: {
${routeSubMap("connect")}
    },
    options: {
${routeSubMap("options")}
    },
    trace: {
${routeSubMap("trace")}
    },
};

${routeList.map((route) => `handleRoute(${route.importName});`).join("\n")}
`;
    return result;
}

export async function createDevServer(config: ArriConfig) {
    if (!existsSync(".arri")) {
        mkdirSync(".arri");
    }
    const watcher = watch([
        `${path.resolve(
            config.rootDir ?? "",
            config.srcDir ?? "."
        )}/**/*.{ts,js}`,
    ]);

    const entryPoint = path.resolve(".arri/main.ts");

    let isUpdating = false;

    async function handleChange() {
        if (isUpdating) {
            return;
        }
        isUpdating = true;
        const routeList = await getAllRoutes(config);
        await fs.writeFile(entryPoint, entryPointFromRoutes(routeList));
        isUpdating = false;
    }

    watcher
        .on("change", handleChange)
        .on("add", handleChange)
        .on("unlink", handleChange)
        .on("unlinkDir", handleChange);
}
