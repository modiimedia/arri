import { readFileSync } from "fs";
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
        const rootPackageJson = JSON.parse(
            readFileSync(path.resolve(__dirname, "../../package.json"), {
                encoding: "utf8",
            }),
        ) as Record<string, any>;
        const version =
            "version" in rootPackageJson &&
            typeof rootPackageJson.version === "string"
                ? rootPackageJson.version
                : "0.0.1";
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
                packageJsonTemplate(name, version),
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
                viteConfigTemplate(name),
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

function packageJsonTemplate(packageName: string, version: string) {
    return `{
    "name": "${packageName}",
    "version": ${version},
    "type": "module",
    "license": "MIT",
    "author": {
        "name": "joshmossas",
        "url": "https://github.com/joshmossas"
    },
    "bugs": {
        "url": "https://github.com/modiimedia/arri/issues"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com/modiimedia/arri.git",
        "directory": "packages/${packageName}"
    },
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
      "executor": "nx:run-commands",
      "outputs": ["{projectRoot}/dist"],
      "options": {
        "command": "unbuild",
        "cwd": "packages/${packageName}"
      }
    },
    "publish": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm publish",
        "cwd": "packages/${packageName}"
      },
      "dependsOn": ["build"]
    },
    "lint": {
      "executor": "@nx/eslint:eslint",
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
        "reportsDirectory": "../../coverage/packages/arri-validate",
        "watch": false
      },
      "configurations": {
        "watch": {
          "command": "vitest watch --passWithNoTests --globals"
        }
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
  "ignorePatterns": [],
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
}
`;
}

function buildConfigTemplate(packageName: string) {
    return `import { readFileSync } from "node:fs";
import path from "node:path";
import { defineBuildConfig } from "unbuild";

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "./package.json"), {
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
    outDir: "dist",
    clean: true,
    declaration: true,
    failOnWarn: true,
    externals: deps,
});`;
}

function tsConfigTemplate() {
    return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest"]
  },
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

function viteConfigTemplate(projectName: string) {
    return `import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "../../node_modules/.vite/${projectName}",

    plugins: [
        viteTsConfigPaths({
            root: "../../",
        }) as any,
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
        reporters: ["default"],
        pool: "threads",
        pollOptions: {
            threads: {
                singleThread: true,
            },
        },
        cache: {
            dir: "../../node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
`;
}
