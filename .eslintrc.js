module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    ignorePatterns: ["**/.eslintrc.js", "**/.eslintrc.json", "**/dist"],
    extends: [
        "standard-with-typescript",
        "plugin:import/recommended",
        "prettier",
    ],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
            rules: {},
        },
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.base.json",
    },
    rules: {
        "@typescript-eslint/triple-slash-reference": 0,
        "@typescript-eslint/strict-boolean-expressions": 0,
        "@typescript-eslint/promise-function-async": 0,
        "@typescript-eslint/no-misused-promises": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-redeclare": 0,
        "@typescript-eslint/return-await": 0,
        "@typescript-eslint/array-type": 0,
        "import/no-unresolved": 0,
        "import/order": [
            "error",
            {
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                ],
            },
        ],
    },
};
