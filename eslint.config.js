import tsEslint from "typescript-eslint";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginN from "eslint-plugin-n";

const ignoreFiles = [
    "**/*.json",
    "*.json",
    "node_modules",
    "**/node_modules",
    "**/.arri",
    "**/.output",
    "**/build",
    "**/target",
    "dist",
    "**/dist",
    "**/*.js",
    "**/**/dist/*.d.ts",
    "**/*.dart",
    "**/*.kt",
    "**/*.rust",
    "**/*.zig",
    "**/*.swift",
    "**/*.go",
    "**/*.py",
    "tests/server",
];

export default tsEslint.config(
    {
        ignores: ignoreFiles,
    },
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    eslintPluginN.configs["flat/recommended"],
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": 0,
            "simple-import-sort/exports": 0,
            "n/no-unpublished-import": 0,
            "n/no-missing-import": 0,
            "n/no-extraneous-import": 0,
            "n/no-process-exit": 0,
            "n/hashbang": 0,
            "n/no-unsupported-features/node-builtins": 0,
            "@typescript-eslint/no-non-null-assertion": 0,
            "@typescript-eslint/non-nullable-type-assertion-style": 0,
            "@typescript-eslint/triple-slash-reference": 0,
            "@typescript-eslint/strict-boolean-expressions": 0,
            "@typescript-eslint/promise-function-async": 0,
            "@typescript-eslint/no-misused-promises": 0,
            "@typescript-eslint/explicit-function-return-type": 0,
            "@typescript-eslint/no-redeclare": 0,
            "@typescript-eslint/return-await": 0,
            "@typescript-eslint/array-type": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-unused-vars": [
                2,
                {
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        files: ["languages/ts/ts-server/**/*.ts", "tooling/schema/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-argument": 0,
        },
    },
    prettier,
);
