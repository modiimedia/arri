import { type ClientGenerator } from "./codegen/plugin";

/* eslint-disable spaced-comment */
export interface ArriConfig {
    entry: string;
    rootDir?: string;
    srcDir?: string;
    procedureDir?: string | false;
    /**
     * this defaults to ["***\/*\*.rpc.ts"]
     */
    procedureGlobPatterns?: string[];
    clientGenerators?: Array<ClientGenerator<any>>;
}

export type ResolvedArriConfig = Required<ArriConfig>;

const defaultArriConfig: Required<ArriConfig> = {
    rootDir: ".",
    srcDir: ".",
    entry: "app.ts",
    procedureDir: "procedures",
    procedureGlobPatterns: ["**/*.rpc.ts"],
    clientGenerators: [],
};

export function defineConfig(config: ArriConfig): ResolvedArriConfig {
    return {
        rootDir: config.rootDir ?? defaultArriConfig.rootDir,
        srcDir: config.srcDir ?? defaultArriConfig.srcDir,
        entry: config.entry ?? defaultArriConfig.entry,
        procedureDir: config.procedureDir ?? defaultArriConfig.procedureDir,
        procedureGlobPatterns:
            config.procedureGlobPatterns ??
            defaultArriConfig.procedureGlobPatterns,
        clientGenerators:
            config.clientGenerators ?? defaultArriConfig.clientGenerators,
    };
}
