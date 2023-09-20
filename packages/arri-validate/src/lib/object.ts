import { type SchemaFormProperties } from "@modii/jtd";

import {
    type ASchema,
    type InferObjectOutput,
    type InferType,
    SCHEMA_METADATA,
    type AObjectSchema,
    type AObjectSchemaOptions,
    type ResolveObject,
    type ValidationData,
    isObject,
} from "../schemas";

export function object<
    TInput extends Record<any, ASchema> = any,
    TAdditionalProps extends boolean = false,
>(
    input: TInput,
    opts: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<
    InferObjectOutput<TInput, TAdditionalProps>,
    TAdditionalProps
> {
    const schema: SchemaFormProperties = {
        properties: {},
    };
    for (const key of Object.keys(input)) {
        const prop = input[key];
        if (prop.metadata[SCHEMA_METADATA].optional) {
            if (!schema.optionalProperties) {
                schema.optionalProperties = {};
            }
            schema.optionalProperties[key] = prop;
            continue;
        }
        schema.properties[key] = input[key];
    }
    const result: AObjectSchema<any, TAdditionalProps> = {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any satisfies InferObjectOutput<
                    TInput,
                    TAdditionalProps
                >,
                parse(input, data) {
                    return parse(schema as AObjectSchema, input, data, false);
                },
                coerce(input: unknown, data) {
                    return parse(schema as AObjectSchema, input, data, true);
                },
                validate(input) {
                    return validate(schema as AObjectSchema, input);
                },
                serialize: (input) => JSON.stringify(input),
            },
        },
    };
    return result;
}

function parse<T>(
    schema: AObjectSchema<T>,
    input: unknown,
    data: ValidationData,
    coerce = false,
): T | undefined {
    let parsedInput: any = input;
    if (data.instancePath.length === 0 && typeof input === "string") {
        try {
            const result = JSON.parse(input);
            parsedInput = result;
        } catch (err) {
            data.errors.push({
                instancePath: data.instancePath,
                schemaPath: data.schemaPath,
                message: `Error parsing. Invalid JSON.`,
            });
            return undefined;
        }
    }
    if (!isObject(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: "Expected object",
        });
    }
    const result: Record<any, any> = {};
    const optionalProps = schema.optionalProperties ?? {};
    for (const key of Object.keys(parsedInput)) {
        const val = parsedInput[key];
        const prop = schema.properties[key] ?? optionalProps[key];
        if (prop) {
            result[key] = coerce
                ? prop.metadata[SCHEMA_METADATA].coerce(parsedInput, data)
                : prop.metadata[SCHEMA_METADATA].parse(val, data);
            continue;
        }
        if (key === data.discriminatorKey) {
            result[key] = data.discriminatorValue;
            continue;
        }
        if (!schema.additionalProperties) {
            data.errors.push({
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}`,
                message: `Property ${key} not found in object schema. If you want to allow additional properties, you must set additionalProperties to 'true'.`,
            });
            continue;
        }
        result[key] = parsedInput[key];
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}

function validate(schema: AObjectSchema, input: unknown): boolean {
    if (!isObject(input)) {
        return false;
    }
    const optionalProps = schema.optionalProperties ?? {};
    for (const key of Object.keys(input)) {
        const prop: ASchema<any> | undefined =
            schema.properties[key] ?? optionalProps[key];
        if (!prop && !schema.additionalProperties) {
            return false;
        }
        const isValid = prop.metadata[SCHEMA_METADATA].validate(input[key]);
        if (!isValid) {
            return false;
        }
    }
    return true;
}

export function pick<
    TSchema extends AObjectSchema<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    inputSchema: TSchema,
    keys: TKeys[],
    opts: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Pick<InferType<TSchema>, TKeys>, TAdditionalProps> {
    const schema: SchemaFormProperties = {
        properties: {},
        nullable: inputSchema.nullable,
    };

    Object.keys(inputSchema.properties).forEach((key) => {
        if (!schema.properties) {
            return;
        }
        if (keys.includes(key as any)) {
            schema.properties[key] = inputSchema.properties[key];
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
                    inputSchema.optionalProperties[key];
            }
        });
    }
    if (typeof inputSchema.additionalProperties === "boolean") {
        schema.additionalProperties = inputSchema.additionalProperties;
    }

    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any satisfies Pick<InferType<TSchema>, TKeys>,
                parse: (input, data) => {
                    return parse(schema as any, input, data, true);
                },
                coerce(input, data) {
                    return parse(schema as any, input, data, false);
                },
                validate(input) {
                    return validate(schema as any, input);
                },
                serialize(input) {
                    return JSON.stringify(input);
                },
            },
        },
    };
}

export function omit<
    TSchema extends AObjectSchema<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    inputSchema: TSchema,
    keys: TKeys[],
    opts: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Omit<InferType<TSchema>, TKeys>, TAdditionalProps> {
    const schema: SchemaFormProperties = {
        properties: {
            ...inputSchema.properties,
        },
        nullable: inputSchema.nullable,
    };
    Object.keys(inputSchema.properties).forEach((key) => {
        if (keys.includes(key as any)) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete schema.optionalProperties[key];
            }
        });
    }
    if (typeof inputSchema.additionalProperties === "boolean") {
        schema.additionalProperties = inputSchema.additionalProperties;
    }
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any,
                validate(input) {
                    return validate(schema as any, input);
                },
                parse(input: unknown, data) {
                    return parse(schema as any, input, data, false);
                },
                serialize(input) {
                    return JSON.stringify(input);
                },
                coerce(input, data) {
                    return parse(schema as any, input, data, true);
                },
            },
        },
    };
}

export function extend<
    TBaseSchema extends AObjectSchema<any, any> = any,
    TSchema extends AObjectSchema<any, any> = any,
    TAdditionalProps extends boolean = false,
>(
    baseSchema: TBaseSchema,
    inputSchema: TSchema,
    opts: AObjectSchemaOptions<TAdditionalProps> = {},
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
        additionalProperties: opts.additionalProperties,
    };

    const isType = (
        input: unknown,
    ): input is InferType<TBaseSchema> & InferType<TSchema> =>
        validate(schema as any, input);
    const meta: ASchema["metadata"] = {
        id: opts.id,
        description: opts.description,
        [SCHEMA_METADATA]: {
            output: {} as any as InferType<TBaseSchema> & InferType<TSchema>,
            parse(input: unknown, data) {
                return parse(schema as any, input, data, false);
            },
            coerce(input: unknown, data) {
                return parse(schema as any, input, data, true);
            },
            validate: isType,
            serialize(input) {
                return JSON.stringify(input);
            },
        },
    };
    schema.metadata = meta;
    return schema as any;
}
