import path from "pathe";
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["./src/index"],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    alias: {
        arri: path.resolve(__dirname, "../arri/src/index.ts"),
    },
    outDir: "../../dist/packages/arri-client/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
});
