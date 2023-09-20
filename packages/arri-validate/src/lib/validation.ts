import Ajv from "ajv/dist/jtd";
import { type ASchema, SCHEMA_METADATA } from "../schemas";

export const AJV = new Ajv({ strictSchema: false });

export function validate<T = any>(
    schema: ASchema<T>,
    input: unknown,
): input is T {
    return schema.metadata[SCHEMA_METADATA].validate(input);
}

export function parse<T = any>(schema: ASchema<T>, input: unknown): T {
    const errors: ValueError[] = [];
    const result = schema.metadata[SCHEMA_METADATA].parse(input, {
        schemaPath: "",
        instancePath: "",
        errors,
    });
    if (errors.length || !result) {
        throw new ValidationError({ message: "Unable to parse input", errors });
    }
    return result;
}

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
                success: false as const,
                error: err,
            };
        }
        return {
            success: false as const,
            error: new ValidationError({
                message: "Unable to coerce input",
                errors: [],
            }),
        };
    }
}

export function coerce<T = any>(schema: ASchema<T>, input: unknown): T {
    const errors: ValueError[] = [];
    const result = schema.metadata[SCHEMA_METADATA].coerce(input, {
        schemaPath: "",
        instancePath: "",
        errors,
    });
    if (errors.length || !result) {
        throw new ValidationError({
            message: "Unable to coerce input",
            errors,
        });
    }
    return result;
}

type SafeResult<T> =
    | { success: true; value: T }
    | { success: false; error: ValidationError };

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

export function serialize<T = any>(schema: ASchema<T>, input: T) {
    return schema.metadata[SCHEMA_METADATA].serialize(input);
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
    return input instanceof ValidationError;
}
