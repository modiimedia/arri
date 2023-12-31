import {
    type AScalarSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationData,
} from "../schemas";

/**
 * @example
 * const StringSchema = a.string();
 * a.validate(StringSchema, "hello world") // true
 * a.validate(StringSchema, 10) // false
 */
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
                parse,
                coerce,
                validate,
                serialize(input, data) {
                    if (data.instancePath.length === 0) {
                        return input;
                    }
                    return `"${input
                        .replace(/[\n]/g, "\\n")
                        .replace(/"/g, '\\"')}"`;
                },
            },
        },
    };
}

function validate(input: unknown): input is string {
    return typeof input === "string";
}

function parse(input: unknown, options: ValidationData) {
    if (validate(input)) {
        return input;
    }
    options.errors.push({
        instancePath: options.instancePath,
        schemaPath: options.schemaPath,
        message: `Error at ${
            options.instancePath
        }. Expected 'string' got ${typeof input}.`,
    });
    return undefined;
}

function coerce(input: unknown, options: ValidationData) {
    return parse(input, options);
}
