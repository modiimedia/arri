import fs, { readFileSync, rmSync, writeFileSync } from "node:fs";
import { defineCommand } from "citty";
import Degit from "degit";
import enquirer from "enquirer";
import path from "pathe";
import prettier from "prettier";
import { kebabCase } from "scule";
import { logger } from "./_common";

export default defineCommand({
    meta: {
        name: "Init",
        description: "Scaffold an Arri app",
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
    },
    async run(context) {
        let type: "app" | "plugin" | undefined;
        switch (context.args.type?.toLowerCase()) {
            case "app":
                type = "app";
                break;
            case "plugin":
                type = "plugin";
                break;
            default:
                break;
        }
        if (!type) {
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
                    type = "app";
                    break;
                case "generator plugin":
                    type = "plugin";
                    break;
                default:
                    throw new Error(
                        `Unknown project type "${projectType as any}"`,
                    );
            }
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
        switch (type) {
            case "app":
                await initApp(context.args.dir, context.args.force);
                break;
            case "plugin":
                await initPlugin(context.args.dir, context.args.force);
                break;
            default:
                logger.error(`Unknown app type: '${type as any}'"`);
                break;
        }
        process.exit(0);
    },
});

async function initApp(dir: string, force: boolean) {
    const degit = Degit("modiimedia/arri-starters/app-starter-ts", {
        force,
    });
    await degit.clone(dir);
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
    writeFileSync(
        path.resolve(dir, "package.json"),
        await prettier.format(JSON.stringify(packageJson), {
            parser: "json",
            tabWidth: 4,
            semi: true,
            endOfLine: "lf",
            trailingComma: "all",
        }),
    );
    logger.success(`Project initialized in ${dir}!`);
    logger.info(`To get started:\n- cd ${dir}\n- pnpm install\n- pnpm run dev`);
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
    writeFileSync(path.resolve(dir, "package.json"), packageJson);
    logger.success(`Project initialized in ${dir}!`);
    logger.info(`To get started:\n- cd ${dir}\n- pnpm install`);
}
