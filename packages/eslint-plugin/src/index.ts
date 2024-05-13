import { type ESLint } from "eslint";
import noAnonymousObjects from "./rules/no-anonymous-objects";

export const meta: ESLint.Plugin["meta"] = {
    name: "@arrirpc",
};

export const configs: ESLint.Plugin["configs"] = {
    recommended: {
        plugins: ["@arrirpc"],
        rules: {
            "@arrirpc/no-anonymous-objects": "error",
        },
    },
};

export const rules: ESLint.Plugin["rules"] = {
    "no-anonymous-objects": noAnonymousObjects,
};

export default { meta, configs, rules };
