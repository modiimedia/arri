import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["./src/index"],
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
    externals: ["ofetch", "arri-validate"],
});
