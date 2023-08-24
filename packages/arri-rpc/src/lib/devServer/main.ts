import path from "pathe";
import { globby } from "globby";
import { loadConfig } from "c12";
import * as prettier from "prettier";
import chokidar from "chokidar";
import fs from "node:fs/promises";
import type { Hookable } from "hookable";
import type { RequestListener } from "node:http";
import type { ApplicationDefinition } from "../codegen/utils";
import { type TObject } from "@sinclair/typebox";
import { camelCase, kebabCase, pascalCase } from "scule";
import { type RpcMethod, isRpc } from "../arri-rpc";
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
    servicesDir?: string;
    /** Default is ["\*\*\/*.rpc.ts"] */
    servicesGlobPatterns?: string[];
}

export type FullArriConfig = Required<ArriConfig>;

export interface ArriServiceConfig {
    prefix?: string;
    globPatterns: string[];
}

export interface ArriHooks {
    close: (app: Arri) => Promise<void> | void;
    restart: (app: Arri) => Promise<void> | void;
}

const getRpcMetaFromPath = (
    config: ArriConfig,
    filePath: string
): { serviceName: string; name: string; httpPath: string } | undefined => {
    // experimenting
    console.log(filePath);
    const rootPath = path.resolve(
        config.baseDir ?? "",
        config.servicesDir ?? ""
    );
    console.log(rootPath);
    const resolvedFilepath = path.resolve(rootPath, filePath);
    const cleanedFiledPath = resolvedFilepath.replace(rootPath, "");
    console.log(cleanedFiledPath);
    // end experiments
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

interface RpcBlockResult extends ApplicationDefinition {
    procedures: Record<
        string,
        {
            method: RpcMethod;
            path: string;
        }
    >;
}

async function getRpcBlock(
    arriConfig: FullArriConfig,
    globPattern: string
): Promise<RpcBlockResult> {
    const target = `${arriConfig.servicesDir}/${globPattern}`;
    const paths = await globby(target);
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
    const result: RpcBlockResult = {
        procedures: {},
        services: {},
        models: {},
    };
    rpcs.forEach((rpc) => {
        if (rpc.status === "fulfilled") {
            const data =
                typeof rpc.value.data === "object" ? rpc.value.data : {};
            if (!isRpc(data)) {
                return;
            }
            const meta = getRpcMetaFromPath(arriConfig, rpc.value.path);
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
            const rpcDef = {
                path: meta.httpPath,
                method: data.method,
                params: paramName,
                response: responseName,
            };
            result.procedures[
                meta.httpPath
                    .split("/")
                    .map((val) => camelCase(val))
                    .join(" ")
                    .trim()
                    .split(" ")
                    .join(".")
            ] = {
                method: data.method,
                path: path.relative(
                    `${arriConfig.baseDir}/.arri`,
                    rpc.value.path
                ),
            };
            result.services[meta.serviceName][meta.name] = rpcDef;
        }
    });
    return result;
}

async function getApplicationDefinition(
    config: FullArriConfig
): Promise<RpcBlockResult> {
    const results: RpcBlockResult = {
        procedures: {},
        services: {},
        models: {},
    };
    await Promise.allSettled(
        config.servicesGlobPatterns.map((pattern) =>
            getRpcBlock(config, pattern).then((block) => {
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
                Object.keys(block.procedures).forEach((key) => {
                    results.procedures[key] = block.procedures[key];
                });
            })
        )
    );
    return results;
}

export function JsonStringifyWithSymbols(object: any, clean?: boolean): string {
    return JSON.stringify(object, (_, value) => {
        if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            value !== null
        ) {
            const props = [
                ...Object.getOwnPropertyNames(value),
                ...Object.getOwnPropertySymbols(value),
            ];
            const replacement: Record<string, any> = {};
            for (const k of props) {
                if (typeof k === "symbol") {
                    replacement[`Symbol:${Symbol.keyFor(k) ?? ""}`] = value[k];
                } else {
                    replacement[k] = value[k];
                }
            }
            return replacement;
        }
        return value;
    });
}

let writeCount = 0;
async function generateApplicationDefinition(config: FullArriConfig) {
    const { services, procedures, models } = await getApplicationDefinition(
        config
    );
    await fs.writeFile(
        path.resolve(`${config.baseDir ?? ""}`, ".arri/definition.ts"),
        prettier.format(
            `
            export interface ClientDefinition {
                ${Object.keys(procedures)
                    .map((key) => {
                        const filepath = procedures[key].path.split(".");
                        filepath.pop();
                        return `"${key}": {
                            method: "${procedures[key].method}";
                            path: typeof import("${filepath.join(
                                "."
                            )}").default;
                            }`;
                    })
                    .join("\n")}
            }
            export const ApplicationDefinition = ${JSON.stringify({
                services,
                models,
            })} as const`,
            {
                tabWidth: 4,
                parser: "typescript",
            }
        )
    );
    writeCount++;
    console.log("WRITE_COUNT:", writeCount);
}

async function main(config: FullArriConfig) {
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
    servicesDir: "./packages/arri-rpc/src/lib/services",
    servicesGlobPatterns: ["**/*.rpc.ts"],
});
