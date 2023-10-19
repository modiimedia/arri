import { type ASchema, SCHEMA_METADATA, type ValidationData } from "../schemas";

/**
 * Check if the input matches the specified schema. This is a type guard.
 */
export function validate<T = any>(
    schema: ASchema<T>,
    input: unknown,
): input is T {
    return schema.metadata[SCHEMA_METADATA].validate(input);
}

/**
 * Parse a JSON string or the result of JSON.parse(). Throws a ValidationError if parsing fails.
 */
export function parse<T = any>(schema: ASchema<T>, input: unknown): T {
    const errors: ValueError[] = [];
    const result = schema.metadata[SCHEMA_METADATA].parse(input, {
        schemaPath: "",
        instancePath: "",
        errors,
    });
    if (errors.length) {
        throw new ValidationError({
            message: `Unable to parse input. ${errors[0].message}`,
            errors,
        });
    }
    return result as T;
}

/**
 * Parse a value without throwing an error.
 */
export function safeParse<T = any>(
    schema: ASchema<T>,
    input: unknown,
): SafeResult<T> {
    try {
        const result = parse(schema, input);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (isValidationError(err)) {
            return {
                success: false,
                error: err,
            };
        }
        return {
            success: false,
            error: new ValidationError({
                message: "Unable to parse input",
                errors: [],
            }),
        };
    }
}

/**
 * Try to convert input to match the specified schema. Throws a ValidationError if conversion fails.
 */
export function coerce<T = any>(schema: ASchema<T>, input: unknown): T {
    const errors: ValueError[] = [];
    const result = schema.metadata[SCHEMA_METADATA].coerce(input, {
        schemaPath: "",
        instancePath: "",
        errors,
    });
    if (errors.length) {
        throw new ValidationError({
            message: `Unable to coerce input. ${errors[0]?.message}`,
            errors,
        });
    }
    return result as T;
}

export type SafeResult<T> =
    | { success: true; value: T }
    | { success: false; error: ValidationError };

/**
 * Convert a value into the specified schema without throwing an error.
 */
export function safeCoerce<T = any>(
    schema: ASchema<T>,
    input: unknown,
): SafeResult<T> {
    try {
        const result = coerce(schema, input);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (isValidationError(err)) {
            return {
                success: false,
                error: err,
            };
        }
        return {
            success: false,
            error: new ValidationError({
                message: "Unable to coerce input",
                errors: [],
            }),
        };
    }
}

/**
 * Serialize a value into a JSON string
 */
export function serialize<T = any>(schema: ASchema<T>, input: T) {
    const data: ValidationData = {
        instancePath: "",
        schemaPath: "",
        errors: [],
    };
    return schema.metadata[SCHEMA_METADATA].serialize(input, data);
}

export interface ValueError {
    instancePath: string;
    schemaPath: string;
    message?: string;
    data?: any;
}

export class ValidationError extends Error {
    errors: ValueError[];

    constructor(options: { message: string; errors: ValueError[] }) {
        super(options.message);
        this.errors = options.errors;
    }
}

export function isValidationError(input: unknown): input is ValidationError {
    if (typeof input !== "object" || !input) {
        return false;
    }
    return (
        "message" in input &&
        typeof input.message === "string" &&
        "errors" in input &&
        Array.isArray(input.errors)
    );
}
