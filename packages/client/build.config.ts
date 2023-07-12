import { defineBuildConfig } from "unbuild";
import path from "pathe";

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
    outDir: "../../dist/packages/client/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
});
