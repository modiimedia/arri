import { defineBuildConfig } from "unbuild";
import fs from "node:fs";
import path from "pathe";

const packageJson = fs.readFileSync(
    path.resolve(__dirname, "package.json"),
) as any;

const deps = Object.keys(packageJson.dependencies).map((key) => key);

export default defineBuildConfig({
    entries: [
        { input: "./src/_index.ts", name: "index" },
        { input: "./src/codegen/_index.ts", name: "codegen" },
        { input: "./src/cli/_index.ts", name: "cli" },
    ],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: true,
        },
    },
    outDir: "dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
    externals: deps,
});
