import { type SchemaFormProperties } from '@arrirpc/type-defs';

import {
    type AObjectSchema,
    type AObjectSchemaOptions,
    type ASchema,
    type InferObjectOutput,
    type InferType,
    isObject,
    type ResolveObject,
    SCHEMA_METADATA,
    type ValidationContext,
} from '../schemas';
import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../standardSchema';
import { optional } from './modifiers';

/**
 * Create an object schema
 *
 * @example
 * const Schema = a.object('Schema', {
 *   foo: a.string(),
 *   bar: a.number()
 * });
 * a.validate(Schema, {foo: "", bar: 0}) // true
 * a.validate(Schema, {foo: null, bar: 0}) // false
 */
export function object<
    TInput extends Record<any, ASchema> = any,
    TAdditionalProps extends boolean = false,
>(
    input: TInput,
    opts?: AObjectSchemaOptions<TAdditionalProps>,
): AObjectSchema<InferObjectOutput<TInput>, TAdditionalProps>;
export function object<
    TInput extends Record<any, ASchema> = any,
    TAdditionalProps extends boolean = false,
>(
    id: string,
    input: TInput,
): AObjectSchema<InferObjectOutput<TInput>, TAdditionalProps>;
export function object<
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TInput extends Record<any, ASchema> = {},
    TAdditionalProps extends boolean = false,
>(
    propA: TInput | string,
    propB?: TInput | AObjectSchemaOptions<TAdditionalProps>,
): AObjectSchema<InferObjectOutput<TInput>, TAdditionalProps> {
    const isIdShorthand = typeof propA === 'string';
    const input = isIdShorthand ? (propB as TInput) : propA;
    const options = isIdShorthand
        ? { id: propA }
        : ((propB ?? {}) as AObjectSchemaOptions<TAdditionalProps>);
    const schema: SchemaFormProperties = {
        properties: {},
    };
    if (typeof options.strict === 'boolean') {
        schema.strict = options.strict;
    }
    for (const key of Object.keys(input)) {
        const prop = input[key]!;
        if (prop.metadata[SCHEMA_METADATA].optional) {
            if (!schema.optionalProperties) {
                schema.optionalProperties = {};
            }
            schema.optionalProperties[key] = prop;
            continue;
        }
        schema.properties[key] = prop;
    }
    const validate = (input: unknown): input is InferObjectOutput<TInput> => {
        return validateObjectSchema(schema as AObjectSchema, input);
    };
    const parse = (
        input: unknown,
        context: ValidationContext,
    ): InferObjectOutput<TInput> | undefined => {
        return parseObjectSchema(
            schema as AObjectSchema,
            input,
            context,
            false,
        );
    };
    const result: AObjectSchema<any, TAdditionalProps> = {
        ...(schema as any),
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
            [SCHEMA_METADATA]: {
                output: {} as any satisfies InferObjectOutput<TInput>,
                parse,
                coerce(input: unknown, context) {
                    return parseObjectSchema(
                        schema as AObjectSchema,
                        input,
                        context,
                        true,
                    );
                },
                validate,
                serialize(input, context) {
                    return serializeObject(
                        schema as AObjectSchema,
                        input,
                        context,
                    );
                },
            },
        },
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}

