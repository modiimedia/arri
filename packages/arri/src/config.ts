import { type BuildOptions } from "esbuild";
import { type ClientGenerator } from "./codegen/plugin";

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

export type ResolvedArriConfig = Required<ArriConfig>;

export const defaultConfig: Required<ArriConfig> = {
    port: 3000,
    rootDir: ".",
    srcDir: ".",
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
