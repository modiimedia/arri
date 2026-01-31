import fs from 'node:fs';

import { type AppDefinition, isAppDefinition } from '@arrirpc/codegen-utils';
import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
} from '@arrirpc/type-defs';
import { loadConfig } from 'c12';
import { defineCommand } from 'citty';
import { ofetch } from 'ofetch';
import path from 'pathe';

import { logger } from '../common';

type JsonSchemaType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'object'
    | 'array'
    | 'null';

interface JsonSchema {
    $schema?: string;
    $id?: string;
    $ref?: string;
    $defs?: Record<string, JsonSchema>;
    title?: string;
    description?: string;
    deprecated?: boolean;
    type?: JsonSchemaType | JsonSchemaType[];
    pattern?: string;
    format?: string;
    minimum?: number;
    maximum?: number;
    enum?: unknown[];
    const?: unknown;
    items?: JsonSchema;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    additionalProperties?: boolean | JsonSchema;
    oneOf?: JsonSchema[];
    anyOf?: JsonSchema[];
    [key: string]: unknown;
}

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
        const isUrl =
            args.input.startsWith('http://') ||
            args.input.startsWith('https://');

        let def: AppDefinition;

        if (isUrl) {
            logger.info(`Fetching AppDefinition from ${args.input}...`);
            const result = await ofetch(args.input);
            if (!isAppDefinition(result)) {
                logger.error(`Invalid AppDefinition at ${args.input}`);
                process.exit(1);
            }
            def = result;
        } else {
            logger.info(`Loading AppDefinition from ${args.input}...`);
            def = await getAppDefinitionFromFile(args.input);
        }

        const jsonSchema = convertAppDefinitionToJsonSchema(def, {
            $id: args.id,
            title: args.title,
        });

        const outputPath = path.resolve(args.output);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));
        logger.success(`JSON Schema exported to ${outputPath}`);
    },
});

async function getAppDefinitionFromFile(file: string): Promise<AppDefinition> {
    if (!fs.existsSync(file)) {
        throw new Error(`Unable to find ${file}`);
    }
    const isTs = file.endsWith('.ts');
    const isJs = file.endsWith('.js');
    if (isTs || isJs) {
        const schemaResult = await loadConfig({
            configFile: file,
        });
        if (!isAppDefinition(schemaResult.config)) {
            throw new Error(`Invalid AppDefinition at ${file}`);
        }
        return schemaResult.config;
    } else {
        const parsingResult = JSON.parse(
            fs.readFileSync(file, { encoding: 'utf-8' }),
        );
        if (!isAppDefinition(parsingResult)) {
            throw new Error(`Invalid AppDefinition at ${file}`);
        }
        return parsingResult;
    }
}

interface ConvertOptions {
    $id?: string;
    title?: string;
}

function convertAppDefinitionToJsonSchema(
    def: AppDefinition,
    options?: ConvertOptions,
): JsonSchema {
    const $defs: Record<string, JsonSchema> = {};

    // Convert all definitions
    for (const [name, schema] of Object.entries(def.definitions ?? {})) {
        $defs[name] = convertAtdToJsonSchema(schema);
    }

    const result: JsonSchema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
    };

    if (options?.$id) {
        result.$id = options.$id;
    }

    if (options?.title) {
        result.title = options.title;
    } else if (def.info?.title) {
        result.title = def.info.title;
    }

    if (def.info?.description) {
        result.description = def.info.description;
    }

    if (Object.keys($defs).length > 0) {
        result.$defs = $defs;
    }

    return result;
}

/**
 * Convert an ATD schema (from AppDefinition) to JSON Schema
 * This works with plain schema objects that don't have the VALIDATOR_KEY
 */