export function parseObjectSchema<T>(
    schema: AObjectSchema<T>,
    input: unknown,
    data: ValidationContext,
    coerce = false,
): T | undefined {
    let parsedInput: any = input;
    if (data.instancePath.length === 0 && typeof input === 'string') {
        try {
            const result = JSON.parse(input);
            parsedInput = result;
        } catch (_err) {
            data.errors.push({
                instancePath: data.instancePath,
                schemaPath: `${data.schemaPath}/properties`,
                message: `Error at ${data.instancePath}. Invalid JSON.`,
            });
            return undefined;
        }
    }
    if (!isObject(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/properties`,
            message: `Error at ${data.instancePath}. Expected object`,
        });
        return undefined;
    }
    const result: Record<any, any> = {};
    const optionalProps = schema.optionalProperties ?? {};
    const inputKeys = Object.keys(parsedInput);
    const requiredKeys = Object.keys(schema.properties);
    const optionalKeys = Object.keys(optionalProps);
    if (schema.strict) {
        for (const key of inputKeys) {
            if (
                !requiredKeys.includes(key) &&
                !optionalKeys.includes(key) &&
                key !== data.discriminatorKey
            ) {
                data.errors.push({
                    instancePath: `${data.instancePath}/${key}`,
                    schemaPath: `${data.schemaPath}/strict`,
                    message: `Error at ${data.instancePath}/${key}. Key '${key}' is not included in the schema. To allow additional input properties set strict to 'false'.`,
                });
            }
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    if (data.discriminatorKey) {
        result[data.discriminatorKey] = data.discriminatorValue;
    }
    for (const key of requiredKeys) {
        const val = parsedInput[key];
        const prop = schema.properties[key]!;
        if (coerce) {
            result[key] = prop.metadata[SCHEMA_METADATA].coerce(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/properties/${key}`,
                errors: data.errors,
            });
            continue;
        }
        result[key] = prop.metadata[SCHEMA_METADATA].parse(val, {
            instancePath: `${data.instancePath}/${key}`,
            schemaPath: `${data.schemaPath}/properties/${key}`,
            errors: data.errors,
        });
    }
    for (const key of optionalKeys) {
        const val = parsedInput[key];
        const prop = optionalProps[key]!;
        if (val === undefined) {
            continue;
        }
        if (coerce) {
            result[key] = prop.metadata[SCHEMA_METADATA].coerce(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/optionalProperties/${key}`,
                errors: data.errors,
            });
            continue;
        }
        if (typeof val !== 'undefined') {
            result[key] = prop.metadata[SCHEMA_METADATA].parse(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/optionalProperties/${key}`,
                errors: data.errors,
            });
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}

export function validateObjectSchema(
    schema: AObjectSchema,
    input: unknown,
): boolean {
    if (!isObject(input)) {
        return false;
    }
    const allowedKeys: string[] | undefined = schema.strict ? [] : undefined;
    for (const key of Object.keys(schema.properties)) {
        const propSchema = schema.properties[key]!;
        const isValid = propSchema.metadata[SCHEMA_METADATA].validate(
            input[key],
        );
        if (!isValid) return false;
        allowedKeys?.push(key);
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const propsSchema = schema.optionalProperties[key]!;
            const isValid = propsSchema.metadata[SCHEMA_METADATA].validate(
                input[key],
            );
            if (!isValid) return false;
            allowedKeys?.push(key);
        }
    }
    if (allowedKeys) {
        for (const key of Object.keys(input)) {
            if (!allowedKeys.includes(key)) return false;
        }
    }
    return true;
}

/**
 * Create an object schema using a subset of keys from another object schema
 *
 * @example
 * const BaseObject = a.object({
 *   foo: a.string(),
 *   bar: a.string(),
 *   baz: a.string(),
 * }) // { foo: string; bar: string; baz: string; }
 *
 * const SubObject = a.pick(User, ['foo']) // { foo: string; }
 */
