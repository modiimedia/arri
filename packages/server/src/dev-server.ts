import { Project } from "ts-morph";

export interface RouteConfig {
    prefix?: string;
    /** an array of glob patterns */
    filePatterns: string[];
}

export interface Config {
    tsConfig: string;
    routes: RouteConfig[];
}

const project = new Project({ tsConfigFilePath: "tsconfig.base.json" });

const files = project.getSourceFiles();
console.log(files);
