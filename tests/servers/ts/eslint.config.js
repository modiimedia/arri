import arri from "@arrirpc/eslint-plugin";
import rootConfig from "../../../eslint.config.js";

const config = [...rootConfig];
config.push({
    files: ["src/linter-tests.ts"],
    plugins: {
        arri,
    },
    rules: {
        "arri/no-anonymous-enumerator": 2,
        "arri/no-anonymous-discriminator": 2,
        "arri/no-anonymous-object": 2,
        "arri/no-anonymous-recursive": 2,
    },
});

export default config;
