import { type Schema } from "@modii/jtd";
import { type ASchema, SCHEMA_METADATA, type ASchemaOptions } from "../schemas";
import { AJV } from "./validation";

const anyRawSchema: Schema = {};

const parser = AJV.compileParser(anyRawSchema);
const serializer = AJV.compileSerializer(anyRawSchema);

export function any(options: ASchemaOptions = {}): ASchema<any> {
    return {
        metadata: {
            id: options.id,
            description: options.description,
            [SCHEMA_METADATA]: {
                output: undefined as any,
                parse: (input): any =>
                    typeof input === "string" ? parser(input) : input,
                coerce: (input) => input,
                validate: (input): input is any => true,
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                serialize: serializer,
            },
        },
    };
}