export function pick<
    TSchema extends AObjectSchema<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    inputSchema: TSchema,
    keys: TKeys[],
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Pick<InferType<TSchema>, TKeys>, TAdditionalProps> {
    type TOutput = Pick<InferType<TSchema>, TKeys>;
    const schema: SchemaFormProperties = {
        properties: {},
        nullable: inputSchema.nullable,
    };
    if (typeof options.strict === 'boolean') {
        schema.strict = options.strict;
    }

    Object.keys(inputSchema.properties).forEach((key) => {
        if (!schema.properties) {
            return;
        }
        if (keys.includes(key as any)) {
            schema.properties[key] = inputSchema.properties[key]!;
        }
    });
    if (inputSchema.optionalProperties) {
        schema.optionalProperties = {};
        Object.keys(inputSchema.optionalProperties).forEach((key) => {
            if (!schema.optionalProperties || !inputSchema.optionalProperties) {
                return;
            }
            if (keys.includes(key as any)) {
                schema.optionalProperties[key] =
                    inputSchema.optionalProperties[key]!;
            }
        });
    }
    const parse = (
        input: unknown,
        context: ValidationContext,
    ): TOutput | undefined => {
        return parseObjectSchema(schema as any, input, context, false);
    };
    const validate = (input: unknown): input is TOutput => {
        return validateObjectSchema(schema as any, input);
    };
    const result: AObjectSchema<
        Pick<InferType<TSchema>, TKeys>,
        TAdditionalProps
    > = {
        ...(schema as any),
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
            [SCHEMA_METADATA]: {
                output: {} as any satisfies Pick<InferType<TSchema>, TKeys>,
                parse,
                coerce(input, context) {
                    return parseObjectSchema(
                        schema as any,
                        input,
                        context,
                        false,
                    );
                },
                validate,
                serialize(input, context) {
                    return serializeObject(schema as any, input, context);
                },
            },
        },
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}

/**
 * Create an object schema by omitting keys from another object schema
 *
 * @example
 * const BaseObject = a.object({
 *   foo: a.string(),
 *   bar: a.string(),
 *   baz: a.string(),
 * }); // { foo: string; bar: string; baz: string; }
 *
 * const SubObject = a.omit(BaseObject, ['foo']) // { bar: string; baz: string; }
 */
export function omit<
    TSchema extends AObjectSchema<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    inputSchema: TSchema,
    keys: TKeys[],
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Omit<InferType<TSchema>, TKeys>, TAdditionalProps> {
    type TOutput = Omit<InferType<TSchema>, TKeys>;
    const schema: SchemaFormProperties = {
        properties: {
            ...inputSchema.properties,
        },
        nullable: inputSchema.nullable,
    };
    if (typeof options.strict === 'boolean') {
        schema.strict = options.strict;
    }
    Object.keys(inputSchema.properties).forEach((key) => {
        if (keys.includes(key as any)) {
            delete schema.properties[key];
        }
    });
    if (inputSchema.optionalProperties) {
        schema.optionalProperties = {
            ...(inputSchema.optionalProperties as any),
        };
        Object.keys(inputSchema.optionalProperties).forEach((key) => {
            if (!schema.optionalProperties) {
                return;
            }
            if (keys.includes(key as any)) {
                delete schema.optionalProperties[key];
            }
        });
    }
    const validate = (input: unknown): input is TOutput =>
        validateObjectSchema(schema as any, input);
    const parse = (
        input: unknown,
        context: ValidationContext,
    ): TOutput | undefined =>
        parseObjectSchema(schema as any, input, context, false);
    const result: AObjectSchema<
        Omit<InferType<TSchema>, TKeys>,
        TAdditionalProps
    > = {
        ...(schema as any),
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
            [SCHEMA_METADATA]: {
                output: {} as any,
                validate,
                parse,
                serialize(input, context) {
                    return serializeObject(schema as any, input, context);
                },
                coerce(input, context) {
                    return parseObjectSchema(
                        schema as any,
                        input,
                        context,
                        true,
                    );
                },
            },
        },
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}

export function serializeObject(
    schema: AObjectSchema,
    input: any,
    data: ValidationContext,
) {
    const strParts: string[] = [];
    if (data.discriminatorKey && data.discriminatorValue) {
        strParts.push(
            `"${data.discriminatorKey}":"${data.discriminatorValue}"`,
        );
    }
    for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key]!;
        const val = input[key];
        if (typeof val !== 'undefined') {
            strParts.push(
                `"${key}":${prop.metadata[SCHEMA_METADATA].serialize(val, {
                    instancePath: `${data.instancePath}/${key}`,
                    schemaPath: `${data.schemaPath}/properties/${key}`,
                    errors: data.errors,
                })}`,
            );
        }
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const prop = schema.optionalProperties[key]!;
            const val = input[key];
            if (typeof val !== 'undefined') {
                strParts.push(
                    `"${key}":${prop.metadata[SCHEMA_METADATA].serialize(val, {
                        instancePath: `${data.instancePath}/${key}`,
                        schemaPath: `${data.schemaPath}/optionalProperties/${key}`,
                        errors: data.errors,
                    })}`,
                );
            }
        }
    }
    return `{${strParts.join(',')}}`;
}

