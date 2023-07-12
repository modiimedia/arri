import path from "pathe";
import { defineConfig } from "rollup";
import { watch } from "chokidar";
import type { ApiDefinition } from "@arri/client";

export interface RouteConfig {
    /** an array of glob patterns */
    prefix?: string;
    filePatterns: string[];
}

export interface Config {
    rootDir?: string;
    srcDir?: string;
    tsConfig: string;
    routes: RouteConfig[];
}

export async function build(config: Config) {
    const rollupConfig = defineConfig({});
    console.log(rollupConfig);
}

export async function createDevServer(config: Config) {
    const routeMap: ApiDefinition = {
        get: {},
        head: {},
        patch: {},
        post: {},
        put: {},
        delete: {},
        connect: {},
        options: {},
        trace: {},
    };

    console.log(routeMap);

    const watcher = watch([
        `${path.resolve(
            config.rootDir ?? "",
            config.srcDir ?? "."
        )}/**/*.{ts,js}`,
    ]);

    watcher
        .on("change", (path) => {
            console.log(path, "CHANGED");
        })
        .on("add", () => {
            // todo
        })
        .on("unlink", () => {
            // todo
        })
        .on("unlinkDir", () => {
            // todo
        });

    const rollupConfig = defineConfig({});
    console.log(rollupConfig);
}
