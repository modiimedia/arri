import { type SchemaFormType } from "jtd";
import {
    type ScalarTypeSchema,
    type InputOptions,
    type MaybeNullable,
    SCHEMA_METADATA,
} from "./typedefs";
import { ArriValidationError, AVJ } from "./validation";

const schema: SchemaFormType = {
    type: "boolean",
};

const validator = AVJ.compile(schema);
const isBool = (input: unknown): input is boolean => validator(input);
const parser = AVJ.compileParser(schema);
const serializer = AVJ.compileSerializer(schema);

export function boolean<TNullable extends boolean = false>(
    opts: InputOptions = {},
): ScalarTypeSchema<"boolean", MaybeNullable<boolean, TNullable>> {
    return {
        type: "boolean",
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: false,
                parse(input) {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isBool(result)) {
                            return result;
                        }
                        throw new ArriValidationError(validator.errors ?? []);
                    }
                    if (isBool(input)) {
                        return input;
                    }
                    throw new ArriValidationError(validator.errors ?? []);
                },
                validate: isBool,
                serialize: serializer,
                coerce(input) {
                    if (isBool(input)) {
                        return input;
                    }
                    switch (input) {
                        case "true":
                        case "TRUE":
                        case "1":
                        case 1:
                            return true;
                        case "false":
                        case "FALSE":
                        case "0":
                        case 0:
                            return false;
                        default:
                            break;
                    }
                    throw new ArriValidationError(validator.errors ?? []);
                },
            },
        },
    };
}
