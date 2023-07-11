import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: [
        "./src/index",
        {
            input: "./src/cli/index",
            name: "cli",
            outDir: "./dist",
        },
    ],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    declaration: true,
    failOnWarn: false,
});
