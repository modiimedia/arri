import { type AScalarSchema, type ASchemaOptions, SCHEMA_METADATA } from "../schemas";
import { ValidationError } from "./validation";

const isString = (input: unknown): input is string => typeof input === "string";

export function string(
    opts: ASchemaOptions = {},
): AScalarSchema<"string", string> {
    return {
        type: "string",
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: "",
                parse: (input) => {
                    if (typeof input === "string") {
                        return input;
                    }
                    throw new ValidationError([
                        {
                            message: "Expected string",
                            instancePath: "/",
                            keyword: "",
                            params: {},
                            schemaPath: "/",
                        },
                    ]);
                },
                coerce: (input) => {
                    if (typeof input === "string") {
                        return input;
                    }
                    return `${input as any}`;
                },
                validate: isString,
                serialize: (input) =>
                    typeof input === "string" ? input : `${input as any}`,
            },
        },
    };
}
