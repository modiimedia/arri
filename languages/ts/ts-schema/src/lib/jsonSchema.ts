import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEmpty,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
} from '@arrirpc/type-defs';

import {
    AArraySchema,
    ADiscriminatorSchema,
    AObjectSchema,
    ARecordSchema,
    ARefSchema,
    AScalarSchema,
    ASchema,
    AStringEnumSchema,
} from '../schemas';
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

/**
 * JSON Schema type definitions
 */
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

    // Metadata
    title?: string;
    description?: string;
    deprecated?: boolean;

    // Type
    type?: JsonSchemaType | JsonSchemaType[];

    // String
    pattern?: string;
    format?: string;
    minLength?: number;
    maxLength?: number;

    // Number/Integer
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;

    // Enum
    enum?: unknown[];
    const?: unknown;

    // Array
    items?: JsonSchema;
    minItems?: number;
    maxItems?: number;

    // Object
    properties?: Record<string, JsonSchema>;
    required?: string[];
    additionalProperties?: boolean | JsonSchema;

    // Composition
    oneOf?: JsonSchema[];
    anyOf?: JsonSchema[];
    allOf?: JsonSchema[];

    // Allow additional properties for extensibility
    [key: string]: unknown;
}

export interface ToJsonSchemaOptions {
    /**
     * The $id to use for the root schema
     */
    $id?: string;
    /**
     * The title to use for the root schema
     */
    title?: string;
    /**
     * The description to use for the root schema
     */
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

interface ConversionContext {
    definitions: Record<string, JsonSchema>;
    collectDefinitions: boolean;
    visitedRefs: Set<string>;
}

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
    const ctx: ConversionContext = {
        definitions: {},
        collectDefinitions: options?.definitions !== false,
        visitedRefs: new Set(),
    };

    const result = convertSchema(schema, ctx);

    // Add root schema properties
    if (options?.$schema !== undefined) {
        result.$schema = options.$schema;
    } else {
        result.$schema = 'https://json-schema.org/draft/2020-12/schema';
    }

    if (options?.$id) {
        result.$id = options.$id;
    }

    if (options?.title) {
        result.title = options.title;
    }

    if (options?.description) {
        result.description = options.description;
    }

    // Add $defs if there are any collected definitions
    if (ctx.collectDefinitions && Object.keys(ctx.definitions).length > 0) {
        result.$defs = ctx.definitions;
    }

    return result;
}

function convertSchema(schema: ASchema, ctx: ConversionContext): JsonSchema {
    // Handle empty schema (any type)
    if (isSchemaFormEmpty(schema)) {
        return applyNullableAndMetadata({}, schema);
    }

    // Handle scalar types
    if (isSchemaFormType(schema)) {
        return convertScalarSchema(schema as AScalarSchema, ctx);
    }

    // Handle enum
    if (isSchemaFormEnum(schema)) {
        return convertEnumSchema(schema as AStringEnumSchema<string[]>, ctx);
    }

    // Handle array
    if (isSchemaFormElements(schema)) {
        return convertArraySchema(schema as AArraySchema, ctx);
    }

    // Handle object
    if (isSchemaFormProperties(schema)) {
        return convertObjectSchema(schema as AObjectSchema, ctx);
    }

    // Handle record (values)
    if (isSchemaFormValues(schema)) {
        return convertRecordSchema(schema as ARecordSchema<ASchema>, ctx);
    }

    // Handle discriminator
    if (isSchemaFormDiscriminator(schema)) {
        return convertDiscriminatorSchema(
            schema as ADiscriminatorSchema<unknown>,
            ctx,
        );
    }

    // Handle ref
    if (isSchemaFormRef(schema)) {
        return convertRefSchema(schema as ARefSchema<unknown>, ctx);
    }

    // Fallback: empty schema for any
    return applyNullableAndMetadata({}, schema);
}

function convertScalarSchema(
    schema: AScalarSchema,
    _ctx: ConversionContext,
): JsonSchema {
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

function convertEnumSchema(
    schema: AStringEnumSchema<string[]>,
    _ctx: ConversionContext,
): JsonSchema {
    const result: JsonSchema = {
        type: 'string',
        enum: [...schema.enum],
    };

    return applyNullableAndMetadata(result, schema);
}

function convertArraySchema(
    schema: AArraySchema,
    ctx: ConversionContext,
): JsonSchema {
    const result: JsonSchema = {
        type: 'array',
        items: convertSchema(schema.elements, ctx),
    };

    return applyNullableAndMetadata(result, schema);
}

function convertObjectSchema(
    schema: AObjectSchema,
    ctx: ConversionContext,
): JsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    // Convert required properties
    if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
            properties[key] = convertSchema(propSchema as ASchema, ctx);
            required.push(key);
        }
    }

    // Convert optional properties
    if (schema.optionalProperties) {
        for (const [key, propSchema] of Object.entries(
            schema.optionalProperties,
        )) {
            properties[key] = convertSchema(propSchema as ASchema, ctx);
            // Optional properties are not added to required array
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

function convertRecordSchema(
    schema: ARecordSchema<ASchema>,
    ctx: ConversionContext,
): JsonSchema {
    const result: JsonSchema = {
        type: 'object',
        additionalProperties: convertSchema(schema.values, ctx),
    };

    return applyNullableAndMetadata(result, schema);
}

function convertDiscriminatorSchema(
    schema: ADiscriminatorSchema<unknown>,
    ctx: ConversionContext,
): JsonSchema {
    const oneOf: JsonSchema[] = [];

    for (const [discriminatorValue, mappingSchema] of Object.entries(
        schema.mapping,
    )) {
        // Each variant needs to include the discriminator property
        const variantSchema = convertObjectSchema(
            mappingSchema as AObjectSchema,
            ctx,
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

function convertRefSchema(
    schema: ARefSchema<unknown>,
    _ctx: ConversionContext,
): JsonSchema {
    const result: JsonSchema = {
        $ref: `#/$defs/${schema.ref}`,
    };

    return applyNullableAndMetadata(result, schema);
}

function applyNullableAndMetadata(
    jsonSchema: JsonSchema,
    atdSchema: ASchema,
): JsonSchema {
    // Apply nullable
    if (atdSchema.isNullable) {
        if (jsonSchema.type) {
            // If there's already a type, make it nullable by creating an array of types
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
