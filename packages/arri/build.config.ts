import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: [
        "./src/index.ts",
        { input: "./src/codegen/index.ts", name: "codegen" },
        { input: "./src/cli/index.ts", name: "cli" },
    ],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    outDir: "../../dist/packages/arri/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
});
