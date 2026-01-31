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

// ============================================================================
// Types
// ============================================================================

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
    /**
     * Whether to include $defs for named types (types with metadata.id)
     * @default true
     */
    definitions?: boolean;
    /**
     * The JSON Schema draft version to target
     * @default "https://json-schema.org/draft/2020-12/schema"
     */
    $schema?: string;
}

// ============================================================================
// Main API
// ============================================================================

/**
 * Convert an Arri schema to JSON Schema format
 *
 * @example
 * ```ts
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
 * ```
 */
export function toJsonSchema<T>(
    schema: ASchema<T>,
    options?: ToJsonSchemaOptions,
): JsonSchema {
    const result = schemaToJsonSchema(schema as unknown as Schema);
    return applyRootOptions(result, options);
}

/**
 * Convert a raw ATD Schema object to JSON Schema format.
 * This is useful when working with plain schema objects from AppDefinition.
 */
export function schemaToJsonSchema(schema: Schema): JsonSchema {
    return convertSchema(schema);
}

/**
 * Apply root-level options to a JSON Schema
 */
function applyRootOptions(
    schema: JsonSchema,
    options?: ToJsonSchemaOptions,
): JsonSchema {
    const result = { ...schema };

    result.$schema =
        options?.$schema ?? 'https://json-schema.org/draft/2020-12/schema';

    if (options?.$id) {
        result.$id = options.$id;
    }
    if (options?.title) {
        result.title = options.title;
    }
    if (options?.description) {
        result.description = options.description;
    }

    return result;
}

// ============================================================================
// Schema Converters
// ============================================================================

function convertSchema(schema: Schema): JsonSchema {
    if (isSchemaFormEmpty(schema)) {
        return withMetadata({}, schema);
    }
    if (isSchemaFormType(schema)) {
        return convertScalar(schema as Schema & { type: string });
    }
    if (isSchemaFormEnum(schema)) {
        return convertEnum(schema as Schema & { enum: string[] });
    }
    if (isSchemaFormElements(schema)) {
        return convertArray(schema as Schema & { elements: Schema });
    }
    if (isSchemaFormProperties(schema)) {
        return convertObject(schema as ObjectSchema);
    }
    if (isSchemaFormValues(schema)) {
        return convertRecord(schema as Schema & { values: Schema });
    }
    if (isSchemaFormDiscriminator(schema)) {
        return convertDiscriminator(schema as DiscriminatorSchema);
    }
    if (isSchemaFormRef(schema)) {
        return convertRef(schema as Schema & { ref: string });
    }
    return withMetadata({}, schema);
}

// Type aliases for cleaner function signatures
type ObjectSchema = Schema & {
    properties?: Record<string, Schema>;
    optionalProperties?: Record<string, Schema>;
    isStrict?: boolean;
};

type DiscriminatorSchema = Schema & {
    discriminator: string;
    mapping: Record<string, Schema>;
};

// Scalar type mappings
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

function convertScalar(schema: Schema & { type: string }): JsonSchema {
    const mapping = SCALAR_MAPPINGS[schema.type];
    const result = mapping ? { ...mapping } : {};
    return withMetadata(result, schema);
}

function convertEnum(schema: Schema & { enum: string[] }): JsonSchema {
    return withMetadata({ type: 'string', enum: [...schema.enum] }, schema);
}

function convertArray(schema: Schema & { elements: Schema }): JsonSchema {
    return withMetadata(
        { type: 'array', items: convertSchema(schema.elements) },
        schema,
    );
}

function convertObject(schema: ObjectSchema): JsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
        properties[key] = convertSchema(propSchema);
        required.push(key);
    }

    for (const [key, propSchema] of Object.entries(
        schema.optionalProperties ?? {},
    )) {
        properties[key] = convertSchema(propSchema);
    }

    const result: JsonSchema = { type: 'object', properties };

    if (required.length > 0) {
        result.required = required;
    }
    if (schema.isStrict) {
        result.additionalProperties = false;
    }

    return withMetadata(result, schema);
}

function convertRecord(schema: Schema & { values: Schema }): JsonSchema {
    return withMetadata(
        { type: 'object', additionalProperties: convertSchema(schema.values) },
        schema,
    );
}

function convertDiscriminator(schema: DiscriminatorSchema): JsonSchema {
    const oneOf: JsonSchema[] = Object.entries(schema.mapping).map(
        ([value, mappingSchema]) => {
            const variant = convertObject(mappingSchema as ObjectSchema);

            // Add discriminator property
            variant.properties = {
                ...variant.properties,
                [schema.discriminator]: { type: 'string', const: value },
            };

            // Add to required
            variant.required = variant.required ?? [];
            if (!variant.required.includes(schema.discriminator)) {
                variant.required.push(schema.discriminator);
            }

            return variant;
        },
    );

    return withMetadata({ oneOf }, schema);
}

function convertRef(schema: Schema & { ref: string }): JsonSchema {
    return withMetadata({ $ref: `#/$defs/${schema.ref}` }, schema);
}

// ============================================================================
// Helpers
// ============================================================================

function withMetadata(jsonSchema: JsonSchema, atdSchema: Schema): JsonSchema {
    // Handle nullable
    if (atdSchema.isNullable) {
        return makeNullable(jsonSchema, atdSchema);
    }
    return applyMetadataFields(jsonSchema, atdSchema);
}

function makeNullable(jsonSchema: JsonSchema, atdSchema: Schema): JsonSchema {
    // For $ref or oneOf, wrap in anyOf
    if (jsonSchema.$ref || jsonSchema.oneOf) {
        return applyMetadataFields(
            { anyOf: [jsonSchema, { type: 'null' }] },
            atdSchema,
        );
    }

    // For schemas with type, add null to the type array
    if (jsonSchema.type) {
        const types = Array.isArray(jsonSchema.type)
            ? jsonSchema.type
            : [jsonSchema.type];
        if (!types.includes('null')) {
            jsonSchema.type = [...types, 'null'];
        }
    } else {
        // Empty schema (any) - just mark as null type
        jsonSchema.type = 'null';
    }

    return applyMetadataFields(jsonSchema, atdSchema);
}

function applyMetadataFields(
    jsonSchema: JsonSchema,
    atdSchema: Schema,
): JsonSchema {
    const { metadata } = atdSchema;
    if (!metadata) return jsonSchema;

    if (metadata.id) {
        jsonSchema.title = metadata.id;
    }
    if (metadata.description) {
        jsonSchema.description = metadata.description;
    }
    if (metadata.isDeprecated) {
        jsonSchema.deprecated = true;
    }

    return jsonSchema;
}
