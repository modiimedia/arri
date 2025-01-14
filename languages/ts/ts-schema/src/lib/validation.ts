import {
    isValidationError,
    Result,
    ValidationError,
    ValueError,
} from '@arrirpc/schema-interface';

import { type ASchema, type ValidationContext, validatorKey } from '../schemas';

export function sanitizeJson(json: string) {
    return json
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
}

/**
 * Check if the input matches the specified schema. This is a type guard.
 */
export function validate<T = any>(
    schema: ASchema<T>,
    input: unknown,
): input is T {
    return schema[validatorKey].validate(input);
}

/**
 * Parse a JSON string or the result of JSON.parse(). Throws a ValidationError if parsing fails.
 */
export function decodeUnsafe<T = any>(schema: ASchema<T>, input: unknown): T {
    const errors: ValueError[] = [];
    const result = schema[validatorKey].decode(input, {
        schemaPath: '',
        instancePath: '',
        errors,
    });
    if (errors.length) {
        throw new ValidationError({
            message: `Unable to parse input. ${errors[0]!.message}`,
            errors,
        });
    }
    return result as T;
}

/**
 * Decode a value without throwing an error.
 */
export function decode<T = any>(schema: ASchema<T>, input: unknown): Result<T> {
    try {
        const result = decodeUnsafe(schema, input);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (isValidationError(err)) {
            return {
                success: false,
                errors: err.errors,
            };
        }
        return {
            success: false,
            errors: [
                {
                    instancePath: '',
                    schemaPath: '',
                    message: 'Unable to parse input',
                },
            ],
        };
    }
}

/**
 * Try to convert input to match the specified schema. Throws a ValidationError if conversion fails.
 */
export function coerceUnsafe<T = any>(schema: ASchema<T>, input: unknown): T {
    const errors: ValueError[] = [];
    const result = schema[validatorKey].coerce(input, {
        schemaPath: '',
        instancePath: '',
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

/**
 * Convert a value into the specified schema without throwing an error.
 */
export function coerce<T = any>(schema: ASchema<T>, input: unknown): Result<T> {
    try {
        const result = coerceUnsafe(schema, input);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (isValidationError(err)) {
            return {
                success: false,
                errors: err.errors,
            };
        }
        return {
            success: false,
            errors: [
                {
                    instancePath: '',
                    schemaPath: '',
                    message: 'Unable to coerce input',
                },
            ],
        };
    }
}

/**
 * Serialize a value into a JSON string
 */
export function encode<T = any>(schema: ASchema<T>, input: T) {
    const context: ValidationContext = {
        instancePath: '',
        schemaPath: '',
        errors: [],
    };
    return schema[validatorKey].encode(input, context);
}

export function errors(schema: ASchema, input: unknown): ValueError[] {
    const errorList: ValueError[] = [];
    try {
        schema[validatorKey].decode(input, {
            errors: errorList,
            instancePath: '',
            schemaPath: '',
        });
    } catch (err) {
        errorList.push({ instancePath: '', schemaPath: '', message: `${err}` });
    }
    return errorList;
}
