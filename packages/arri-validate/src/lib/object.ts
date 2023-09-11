import { type Schema, type SchemaFormProperties } from "@modii/jtd";

import { ValidationError, AJV } from "./validation";
import {
    ASchema,
    InferObjectOutput,
    InferType,
    SCHEMA_METADATA,
    AObjectSchema,
    AObjectSchemaOptions,
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
    const validator = AJV.compile(schema, true);
    const parser = AJV.compileParser(schema);
    const serializer = AJV.compileSerializer(schema);
    const isType = (
        input: unknown,
    ): input is InferObjectOutput<TInput, TAdditionalProps> => validator(input);
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
                parse: (input) => {
                    if (typeof input === "string") {
                        const parseResult = parser(input);
                        if (isType(parseResult)) {
                            return parseResult;
                        }
                        throw new ValidationError(validator.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                coerce: (input: unknown) => {
                    let parsedInput = input;
                    if (typeof input === "string") {
                        parsedInput = JSON.parse(input);
                    }
                    if (typeof parsedInput !== "object") {
                        throw new ValidationError([
                            {
                                message: "Expected object",
                                keyword: "",
                                instancePath: "/",
                                params: {},
                                schemaPath: "",
                            },
                        ]);
                    }
                    const result: any = {};
                    Object.keys(schema.properties).forEach((key) => {
                        const prop = schema.properties[key] as ASchema;
                        result[key] = prop.metadata[SCHEMA_METADATA].coerce(
                            (input as any)[key],
                        );
                    });
                    Object.keys(schema.optionalProperties ?? {}).forEach(
                        (key) => {
                            const prop = (schema.additionalProperties as any)[
                                key
                            ] as ASchema;
                            if (typeof (input as any)[key] !== "undefined") {
                                result[key] = prop.metadata[
                                    SCHEMA_METADATA
                                ].coerce((input as any)[key]);
                            }
                        },
                    );
                    return result as InferObjectOutput<
                        TInput,
                        TAdditionalProps
                    >;
                },
                validate: isType,
                serialize: serializer,
            },
        },
    };
    return result;
}

export function pick<
    TSchema extends AObjectSchema<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    input: TSchema,
    keys: TKeys[],
    opts: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Pick<InferType<TSchema>, TKeys>, TAdditionalProps> {
    const schema: Schema = {
        properties: {},
        nullable: input.nullable,
    };

    Object.keys(input.properties).forEach((key) => {
        if (!schema.properties) {
            return;
        }
        if (keys.includes(key as any)) {
            schema.properties[key] = input.properties[key];
        }
    });
    if (input.optionalProperties) {
        schema.optionalProperties = {};
        Object.keys(input.optionalProperties).forEach((key) => {
            if (!schema.optionalProperties || !input.optionalProperties) {
                return;
            }
            if (keys.includes(key as any)) {
                schema.optionalProperties[key] = input.optionalProperties[key];
            }
        });
    }
    if (typeof input.additionalProperties === "boolean") {
        schema.additionalProperties = input.additionalProperties;
    }
    const validator = AJV.compile(schema, true);
    const isType = (input: unknown): input is Pick<InferType<TSchema>, TKeys> =>
        validator(input);
    const parser = AJV.compileParser(schema);
    const serializer = AJV.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any satisfies Pick<InferType<TSchema>, TKeys>,
                parse: (input) => {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ValidationError(validator.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                validate: isType,
                serialize: serializer,
            },
        },
    };
}

export function omit<
    TSchema extends AObjectSchema<any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TAdditionalProps extends boolean = false,
>(
    input: TSchema,
    keys: TKeys[],
    opts: AObjectSchemaOptions<TAdditionalProps> = {},
): AObjectSchema<Omit<InferType<TSchema>, TKeys>, TAdditionalProps> {
    const schema: Schema = {
        properties: {
            ...input.properties,
        },
        nullable: input.nullable,
    };
    Object.keys(input.properties).forEach((key) => {
        if (keys.includes(key as any)) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete schema.properties[key];
        }
    });

    if (input.optionalProperties) {
        schema.optionalProperties = {
            ...(input.optionalProperties as any),
        };
        Object.keys(input.optionalProperties).forEach((key) => {
            if (!schema.optionalProperties) {
                return;
            }
            if (keys.includes(key as any)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete schema.optionalProperties[key];
            }
        });
    }
    if (typeof input.additionalProperties === "boolean") {
        schema.additionalProperties = input.additionalProperties;
    }
    const validator = AJV.compile(schema, true);
    const isType = (input: unknown): input is Omit<InferType<TSchema>, TKeys> =>
        validator(input);
    const parser = AJV.compileParser(schema);
    const serializer = AJV.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any,
                validate: isType,
                parse(val: unknown) {
                    if (typeof val === "string") {
                        const result = parser(val);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ValidationError(validator.errors ?? []);
                    }
                    if (isType(val)) {
                        return val;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                serialize: serializer,
                coerce(val) {
                    let parsedInput = val;
                    if (typeof val === "string") {
                        parsedInput = JSON.parse(val);
                    }
                    if (typeof parsedInput !== "object") {
                        throw new ValidationError([
                            {
                                message: "Expected object",
                                keyword: "",
                                instancePath: "/",
                                params: {},
                                schemaPath: "",
                            },
                        ]);
                    }
                    const result: any = {};
                    Object.keys(schema.properties).forEach((key) => {
                        const prop = schema.properties[key] as ASchema;
                        result[key] = prop.metadata[SCHEMA_METADATA].coerce(
                            (val as any)[key],
                        );
                    });
                    Object.keys(schema.optionalProperties ?? {}).forEach(
                        (key) => {
                            const prop = (schema.additionalProperties as any)[
                                key
                            ] as ASchema;
                            if (typeof (val as any)[key] !== "undefined") {
                                result[key] = prop.metadata[
                                    SCHEMA_METADATA
                                ].coerce((val as any)[key]);
                            }
                        },
                    );
                    return result;
                },
            },
        },
    };
}
