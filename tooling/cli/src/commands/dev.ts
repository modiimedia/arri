// import watcher from "@parcel/watcher";
// import type ParcelWatcher from "@parcel/watcher";
import { loadConfig } from 'c12';
import { defineCommand, runCommand } from 'citty';
import path from 'pathe';

import { isArriConfig } from '../config';

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/__definition`;

export default defineCommand({
    meta: {
        name: 'dev',
        description: 'Start the arri dev server',
    },
    args: {
        config: {
            type: 'string',
            description: 'Path to the arri config file',
            alias: 'c',
            default: './arri.config.ts',
        },
    },
    async run({ args, rawArgs }) {
        const { config } = await loadConfig({
            configFile: path.resolve(args.config),
        });
        if (!config) {
            throw new Error(`Unable to find arri config at ${args.config}`);
        }
        if (!isArriConfig(config)) {
            throw new Error(`Invalid config file at ${args.config}`);
        }
        if (!config.server) {
            throw new Error(
                `No server specified in ${args.config}. Cannot start dev server.`,
            );
        }
        const subCommand = defineCommand({
            args: config.server.devArgs,
            async run({ args }) {
                await config.server?.devFn(args, config.generators);
            },
        });
        await runCommand(subCommand, { rawArgs });
    },
});
