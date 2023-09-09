import { type SchemaFormValues } from "@modii/jtd";
import {
    type InferType,
    type ArriSchema,
    type MaybeNullable,
    SCHEMA_METADATA,
    type InputOptions,
} from "./typedefs";
import { ValidationError, AJV } from "./validation";

interface RecordSchema<
    TInnerSchema extends ArriSchema<any>,
    TNullable extends boolean = false,
> extends ArriSchema<
        MaybeNullable<Record<any, InferType<TInnerSchema>>, TNullable>
    > {
    values: TInnerSchema;
}

type InferRecordType<TInnerSchema extends ArriSchema<any>> = Record<
    any,
    InferType<TInnerSchema>
>;

export function record<TInnerSchema extends ArriSchema<any>>(
    schema: TInnerSchema,
    opts: InputOptions = {},
): RecordSchema<TInnerSchema> {
    const jtdSchema: SchemaFormValues = {
        values: schema,
    };
    const validator = AJV.compile(jtdSchema as any);
    const isType = (input: unknown): input is InferRecordType<TInnerSchema> =>
        validator(input);
    const parser = AJV.compileParser(jtdSchema);
    const serializer = AJV.compileSerializer(jtdSchema);
    return {
        ...(jtdSchema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {},
                validate: isType,
                parse: (input: unknown) => {
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
                serialize: serializer,
            },
        },
    };
}
export const dictionary = record;
