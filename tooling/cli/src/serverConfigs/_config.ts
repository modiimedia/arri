import { Generator } from "@arrirpc/codegen-utils";
import { ArgsDef, ParsedArgs } from "citty";

export interface ServerConfig<
    TDevArgs extends ArgsDef | undefined = any,
    TBuildArgs extends ArgsDef | undefined = any,
> {
    devArgs: TDevArgs;
    buildArgs: TBuildArgs;
    devFn: (
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        args: TDevArgs extends ArgsDef ? ParsedArgs<TDevArgs> : {},
        generators: Generator<any>[],
    ) => any;
    buildFn: (
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        args: (TBuildArgs extends ArgsDef ? ParsedArgs<TBuildArgs> : {}) & {
            skipCodegen?: boolean;
        },
        generators: Generator<any>[],
    ) => any;
}

export function isServerConfig(
    input: unknown,
): input is ServerConfig<any, any> {
    if (typeof input !== "object" || input === null) {
        return false;
    }
    return (
        "devFn" in input &&
        typeof input.devFn === "function" &&
        "buildFn" in input &&
        typeof input.buildFn === "function"
    );
}

export function defineServerConfig<
    DevArgs extends ArgsDef | undefined = any,
    BuildArgs extends ArgsDef | undefined = any,
>(config: ServerConfig<DevArgs, BuildArgs>) {
    return config;
}
