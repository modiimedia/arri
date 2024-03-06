import {
    type AScalarSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationData as ValidationContext,
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
            isDeprecated: opts.isDeprecated,
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

function parse(input: unknown, context: ValidationContext) {
    if (validate(input)) {
        return input;
    }
    context.errors.push({
        instancePath: context.instancePath,
        schemaPath: `${context.schemaPath}/type`,
        message: `Error at ${
            context.instancePath
        }. Expected 'string' got ${typeof input}.`,
    });
    return undefined;
}

function coerce(input: unknown, context: ValidationContext) {
    return parse(input, context);
}
