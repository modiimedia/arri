import Avj, { type ErrorObject } from "ajv/dist/jtd";
import { _SCHEMA, type ActualValue, type ArriSchema } from "./typedefs";

export const avj = new Avj({ strictSchema: false });

export class ArriValidationError extends Error {
    errors: ErrorObject[];
    constructor(errors: ErrorObject[]) {
        super();
        this.errors = errors;
        this.message = errors.map((err) => err.message).join(", ");
    }
}

export function validate<T = any, TNullable extends boolean = false>(
    schema: ArriSchema<T, TNullable>,
    input: unknown,
): input is ActualValue<T, TNullable> {
    return schema.metadata[_SCHEMA].validate(input);
}

export function parse<T = any, TNullable extends boolean = false>(
    schema: ArriSchema<T, TNullable>,
    input: unknown,
) {
    const result = schema.metadata[_SCHEMA].parse(input);
    return result;
}

export function safeParse<T = any, TNullable extends boolean = false>(
    schema: ArriSchema<T, TNullable>,
    input: unknown,
) {
    try {
        const result = schema.metadata[_SCHEMA].parse(input);
        return {
            success: true as const,
            value: result,
        };
    } catch (err) {
        return {
            success: false as const,
            error: err as ArriValidationError,
        };
    }
}

export function serialize<T = any, TNullable extends boolean = false>(
    schema: ArriSchema<T, TNullable>,
    input: unknown,
) {
    return schema.metadata[_SCHEMA].serialize(input);
}
