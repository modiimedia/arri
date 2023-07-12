import { defineBuildConfig } from "unbuild";
import path from "pathe";

export default defineBuildConfig({
    entries: [
        "./src/index",
        {
            input: "./src/cli/index",
            name: "cli",
        },
    ],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    alias: {
        "arri-client": path.resolve(__dirname, "../arri-client/src/index.ts"),
    },
    outDir: "../../dist/packages/arri/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
});
