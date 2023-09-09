import { type Schema as JtdSchema } from "jtd";
import {
    SCHEMA_METADATA,
    type MaybeNullable,
    type ArriSchema,
    type InputOptions,
} from "./typedefs";
import { ValidationError, AJV } from "./validation";

export interface EnumSchema<
    TValues extends string[],
    TNullable extends boolean = false,
> extends ArriSchema<MaybeNullable<TValues[number], TNullable>> {
    enum: TValues;
}

/**
 * An enumeration of string values
 *
 * This is an implementation of:
 * https://jsontypedef.com/docs/jtd-in-5-minutes/#enum-schemas
 */
export function stringEnum<
    TKeys extends string,
    TValues extends TKeys[],
    TNullable extends boolean = false,
>(values: TValues, opts: InputOptions = {}): EnumSchema<TValues, TNullable> {
    const schema: JtdSchema = {
        enum: values,
    };
    const validator = AJV.compile(schema);
    const isType = (
        input: unknown,
    ): input is MaybeNullable<TValues, TNullable> => validator(input);
    const serializer = AJV.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: values[0],
                parse: (input) => {
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                coerce: (input) => {
                    if (typeof input === "string") {
                        for (const value of values) {
                            if (value === input) {
                                return input;
                            }
                        }
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
