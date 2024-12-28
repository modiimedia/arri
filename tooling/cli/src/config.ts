import { type Generator } from '@arrirpc/codegen-utils';
import { ArgsDef } from 'citty';

import { isServerConfig, ServerConfig } from './serverConfigs/_config';

export interface ArriConfig<
    TDevArgs extends ArgsDef | undefined = any,
    TBuildArgs extends ArgsDef | undefined = any,
> {
    server?: ServerConfig<TDevArgs, TBuildArgs>;
    generators: Generator<any>[];
}

export function isArriConfig(input: unknown): input is ArriConfig {
    if (typeof input !== 'object' || input === null) {
        return false;
    }
    if ('server' in input) {
        if (
            typeof input.server !== 'undefined' &&
            !isServerConfig(input.server)
        ) {
            return false;
        }
    }
    return 'generators' in input && Array.isArray(input.generators);
}

export function defineConfig(config: ArriConfig): ArriConfig {
    return config;
}
