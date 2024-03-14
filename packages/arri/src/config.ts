import { type ClientGenerator } from "arri-codegen-utils";
import { type BuildOptions } from "esbuild";

/* eslint-disable spaced-comment */
export interface ArriConfig {
    port?: number;
    entry?: string;
    serverEntry?: string;
    rootDir?: string;
    srcDir?: string;
    procedureDir?: string | false;
    /**
     * this defaults to ["***\/*\*.rpc.ts"]
     */
    procedureGlobPatterns?: string[];
    generators?: Array<ClientGenerator<any>>;
    buildDir?: string;
    esbuild?: Omit<
        BuildOptions,
        "outfile" | "outdir" | "entryNames" | "entryPoints"
    >;
    https?:
        | {
              cert: string;
              key: string;
              passphrase?: string;
          }
        | boolean;
    http2?: boolean;
}

export function isArriConfig(input: unknown): input is ArriConfig {
    if (typeof input !== "object" || input === null) {
        return false;
    }
    if ("generators" in input) {
        if (!Array.isArray(input)) {
            return false;
        }
    }
    if ("port" in input && typeof input.port !== "number") {
        return false;
    }
    if (Number.isNaN((input as any).port)) {
        return false;
    }
    if ("entry" in input && typeof input.entry !== "string") {
        return false;
    }
    return true;
}
export function isResolvedArriConfig(
    input: unknown,
): input is ResolvedArriConfig {
    if (!isArriConfig(input)) {
        return false;
    }
    return (
        typeof input.rootDir === "string" &&
        typeof input.srcDir === "string" &&
        (typeof input.procedureDir === "string" ||
            typeof input.procedureDir === "boolean") &&
        Array.isArray(input.procedureGlobPatterns) &&
        Array.isArray(input.generators) &&
        typeof input.buildDir === "string" &&
        typeof input.esbuild === "object" &&
        input.esbuild &&
        !Array.isArray(input.esbuild)
    );
}

export type ResolvedArriConfig = Required<ArriConfig>;

export const defaultConfig: Required<ArriConfig> = {
    port: 3000,
    rootDir: ".",
    srcDir: "src",
    entry: "app.ts",
    serverEntry: "",
    procedureDir: "procedures",
    procedureGlobPatterns: ["**/*.rpc.ts"],
    generators: [],
    buildDir: ".arri",
    esbuild: {},
    https: false,
    http2: false,
};

export function defineConfig(config: ArriConfig): ResolvedArriConfig {
    return {
        port: config.port ?? defaultConfig.port,
        rootDir: config.rootDir ?? defaultConfig.rootDir,
        srcDir: config.srcDir ?? defaultConfig.srcDir,
        entry: config.entry ?? defaultConfig.entry,
        procedureDir: config.procedureDir ?? defaultConfig.procedureDir,
        procedureGlobPatterns:
            config.procedureGlobPatterns ?? defaultConfig.procedureGlobPatterns,
        generators: config.generators ?? defaultConfig.generators,
        buildDir: config.buildDir ?? defaultConfig.buildDir,
        esbuild: config.esbuild ?? defaultConfig.esbuild,
        serverEntry: config.serverEntry ?? "",
        https: config.https ?? false,
        http2: config.http2 ?? false,
    };
}
