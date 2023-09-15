import { type Schema } from "@modii/jtd";
import Ajv, { type ErrorObject, ValidationError } from "ajv/dist/jtd";
import { type ASchema, SCHEMA_METADATA } from "../schemas";

export const AJV = new Ajv({ strictSchema: false });
export { type ErrorObject, ValidationError };

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
    const parse = AJV.compileParser<T>(schema);
    const validate = AJV.compile<T>(schema as any);
    const serialize = AJV.compileSerializer<T>(schema);
    return {
        parse,
        validate,
        serialize,
    };
}
