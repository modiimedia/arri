import { readFileSync } from "node:fs";
import path from "node:path";
import { defineBuildConfig } from "unbuild";

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "./package.json"), {
        encoding: "utf-8",
    }),
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const deps = Object.keys(packageJson.dependencies);

export default defineBuildConfig({
    entries: ["./src/index.ts"],
    rollup: {
        emitCJS: true,
        // dts: {
        //     respectExternal: false,
        // },
    },
    outDir: "dist",
    clean: true,
    declaration: false,
    failOnWarn: false,
    externals: deps,
});
