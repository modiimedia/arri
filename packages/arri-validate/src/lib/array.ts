import { type Schema } from "jtd";
import {
    type ArriSchema,
    SCHEMA_METADATA,
    type InferType,
    type InputOptions,
} from "./typedefs";
import { ArriValidationError, AVJ } from "./validation";

export interface ArraySchema<TInnerSchema extends ArriSchema<any> = any>
    extends ArriSchema<Array<InferType<TInnerSchema>>> {
    elements: TInnerSchema;
}

export function array<TInnerSchema extends ArriSchema<any> = any>(
    input: TInnerSchema,
    opts: InputOptions = {},
): ArraySchema<TInnerSchema> {
    const schema: Schema = {
        elements: input,
    };
    const validator = AVJ.compile(schema, true);
    const serializer = AVJ.compileSerializer(schema);
    const parser = AVJ.compileParser(schema);
    const isType = (
        input: unknown,
    ): input is InferType<ArraySchema<TInnerSchema>> => validator(input);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: [] as any,
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
