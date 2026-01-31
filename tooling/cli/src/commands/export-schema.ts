import fs from 'node:fs';

import { type AppDefinition, isAppDefinition } from '@arrirpc/codegen-utils';
import { type JsonSchema, schemaToJsonSchema } from '@arrirpc/schema';
import { loadConfig } from 'c12';
import { defineCommand } from 'citty';
import { ofetch } from 'ofetch';
import path from 'pathe';

import { logger } from '../common';

export default defineCommand({
    meta: {
        name: 'export-schema',
        description: 'Export AppDefinition types as JSON Schema',
    },
    args: {
        input: {
            type: 'positional',
            required: true,
            description:
                'Path to AppDefinition file (JSON, JS, or TS) or HTTP URL',
        },
        output: {
            type: 'string',
            alias: ['o'],
            description: 'Output file path for JSON Schema',
            default: './schema.json',
        },
        id: {
            type: 'string',
            description: '$id to use in the JSON Schema',
        },
        title: {
            type: 'string',
            description: 'Title for the JSON Schema',
        },
    },
    async run({ args }) {
        const def = await loadAppDefinition(args.input);
        const jsonSchema = appDefinitionToJsonSchema(def, {
            $id: args.id,
            title: args.title,
        });

        writeJsonSchema(args.output, jsonSchema);
        logger.success(`JSON Schema exported to ${path.resolve(args.output)}`);
    },
});

async function loadAppDefinition(input: string): Promise<AppDefinition> {
    const isUrl = input.startsWith('http://') || input.startsWith('https://');

    if (isUrl) {
        logger.info(`Fetching AppDefinition from ${input}...`);
        const result = await ofetch(input);
        if (!isAppDefinition(result)) {
            logger.error(`Invalid AppDefinition at ${input}`);
            process.exit(1);
        }
        return result;
    }

    logger.info(`Loading AppDefinition from ${input}...`);

    if (!fs.existsSync(input)) {
        throw new Error(`Unable to find ${input}`);
    }

    if (input.endsWith('.ts') || input.endsWith('.js')) {
        const { config } = await loadConfig({ configFile: input });
        if (!isAppDefinition(config)) {
            throw new Error(`Invalid AppDefinition at ${input}`);
        }
        return config;
    }

    const parsed = JSON.parse(fs.readFileSync(input, 'utf-8'));
    if (!isAppDefinition(parsed)) {
        throw new Error(`Invalid AppDefinition at ${input}`);
    }
    return parsed;
}

interface ConvertOptions {
    $id?: string;
    title?: string;
}

function appDefinitionToJsonSchema(
    def: AppDefinition,
    options?: ConvertOptions,
): JsonSchema {
    const $defs: Record<string, JsonSchema> = {};

    for (const [name, schema] of Object.entries(def.definitions ?? {})) {
        $defs[name] = schemaToJsonSchema(schema);
    }

    const result: JsonSchema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
    };

    if (options?.$id) {
        result.$id = options.$id;
    }

    result.title = options?.title ?? def.info?.title;

    if (def.info?.description) {
        result.description = def.info.description;
    }

    if (Object.keys($defs).length > 0) {
        result.$defs = $defs;
    }

    return result;
}

function writeJsonSchema(outputPath: string, schema: JsonSchema): void {
    const resolved = path.resolve(outputPath);
    const dir = path.dirname(resolved);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resolved, JSON.stringify(schema, null, 2));
}
