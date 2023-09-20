import { type Schema, type SchemaFormProperties } from "@modii/jtd";

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
    Object.keys(input).forEach((key) => {
        const prop = input[key];
        if (prop.metadata[SCHEMA_METADATA].optional) {
            if (!schema.optionalProperties) {
                schema.optionalProperties = {};
            }
            schema.optionalProperties[key] = prop;
            return;
        }
        schema.properties[key] = input[key];
    });
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
                    return parse(schema as AObjectSchema, input, data);
                },
                coerce(input: unknown, data) {
                    return coerce(schema as AObjectSchema, input, data);
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
    for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key];
        result[key] = prop.metadata[SCHEMA_METADATA].parse(parsedInput[key], {
            instancePath: `${data.instancePath}/${key}`,
            schemaPath: `${data.schemaPath}/properties/${key}`,
            errors: data.errors,
        });
    }
    const optionalProps = schema.optionalProperties ?? {};
    for (const key of Object.keys(optionalProps)) {
        const prop = optionalProps[key];
        if (parsedInput[key] !== undefined) {
            result[key] = prop.metadata[SCHEMA_METADATA].parse(
                parsedInput[key],
                {
                    instancePath: `${data.instancePath}/${key}`,
                    schemaPath: `${data.schemaPath}/optionalProperties/${key}`,
                    errors: data.errors,
                },
            );
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}

function coerce<T>(
    schema: AObjectSchema,
    input: unknown,
    data: ValidationData,
): T | undefined {
    let parsedInput: any = input;
    if (data.instancePath.length === 0 && typeof input === "string") {
        parsedInput = JSON.parse(input);
    }

    if (!isObject(input)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: "Expected object",
        });
        return undefined;
    }
    const result: any = {};
    for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key];
        result[key] = prop.metadata[SCHEMA_METADATA].coerce(parsedInput[key], {
            instancePath: `${data.instancePath}/${key}`,
            schemaPath: `${data.schemaPath}/properties/${key}`,
            errors: data.errors,
        });
    }
    const optionalProps = schema.optionalProperties ?? {};
    for (const key of Object.keys(optionalProps)) {
        const prop = optionalProps[key];
        result[key] = prop.metadata[SCHEMA_METADATA].coerce(parsedInput[key], {
            instancePath: `${data.instancePath}/${key}`,
            schemaPath: `${data.schemaPath}/optionalProperties/${key}`,
            errors: data.errors,
        });
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
    const allKeys = Object.keys(schema);
    for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key];
        const isValid = prop.metadata[SCHEMA_METADATA].validate(input[key]);
        if (!isValid) {
            return false;
        }
        allKeys.splice(allKeys.indexOf(key), 1);
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const prop = schema.properties[key];
            const isValid =
                input[key] === undefined ??
                prop.metadata[SCHEMA_METADATA].validate(input[key]);
            if (!isValid) {
                return false;
            }
            allKeys.splice(allKeys.indexOf(key), 1);
        }
    }
    if (allKeys.length) {
        return false;
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
    const schema: Schema = {
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
                    return parse(schema as any, input, data);
                },
                validate(input) {
                    return validate(schema as any, input);
                },
                coerce(input, data) {
                    return coerce(schema as any, input, data);
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
    const schema: Schema = {
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
                    return parse(schema as any, input, data);
                },
                serialize(input) {
                    return JSON.stringify(input);
                },
                coerce(input, data) {
                    return coerce(schema as any, input, data);
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
                return parse(schema as any, input, data);
            },
            coerce(input: unknown, data) {
                return coerce(schema as any, input, data);
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
