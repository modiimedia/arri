import glob from "globby";
import { loadConfig } from "c12";
import { ArriRoute } from "../routes";

export const getAllRoutes = async (filePatterns: string[]) => {
    const files = await glob(filePatterns, { onlyFiles: true, absolute: true });
    const routes: ArriRoute[] = [];
    await Promise.all(
        files.map(async (file) => {
            const route = await loadConfig({ configFile: file });
            routes.push(route.config as any);
        })
    );
    return routes;
};
