import fs, { readFileSync, rmSync, writeFileSync } from "node:fs";

import { kebabCase } from "@arrirpc/codegen-utils";
import { a } from "@arrirpc/schema";
import { defineCommand } from "citty";
import Degit from "degit";
import enquirer from "enquirer";
import path from "pathe";
import prettier from "prettier";

import { logger } from "../common";

const Language = a.enumerator(["typescript", "go"]);
type Language = a.infer<typeof Language>;

const CliArgs = a.object({
    dir: a.string(),
    force: a.optional(a.boolean()),
    type: a.optional(a.enumerator(["app", "plugin"])),
    language: a.optional(Language),
});
type CliArgs = a.infer<typeof CliArgs>;

export default defineCommand({
    meta: {
        name: "Init",
        description: "Scaffold an arri app",
    },
    args: {
        dir: {
            type: "positional",
            required: true,
            description: "Directory where to initialize the project",
        },
        force: {
            type: "boolean",
            default: false,
            alias: "f",
            description:
                "Force created a project when if a directory already exists",
        },
        type: {
            type: "string",
            description: `"app" | "plugin"`,
        },
        language: {
            type: "string",
            alias: ["lang", "l"],
            default: `"typescript" | "go"`,
        },
    },
    async run(context) {
        const args = a.parse(CliArgs, context.args);
        if (!args.type) {
            const { projectType } = await enquirer.prompt<{
                projectType: "application" | "generator plugin";
            }>([
                {
                    type: "select",
                    name: "projectType",
                    message: "What kind of project do you want to initialize?",
                    choices: ["application", "generator plugin"],
                },
            ]);
            switch (projectType) {
                case "application":
                    args.type = "app";
                    break;
                case "generator plugin":
                    args.type = "plugin";
                    break;
                default:
                    throw new Error(
                        `Unknown project type "${projectType as any}"`,
                    );
            }
        }
        if (!args.language) {
            const { language } = await enquirer.prompt<{
                language: "typescript" | "go";
            }>([
                {
                    type: "select",
                    name: "language",
                    message: "What language do you want to use?",
                    choices: ["typescript", "go"],
                },
            ]);
            args.language = language;
        }
        const dir = path.resolve(context.args.dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const dirFiles = fs.readdirSync(dir);
        if (dirFiles.length && !context.args.force) {
            logger.error(
                `"${context.args.dir}" is a non-empty directory. To continue with this operation rerun "arri init" with the --force flag.`,
            );
            process.exit(1);
        }
        switch (args.type) {
            case "app":
                await initApp(args.dir, args.language, args.force ?? false);
                break;
            case "plugin":
                await initPlugin(args.dir, args.force ?? false);
                break;
            default:
                logger.error(`Unknown app type: '${args.type as any}'"`);
                break;
        }
        process.exit(0);
    },
});

async function initApp(dir: string, language: Language, force: boolean) {
    switch (language) {
        case "typescript":
            return initTypescriptApp(dir, force);
        case "go":
            return initGoApp(dir, force);
        default:
            language satisfies never;
    }
}

async function initTypescriptApp(dir: string, force: boolean) {
    const { eslint } = await enquirer.prompt<{ eslint: boolean }>([
        {
            name: "eslint",
            type: "confirm",
            message: "Do you want to setup Eslint?",
            initial: true,
        },
    ]);
    if (eslint) {
        logger.warn(
            `The Arri eslint starter uses the Eslint flat config syntax. If you are using VSCode you will need to enable "eslint.experimental.useFlatConfig" in your workspace settings. Please follow https://github.com/microsoft/vscode-eslint/issues/1644 for details.`,
        );
    }
    const repo = eslint
        ? "modiimedia/arri-starters/app-starter-ts-with-eslint"
        : "modiimedia/arri-starters/app-starter-ts";
    const degit = Degit(repo, {
        force,
    });
    await degit.clone(dir);
    await cleanPackageJsonAndPnpmLockFiles(dir);
    logger.success(`Project initialized in ${dir}!`);
    logger.info(`To get started:\n- cd ${dir}\n- pnpm install\n- pnpm run dev`);
}

async function initGoApp(dir: string, force: boolean) {
    const degit = Degit("modiimedia/arri-starters/app-starter-go", { force });
    await degit.clone(dir);
    await cleanPackageJsonAndPnpmLockFiles(dir);
    logger.success(`Project created in ${dir}!`);
    logger.info(`To get started:\n- cd ${dir}\n- pnpm install\n- pnpm run dev`);
}

async function cleanPackageJsonAndPnpmLockFiles(dir: string) {
    rmSync(path.resolve(dir, "pnpm-lock.yaml"));
    const packageJson = JSON.parse(
        readFileSync(path.resolve(dir, "package.json"), {
            encoding: "utf-8",
        }),
    );
    packageJson.name = kebabCase(dir);
    packageJson.description = "An RPC server created with Arri RPC";
    packageJson.private = true;
    delete packageJson.license;
    delete packageJson.main;
    delete packageJson.author;
    delete packageJson.tags;
    delete packageJson.packageManager;
    writeFileSync(
        path.resolve(dir, "package.json"),
        await prettier.format(JSON.stringify(packageJson), {
            parser: "json",
            tabWidth: 2,
            semi: true,
            endOfLine: "lf",
            trailingComma: "all",
        }),
    );
}

async function initPlugin(dir: string, force: boolean) {
    const name = kebabCase(dir);
    const degit = Degit("modiimedia/arri-starters/generator-starter", {
        force,
    });
    await degit.clone(dir);
    rmSync(path.resolve(dir, "pnpm-lock.yaml"));
    let packageJson = readFileSync(path.resolve(dir, "package.json"), {
        encoding: "utf8",
    });
    packageJson = packageJson.replace(`"arri-generator-name"`, `"${name}"`);
    const parsedPackageJson = JSON.parse(packageJson) as Record<string, any>;
    delete parsedPackageJson.packageManager;
    writeFileSync(
        path.resolve(dir, "package.json"),
        await prettier.format(JSON.stringify(parsedPackageJson), {
            parser: "json",
            tabWidth: 2,
            semi: true,
            endOfLine: "lf",
            trailingComma: "all",
        }),
    );
    logger.success(`Project initialized in ${dir}!`);
    logger.info(`To get started:\n- cd ${dir}\n- pnpm install`);
}
