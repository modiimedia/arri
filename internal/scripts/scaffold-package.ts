import { defineCommand, runMain } from "citty";
import enquirer from "enquirer";
import { existsSync, readFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "pathe";
import { kebabCase } from "scule";

const main = defineCommand({
    async run() {
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
        const result = await enquirer.prompt<{
            name: string;
            type: "codegen" | "tooling";
        }>([
            {
                name: "type",
                message: "Select a package type",
                required: true,
                type: "select",
                choices: ["codegen", "tooling"],
            },
        ]);
        let projectName: string;
        let pkgName: string;
        let pkgLocation: string;
        let depth: number;
        let outDir: string;
        let isCodegen: boolean;
        switch (result.type) {
            case "codegen":
                {
                    const { language } = await enquirer.prompt<{
                        language: string;
                    }>([
                        {
                            name: "language",
                            message: "What programming language is this for?",
                            required: true,
                            type: "input",
                        },
                    ]);
                    isCodegen = true;
                    const lang = language.toLowerCase();
                    const langDir = path.resolve(
                        __dirname,
                        `../../languages/${lang}`,
                    );
                    if (!existsSync(langDir)) {
                        await mkdir(langDir);
                    }
                    pkgName = `@arrirpc/codegen-${lang}`;
                    projectName = `${lang}-codegen`;
                    pkgLocation = `languages/${lang}/${lang}-codegen`;

                    depth = 3;
                    outDir = path.resolve(
                        __dirname,
                        `../../languages/${language.toLowerCase()}/${lang}-codegen`,
                    );
                }
                break;
            case "tooling": {
                const inputResult = await enquirer.prompt<{ name: string }>([
                    {
                        name: "name",
                        message: "Name your package",
                        type: "input",
                        required: true,
                    },
                ]);
                isCodegen = false;
                pkgName = kebabCase(inputResult.name);
                projectName = kebabCase(
                    inputResult.name.replace("@arrirpc/", ""),
                );
                pkgLocation = `tooling/${pkgName}`;
                depth = 2;
                outDir = path.resolve(__dirname, "../../tooling", pkgName);
                break;
            }
        }
        await mkdir(outDir);
        await mkdir(path.resolve(outDir, "src"));
        await Promise.all([
            writeFile(
                path.resolve(outDir, "src/_index.ts"),
                isCodegen
                    ? `import { defineGeneratorPlugin } from "@arrirpc/codegen-utils";

// rename this and add any other options you need for the generator
export interface MyGeneratorOptions {
    clientName: string;
    outputFile: string;
    typePrefix?: string;
}

// rename this before publishing
export const myGenerator = defineGeneratorPlugin(
    (options: MyGeneratorOptions) => {
        return {
            generator(appDef, isDevServer) {
                // todo: use the app definition to output some code
            },
            options,
        };
    },
);
`
                    : `// ${pkgName} entry\n// todo`,
            ),
            writeFile(
                path.resolve(outDir, "build.config.ts"),
                buildConfigTemplate(pkgName),
            ),
            writeFile(
                path.resolve(outDir, "package.json"),
                packageJsonTemplate(pkgName, pkgLocation, version, isCodegen),
            ),
            writeFile(
                path.resolve(outDir, "project.json"),
                projectJsonTemplate(projectName, pkgName, pkgLocation, depth),
            ),
            writeFile(
                path.resolve(outDir, "README.md"),
                readmeTemplate(pkgName),
            ),
            writeFile(
                path.resolve(outDir, "tsconfig.json"),
                tsConfigTemplate(depth),
            ),
            writeFile(
                path.resolve(outDir, "vite.config.ts"),
                viteConfigTemplate(pkgName, depth),
            ),
        ]);
        if (isCodegen) {
            await mkdir(`${outDir}-reference`);
            await Promise.all([
                writeFile(
                    path.resolve(`${outDir}-reference`, "README.md"),
                    `# ${pkgName} Reference

Use this directory to make a reference output based \`../../../tests/test-files/AppDefinition.json\` that can be used to test the output of your generator.`,
                ),
                writeFile(
                    path.resolve(`${outDir}-reference`, "project.json"),
                    referenceProjectJsonTemplate(
                        projectName,
                        `${pkgLocation}-reference`,
                        depth,
                    ),
                ),
            ]);
        }
        console.info(`Scaffolded new project in ${outDir}`);
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

function packageJsonTemplate(
    packageName: string,
    packageLocation: string,
    version: string,
    isCodegen: boolean,
) {
    return `{
    "name": "${packageName}",
    "version": "${version}",
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
        "directory": "${packageLocation}"
    },
    "main": "./dist/index.cjs",
    "module": "./dist/index.mjs",
    "types": "./dist/index.d.ts",
    "files": [
        "dist"
    ],
    "dependencies": {
      ${isCodegen ? `"@arrirpc/codegen-utils": "workspace:*"` : ""}
    },
    "devDependencies": {}
}`;
}

function projectJsonTemplate(
    projectName: string,
    packageName: string,
    packageLocation: string,
    depth: number,
) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `{
  "name": "${projectName}",
  "$schema": "${prefix}node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "${packageLocation}/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "outputs": ["{projectRoot}/dist"],
      "options": {
        "command": "unbuild",
        "cwd": "${packageLocation}"
      }
    },
    "publish": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm publish",
        "cwd": "${packageLocation}"
      },
      "dependsOn": ["build"]
    },
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm eslint ${packageLocation}"
      }
    },
    "typecheck": {
        "executor": "nx:run-commands",
        "options": {
            "command": "tsc --noEmit",
            "cwd": "${packageLocation}"
        }
    },
    "test": {
      "executor": "nx:run-commands",
      "outputs": ["{workspaceRoot}/coverage/${packageLocation}"],
      "options": {
        "command": "vitest run . --passWithNoTests --globals",
        "cwd": "${packageLocation}"
      },
    }
  },
  "tags": []
}
`;
}

function referenceProjectJsonTemplate(
    projectName: string,
    packageLocation: string,
    depth: number,
) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `{
  "name": "${projectName}-reference",
  "$schema": "${prefix}node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "targets": {
    "compile": {
      "executor": "nx:run-commands",
      "options": {
        "command": "echo 'not implemented'",
        "cwd": "${packageLocation}-reference"
      }
    },
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "echo 'not implemented'",
        "cwd": "${packageLocation}-reference"
      }
    },
    "test": {
      "executor": "nx:run-commands",
      "options": {
        "command": "echo 'not implemented'",
        "cwd": "${packageLocation}-reference"
      }
    }
  },
  "tags": []
}
`;
}

function buildConfigTemplate(_packageName: string) {
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
    entries: [{ name: "index", input: "./src/_index.ts" }],
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

function tsConfigTemplate(depth: number) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `{
  "extends": "${prefix}tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest", "vitest/globals", "node"]
  }
}
`;
}

function viteConfigTemplate(projectName: string, depth: number) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "${prefix}node_modules/.vite/tooling/${projectName}",

    plugins: [
        viteTsConfigPaths({
            root: "${prefix}",
        }) as any,
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: '${prefix}',
    //    }),
    //  ],
    // },

    test: {
        globals: true,
        reporters: ["default", "html"],
        outputFile: ".temp/test-results/index.html",
        pool: "threads",
        cache: {
            dir: "${prefix}node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
`;
}
