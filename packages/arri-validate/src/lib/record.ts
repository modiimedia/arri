import { type SchemaFormValues } from "@modii/jtd";

import {
    type ARecordSchema,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    SCHEMA_METADATA,
} from "../schemas";
import { ValidationError, AJV } from "./validation";

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
                coerce: (input: unknown, instancePath) => {
                    if (!input || typeof input !== "object") {
                        throw new ValidationError([
                            {
                                instancePath,
                                message: `Expected type 'Object'. Got ${typeof input}.`,
                            },
                        ]);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(
                        validator.errors?.map((val) => ({
                            ...val,
                            instancePath: instancePath ?? val.instancePath,
                        })) ?? [],
                    );
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
