import { readFileSync } from "node:fs";
import path from "pathe";
import { defineBuildConfig } from "unbuild";

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "./package.json"), {
        encoding: "utf-8",
    }),
);

const deps = Object.keys(packageJson.dependencies);

export default defineBuildConfig({
    entries: [{ input: "./src/_index", name: "index" }],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: true,
        },
    },

    outDir: "dist",
    clean: true,
    declaration: true,
    failOnWarn: true,
    externals: deps,
});
