import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: [
        { input: "./src/_index.ts", name: "index" },
        { input: "./src/codegen/_index.ts", name: "codegen" },
        { input: "./src/cli/_index.ts", name: "cli" },
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
    externals: [
        "esbuild",
        "listhen",
        "h3",
        "@sinclair/typebox",
        "ofetch",
        "citty",
        "consola",
        "prettier",
        "pathe",
        "jiti",
    ],
});
