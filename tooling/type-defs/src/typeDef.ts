export function isObject(input: unknown): input is Record<any, any> {
    return typeof input === 'object' && input !== null;
}

export interface SchemaMetadata {
    id?: string;
    description?: string;
    isDeprecated?: boolean;
    deprecatedNote?: string;
}

export type Schema =
    | SchemaFormEmpty
    | SchemaFormType
    | SchemaFormEnum
    | SchemaFormElements
    | SchemaFormProperties
    | SchemaFormValues
    | SchemaFormDiscriminator
    | SchemaFormUnion
    | SchemaFormRef;
export function isSchema(input: unknown): input is Schema {
    const allowedProperties = [
        'metadata',
        'isNullable',
        'isStrict',
        'type',
        'enum',
        'elements',
        'values',
        'properties',
        'optionalProperties',
        'discriminator',
        'mapping',
        'ref',
        'definitions',
    ];
    if (!isObject(input)) {
        return false;
    }
    for (const key of Object.keys(input)) {
        if (!allowedProperties.includes(key)) {
            return false;
        }
    }
    return true;
}

// ANY //
export interface SchemaFormEmpty {
    metadata?: SchemaMetadata;
    isNullable?: boolean;
}
export function isSchemaFormEmpty(input: unknown): input is SchemaFormEmpty {
    if (!isObject(input)) {
        return false;
    }
    const keys = Object.keys(input);
    if (keys.length === 0) {
        return true;
    }
    if (
        keys.length === 1 &&
        'metadata' in input &&
        typeof input.metadata === 'object' &&
        input.metadata !== null
    ) {
        return true;
    }
    return false;
}

// BASIC TYPES //
export const TypeValues = [
    'boolean',
    'float32',
    'float64',
    'int8',
    'uint8',
    'int16',
    'uint16',
    'int32',
    'uint32',
    'int64',
    'uint64',
    'string',
    'timestamp',
] as const;
export type Type = (typeof TypeValues)[number];
export interface SchemaFormType extends SchemaFormEmpty {
    type: Type;
}
export function isSchemaFormType(input: unknown): input is SchemaFormType {
    if (!isObject(input)) {
        return false;
    }

    return TypeValues.includes(input.type);
}

// ENUMS //
export interface SchemaFormEnum extends SchemaFormEmpty {
    enum: string[];
}
export function isSchemaFormEnum(input: unknown): input is SchemaFormEnum {
    if (!isObject(input)) {
        return false;
    }
    return (
        Array.isArray(input.enum) &&
        input.enum.every((val) => typeof val === 'string')
    );
}

// ARRAYS //
export interface SchemaFormElements extends SchemaFormEmpty {
    elements: Schema;
}
export function isSchemaFormElements(
    input: unknown,
): input is SchemaFormElements {
    if (!isObject(input)) {
        return false;
    }
    return 'elements' in input;
}

// OBJECTS //
export interface SchemaFormProperties extends SchemaFormEmpty {
    properties: Record<string, Schema>;
    optionalProperties?: Record<string, Schema>;
    isStrict?: boolean;
}
export function isSchemaFormProperties(
    input: unknown,
): input is SchemaFormProperties {
    if (!isObject(input)) {
        return false;
    }
    if (
        'properties' in input &&
        typeof input.properties === 'object' &&
        input.properties !== null
    ) {
        const keys = Object.keys(input.properties);
        if (keys[0]) {
            return isSchema(input.properties[keys[0]]);
        }
        return true;
    }
    return false;
}

// RECORDS //
export interface SchemaFormValues extends SchemaFormEmpty {
    values: Schema;
}
export function isSchemaFormValues(input: unknown): input is SchemaFormValues {
    if (!isObject(input)) {
        return false;
    }
    return 'values' in input && isSchema(input.values);
}

// TAGGED UNIONS //
/**
 * @deprecated will be removed in a future version. please migrate to SchemaFormUnion
 */
export interface SchemaFormDiscriminator extends SchemaFormEmpty {
    discriminator: string;
    mapping: Record<string, SchemaFormProperties>;
}
/**
 * @deprecated will be removed in a future version. please migrate to SchemaFormUnion
 */
export function isSchemaFormDiscriminator(
    input: unknown,
): input is SchemaFormDiscriminator {
    if (!isObject(input)) {
        return false;
    }
    if (
        'discriminator' in input &&
        typeof input.discriminator === 'string' &&
        input.discriminator.length > 0 &&
        typeof input.mapping === 'object' &&
        input.mapping !== null
    ) {
        for (const key of Object.keys(input.mapping)) {
            if (!isSchemaFormProperties(input.mapping[key])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

/**
 * Represents tagged / discriminated unions.
 *
 * ### Default (External Tagging)
 * If neither `tagKey` nor `valueKey` is set, the payload is nested under the active union key:
 * ```json
 * {
 *   "rectangle": {
 *     "width": 15,
 *     "height": 15
 *   }
 * }
 * ```
 */
export interface SchemaFormUnion extends SchemaFormEmpty {
    /**
     * Enables internal / adjacent tagging using this field as the discriminator.
     *
     * ### Example (`tagKey: "kind"`)
     * ```json
     * {
     *   "kind": "rectangle",
     *   "width": 15,
     *   "height": 15
     * }
     * ```
     */
    tagKey?: string;
    /**
     * Nests the union payload fields under this property name.
     *
     * *Note: Requires `tagKey` to be set.*
     *
     * ### Example (`tagKey: "type"`, `valueKey: "data"`)
     * ```json
     * {
     *   "type": "rectangle",
     *   "data": {
     *     "width": 15,
     *     "height": 15
     *   }
     * }
     * ```
     */
    valueKey?: string;
    /**
     * Map of union keys to their respective schemas.
     */
    union: Record<string, Schema>;
}

export function isSchemaFormUnion(input: unknown): input is SchemaFormUnion {
    if (!isObject(input)) {
        return false;
    }
    if (
        !('union' in input) ||
        typeof input.union !== 'object' ||
        input.union === null
    ) {
        return false;
    }
    if (
        'tagKey' in input &&
        typeof input.tagKey !== 'string' &&
        typeof input.tagKey !== 'undefined'
    ) {
        return false;
    }
    if (
        'valueKey' in input &&
        typeof input.valueKey !== 'string' &&
        typeof input.valueKey !== 'undefined'
    ) {
        return false;
    }
    return true;
}

// REFS //
export interface SchemaFormRef extends SchemaFormEmpty {
    ref: string;
}
export function isSchemaFormRef(input: unknown): input is SchemaFormRef {
    return (
        typeof input === 'object' &&
        input !== null &&
        'ref' in input &&
        typeof input.ref === 'string' &&
        input.ref.length > 0
    );
}
