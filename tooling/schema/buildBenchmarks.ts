import { rmSync } from "node:fs";

import { buildSync } from "esbuild";
import path from "pathe";

try {
    rmSync(path.resolve(__dirname, "benchmarks/dist"));
} catch (_) {
    /* empty */
}

buildSync({
    entryPoints: ["benchmark/src/_index.ts"],
    outdir: "benchmark/dist",
    target: "node20",
    platform: "node",
    bundle: true,
});
