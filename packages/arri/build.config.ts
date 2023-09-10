import { defineBuildConfig } from "unbuild";
import path from "pathe";

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
    alias: {
        "arri-codegen-utils": path.resolve(
            __dirname,
            "../../packages/arri-codegen-utils/src/index.ts",
        ),
        "arri-validate": path.resolve(
            __dirname,
            "../../packages/arri-validate/src/index.ts",
        ),
        "json-schema-to-jtd": path.resolve(
            __dirname,
            "../../packages/json-schema-to-jtd/src/index.ts",
        ),
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
