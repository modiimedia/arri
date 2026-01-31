import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEmpty,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
} from '@arrirpc/type-defs';

import { type ASchema } from '../schemas';
import {
    int8Max,
    int8Min,
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    uint8Max,
    uint8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
} from './numberConstants';

export type JsonSchemaType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'object'
    | 'array'
    | 'null';

export interface JsonSchema {
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
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    enum?: unknown[];
    const?: unknown;
    items?: JsonSchema;
    minItems?: number;
    maxItems?: number;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    additionalProperties?: boolean | JsonSchema;
    oneOf?: JsonSchema[];
    anyOf?: JsonSchema[];
    allOf?: JsonSchema[];
    [key: string]: unknown;
}

export interface ToJsonSchemaOptions {
    /** The $id to use for the root schema */
    $id?: string;
    /** The title to use for the root schema */
    title?: string;
    /** The description to use for the root schema */
    description?: string;
    /** Whether to include $defs for named types (types with metadata.id) */
    definitions?: boolean;
    /** The JSON Schema draft version to target */
    $schema?: string;
}

/**
 * Convert an Arri schema to JSON Schema format
 *
 * @example
 * const User = a.object({
 *   id: a.string(),
 *   name: a.string(),
 *   email: a.nullable(a.string()),
 * });
 *
 * const jsonSchema = toJsonSchema(User, {
 *   $id: 'https://example.com/schemas/user.json',
 *   title: 'User',
 * });
 */
export function toJsonSchema<T>(
    schema: ASchema<T>,
    options?: ToJsonSchemaOptions,
): JsonSchema {
    return applyRootOptions(
        schemaToJsonSchema(schema as unknown as Schema),
        options,
    );
}

/**
 * Convert a raw ATD Schema object to JSON Schema format.
 * This is useful when working with plain schema objects from AppDefinition.
 */
export function schemaToJsonSchema(schema: Schema): JsonSchema {
    return convertSchema(schema);
}

function applyRootOptions(
    schema: JsonSchema,
    options?: ToJsonSchemaOptions,
): JsonSchema {
    return {
        ...schema,
        $schema:
            options?.$schema ?? 'https://json-schema.org/draft/2020-12/schema',
        ...(options?.$id && { $id: options.$id }),
        ...(options?.title && { title: options.title }),
        ...(options?.description && { description: options.description }),
    };
}

const SCALAR_MAPPINGS: Record<string, JsonSchema> = {
    string: { type: 'string' },
    boolean: { type: 'boolean' },
    timestamp: { type: 'string', format: 'date-time' },
    float32: { type: 'number' },
    float64: { type: 'number' },
    int8: { type: 'integer', minimum: int8Min, maximum: int8Max },
    uint8: { type: 'integer', minimum: uint8Min, maximum: uint8Max },
    int16: { type: 'integer', minimum: int16Min, maximum: int16Max },
    uint16: { type: 'integer', minimum: uint16Min, maximum: uint16Max },
    int32: { type: 'integer', minimum: int32Min, maximum: int32Max },
    uint32: { type: 'integer', minimum: uint32Min, maximum: uint32Max },
    int64: { type: 'string', pattern: '^-?[0-9]+$' },
    uint64: { type: 'string', pattern: '^[0-9]+$' },
};

type ObjectSchema = Schema & {
    properties?: Record<string, Schema>;
    optionalProperties?: Record<string, Schema>;
    isStrict?: boolean;
};

type DiscriminatorSchema = Schema & {
    discriminator: string;
    mapping: Record<string, Schema>;
};

function convertSchema(schema: Schema): JsonSchema {
    const base = getBaseSchema(schema);
    return schema.isNullable
        ? makeNullable(base, schema)
        : applyMetadata(base, schema);
}

function getBaseSchema(schema: Schema): JsonSchema {
    if (isSchemaFormEmpty(schema)) return {};
    if (isSchemaFormType(schema)) {
        const mapping =
            SCALAR_MAPPINGS[(schema as Schema & { type: string }).type];
        return mapping ? { ...mapping } : {};
    }
    if (isSchemaFormEnum(schema)) {
        return {
            type: 'string',
            enum: [...(schema as Schema & { enum: string[] }).enum],
        };
    }
    if (isSchemaFormElements(schema)) {
        return {
            type: 'array',
            items: convertSchema(
                (schema as Schema & { elements: Schema }).elements,
            ),
        };
    }
    if (isSchemaFormProperties(schema)) {
        return convertObject(schema as ObjectSchema);
    }
    if (isSchemaFormValues(schema)) {
        return {
            type: 'object',
            additionalProperties: convertSchema(
                (schema as Schema & { values: Schema }).values,
            ),
        };
    }
    if (isSchemaFormDiscriminator(schema)) {
        return convertDiscriminator(schema as DiscriminatorSchema);
    }
    if (isSchemaFormRef(schema)) {
        return { $ref: `#/$defs/${(schema as Schema & { ref: string }).ref}` };
    }
    return {};
}

function convertObject(schema: ObjectSchema): JsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, prop] of Object.entries(schema.properties ?? {})) {
        properties[key] = convertSchema(prop);
        required.push(key);
    }
    for (const [key, prop] of Object.entries(schema.optionalProperties ?? {})) {
        properties[key] = convertSchema(prop);
    }

    return {
        type: 'object',
        properties,
        ...(required.length > 0 && { required }),
        ...(schema.isStrict && { additionalProperties: false }),
    };
}

function convertDiscriminator(schema: DiscriminatorSchema): JsonSchema {
    const oneOf = Object.entries(schema.mapping).map(
        ([value, mappingSchema]) => {
            const variant = convertObject(mappingSchema as ObjectSchema);
            variant.properties = {
                ...variant.properties,
                [schema.discriminator]: { type: 'string', const: value },
            };
            variant.required = [
                ...(variant.required ?? []),
                schema.discriminator,
            ];
            return variant;
        },
    );
    return { oneOf };
}

function makeNullable(jsonSchema: JsonSchema, atdSchema: Schema): JsonSchema {
    if (jsonSchema.$ref || jsonSchema.oneOf) {
        return applyMetadata(
            { anyOf: [jsonSchema, { type: 'null' }] },
            atdSchema,
        );
    }

    if (jsonSchema.type) {
        const types = Array.isArray(jsonSchema.type)
            ? jsonSchema.type
            : [jsonSchema.type];
        jsonSchema.type = types.includes('null') ? types : [...types, 'null'];
    } else {
        jsonSchema.type = 'null';
    }

    return applyMetadata(jsonSchema, atdSchema);
}

function applyMetadata(
    jsonSchema: JsonSchema,
    { metadata }: Schema,
): JsonSchema {
    if (!metadata) return jsonSchema;
    return {
        ...jsonSchema,
        ...(metadata.id && { title: metadata.id }),
        ...(metadata.description && { description: metadata.description }),
        ...(metadata.isDeprecated && { deprecated: true }),
    };
}
