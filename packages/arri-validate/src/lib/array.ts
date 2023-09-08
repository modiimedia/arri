import { type Schema } from "jtd";
import { type InputOptions } from "./scalar";
import { type ArriSchema, _SCHEMA, type InferType } from "./typedefs";
import { ArriValidationError, avj } from "./validation";

export interface ArraySchema<
    TInnerSchema extends ArriSchema<any, any> = any,
    TNullable extends boolean = false,
> extends ArriSchema<Array<InferType<TInnerSchema>>, TNullable> {
    elements: TInnerSchema;
}

export function array<
    TInnerSchema extends ArriSchema<any, any> = any,
    TDefault = any,
    TArrayNullable extends boolean = false,
>(
    input: TInnerSchema,
    opts: InputOptions<TDefault, TArrayNullable> = {},
): ArraySchema<TInnerSchema, TArrayNullable> {
    const schema: Schema = {
        elements: input,
        nullable: opts.nullable,
    };
    const validator = avj.compile(schema, true);
    const serializer = avj.compileSerializer(schema);
    const parser = avj.compileParser(schema);
    const isType = (
        input: unknown,
    ): input is InferType<ArraySchema<TInnerSchema, TArrayNullable>> =>
        validator(input);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                default: opts.default,
                output: opts.default ?? ([] as any),
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
                validate: isType,
                serialize: serializer,
            },
        },
    };
}
