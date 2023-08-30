import { type ApplicationDef } from "./utils";

export interface ClientGenerator<
    TOptions extends Record<string, any> | undefined,
> {
    generator: (def: ApplicationDef) => any;
    options: TOptions;
}

export type ClientGeneratorPlugin<
    TOptions extends Record<string, any> | undefined,
> = (options: TOptions) => ClientGenerator<TOptions>;

export function defineClientGeneratorPlugin<
    TOptions extends Record<string, any> | undefined,
>(plugin: ClientGeneratorPlugin<TOptions>) {
    return plugin;
}
