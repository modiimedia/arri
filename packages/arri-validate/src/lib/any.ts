import { type Schema } from "@modii/jtd";
import { SCHEMA_METADATA, type ArriSchema } from "./typedefs";
import { AJV } from "./validation";

const anyRawSchema: Schema = {};

const parser = AJV.compileParser(anyRawSchema);
const serializer = AJV.compileSerializer(anyRawSchema);

const anySchema: ArriSchema<any> = {
    metadata: {
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

export function any(): ArriSchema<any> {
    return anySchema;
}
