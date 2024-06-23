import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineCommand } from "citty";
import path from "pathe";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const version = defineCommand({
    meta: {
        name: "Version",
        description: "Get the current arri CLI version",
    },
    run() {
        const packageJson = JSON.parse(
            readFileSync(path.resolve(__dirname, "../package.json"), {
                encoding: "utf8",
            }),
        );
        console.info(`${packageJson.version}`);
    },
});

export default version;
