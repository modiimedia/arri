import fs from "node:fs";

import { type AppDefinition, isAppDefinition } from "@arrirpc/codegen-utils";
import { loadConfig } from "c12";
import { watch } from "chokidar";
import { defineCommand } from "citty";
import { ofetch } from "ofetch";
import path from "pathe";

import { logger } from "../common";
import { ArriConfig, isArriConfig } from "../config";

export default defineCommand({
    meta: {
        name: "Codegen",
        description:
            "Run code-generators. (Uses options from your arri config file)",
    },
    args: {
        schema: {
            type: "positional",
            alias: ["l"],
            required: true,
        },
        config: {
            type: "string",
            alias: ["c"],
            default: "arri.config.ts",
        },
        watch: {
            type: "boolean",
            alias: ["w"],
            default: false,
        },
    },
    async run({ args }) {
        if (!fs.existsSync(path.resolve(args.config))) {
            logger.error(
                `Unable to load arri config at ${args.config}. Please specify a valid config path with --config`,
            );
            process.exit(1);
        }
        const { config } = await loadConfig({
            configFile: path.resolve(args.config),
        });
        if (!isArriConfig(config)) {
            logger.error(`Invalid arri config at ${args.config}`);
            process.exit(1);
        }
        if (!config.generators?.length) {
            logger.error(`No generators specified in ${args.config}`);
            process.exit(1);
        }

        const isUrl =
            args.schema.startsWith("http://") ||
            args.schema.startsWith("https://");

        let def: AppDefinition | undefined;
        if (isUrl) {
            if (args.watch) throw new Error("Cannot watch a URL");
            const result = await ofetch(args.schema);
            if (!isAppDefinition(result)) {
                throw new Error(`Invalid App Definition at ${args.schema}`);
            }
            def = result;
        } else {
            try {
                def = await getAppDefinitionFromFile(args.schema);
            } catch (err) {
                if (!args.watch) {
                    throw err;
                }
                logger.error(err);
            }
        }
        if (!def && !args.watch) {
            throw new Error(`Unable to find App Definition at ${args.schema}`);
        }
        if (def) {
            const initialStartTime = new Date();
            await runGenerators(def, config.generators ?? []);
            logger.success(
                `Generators completed in ${new Date().getTime() - initialStartTime.getTime()}ms`,
            );
        }
        if (!args.watch) process.exit(0);
        const watcher = watch(args.schema, { ignoreInitial: true });
        logger.info(`Watching ${args.schema} for changes...`);
        watcher.on("add", async (_, __) => {
            try {
                logger.info(`Change detected`);
                const startTime = new Date();
                await runGenerators(
                    await getAppDefinitionFromFile(args.schema),
                    config.generators ?? [],
                );
                logger.success(
                    `Generators completed in ${new Date().getTime() - startTime.getTime()}ms`,
                );
            } catch (err) {
                logger.error(err);
            }
        });
        watcher.on("change", async (_, __) => {
            try {
                logger.info(`Change detected in AppDefinition file.`);
                const startTime = new Date();
                await runGenerators(
                    await getAppDefinitionFromFile(args.schema),
                    config.generators ?? [],
                );
                logger.success(
                    `Generators completed in ${new Date().getTime() - startTime.getTime()}ms`,
                );
            } catch (err) {
                logger.error(err);
            }
        });
    },
});

async function getAppDefinitionFromFile(file: string) {
    if (!fs.existsSync(file)) {
        throw new Error(`Unable to find ${file}`);
    }
    const isTs = file.endsWith(".ts");
    const isJs = file.endsWith(".js");
    if (isTs || isJs) {
        const schemaResult = await loadConfig({
            configFile: file,
        });
        if (!isAppDefinition(schemaResult.config)) {
            throw new Error(`Invalid App Definition at ${file}`);
        }
        return schemaResult.config;
    } else {
        const parsingResult = JSON.parse(
            fs.readFileSync(file, { encoding: "utf-8" }),
        );
        if (!isAppDefinition(parsingResult)) {
            throw new Error(`Invalid App Definition at ${file}`);
        }
        return parsingResult;
    }
}

async function runGenerators(
    def: AppDefinition,
    generators: ArriConfig["generators"],
) {
    logger.info(`Generating ${generators?.length} client(s)`);
    await Promise.allSettled(
        generators.map((gen) =>
            gen.generator(
                def ?? {
                    schemaVersion: "0.0.7",
                    procedures: {},
                    definitions: {},
                },
            ),
        ),
    );
}
