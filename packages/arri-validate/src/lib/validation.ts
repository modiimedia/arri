import { type Schema } from "@modii/jtd";
import Ajv, { type ErrorObject, ValidationError } from "ajv/dist/jtd";
import { type ASchema, SCHEMA_METADATA } from "../schemas";

export const AJV = new Ajv({ strictSchema: false });
export { type ErrorObject, ValidationError };

export function isValidationError(input: unknown): input is ValidationError {
    if (typeof input !== "object" || !input) {
        return false;
    }
    return (
        "ajv" in input &&
        typeof input.ajv === "boolean" &&
        "errors" in input &&
        Array.isArray(input.errors) &&
        "validation" in input &&
        typeof input.validation === "boolean" &&
        "name" in input &&
        typeof input.name === "string" &&
        "message" in input &&
        typeof input.message === "string"
    );
}

export function validate<T = any>(
    schema: ASchema<T>,
    input: unknown,
): input is T {
    return schema.metadata[SCHEMA_METADATA].validate(input);
}

export function parse<T = any>(schema: ASchema<T>, input: unknown) {
    const result = schema.metadata[SCHEMA_METADATA].parse(input);
    return result;
}

export function safeParse<T = any>(schema: ASchema<T>, input: unknown) {
    try {
        const result = schema.metadata[SCHEMA_METADATA].parse(input);
        return {
            success: true as const,
            value: result,
        };
    } catch (err) {
        return {
            success: false as const,
            error: err as ValidationError,
        };
    }
}

export function serialize<T = any>(schema: ASchema<T>, input: unknown) {
    return schema.metadata[SCHEMA_METADATA].serialize(input);
}

/**
 * Create validator for a raw JSON Type Definition Schema
 */
export function createRawJtdValidator<T>(schema: Schema) {
    const parser = AJV.compileParser<T>(schema);
    const validate = AJV.compile<T>(schema as any);
    const serialize = AJV.compileSerializer<T>(schema);
    return {
        parse: (input: unknown): T => {
            if (typeof input === "string") {
                const result = parser(input);
                if (validate(result)) {
                    return result;
                }
            }
            if (validate(input)) {
                return input;
            }
            throw new ValidationError(validate.errors ?? []);
        },
        validate,
        serialize,
    };
}