export function extend<
    TBaseSchema extends AObjectSchema<any, any> = any,
    TSchema extends AObjectSchema<any, any> = any,
    TAdditionalProps extends boolean = false,
>(
    baseSchema: TBaseSchema,
    inputSchema: TSchema,
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<
    ResolveObject<InferType<TBaseSchema> & InferType<TSchema>>,
    TAdditionalProps
> {
    const schema: SchemaFormProperties = {
        properties: {
            ...baseSchema.properties,
            ...inputSchema.properties,
        },
        optionalProperties: {
            ...baseSchema.optionalProperties,
            ...inputSchema.optionalProperties,
        },
    };
    if (typeof options.strict === 'boolean') {
        schema.strict = options.strict;
    }

    const isType = (
        input: unknown,
    ): input is InferType<TBaseSchema> & InferType<TSchema> =>
        validateObjectSchema(schema as any, input);
    const meta: ASchema['metadata'] = {
        id: options.id,
        description: options.description,
        [SCHEMA_METADATA]: {
            output: {} as any as InferType<TBaseSchema> & InferType<TSchema>,
            parse(input: unknown, context) {
                return parseObjectSchema(schema as any, input, context, false);
            },
            coerce(input: unknown, context) {
                return parseObjectSchema(schema as any, input, context, true);
            },
            validate: isType,
            serialize(input, context) {
                return serializeObject(schema as any, input, context);
            },
        },
    };
    schema.metadata = meta;
    return schema as any;
}

export function partial<
    TSchema extends AObjectSchema<any, any> = any,
    TAdditionalProps extends boolean = false,
>(
    schema: TSchema,
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Partial<InferType<TSchema>>, TAdditionalProps> {
    const newSchema: SchemaFormProperties = {
        properties: {},
        optionalProperties: {},
        nullable: schema.nullable,
    };
    if (typeof options.strict === 'boolean') {
        schema.strict = options.strict;
    }
    for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key]!;
        (newSchema.optionalProperties as any)[key] = optional(prop);
    }
    if (schema.optionalProperties && newSchema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const prop = schema.optionalProperties[key]!;
            if (prop.metadata[SCHEMA_METADATA].optional) {
                newSchema.optionalProperties[key] = prop;
            } else {
                newSchema.optionalProperties[key] = optional(prop);
            }
        }
    }
    const validate = (input: unknown): input is Partial<InferType<TSchema>> => {
        return validateObjectSchema(newSchema as any, input);
    };
    const parse = (
        input: unknown,
        context: ValidationContext,
    ): Partial<InferType<TSchema>> | undefined => {
        return parseObjectSchema(newSchema as any, input, context, false);
    };
    const meta: ASchema['metadata'] = {
        id: options.id,
        description: options.description,
        [SCHEMA_METADATA]: {
            output: {} as any,
            optional: schema.metadata[SCHEMA_METADATA].optional,
            validate,
            parse,
            coerce(input, context) {
                return parseObjectSchema(
                    newSchema as any,
                    input,
                    context,
                    true,
                );
            },
            serialize(input, context) {
                return serializeObject(schema, input, context);
            },
        },
    };
    newSchema.metadata = meta;
    (newSchema as any)['~standard'] = createStandardSchemaProperty(
        validate,
        parse,
    );
    hideInvalidProperties(newSchema as any);
    return newSchema as any;
}
