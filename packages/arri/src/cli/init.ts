import fs from "node:fs";
import { defineCommand } from "citty";
import consola, { createConsola } from "consola";
import Degit from "degit";
import path from "pathe";

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
        logger.error("This feature is not yet available");
        const degit = Degit("https://github.com/modiimedia/arri-starters", {
            force: context.args.force,
        });
        await degit.clone(dir);
        consola.log(
            `Project initialized in ${dir}. Cd into the directory and install dependencies to get started.`,
        );
        process.exit(0);
    },
});
