import Avj, { type ErrorObject } from "ajv/dist/jtd";
import { SCHEMA_METADATA, type ArriSchema } from "./typedefs";

export const AVJ = new Avj({ strictSchema: false });

export class ValidationError extends Error {
    errors: ErrorObject[];
    constructor(errors: ErrorObject[]) {
        super();
        this.errors = errors;
        this.message = errors.map((err) => err.message).join(", ");
    }
}

export function validate<T = any>(
    schema: ArriSchema<T>,
    input: unknown,
): input is T {
    return schema.metadata[SCHEMA_METADATA].validate(input);
}

export function parse<T = any>(schema: ArriSchema<T>, input: unknown) {
    const result = schema.metadata[SCHEMA_METADATA].parse(input);
    return result;
}

export function safeParse<T = any>(schema: ArriSchema<T>, input: unknown) {
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

export function serialize<T = any>(schema: ArriSchema<T>, input: unknown) {
    return schema.metadata[SCHEMA_METADATA].serialize(input);
}
