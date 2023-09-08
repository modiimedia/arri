import { type SchemaFormValues } from "jtd";
import { type InputOptions } from "./scalar";
import {
    type InferType,
    type ArriSchema,
    type ActualValue,
    _SCHEMA,
} from "./typedefs";
import { ArriValidationError, avj } from "./validation";

export interface RecordSchema<
    TInnerSchema extends ArriSchema<any, any>,
    TNullable extends boolean = false,
> extends ArriSchema<Record<any, InferType<TInnerSchema>>, TNullable> {
    values: TInnerSchema;
}

type InferRecordType<
    TInnerSchema extends ArriSchema<any, any>,
    TNullable extends boolean,
> = ActualValue<Record<any, InferType<TInnerSchema>>, TNullable>;

export function record<
    TInnerSchema extends ArriSchema<any, any>,
    TNullable extends boolean = false,
>(
    schema: TInnerSchema,
    opts: InputOptions<any, TNullable> = {},
): RecordSchema<TInnerSchema, TNullable> {
    const jtdSchema: SchemaFormValues = {
        values: schema,
        nullable: opts.nullable,
    };
    const validator = avj.compile(jtdSchema as any);
    const isType = (
        input: unknown,
    ): input is InferRecordType<TInnerSchema, TNullable> => validator(input);
    const parser = avj.compileParser(jtdSchema);
    const serializer = avj.compileSerializer(jtdSchema);
    return {
        ...(jtdSchema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                default: opts.default,
                output: opts.default ?? {},
                validate: isType,
                parse: (input: unknown) => {
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
