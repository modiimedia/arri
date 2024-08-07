import { defineBuildConfig } from "unbuild";

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
    externals: ["ofetch", "@joshmossas/ofetch", "@arrirpc/schema"],
});
