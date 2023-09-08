import { type SchemaFormValues } from "jtd";
import {
    type InferType,
    type ArriSchema,
    type MaybeNullable,
    SCHEMA_METADATA,
    type InputOptions,
} from "./typedefs";
import { ValidationError, AVJ } from "./validation";

export interface RecordSchema<
    TInnerSchema extends ArriSchema<any>,
    TNullable extends boolean = false,
> extends ArriSchema<
        MaybeNullable<Record<any, InferType<TInnerSchema>>, TNullable>
    > {
    values: TInnerSchema;
}

type InferRecordType<
    TInnerSchema extends ArriSchema<any>,
    TNullable extends boolean,
> = MaybeNullable<Record<any, InferType<TInnerSchema>>, TNullable>;

export function record<
    TInnerSchema extends ArriSchema<any>,
    TNullable extends boolean = false,
>(
    schema: TInnerSchema,
    opts: InputOptions = {},
): RecordSchema<TInnerSchema, TNullable> {
    const jtdSchema: SchemaFormValues = {
        values: schema,
    };
    const validator = AVJ.compile(jtdSchema as any);
    const isType = (
        input: unknown,
    ): input is InferRecordType<TInnerSchema, TNullable> => validator(input);
    const parser = AVJ.compileParser(jtdSchema);
    const serializer = AVJ.compileSerializer(jtdSchema);
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
