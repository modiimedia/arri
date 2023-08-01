import glob from "globby";
import { loadConfig } from "c12";
import type { RouterMethod } from "h3";
import path from "pathe";
import { isArriRoute, type ArriRoute } from "../routes";
import type { ArriConfig } from "../config";
import { camelCase } from "scule";

export interface MappedArriRoute {
    importName: string;
    importPath: string;
    content: ArriRoute<any, RouterMethod, any, any>;
}

export const getAllRoutesFromGlobs = async (
    filePatterns: string[],
    prefix?: string
) => {
    const files = await glob(filePatterns, { onlyFiles: true, absolute: true });
    const routes: MappedArriRoute[] = [];
    await Promise.all(
        files.map(async (file) => {
            const { config: route } = await loadConfig({ configFile: file });
            if (!isArriRoute(route)) {
                return;
            }

            console.log(file);
            routes.push({
                importName: camelCase(
                    `${
                        route.path
                            .replaceAll("/", "_")
                            .replaceAll(":", "_") as string
                    }_${route.method}_route`
                ),
                importPath: path.relative(".", file),
                content: {
                    ...route,
                    path: `${prefix ?? ""}${route.path}`,
                },
            });
        })
    );
    return routes;
};

export const getAllRoutes = async (config: ArriConfig) => {
    const routes: MappedArriRoute[] = [];
    await Promise.all(
        config.routes.map(async (routeConfig) => {
            const result = await getAllRoutesFromGlobs(
                routeConfig.filePatterns
            );
            for (const route of result) {
                routes.push(route);
            }
        })
    );
    routes.sort((a, b) => (a.content.path < b.content.path ? -1 : 1));
    return routes;
};
