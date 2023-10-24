import fs, { readFileSync, rmSync, writeFileSync } from "node:fs";
import { defineCommand } from "citty";
import consola, { createConsola } from "consola";
import Degit from "degit";
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
    },
    async run(context) {
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
        const degit = Degit("https://github.com/modiimedia/arri-starters", {
            force: context.args.force,
        });
        await degit.clone(dir);
        rmSync(path.resolve(dir, "pnpm-lock.yaml"));
        const packageJson = JSON.parse(
            readFileSync(path.resolve(dir, "package.json"), {
                encoding: "utf-8",
            }),
        );
        packageJson.name = kebabCase(context.args.dir);
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
        consola.log(
            `Project initialized in ${context.args.dir}. To get started:\ncd ${context.args.dir}\nnpm install\nnpm run dev`,
        );
        process.exit(0);
    },
});
