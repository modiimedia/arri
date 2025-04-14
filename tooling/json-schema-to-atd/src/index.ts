import {
    type Schema,
    type SchemaFormElements,
    type SchemaFormEmpty,
    type SchemaFormEnum,
    type SchemaFormProperties,
    type SchemaFormValues,
} from '@arrirpc/type-defs';

import {
    isJsonSchemaArray,
    isJsonSchemaEnum,
    isJsonSchemaObject,
    isJsonSchemaRecord,
    isJsonSchemaRef,
    isJsonSchemaScalarType,
    type JsonSchemaArray,
    type JsonSchemaEnum,
    type JsonSchemaObject,
    type JsonSchemaRecord,
    JsonSchemaRef,
    type JsonSchemaScalarType,
    type JsonSchemaType,
} from './models';
export * from './models';

export interface JsonSchemaContext {
    parentRefs: string[];
    rootSchema?: any;
}

export function jsonSchemaToJtdSchema(
    input: JsonSchemaType,
    context: JsonSchemaContext = { parentRefs: [] },
): Schema {
    if (isJsonSchemaScalarType(input)) {
        return jsonSchemaScalarToJtdScalar(input, context);
    }
    if (isJsonSchemaEnum(input)) {
        return jsonSchemaEnumToJtdEnum(input, context);
    }
    if (isJsonSchemaObject(input)) {
        return jsonSchemaObjectToJtdObject(input, context);
    }
    if (isJsonSchemaArray(input)) {
        return jsonSchemaArrayToJtdArray(input, context);
    }
    if (isJsonSchemaRecord(input)) {
        return jsonSchemaRecordToJtdRecord(input, context);
    }
    if (isJsonSchemaRef(input)) {
        return jsonSchemaRefToJtdRef(input, context);
    }

    console.warn(
        `WARNING: unable to determine type for ${
            input as any
        }. Falling back to "any" type.`,
    );
    // fallback to "any" type
    return {
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    } satisfies SchemaFormEmpty;
}

export function jsonSchemaEnumToJtdEnum(
    input: JsonSchemaEnum,
    _: JsonSchemaContext,
): Schema {
    const enumTypes = input.anyOf.map((val) => val.type);
    const isNotStringEnum =
        enumTypes.includes('integer') || enumTypes.includes('number');
    if (isNotStringEnum) {
        console.error(
            `WARNING: Cannot convert non string enums. This key will be treated as an "any" by generated clients.`,
        );
        const output: SchemaFormEmpty = {};
        return output;
    }
    const output: SchemaFormEnum = {
        enum: input.anyOf.map((val) => val.const as string),
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    return output;
}

export function jsonSchemaScalarToJtdScalar(
    input: JsonSchemaScalarType,
    _: JsonSchemaContext,
): Schema {
    const meta = {
        id: input.$id ?? input.title,
        description: input.description,
    };
    switch (input.type) {
        case 'Date':
            return {
                type: 'timestamp',
                isNullable: input.nullable,
                metadata: meta,
            };
        case 'bigint':
        case 'integer':
            return {
                type: 'int32',
                isNullable: input.nullable,
                metadata: meta,
            };
        case 'number':
            return {
                type: 'float64',
                isNullable: input.nullable,
                metadata: meta,
            };
        case 'boolean':
            return {
                type: 'boolean',
                isNullable: input.nullable,
                metadata: meta,
            };
        case 'string':
            if (input.format === 'date-time') {
                return {
                    type: 'timestamp',
                    isNullable: input.nullable,
                    metadata: meta,
                };
            }
            return {
                type: 'string',
                isNullable: input.nullable,
                metadata: meta,
            };
        default:
            return {};
    }
}

export function jsonSchemaObjectToJtdObject(
    input: JsonSchemaObject,
    _: JsonSchemaContext,
): Schema {
    const result: SchemaFormProperties = {
        properties: {},
        isNullable: input.nullable,
        isStrict:
            typeof input.additionalProperties === 'boolean'
                ? !input.additionalProperties
                : undefined,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    Object.keys(input.properties).forEach((key) => {
        const prop = input.properties[key];
        if (!prop) {
            return;
        }
        const isOptional = !(input.required ?? []).includes(key);
        if (isOptional) {
            if (!result.optionalProperties) {
                result.optionalProperties = {};
            }
            (result.optionalProperties as any)[key] =
                jsonSchemaToJtdSchema(prop);
            return;
        }
        (result.properties as any)[key] = jsonSchemaToJtdSchema(prop);
    });

    return result;
}

export function jsonSchemaArrayToJtdArray(
    input: JsonSchemaArray,
    _: JsonSchemaContext,
) {
    const result: SchemaFormElements = {
        elements: jsonSchemaToJtdSchema(input.items),
        isNullable: input.nullable,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    return result;
}

export function jsonSchemaRecordToJtdRecord(
    input: JsonSchemaRecord,
    _: JsonSchemaContext,
): Schema {
    if (input.additionalProperties) {
        const type = jsonSchemaToJtdSchema(input.additionalProperties);
        return {
            values: type,
            isNullable: input.nullable,
            metadata: {
                id: input.$id ?? input.title,
                description: input.description,
            },
        };
    }
    const types: Schema[] = [];
    Object.keys(input.patternProperties ?? {}).forEach((key) => {
        const pattern = input.patternProperties![key];
        if (!pattern) {
            return;
        }
        types.push(jsonSchemaToJtdSchema(pattern));
    });
    if (types.length === 0) {
        console.warn(
            'WARNING: unable to determine record type values. This key will be treated as "any" by client generators.',
        );
        return {};
    }
    const result: SchemaFormValues = {
        values: types[0]!,
        isNullable: input.nullable,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    return result;
}

export function jsonSchemaRefToJtdRef(
    input: JsonSchemaRef,
    context: JsonSchemaContext,
): Schema {
    if (context.parentRefs.includes(input.$ref)) {
        const parts = input.$ref.split('/');
        const refId = parts[parts.length - 1];
        if (!refId) return {};
        return {
            isNullable: input.nullable,
            ref: refId,
        };
    }
    const parts = input.$ref.split('/');
    let subSchema = context.rootSchema ?? {};
    for (const part of parts) {
        if (part === '#') continue;
        if (!subSchema[part]) return {};
        subSchema = subSchema[part];
    }
    const r = context.parentRefs;
    r.push(input.$ref);
    const result = jsonSchemaToJtdSchema(subSchema, {
        ...context,
        parentRefs: r,
    });
    return result;
}
