import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { consola } from "consola";

async function main() {
    execSync(`nx run-many -t build-server`, {
        stdio: "inherit",
    });
    const tsOutput = fs.readFileSync(
        path.resolve(__dirname, "./ts/.output/__definition.json"),
        "utf8",
    );
    const goOutput = fs.readFileSync(
        path.resolve(__dirname, "./go/.output/__definition.json"),
        "utf8",
    );
    if (tsOutput !== goOutput) {
        throw new Error(
            "App definition from Go server doesn't match TS server",
        );
    }
    consola.success("App definitions match");
}

main();
