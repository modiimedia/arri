import { type Schema } from "jtd";
import { _SCHEMA, type ArriSchema } from "./typedefs";
import { avj } from "./validation";

const anyRawSchema: Schema = {};

const parser = avj.compileParser(anyRawSchema);
const serializer = avj.compileSerializer(anyRawSchema);

const anySchema: ArriSchema<any, any> = {
    metadata: {
        [_SCHEMA]: {
            output: undefined as any,
            parse: (input): any =>
                typeof input === "string" ? parser(input) : input,
            validate: (input): input is any => true,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            serialize: serializer,
        },
    },
};

export function any(): ArriSchema<any, any> {
    return anySchema;
}
