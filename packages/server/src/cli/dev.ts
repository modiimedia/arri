import { defineCommand } from "citty";
import { devLogger } from "../logger";

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
    run({ args }) {
        devLogger.log(args.config);
    },
});
