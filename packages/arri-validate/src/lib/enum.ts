import { type Schema as JtdSchema } from "jtd";
import { type InputOptions } from "./scalar";
import { _SCHEMA, type ActualValue, type ArriSchema } from "./typedefs";
import { ArriValidationError, avj } from "./validation";

export interface EnumSchema<
    TValues extends string[],
    TNullable extends boolean = false,
> extends ArriSchema<TValues[number], TNullable> {
    enum: TValues;
}

export function stringEnum<
    TKeys extends string,
    TValues extends TKeys[],
    TNullable extends boolean = false,
>(
    values: TValues,
    opts: InputOptions<TKeys, TNullable> = {},
): EnumSchema<TValues, TNullable> {
    const schema: JtdSchema = {
        enum: values,
        nullable: opts.nullable,
    };
    const validator = avj.compile(schema);
    const isType = (input: unknown): input is ActualValue<TValues, TNullable> =>
        validator(input);
    const serializer = avj.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                output: opts.default ?? values[0],
                default: opts.default,
                parse: (input) => {
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
