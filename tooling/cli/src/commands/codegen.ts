import fs from "node:fs";

import { type AppDefinition, isAppDefinition } from "@arrirpc/codegen-utils";
import { loadConfig } from "c12";
import { defineCommand } from "citty";
import { ofetch } from "ofetch";
import path from "pathe";

import { logger } from "../common";
import { isArriConfig } from "../config";

export default defineCommand({
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
    },
    async run({ args }) {
        const isUrl =
            args.schema.startsWith("http://") ||
            args.schema.startsWith("https://");
        const isTs = args.schema.endsWith(".ts");
        const isJs = args.schema.endsWith(".js");
        let def: AppDefinition | undefined;
        if (isUrl) {
            const result = await ofetch(args.schema);
            if (!isAppDefinition(result)) {
                throw new Error(`Invalid App Definition at ${args.schema}`);
            }
            def = result;
        } else {
            if (!fs.existsSync(args.schema)) {
                throw new Error(`Unable to find ${args.schema}`);
            }
            if (isTs || isJs) {
                const schemaResult = await loadConfig({
                    configFile: args.schema,
                });
                if (!isAppDefinition(schemaResult.config)) {
                    throw new Error(`Invalid App Definition at ${args.schema}`);
                }
                def = schemaResult.config;
            } else {
                const jsonString = JSON.parse(
                    fs.readFileSync(args.schema, { encoding: "utf-8" }),
                );
                if (!isAppDefinition(jsonString)) {
                    throw new Error(`Invalid App Definition at ${args.schema}`);
                }
                def = jsonString;
            }
        }
        if (!def) {
            throw new Error(`Unable to find App Definition at ${args.schema}`);
        }
        if (!fs.existsSync(path.resolve(args.config))) {
            throw new Error(
                `Unable to load arri config at ${args.config}. Please specify a valid config path with --config`,
            );
        }
        const configPath = path.resolve(args.config);
        const { config } = await loadConfig({ configFile: configPath });
        if (!isArriConfig(config)) {
            throw new Error(`Invalid arri config at ${args.config}`);
        }
        if (!config.generators?.length) {
            logger.warn(`No generators specified in ${args.config}`);
            process.exit(1);
        }
        logger.info(`Generating ${config.generators?.length} client(s)`);
        await Promise.allSettled(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            config.generators.map((gen) =>
                gen.generator(
                    def ?? {
                        schemaVersion: "0.0.6",
                        procedures: {},
                        definitions: {},
                    },
                ),
            ),
        );
        process.exit(0);
    },
});
