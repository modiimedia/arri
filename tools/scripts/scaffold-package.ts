import { mkdir, writeFile } from "fs/promises";
import { defineCommand, runMain } from "citty";
import path from "pathe";
import { kebabCase } from "scule";

const main = defineCommand({
    args: {
        packageName: {
            type: "positional",
            required: true,
        },
    },
    async run({ args }) {
        const name = kebabCase(args.packageName.toLowerCase());
        const outDir = path.resolve(__dirname, "../../packages", name);
        await mkdir(outDir);
        await mkdir(path.resolve(outDir, "src"));
        await Promise.all([
            writeFile(
                path.resolve(outDir, "src/index.ts"),
                `// ${name} entry\n// todo`,
            ),
            writeFile(
                path.resolve(outDir, ".eslintrc.json"),
                eslintConfigTemplate(),
            ),
            writeFile(
                path.resolve(outDir, "build.config.ts"),
                buildConfigTemplate(name),
            ),
            writeFile(
                path.resolve(outDir, "package.json"),
                packageJsonTemplate(name),
            ),
            writeFile(
                path.resolve(outDir, "project.json"),
                projectJsonTemplate(name),
            ),
            writeFile(path.resolve(outDir, "README.md"), readmeTemplate(name)),
            writeFile(
                path.resolve(outDir, "tsconfig.json"),
                tsConfigTemplate(),
            ),
            writeFile(
                path.resolve(outDir, "tsconfig.lib.json"),
                tsConfigLibTemplate(),
            ),
            writeFile(
                path.resolve(outDir, "tsconfig.spec.json"),
                tsConfigSpecTemplate(),
            ),
            writeFile(
                path.resolve(outDir, "vite.config.ts"),
                viteConfigTemplate(),
            ),
        ]);
    },
});

void runMain(main);

function readmeTemplate(packageName: string) {
    return `# ${packageName}

This library was generated with [Nx](https://nx.dev).

## Building

Run \`nx build ${packageName}\` to build the library.

## Running unit tests

Run \`nx test ${packageName}\` to execute the unit tests via [Vitest](https://vitest.dev).
`;
}

function packageJsonTemplate(packageName: string) {
    return `{
    "name": "${packageName}",
    "type": "module",
    "main": "./dist/index.cjs",
    "module": "./dist/index.mjs",
    "types": "./dist/index.d.ts",
    "files": [
        "dist"
    ]
}`;
}

function projectJsonTemplate(packageName: string) {
    return `{
    "name": "${packageName}",
    "$schema": "../../node_modules/nx/schemas/project-schema.json",
    "sourceRoot": "packages/${packageName}/src",
    "projectType": "library",
    "targets": {
        "build": {
            "dependsOn": ["setup-package-json"],
            "executor": "nx:run-commands",
            "outputs": ["{workspaceRoot}/dist/packages/${packageName}"],
            "options": {
                "command": "unbuild",
                "cwd": "packages/${packageName}"
            }
        },
        "setup-package-json": {
            "executor": "nx:run-commands",
            "outputs": [
                "{workspaceRoot}/dist/packages/${packageName}/package.json"
            ],
            "options": {
                "command": "jiti tools/scripts/setup-package-json.ts --project-dir packages/${packageName}--out-dir dist/packages/${packageName}"
            }
        },
        "publish": {
            "executor": "nx:run-commands",
            "options": {
                "command": "npm publish",
                "cwd": "dist/packages/${packageName}"
            },
            "dependsOn": ["build"]
        },
        "lint": {
            "executor": "@nx/linter:eslint",
            "outputs": ["{options.outputFile}"],
            "options": {
                "lintFilePatterns": ["packages/${packageName}/**/*.ts"]
            }
        },
        "test": {
            "executor": "@nx/vite:test",
            "outputs": ["{workspaceRoot}/coverage/packages/${packageName}"],
            "options": {
                "passWithNoTests": true,
                "reportsDirectory": "../../coverage/packages/${packageName}"
            }
        }
    },
    "tags": []
}
`;
}

function eslintConfigTemplate() {
    return `{
    "extends": ["../../.eslintrc.js"],
    "ignorePatterns": ["!**/*"],
    "overrides": [
        {
            "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
            "rules": {}
        },
        {
            "files": ["*.ts", "*.tsx"],
            "rules": {}
        },
        {
            "files": ["*.js", "*.jsx"],
            "rules": {}
        }
    ]
}`;
}

function buildConfigTemplate(packageName: string) {
    return `import { readFileSync } from "node:fs";
import path from "node:path";
import { defineBuildConfig } from "unbuild";

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../package.json"), {
        encoding: "utf-8",
    }),
);

const deps = Object.keys(packageJson.dependencies);

export default defineBuildConfig({
    entries: ["./src/index"],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    outDir: "../../dist/packages/${packageName}/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
    externals: deps,
});`;
}

function tsConfigTemplate() {
    return `{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "module": "commonjs",
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "noImplicitOverride": true,
        "noPropertyAccessFromIndexSignature": false,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": false,
        "types": ["vitest"]
    },
    "files": [],
    "include": [],
    "references": [
        {
            "path": "./tsconfig.lib.json"
        },
        {
            "path": "./tsconfig.spec.json"
        }
    ]
}
`;
}

function tsConfigLibTemplate() {
    return `{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "outDir": "../../dist/out-tsc",
        "declaration": true,
        "types": ["node"]
    },
    "include": ["src/**/*.ts"],
    "exclude": ["jest.config.ts", "src/**/*.spec.ts", "src/**/*.test.ts"]
}
`;
}

function tsConfigSpecTemplate() {
    return `{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "outDir": "../../dist/out-tsc",
        "types": ["vitest/globals", "vitest/importMeta", "vite/client", "node"]
    },
    "include": [
        "vite.config.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.tsx",
        "src/**/*.test.js",
        "src/**/*.spec.js",
        "src/**/*.test.jsx",
        "src/**/*.spec.jsx",
        "src/**/*.d.ts"
    ]
}
`;
}

function viteConfigTemplate() {
    return `/// <reference types="vitest" />
import { defineConfig } from "vite";

import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    cacheDir: "../../node_modules/.vite/client",

    plugins: [
        viteTsConfigPaths({
            root: "../../",
        }),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: '../../',
    //    }),
    //  ],
    // },

    test: {
        globals: true,
        cache: {
            dir: "../../node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
`;
}
