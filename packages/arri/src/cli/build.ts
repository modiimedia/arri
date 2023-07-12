import { defineCommand } from "citty";

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
    async run({ args }) {
        //
    },
});
