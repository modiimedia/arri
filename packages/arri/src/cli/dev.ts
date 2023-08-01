import { defineCommand } from "citty";
import { devLogger } from "../logger";
import { loadConfig } from "c12";
import { createDevServer } from "../dev/dev-server";

export default defineCommand({
    meta: {
        name: "dev",
    },
    args: {
        config: {
            type: "string",
            description: "path to a config file",
            default: "./arri.config.ts",
            alias: "c",
            valueHint: "./arri.config.ts",
        },
    },
    async run({ args }) {
        devLogger.info(`loading config from ${args.config}`);
        const { config } = await loadConfig({ configFile: args.config });
        devLogger.info(`config loaded`);
        devLogger.info(`starting dev server`);
        return createDevServer(config as any);
    },
});
