import { type SchemaFormProperties } from '@arrirpc/type-defs';

import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AObjectSchemaOptions,
    AObjectSchemaWithAdapters,
    type ASchema,
    ASchemaWithAdapters,
    type InferObjectOutput,
    type InferType,
    isObject,
    type ResolveObject,
    SchemaValidator,
    type ValidationContext,
    VALIDATOR_KEY,
} from '../schemas';
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
): AObjectSchemaWithAdapters<InferObjectOutput<TInput>, TAdditionalProps>;
export function object<
    TInput extends Record<any, ASchema> = any,
    TAdditionalProps extends boolean = false,
>(
    id: string,
    input: TInput,
): AObjectSchemaWithAdapters<InferObjectOutput<TInput>, TAdditionalProps>;
export function object<
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TInput extends Record<any, ASchema> = {},
    TAdditionalProps extends boolean = false,
>(
    propA: TInput | string,
    propB?: TInput | AObjectSchemaOptions<TAdditionalProps>,
): AObjectSchemaWithAdapters<InferObjectOutput<TInput>, TAdditionalProps> {
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
        if (prop[VALIDATOR_KEY].optional) {
            if (!schema.optionalProperties) {
                schema.optionalProperties = {};
            }
            schema.optionalProperties[key] = prop;
            continue;
        }
        schema.properties[key] = prop;
    }
    const validate = (input: unknown): input is InferObjectOutput<TInput> => {
        return validateObjectSchema(schema as AObjectSchemaWithAdapters, input);
    };
    const decode = (
        input: unknown,
        context: ValidationContext,
    ): InferObjectOutput<TInput> | undefined => {
        return decodeObjectSchema(
            schema as AObjectSchemaWithAdapters,
            input,
            context,
            false,
        );
    };
    const validator: SchemaValidator<any> = {
        output: {} as any satisfies InferObjectOutput<TInput>,
        parse: decode,
        coerce(input: unknown, context) {
            return decodeObjectSchema(
                schema as AObjectSchemaWithAdapters,
                input,
                context,
                true,
            );
        },
        validate,
        serialize(input, context) {
            return serializeObject(
                schema as AObjectSchemaWithAdapters,
                input,
                context,
            );
        },
    };
    const result: AObjectSchemaWithAdapters<any, TAdditionalProps> = {
        ...(schema as any),
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(validate, decode),
    };
    hideInvalidProperties(result);
    return result;
}

export function decodeObjectSchema<T>(
    schema: AObjectSchemaWithAdapters<T>,
    input: unknown,
    context: ValidationContext,
    coerce = false,
): T | undefined {
    let parsedInput: any = input;
    if (context.instancePath.length === 0 && typeof input === 'string') {
        try {
            const result = JSON.parse(input);
            parsedInput = result;
        } catch (_err) {
            context.errors.push({
                instancePath: context.instancePath,
                schemaPath: `${context.schemaPath}/properties`,
                message: `Error at ${context.instancePath}. Invalid JSON.`,
            });
            return undefined;
        }
    }
    if (!isObject(parsedInput)) {
        context.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/properties`,
            message: `Error at ${context.instancePath}. Expected object`,
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
                key !== context.discriminatorKey
            ) {
                context.errors.push({
                    instancePath: `${context.instancePath}/${key}`,
                    schemaPath: `${context.schemaPath}/strict`,
                    message: `Error at ${context.instancePath}/${key}. Key '${key}' is not included in the schema. To allow additional input properties set strict to 'false'.`,
                });
            }
        }
    }
    if (context.errors.length) {
        return undefined;
    }
    if (context.discriminatorKey) {
        result[context.discriminatorKey] = context.discriminatorValue;
    }
    for (const key of requiredKeys) {
        const val = parsedInput[key];
        const prop = schema.properties[key]!;
        if (coerce) {
            result[key] = prop[VALIDATOR_KEY].coerce(val, {
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/properties/${key}`,
                errors: context.errors,
                depth: context.depth + 1,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            });
            if (context.errors.length && context.exitOnFirstError) {
                return undefined;
            }
            continue;
        }
        result[key] = prop[VALIDATOR_KEY].parse(val, {
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            errors: context.errors,
            depth: context.depth + 1,
            maxDepth: context.maxDepth,
            exitOnFirstError: context.exitOnFirstError,
        });
        if (context.errors.length && context.exitOnFirstError) {
            return undefined;
        }
    }
    for (const key of optionalKeys) {
        const val = parsedInput[key];
        const prop = optionalProps[key]!;
        if (val === undefined) {
            continue;
        }
        if (coerce) {
            result[key] = prop[VALIDATOR_KEY].coerce(val, {
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
                errors: context.errors,
                depth: context.depth + 1,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            });
            if (context.errors.length && context.exitOnFirstError) {
                return undefined;
            }
            continue;
        }
        if (typeof val !== 'undefined') {
            result[key] = prop[VALIDATOR_KEY].parse(val, {
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
                errors: context.errors,
                depth: context.depth + 1,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            });
            if (context.errors.length && context.exitOnFirstError) {
                return undefined;
            }
        }
    }
    if (context.errors.length) {
        return undefined;
    }
    return result;
}

