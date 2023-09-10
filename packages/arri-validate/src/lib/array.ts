import { type Schema } from "@modii/jtd";
import { ValidationError, AJV } from "./validation";
import {
    AArraySchema,
    ASchema,
    InferType,
    ASchemaOptions,
    SCHEMA_METADATA,
} from "arri-shared";

export function array<TInnerSchema extends ASchema<any> = any>(
    input: TInnerSchema,
    opts: ASchemaOptions = {},
): AArraySchema<TInnerSchema> {
    const schema: Schema = {
        elements: input,
    };
    const validator = AJV.compile(schema, true);
    const serializer = AJV.compileSerializer(schema);
    const parser = AJV.compileParser(schema);
    const isType = (
        input: unknown,
    ): input is InferType<AArraySchema<TInnerSchema>> => validator(input);
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
                        throw new ValidationError(validator.errors ?? []);
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
