import fs from 'node:fs';

import { type AppDefinition } from '@arrirpc/codegen-utils';
import { type JsonSchema, schemaToJsonSchema } from '@arrirpc/schema';
import { defineCommand } from 'citty';
import path from 'pathe';

import { loadAppDefinition, logger } from '../common';

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
        id: { type: 'string', description: '$id to use in the JSON Schema' },
        title: { type: 'string', description: 'Title for the JSON Schema' },
        description: {
            type: 'string',
            description: 'Description for the JSON Schema',
        },
    },
    async run({ args }) {
        logger.info(`Loading AppDefinition from ${args.input}...`);
        const def = await loadAppDefinition(args.input);
        const jsonSchema = appDefinitionToJsonSchema(def, {
            $id: args.id,
            title: args.title,
            description: args.description,
        });

        const outputPath = path.resolve(args.output);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));
        logger.success(`JSON Schema exported to ${outputPath}`);
    },
});

export interface ConvertOptions {
    $id?: string;
    title?: string;
    description?: string;
}

export function appDefinitionToJsonSchema(
    def: AppDefinition,
    options?: ConvertOptions,
): JsonSchema {
    const $defs = Object.fromEntries(
        Object.entries(def.definitions ?? {}).map(([name, schema]) => [
            name,
            schemaToJsonSchema(schema),
        ]),
    );

    const description = options?.description ?? def.info?.description;

    return {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        ...(options?.$id && { $id: options.$id }),
        title: options?.title ?? def.info?.title,
        ...(description && { description }),
        ...(Object.keys($defs).length > 0 && { $defs }),
    };
}
