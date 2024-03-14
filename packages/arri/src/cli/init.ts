import fs, { readFileSync, rmSync, writeFileSync } from "node:fs";
import { defineCommand } from "citty";
import { createConsola } from "consola";
import Degit from "degit";
import enquirer from "enquirer";
import path from "pathe";
import prettier from "prettier";
import { kebabCase } from "scule";

const logger = createConsola();

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
                projectType: "app" | "plugin";
            }>([
                {
                    type: "select",
                    name: "projectType",
                    message: "What kind of project do you want to initialize?",
                    choices: [
                        { name: "application", value: "app" },
                        { name: "generator plugin", value: "plugin" },
                    ],
                },
            ]);
            type = projectType;
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
                break;
        }
        process.exit(0);
    },
});

async function initApp(dir: string, force: boolean) {
    const degit = Degit(
        "https://github.com/modiimedia/arri-starters/app-starter-ts",
        {
            force,
        },
    );
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
    logger.log(
        `Project initialized in ${dir}. To get started:\ncd ${dir}\nnpm install\nnpm run dev`,
    );
}

async function initPlugin(dir: string, force: boolean) {
    const name = kebabCase(dir);
    const degit = Degit(
        "https://github.com/modiimedia/arri-starters/generator-starter",
        {
            force,
        },
    );
    await degit.clone(dir);
    rmSync(path.resolve(dir, "pnpm-lock.yaml"));
    let packageJson = readFileSync(path.resolve(dir, "package.json"), {
        encoding: "utf8",
    });
    packageJson = packageJson.replace(`"arri-generator-name"`, `"${name}"`);
    writeFileSync(path.resolve(dir, "package.json"), packageJson);
    logger.log(
        `Project initialized in ${dir}. To get started:\ncd ${dir}\nnpm install`,
    );
}
