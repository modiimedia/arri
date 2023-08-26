import { defineCommand } from "citty";
import path from "pathe";
import { globby } from "globby";
import { loadConfig } from "c12";
import * as prettier from "prettier";
import chokidar from "chokidar";
import fs from "node:fs/promises";
import { listen } from "listhen";
import {
    type ApplicationDefinition,
    type ProcedureDefinition,
    removeDisallowedChars,
} from "../codegen/utils";
import { TypeGuard } from "@sinclair/typebox";
import { camelCase, kebabCase, pascalCase } from "scule";
import { type ArriServer, type HttpMethod } from "../app";
import { existsSync } from "node:fs";
import { ErrorResponse } from "../errors";
import { isRpc } from "../procedures";
import { type ArriConfig, type ResolvedArriConfig } from "../config";
import { toNodeListener } from "h3";

export const dev = defineCommand({
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
    run: async ({ args }) => {
        const config = await loadConfig({
            configFile: path.resolve(args.config),
        });
        await main(config.config as ResolvedArriConfig);
    },
});

export interface ArriServiceConfig {
    globPatterns: string[];
}

export interface ArriHooks {
    close: (app: ArriServer) => Promise<void> | void;
    restart: (app: ArriServer) => Promise<void> | void;
}

const disallowedNameChars = "~`!@#$%^&*()-+=[]{}\\|:;\"'<>,./";

const getRpcMetaFromPath = (
    config: ArriConfig,
    filePath: string,
): { serviceName: string; name: string; httpPath: string } | undefined => {
    if (!config.procedureDir) {
        return undefined;
    }
    const resolvedFilePath = filePath
        .split(config.procedureDir.replace("./", "/") ?? "")
        .join("");
    const parts = resolvedFilePath.split("/");
    parts.shift();
    const fileName = parts.pop() ?? "";
    const serviceParts = parts
        .filter((part) => part.trim().length > 0)
        .map((part) => removeDisallowedChars(part, disallowedNameChars));
    const serviceName = serviceParts.join(".");
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
        name: rpcName,
        serviceName,
        httpPath: `/${httpParts.join("/")}`,
    };
};

interface RpcResult {
    procedures: Record<
        string,
        {
            method: HttpMethod;
            filepath: string;
            httpPath: string;
            params: ProcedureDefinition["params"];
            response: ProcedureDefinition["response"];
        }
    >;
    models: ApplicationDefinition["models"];
}

async function getRpcBlock(
    arriConfig: ResolvedArriConfig,
    globPattern: string,
): Promise<RpcResult> {
    if (!arriConfig.procedureDir) {
        return {
            models: {},
            procedures: {},
        };
    }
    const target = `${arriConfig.procedureDir}/${globPattern}`;
    const paths = await globby(target);
    const rpcs = await Promise.allSettled(
        paths.map(async (filePath) => ({
            path: filePath,
            data: (
                await loadConfig({
                    configFile: filePath,
                })
            ).config,
        })),
    );
    const result: RpcResult = {
        procedures: {},
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
            let paramOutput: ProcedureDefinition["params"];
            let responseOutput: ProcedureDefinition["response"];
            if (data?.params) {
                if (TypeGuard.TObject(data.params)) {
                    const paramName =
                        data.params.$id ??
                        pascalCase(`${meta.serviceName}_${meta.name}_params`);
                    paramOutput = paramName;
                    result.models[paramName] = data.params as any;
                }
            }
            if (data?.response) {
                if (TypeGuard.TObject(data.response)) {
                    const responseName =
                        data.response.$id ??
                        pascalCase(`${meta.serviceName}_${meta.name}_response`);
                    responseOutput = responseName;
                    result.models[responseName] = data.response as any;
                }
            }

            result.procedures[
                meta.httpPath
                    .split("/")
                    .map((val) => camelCase(val))
                    .join(" ")
                    .trim()
                    .split(" ")
                    .join(".")
            ] = {
                method: data?.method ?? "post",
                filepath: path.relative(
                    `${arriConfig.rootDir}/.arri`,
                    rpc.value.path,
                ),
                httpPath: meta.httpPath ?? "",
                params: paramOutput,
                response: responseOutput,
            };
        }
    });
    return result;
}

