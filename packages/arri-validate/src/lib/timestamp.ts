import {
    type AScalarSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationData,
} from "../schemas";

export function timestamp(
    opts: ASchemaOptions = {},
): AScalarSchema<"timestamp", Date> {
    return {
        type: "timestamp",
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: new Date(),
                validate,
                parse,
                coerce,
                serialize,
            },
        },
    };
}

function validate(input: unknown): input is Date {
    return typeof input === "object" && input instanceof Date;
}
function parse(input: unknown, options?: ValidationData): Date | undefined {
    if (typeof input === "string") {
        const result = Date.parse(input);
        if (Number.isNaN(result)) {
            options?.errors.push({
                message: "Invalid date string",
                instancePath: options.instancePath,
                schemaPath: options.schemaPath,
            });
            return undefined;
        }
        return new Date(result);
    }
    if (validate(input)) {
        return input;
    }
    return undefined;
}
function coerce(input: unknown, options?: ValidationData): Date | undefined {
    if (typeof input === "number") {
        return new Date(input);
    }
    return parse(input, options);
}
function serialize(input: Date): string {
    return input.toISOString();
}
