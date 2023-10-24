import { type ClientGenerator } from "arri-codegen-utils";
import { type BuildOptions } from "esbuild";

/* eslint-disable spaced-comment */
export interface ArriConfig {
    port: number;
    entry: string;
    rootDir?: string;
    srcDir?: string;
    procedureDir?: string | false;
    /**
     * this defaults to ["***\/*\*.rpc.ts"]
     */
    procedureGlobPatterns?: string[];
    clientGenerators?: Array<ClientGenerator<any>>;
    buildDir?: string;
    esbuild?: Omit<
        BuildOptions,
        "outfile" | "outdir" | "entryNames" | "entryPoints"
    >;
}

export function isArriConfig(input: unknown): input is ArriConfig {
    if (typeof input !== "object" || !input) {
        return false;
    }
    return (
        "port" in input &&
        typeof input.port === "number" &&
        !Number.isNaN(input.port) &&
        "entry" in input &&
        typeof input.entry === "string"
    );
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
        Array.isArray(input.clientGenerators) &&
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
    procedureDir: "procedures",
    procedureGlobPatterns: ["**/*.rpc.ts"],
    clientGenerators: [],
    buildDir: ".arri",
    esbuild: {},
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
        clientGenerators:
            config.clientGenerators ?? defaultConfig.clientGenerators,
        buildDir: config.buildDir ?? defaultConfig.buildDir,
        esbuild: config.esbuild ?? defaultConfig.esbuild,
    };
}
