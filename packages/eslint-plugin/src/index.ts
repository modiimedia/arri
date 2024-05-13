import { type ESLint } from "eslint";
import noAnonymousDiscriminator from "./rules/no-anonymous-discriminator";
import noAnonymousEnumerator from "./rules/no-anonymous-enumerator";
import noAnonymousObject from "./rules/no-anonymous-object";
import noAnonymousRecursive from "./rules/no-anonymous-recursive";

export const meta: ESLint.Plugin["meta"] = {
    name: "@arrirpc",
};

export const configs: ESLint.Plugin["configs"] = {
    recommended: {
        plugins: ["@arrirpc"],
        rules: {
            "@arrirpc/no-anonymous-object": "error",
            "@arrirpc/no-anonymous-recursive": "error",
            "@arrirpc/no-anonymous-discriminator": "error",
            "@arrirpc/no-anonymous-enumerator": "error",
        },
    },
};

export const rules: ESLint.Plugin["rules"] = {
    "no-anonymous-object": noAnonymousObject,
    "no-anonymous-recursive": noAnonymousRecursive,
    "no-anonymous-discriminator": noAnonymousDiscriminator,
    "no-anonymous-enumerator": noAnonymousEnumerator,
};

export default { meta, configs, rules };
