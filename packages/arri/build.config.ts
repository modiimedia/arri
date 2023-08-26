import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["./src/index.ts", "./src/codegen/index.ts"],
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
