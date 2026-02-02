import fs from 'node:fs';

import { SCHEMA_VERSION, type AppDefinition } from '@arrirpc/codegen-utils';
import { loadConfig } from 'c12';
import { watch } from 'chokidar';
import { defineCommand } from 'citty';
import path from 'pathe';

import { loadAppDefinition, logger } from '../common';
import { ArriConfig, isArriConfig } from '../config';

export default defineCommand({
    meta: {
        name: 'Codegen',
        description:
            'Run code-generators. (Uses options from your arri config file)',
    },
    args: {
        schema: {
            type: 'positional',
            alias: ['l'],
            required: true,
        },
        config: {
            type: 'string',
            alias: ['c'],
            default: 'arri.config.ts',
        },
        watch: {
            type: 'boolean',
            alias: ['w'],
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
            args.schema.startsWith('http://') ||
            args.schema.startsWith('https://');

        if (isUrl && args.watch) {
            throw new Error('Cannot watch a URL');
        }

        let def: AppDefinition | undefined;
        try {
            def = await loadAppDefinition(args.schema);
        } catch (err) {
            if (!args.watch) {
                throw err;
            }
            logger.error(err);
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
        watcher.on('add', async (_, __) => {
            try {
                logger.info(`Change detected`);
                const startTime = new Date();
                await runGenerators(
                    await loadAppDefinition(args.schema),
                    config.generators ?? [],
                );
                logger.success(
                    `Generators completed in ${new Date().getTime() - startTime.getTime()}ms`,
                );
            } catch (err) {
                logger.error(err);
            }
        });
        watcher.on('change', async (_, __) => {
            try {
                logger.info(`Change detected in AppDefinition file.`);
                const startTime = new Date();
                await runGenerators(
                    await loadAppDefinition(args.schema),
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

async function runGenerators(
    def: AppDefinition,
    generators: ArriConfig['generators'],
) {
    logger.info(`Generating ${generators?.length} client(s)`);
    await Promise.allSettled(
        generators.map((gen) =>
            gen.run(
                def ?? {
                    schemaVersion: SCHEMA_VERSION,
                    procedures: {},
                    definitions: {},
                },
            ),
        ),
    );
}
