import { type Schema, type SchemaFormProperties } from "jtd";
import { type ScalarTypeSchema, type InputOptions } from "./scalar";
import {
    _SCHEMA,
    type InferType,
    type ArriSchema,
    type ResolveObject,
    type ResolveExtendableObject,
} from "./typedefs";
import { ArriValidationError, avj } from "./validation";

export interface ObjectSchema<
    TVal = any,
    TNullable extends boolean = false,
    TAllowAdditionalProperties extends boolean = false,
> extends ArriSchema<TVal, TNullable> {
    properties: Record<string, ScalarTypeSchema>;
    optionalProperties?: Record<string, ScalarTypeSchema>;
    additionalProperties?: TAllowAdditionalProperties;
}

export function object<
    TDefault = any,
    TNullable extends boolean = false,
    TInput extends Record<any, any> = any,
    TOptionalProps extends keyof TInput = any,
    TAdditionalProps extends boolean = false,
>(
    input: TInput,
    opts: ObjectOptions<
        TInput,
        TDefault,
        TNullable,
        TOptionalProps,
        TAdditionalProps
    > = {},
): ObjectSchema<
    ObjectOutput<TNullable, TInput, TOptionalProps, TAdditionalProps>,
    TNullable,
    TAdditionalProps
> {
    const schema: SchemaFormProperties = {
        properties: {},
        nullable: opts.nullable,
    };
    if (opts.optionalProperties?.length) {
        schema.optionalProperties = {};
    }
    Object.keys(input).forEach((key) => {
        if (
            schema.optionalProperties &&
            opts.optionalProperties?.includes(key as any)
        ) {
            schema.optionalProperties[key] = input[key];
            return;
        }
        schema.properties[key] = input[key];
    });
    const validator = avj.compile(schema, true);
    const parser = avj.compileParser(schema);
    const serializer = avj.compileSerializer(schema);
    const matchesSchema = (
        input: unknown,
    ): input is ObjectOutput<
        TNullable,
        TInput,
        TOptionalProps,
        TAdditionalProps
    > => validator(input);
    const result: ObjectSchema<any, TNullable, TAdditionalProps> = {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                default: opts?.default,
                output: {} as any satisfies ObjectOutput<
                    TNullable,
                    TInput,
                    TOptionalProps,
                    TAdditionalProps
                >,
                parse: (input) => {
                    if (typeof input === "string") {
                        const parseResult = parser(input);
                        if (matchesSchema(parseResult)) {
                            return parseResult;
                        }
                        throw new ArriValidationError(validator.errors ?? []);
                    }
                    if (matchesSchema(input)) {
                        return input;
                    }
                    throw new ArriValidationError(validator.errors ?? []);
                },
                validate: matchesSchema,
                serialize: serializer,
            },
        },
    };
    return result;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ObjectOutput<
    TIsNullable extends boolean = false,
    TInput extends Record<any, ArriSchema<any, TIsNullable>> = any,
    TOptionalProps extends string | number | symbol = any,
    TAdditionalProps = false,
> = TAdditionalProps extends true
    ? ResolveExtendableObject<
          TOptionalProps extends keyof TInput
              ? PartialBy<
                    {
                        [TKey in keyof TInput]: TInput[TKey]["metadata"][typeof _SCHEMA]["output"];
                    },
                    TOptionalProps
                >
              : {
                    [TKey in keyof TInput]: TInput[TKey]["metadata"][typeof _SCHEMA]["output"];
                }
      >
    : ResolveObject<
          TOptionalProps extends keyof TInput
              ? PartialBy<
                    {
                        [TKey in keyof TInput]: TInput[TKey]["metadata"][typeof _SCHEMA]["output"];
                    },
                    TOptionalProps
                >
              : {
                    [TKey in keyof TInput]: TInput[TKey]["metadata"][typeof _SCHEMA]["output"];
                }
      >;

interface ObjectOptions<
    TInput = any,
    TDefault = any,
    TNullable extends boolean = false,
    TOptionalProps extends keyof TInput = any,
    TAdditionalProps extends boolean = false,
> extends InputOptions<TDefault, TNullable> {
    optionalProperties?: TOptionalProps[];
    /**
     * Allow this object to include additional properties not specified here
     */
    additionalProperties?: TAdditionalProps;
}

export function pick<
    TDefault = any,
    TNullable extends boolean = false,
    TSchema extends ObjectSchema<any, any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TOptionalProps extends TKeys = any,
    TAdditionalProps extends boolean = false,
>(
    input: TSchema,
    keys: TKeys[],
    opts: ObjectOptions<
        InferType<TSchema>,
        TDefault,
        TNullable,
        TOptionalProps,
        TAdditionalProps
    > = {},
): ObjectSchema<Pick<InferType<TSchema>, TKeys>, TNullable, TAdditionalProps> {
    const schema: Schema = {
        properties: {},
        nullable: opts.nullable,
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
    const validator = avj.compile(schema, true);
    const isType = (input: unknown): input is Pick<InferType<TSchema>, TKeys> =>
        validator(input);
    const parser = avj.compileParser(schema);
    const serializer = avj.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                output: {} as any satisfies Pick<InferType<TSchema>, TKeys>,
                default: opts.default,
                parse: (input) => {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ArriValidationError(validator.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ArriValidationError(validator.errors ?? []);
                },
                validate: isType,
                serialize: serializer,
            },
        },
    };
}

export function omit<
    TDefault = any,
    TNullable extends boolean = false,
    TSchema extends ObjectSchema<any, any, any> = any,
    TKeys extends keyof InferType<TSchema> = any,
    TOptionalProps extends
        keyof TSchema["metadata"][typeof _SCHEMA]["output"] = any,
    TAdditionalProps extends boolean = false,
>(
    input: TSchema,
    keys: TKeys[],
    opts: ObjectOptions<
        InferType<TSchema>,
        TDefault,
        TNullable,
        TOptionalProps,
        TAdditionalProps
    > = {},
): ObjectSchema<Omit<InferType<TSchema>, TKeys>, TNullable, TAdditionalProps> {
    const schema: Schema = {
        properties: {
            ...input.properties,
        },
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
    const validator = avj.compile(schema, true);
    const isType = (input: unknown): input is Omit<InferType<TSchema>, TKeys> =>
        validator(input);
    const parser = avj.compileParser(schema);
    const serializer = avj.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                output: {} as any,
                default: opts.default,
                validate: isType,
                parse(input: unknown) {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ArriValidationError(validator.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ArriValidationError(validator.errors ?? []);
                },
                serialize: serializer,
            },
        },
    };
}