export function validateObjectSchema(
    schema: AObjectSchemaWithAdapters,
    input: unknown,
): boolean {
    if (!isObject(input)) {
        return false;
    }
    const allowedKeys: string[] | undefined = schema.strict ? [] : undefined;
    for (const key of Object.keys(schema.properties)) {
        const propSchema = schema.properties[key]!;
        const isValid = propSchema[VALIDATOR_KEY].validate(input[key]);
        if (!isValid) return false;
        allowedKeys?.push(key);
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const propsSchema = schema.optionalProperties[key]!;
            const isValid = propsSchema[VALIDATOR_KEY].validate(input[key]);
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
    TSchema extends AObjectSchemaWithAdapters<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TStrict extends boolean = false,
>(
    inputSchema: TSchema,
    keys: TKeys[],
    options: AObjectSchemaOptions<TStrict> = {},
): AObjectSchemaWithAdapters<Pick<InferType<TSchema>, TKeys>, TStrict> {
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
        return decodeObjectSchema(schema as any, input, context, false);
    };
    const validate = (input: unknown): input is TOutput => {
        return validateObjectSchema(schema as any, input);
    };
    const result: AObjectSchemaWithAdapters<
        Pick<InferType<TSchema>, TKeys>,
        TStrict
    > = {
        ...(schema as any),
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
        },
        [VALIDATOR_KEY]: {
            output: {} as any satisfies Pick<InferType<TSchema>, TKeys>,
            parse: parse,
            coerce(input, context) {
                return decodeObjectSchema(schema as any, input, context, false);
            },
            validate,
            serialize(input, context) {
                return serializeObject(schema as any, input, context);
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
    TSchema extends AObjectSchemaWithAdapters<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    inputSchema: TSchema,
    keys: TKeys[],
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchemaWithAdapters<
    Omit<InferType<TSchema>, TKeys>,
    TAdditionalProps
> {
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
        decodeObjectSchema(schema as any, input, context, false);
    const result: AObjectSchemaWithAdapters<
        Omit<InferType<TSchema>, TKeys>,
        TAdditionalProps
    > = {
        ...(schema as any),
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
        },
        [VALIDATOR_KEY]: {
            output: {} as any,
            validate,
            parse: parse,
            serialize(input, context) {
                return serializeObject(schema as any, input, context);
            },
            coerce(input, context) {
                return decodeObjectSchema(schema as any, input, context, true);
            },
        },
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}

export function serializeObject(
    schema: AObjectSchemaWithAdapters,
    input: any,
    context: ValidationContext,
) {
    const strParts: string[] = [];
    if (context.discriminatorKey && context.discriminatorValue) {
        strParts.push(
            `"${context.discriminatorKey}":"${context.discriminatorValue}"`,
        );
    }
    for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key]!;
        const val = input[key];
        if (typeof val !== 'undefined') {
            strParts.push(
                `"${key}":${prop[VALIDATOR_KEY].serialize(val, {
                    instancePath: `${context.instancePath}/${key}`,
                    schemaPath: `${context.schemaPath}/properties/${key}`,
                    errors: context.errors,
                    depth: context.depth + 1,
                    maxDepth: context.maxDepth,
                    exitOnFirstError: context.exitOnFirstError,
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
                    `"${key}":${prop[VALIDATOR_KEY].serialize(val, {
                        instancePath: `${context.instancePath}/${key}`,
                        schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
                        errors: context.errors,
                        depth: context.depth + 1,
                        maxDepth: context.maxDepth,
                        exitOnFirstError: context.exitOnFirstError,
                    })}`,
                );
            }
        }
    }
    return `{${strParts.join(',')}}`;
}

export function extend<
    TBaseSchema extends AObjectSchemaWithAdapters<any, any> = any,
    TSchema extends AObjectSchemaWithAdapters<any, any> = any,
    TAdditionalProps extends boolean = false,
>(
    baseSchema: TBaseSchema,
    inputSchema: TSchema,
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchemaWithAdapters<
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
        metadata: {
            id: options.id,
            description: options.description,
        },
    };
    if (typeof options.strict === 'boolean') {
        schema.strict = options.strict;
    }

    const isType = (
        input: unknown,
    ): input is InferType<TBaseSchema> & InferType<TSchema> =>
        validateObjectSchema(schema as any, input);
    const validator: ASchema[typeof VALIDATOR_KEY] = {
        output: {},
        parse(input: unknown, context: ValidationContext) {
            return decodeObjectSchema(schema as any, input, context, false);
        },
        coerce(input: unknown, context: ValidationContext) {
            return decodeObjectSchema(schema as any, input, context, true);
        },
        validate: isType,
        serialize(input, context: ValidationContext) {
            return serializeObject(schema as any, input, context);
        },
    };
    const result: ASchemaWithAdapters<any> = {
        ...schema,
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(
            validator.validate,
            validator.parse,
        ),
    };
    hideInvalidProperties(result as any);
    return result as any;
}

export function partial<
    TSchema extends AObjectSchemaWithAdapters<any, any> = any,
    TAdditionalProps extends boolean = false,
>(
    schema: TSchema,
    options: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchemaWithAdapters<Partial<InferType<TSchema>>, TAdditionalProps> {
    const newSchema: SchemaFormProperties = {
        properties: {},
        optionalProperties: {},
        nullable: schema.nullable,
        metadata: {
            id: options.id,
            description: options.description,
        },
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
            if (prop[VALIDATOR_KEY].optional) {
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
        return decodeObjectSchema(newSchema as any, input, context, false);
    };
    const validator: SchemaValidator<any> = {
        output: {} as any,
        optional: schema[VALIDATOR_KEY].optional,
        validate,
        parse: parse,
        coerce(input, context) {
            return decodeObjectSchema(newSchema as any, input, context, true);
        },
        serialize(input, context) {
            return serializeObject(schema, input, context);
        },
    };
    const result: ASchemaWithAdapters = {
        ...newSchema,
        [VALIDATOR_KEY]: validator,
        ['~standard']: createStandardSchemaProperty(
            validator.validate,
            validator.parse,
        ),
    };
    hideInvalidProperties(result as any);
    return result as any;
}
