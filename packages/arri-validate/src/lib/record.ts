import { type SchemaFormValues } from "@modii/jtd";

import { ValidationError, AJV } from "./validation";
import {
    ARecordSchema,
    ASchema,
    ASchemaOptions,
    InferType,
    SCHEMA_METADATA,
} from "../schemas";

export function record<TInnerSchema extends ASchema<any>>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): ARecordSchema<TInnerSchema> {
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

/**
 * An alias for `a.record()`
 */
export const dictionary = record;

type InferRecordType<TInnerSchema extends ASchema<any>> = Record<
    any,
    InferType<TInnerSchema>
>;
