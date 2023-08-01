export interface RouteConfig {
    /** an array of glob patterns */
    prefix?: string;
    filePatterns: string[];
}

export interface ArriConfig {
    rootDir?: string;
    srcDir?: string;
    tsConfig: string;
    routes: RouteConfig[];
}

export function defineArriConfig(config: ArriConfig) {
    return config;
}