function convertAtdToJsonSchema(schema: Schema): JsonSchema {
    // Handle empty schema (any type)
    if (isSchemaFormEmpty(schema)) {
        return applyNullableAndMetadata({}, schema);
    }

    // Handle scalar types
    if (isSchemaFormType(schema)) {
        return convertScalarSchema(schema);
    }

    // Handle enum
    if (isSchemaFormEnum(schema)) {
        return convertEnumSchema(schema);
    }

    // Handle array
    if (isSchemaFormElements(schema)) {
        return convertArraySchema(schema);
    }

    // Handle object
    if (isSchemaFormProperties(schema)) {
        return convertObjectSchema(schema);
    }

    // Handle record (values)
    if (isSchemaFormValues(schema)) {
        return convertRecordSchema(schema);
    }

    // Handle discriminator
    if (isSchemaFormDiscriminator(schema)) {
        return convertDiscriminatorSchema(schema);
    }

    // Handle ref
    if (isSchemaFormRef(schema)) {
        return convertRefSchema(schema);
    }

    // Fallback: empty schema for any
    return applyNullableAndMetadata({}, schema);
}

function isSchemaFormEmpty(schema: Schema): boolean {
    return (
        !isSchemaFormType(schema) &&
        !isSchemaFormEnum(schema) &&
        !isSchemaFormElements(schema) &&
        !isSchemaFormProperties(schema) &&
        !isSchemaFormValues(schema) &&
        !isSchemaFormDiscriminator(schema) &&
        !isSchemaFormRef(schema)
    );
}

// Number constants
const int8Min = -128;
const int8Max = 127;
const uint8Min = 0;
const uint8Max = 255;
const int16Min = -32768;
const int16Max = 32767;
const uint16Min = 0;
const uint16Max = 65535;
const int32Min = -2147483648;
const int32Max = 2147483647;
const uint32Min = 0;
const uint32Max = 4294967295;

function convertScalarSchema(schema: Schema & { type: string }): JsonSchema {
    const scalarType = schema.type;
    let result: JsonSchema;

    switch (scalarType) {
        case 'string':
            result = { type: 'string' };
            break;

        case 'boolean':
            result = { type: 'boolean' };
            break;

        case 'timestamp':
            result = { type: 'string', format: 'date-time' };
            break;

        case 'float32':
        case 'float64':
            result = { type: 'number' };
            break;

        case 'int8':
            result = {
                type: 'integer',
                minimum: int8Min,
                maximum: int8Max,
            };
            break;

        case 'uint8':
            result = {
                type: 'integer',
                minimum: uint8Min,
                maximum: uint8Max,
            };
            break;

        case 'int16':
            result = {
                type: 'integer',
                minimum: int16Min,
                maximum: int16Max,
            };
            break;

        case 'uint16':
            result = {
                type: 'integer',
                minimum: uint16Min,
                maximum: uint16Max,
            };
            break;

        case 'int32':
            result = {
                type: 'integer',
                minimum: int32Min,
                maximum: int32Max,
            };
            break;

        case 'uint32':
            result = {
                type: 'integer',
                minimum: uint32Min,
                maximum: uint32Max,
            };
            break;

        // 64-bit integers are represented as strings in JSON
        case 'int64':
            result = {
                type: 'string',
                pattern: '^-?[0-9]+$',
            };
            break;

        case 'uint64':
            result = {
                type: 'string',
                pattern: '^[0-9]+$',
            };
            break;

        default:
            // Unknown type, treat as any
            result = {};
    }

    return applyNullableAndMetadata(result, schema);
}

function convertEnumSchema(schema: Schema & { enum: string[] }): JsonSchema {
    const result: JsonSchema = {
        type: 'string',
        enum: [...schema.enum],
    };

    return applyNullableAndMetadata(result, schema);
}

function convertArraySchema(schema: Schema & { elements: Schema }): JsonSchema {
    const result: JsonSchema = {
        type: 'array',
        items: convertAtdToJsonSchema(schema.elements),
    };

    return applyNullableAndMetadata(result, schema);
}

