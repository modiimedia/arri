import { loadConfig } from "c12";
import { defineCommand, runCommand } from "citty";

import { isArriConfig } from "../config";

export default defineCommand({
    meta: {
        description: "Build the arri TS server",
    },
    args: {
        config: {
            type: "string",
            description: "Path to the arri config file",
            alias: "c",
            default: "./arri.config.ts",
        },
        skipCodegen: {
            type: "boolean",
            default: false,
        },
    },
    async run({ args, rawArgs }) {
        const { config } = await loadConfig({
            configFile: args.config,
        });
        if (!config) {
            throw new Error("Unable to find arri config");
        }
        if (!isArriConfig(config)) {
            throw new Error(`Invalid arri config at ${args.config}`);
        }
        if (!config.server) {
            throw new Error(
                "No server specified in config file. Cannot run build.",
            );
        }
        const subArgs = config.server.buildArgs ?? {};
        subArgs.skipCodegen = {
            type: "boolean",
            default: false,
        };
        const subCommand = defineCommand({
            args: subArgs,
            async run({ args }) {
                await config.server?.buildFn(args, config.generators);
            },
        });
        await runCommand(subCommand, { rawArgs });
    },
});
