import { mkdist } from "mkdist";

export interface RouteConfig {
    /** an array of glob patterns */
    prefix?: string;
    filePatterns: string[];
}

export interface Config {
    rootDir?: string;
    srcDir?: string;
    tsConfig: string;
    routes: RouteConfig[];
}

async function createServer() {
    await mkdist({ distDir: ".arri", rootDir: ".", pattern: ["./**/*.ts"] });
}
