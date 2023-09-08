import {
    type ScalarTypeSchema,
    type InputOptions,
    SCHEMA_METADATA,
} from "./typedefs";
import { ArriValidationError } from "./validation";

const isString = (input: unknown): input is string => typeof input === "string";

export function string(
    opts: InputOptions = {},
): ScalarTypeSchema<"string", string> {
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
                    throw new ArriValidationError([
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