async function getRpcs(config: ResolvedArriConfig): Promise<RpcResult> {
    const results: RpcResult = {
        procedures: {},
        models: {},
    };
    await Promise.allSettled(
        config.procedureGlobPatterns.map((pattern) =>
            getRpcBlock(config, pattern).then((block) => {
                Object.keys(block.models).forEach((model) => {
                    results.models[model] = block.models[model];
                });
                Object.keys(block.procedures).forEach((key) => {
                    results.procedures[key] = block.procedures[key];
                });
            }),
        ),
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
async function generateApplicationDefinition(config: ResolvedArriConfig) {
    const { procedures, models } = await getRpcs(config);
    const mappedProcedures: ApplicationDefinition["procedures"] = {};
    Object.keys(procedures).forEach((key) => {
        const rpc = procedures[key];
        const value: ProcedureDefinition = {
            path: rpc.httpPath,
            method: rpc.method,
            params: rpc.params,
            response: rpc.response,
        };
        mappedProcedures[key] = value;
    });
    const output: ApplicationDefinition = {
        schemaVersion: "0.0.1",
        description: "",
        procedures: mappedProcedures,
        models,
        errors: ErrorResponse,
    };
    const importParts: string[] = [];
    const interfaceFieldParts: string[] = [];
    const endpointParts: string[] = [];
    Object.keys(procedures).forEach((key) => {
        const filepath = procedures[key].filepath.split(".");
        filepath.pop();
        const importName = camelCase(key.split(".").join("_"));
        importParts.push(`import ${importName} from '${filepath.join(".")}';`);
        interfaceFieldParts.push(`"${key}": {
            method: "${procedures[key].method}";
            path: typeof ${importName};
        }`);
        endpointParts.push(`"${procedures[key].httpPath}": ${importName},`);
    });
    await fs.writeFile(
        path.resolve(`${config.rootDir}`, ".arri/definition.ts"),
        await prettier.format(
            `${importParts.join("\n")}

            export interface ClientDefinition {
                ${interfaceFieldParts.join("\n")}
            }
            export const endpoints = {
                ${endpointParts.join("\n")}
            } as const
            export const ApplicationDefinition = ${JSON.stringify(
                output,
            )} as const`,
            {
                tabWidth: 4,
                parser: "typescript",
            },
        ),
    );
    writeCount++;
    console.log("WRITE_COUNT:", writeCount);
}

async function generateApplicationEntry(config: ResolvedArriConfig) {
    const entry = path.resolve(config.rootDir, config.srcDir, config.entry);
    let entryContent = await fs.readFile(entry, { encoding: "utf-8" });
    entryContent = entryContent.replace(
        "initializeProcedures(",
        "registerProcedures(",
    );
    console.log(entryContent);
}

async function main(config: ResolvedArriConfig) {
    await setupWorkingDir(config);
    let fileWatcher: chokidar.FSWatcher | undefined;
    await generateApplicationDefinition(config);
    await generateApplicationEntry(config);
    const app = await loadConfig({
        configFile: path.resolve(config.rootDir, config.srcDir, config.entry),
    });
    const arri = app.config as ArriServer;
    const listener = await listen(toNodeListener(arri.app), {
        showURL: true,
    });
    await listener.showURL();
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
                console.log(`FILE CHANGE`, _event, file);
                await generateApplicationDefinition(config);
            });
        } catch (err) {}
    }
    await load(false);
}

async function setupWorkingDir(config: ArriConfig) {
    const arriDir = path.resolve(config.rootDir ?? ".", ".arri");
    if (existsSync(arriDir)) {
        await fs.rm(arriDir, { recursive: true, force: true });
    }
    await fs.mkdir(arriDir);
}
