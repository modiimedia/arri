import { defineCommand } from "citty";
import { devLogger } from "../logger";

export default defineCommand({
    meta: {
        name: "build",
    },
    args: {
        config: {
            type: "string",
            alias: "c",
            default: "./arri.config.ts",
            valueHint: "./arri.config.ts",
        },
    },
    run({ args }) {
        devLogger.log("Running build");
        devLogger.log(args.config);
    },
});
