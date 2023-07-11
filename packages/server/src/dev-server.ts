import path from "pathe";
import { defineConfig } from "rollup";
import { watch } from "chokidar";

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

async function build(config: Config) {
    const rollupConfig = defineConfig({});
}

async function createDevServer(config: Config) {
    const routeMap = {
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
}