function convertObjectSchema(
    schema: Schema & {
        properties?: Record<string, Schema>;
        optionalProperties?: Record<string, Schema>;
        isStrict?: boolean;
    },
): JsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    // Convert required properties
    if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
            properties[key] = convertAtdToJsonSchema(propSchema);
            required.push(key);
        }
    }

    // Convert optional properties
    if (schema.optionalProperties) {
        for (const [key, propSchema] of Object.entries(
            schema.optionalProperties,
        )) {
            properties[key] = convertAtdToJsonSchema(propSchema);
        }
    }

    const result: JsonSchema = {
        type: 'object',
        properties,
    };

    if (required.length > 0) {
        result.required = required;
    }

    // Handle strict mode
    if (schema.isStrict) {
        result.additionalProperties = false;
    }

    return applyNullableAndMetadata(result, schema);
}

function convertRecordSchema(schema: Schema & { values: Schema }): JsonSchema {
    const result: JsonSchema = {
        type: 'object',
        additionalProperties: convertAtdToJsonSchema(schema.values),
    };

    return applyNullableAndMetadata(result, schema);
}

function convertDiscriminatorSchema(
    schema: Schema & {
        discriminator: string;
        mapping: Record<string, Schema>;
    },
): JsonSchema {
    const oneOf: JsonSchema[] = [];

    for (const [discriminatorValue, mappingSchema] of Object.entries(
        schema.mapping,
    )) {
        // Each variant needs to include the discriminator property
        const variantSchema = convertObjectSchema(
            mappingSchema as Schema & {
                properties?: Record<string, Schema>;
                optionalProperties?: Record<string, Schema>;
            },
        );

        // Add the discriminator property with a const value
        if (!variantSchema.properties) {
            variantSchema.properties = {};
        }
        variantSchema.properties[schema.discriminator] = {
            type: 'string',
            const: discriminatorValue,
        };

        // Add discriminator to required
        if (!variantSchema.required) {
            variantSchema.required = [];
        }
        if (!variantSchema.required.includes(schema.discriminator)) {
            variantSchema.required.push(schema.discriminator);
        }

        oneOf.push(variantSchema);
    }

    const result: JsonSchema = { oneOf };

    return applyNullableAndMetadata(result, schema);
}

function convertRefSchema(schema: Schema & { ref: string }): JsonSchema {
    const result: JsonSchema = {
        $ref: `#/$defs/${schema.ref}`,
    };

    return applyNullableAndMetadata(result, schema);
}

function applyNullableAndMetadata(
    jsonSchema: JsonSchema,
    atdSchema: Schema,
): JsonSchema {
    // Apply nullable
    if (atdSchema.isNullable) {
        if (jsonSchema.type) {
            // If there's already a type, make it nullable
            if (Array.isArray(jsonSchema.type)) {
                if (!jsonSchema.type.includes('null')) {
                    jsonSchema.type = [...jsonSchema.type, 'null'];
                }
            } else {
                jsonSchema.type = [jsonSchema.type, 'null'];
            }
        } else if (jsonSchema.$ref) {
            // For $ref schemas, wrap in anyOf to add null
            return {
                anyOf: [jsonSchema, { type: 'null' }],
            };
        } else if (jsonSchema.oneOf) {
            // For discriminated unions, add null as an option
            return {
                anyOf: [jsonSchema, { type: 'null' }],
            };
        } else {
            // For empty schemas (any), we can add any type including null
            jsonSchema.type = 'null';
        }
    }

    // Apply metadata
    if (atdSchema.metadata) {
        if (atdSchema.metadata.id) {
            jsonSchema.title = atdSchema.metadata.id;
        }
        if (atdSchema.metadata.description) {
            jsonSchema.description = atdSchema.metadata.description;
        }
        if (atdSchema.metadata.isDeprecated) {
            jsonSchema.deprecated = true;
        }
    }

    return jsonSchema;
}
