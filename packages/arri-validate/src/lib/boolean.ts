import { type SchemaFormType } from "@modii/jtd";
import {
    type AScalarSchema,
    type ASchemaOptions,
    type MaybeNullable,
    SCHEMA_METADATA,
} from "../schemas";
import { ValidationError, AJV } from "./validation";

const schema: SchemaFormType = {
    type: "boolean",
};

const validator = AJV.compile(schema);
const isBool = (input: unknown): input is boolean => validator(input);
const parser = AJV.compileParser(schema);
const serializer = AJV.compileSerializer(schema);

export function boolean<TNullable extends boolean = false>(
    opts: ASchemaOptions = {},
): AScalarSchema<"boolean", MaybeNullable<boolean, TNullable>> {
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
                        throw new ValidationError(validator.errors ?? []);
                    }
                    if (isBool(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
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
                    throw new ValidationError(validator.errors ?? []);
                },
            },
        },
    };
}
