import path from "pathe";
import { globby } from "globby";
import { loadConfig } from "c12";
import * as prettier from "prettier";
import chokidar from "chokidar";
import fs from "node:fs/promises";
import type { Hookable } from "hookable";
import type { RequestListener } from "node:http";
import type { ApplicationDefinition } from "../codegen/dartCodegen";
import type { TObject } from "@sinclair/typebox";
import { kebabCase, pascalCase } from "scule";
import { isRpc } from "../arri-rpc";
import { existsSync } from "node:fs";

export interface Arri {
    rootDir: string;
    isDev: boolean;
    isReady: boolean;
    hooks: Hookable<ArriHooks>;
    config: ArriConfig;
}

export interface ArriConfig {
    baseDir?: string;
    srcDir: string;
    services: ArriServiceConfig[];
}

export interface ArriServiceConfig {
    prefix?: string;
    globPatterns: string[];
}

export interface ArriHooks {
    close: (app: Arri) => Promise<void> | void;
    restart: (app: Arri) => Promise<void> | void;
}

const getRpcMetaFromPath = (
    filePath: string
): { serviceName: string; name: string; httpPath: string } | undefined => {
    const parts = filePath.split("/");
    if (parts.length < 2) {
        return undefined;
    }
    const serviceName = parts[parts.length - 2];
    const fileName = parts[parts.length - 1];
    const fileNameParts = fileName.split(".");
    if (!fileNameParts.length) {
        return undefined;
    }
    const rpcName = fileNameParts[0];
    return {
        name: rpcName,
        serviceName,
        httpPath: `/${kebabCase(serviceName)}/${kebabCase(`${rpcName}`)}`,
    };
};

async function getRpcBlock(
    config: ArriServiceConfig
): Promise<ApplicationDefinition> {
    const paths = await globby(config.globPatterns);
    const rpcs = await Promise.allSettled(
        paths.map(async (filePath) => ({
            path: filePath,
            data: (
                await loadConfig({
                    configFile: filePath,
                })
            ).config,
        }))
    );
    const result: ApplicationDefinition = {
        services: {},
        models: {},
    };
    rpcs.forEach((rpc) => {
        if (rpc.status === "fulfilled") {
            if (rpc.value.path.includes("blah")) {
                console.log(rpc.value.data, rpc.value.data?.params);
            }
            const data =
                typeof rpc.value.data === "object" ? rpc.value.data : {};
            if (!isRpc(data)) {
                return;
            }
            const meta = getRpcMetaFromPath(rpc.value.path);
            if (!meta) {
                return;
            }
            if (!result.services[meta.serviceName]) {
                result.services[meta.serviceName] = {};
            }
            let paramName = "";
            let responseName = "";
            if (data.params) {
                paramName =
                    (data.params as TObject).$id ??
                    pascalCase(`${meta.serviceName}_${meta.name}_params`);
                result.models[paramName] = data.params;
            }
            if (data.response) {
                responseName =
                    (data.response as TObject).$id ??
                    pascalCase(`${meta.serviceName}_${meta.name}_response`);
                result.models[responseName] = data.response;
            }
            result.services[meta.serviceName][meta.name] = {
                path: meta.httpPath,
                method: data.method,
                params: paramName,
                response: responseName,
            };
        }
    });
    return result;
}

async function getApplicationDefinition(
    config: ArriConfig
): Promise<ApplicationDefinition> {
    const results: ApplicationDefinition = {
        services: {},
        models: {},
    };
    await Promise.allSettled(
        config.services.map((serviceConfig) =>
            getRpcBlock(serviceConfig).then((block) => {
                Object.keys(block.services).forEach((service) => {
                    Object.keys(block.services[service]).forEach((rpc) => {
                        if (!results.services[service]) {
                            results.services[service] = {};
                        }
                        results.services[service][rpc] =
                            block.services[service][rpc];
                    });
                });
                Object.keys(block.models).forEach((model) => {
                    results.models[model] = block.models[model];
                });
            })
        )
    );
    return results;
}

let writeCount = 0;
async function generateApplicationDefinition(config: ArriConfig) {
    const def = await getApplicationDefinition(config);
    await fs.writeFile(
        path.resolve(`${config.baseDir ?? ""}`, ".arri/definition.ts"),
        prettier.format(`export default ${JSON.stringify(def)}`, {
            tabWidth: 4,
            parser: "typescript",
        })
    );
    writeCount++;
    console.log("WRITE_COUNT:", writeCount);
}

async function main(config: ArriConfig) {
    await setupArriDir(config);
    let currentHandler: RequestListener | undefined;
    const loadingHandler: RequestListener = (_, __) => {
        // todo
    };
    let fileWatcher: chokidar.FSWatcher | undefined;
    const serverHandler: RequestListener = (req, res) => {
        if (currentHandler) {
            currentHandler(req, res);
            return;
        }
        loadingHandler(req, res);
    };
    // const listener = await listen(serverHandler, {
    //     showURL: true,
    //     name: "Arri",
    // });
    await generateApplicationDefinition(config);
    let loadingMessage = "Arri is starting...";
    async function load(isRestart: boolean, reason?: string) {
        try {
            loadingMessage = `${reason ? reason + ". " : ""}${
                isRestart ? "Restarting" : "Starting"
            } arri dev server...`;
            currentHandler = undefined;
            if (fileWatcher) {
                await fileWatcher.close();
            }
            const dirToWatch = path.resolve(
                config.baseDir ?? "",
                config.srcDir
            );
            console.log("Dir to watch", dirToWatch);
            fileWatcher = chokidar.watch(path.resolve(dirToWatch), {
                ignoreInitial: true,
            });
            fileWatcher.on("all", async (_event, file) => {
                console.log(`FILE CHANGE`, _event, file);
                await generateApplicationDefinition(config);
            });
        } catch (err) {}
    }
    await load(false);
}

async function setupArriDir(config: ArriConfig) {
    const arriDir = path.resolve(config.baseDir ?? ".", ".arri");
    if (existsSync(arriDir)) {
        await fs.rm(arriDir, { recursive: true, force: true });
    }
    await fs.mkdir(arriDir);
}

void main({
    baseDir: "packages/arri-rpc",
    srcDir: "src",
    services: [{ globPatterns: ["./packages/**/*.rpc.ts"] }],
});
