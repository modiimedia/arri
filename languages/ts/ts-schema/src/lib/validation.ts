import {
    Result,
    ValidationException,
    ValueError,
} from '@arrirpc/schema-interface';

import { type ASchema, newValidationContext, ValidationsKey } from '../schemas';

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
    return schema[ValidationsKey].validate(input);
}

/**
 * Decode a value without throwing an error.
 */
export function decode<T = any>(schema: ASchema<T>, input: unknown): Result<T> {
    const ctx = newValidationContext();
    const result = schema[ValidationsKey].decode(input, ctx);
    if (ctx.errors.length) {
        return {
            success: false,
            errors: ctx.errors,
        };
    }
    return {
        success: true,
        value: result as T,
    };
}

/**
 * Parse a JSON string or the result of JSON.parse(). Throws a [ValidationException] if parsing fails.
 */
export function decodeUnsafe<T = any>(schema: ASchema<T>, input: unknown): T {
    const ctx = newValidationContext();
    const result = schema[ValidationsKey].decode(input, ctx);
    if (ctx.errors.length) {
        throw new ValidationException({
            message: `Unable to parse input. ${ctx.errors[0]!.message}`,
            errors: ctx.errors,
        });
    }
    return result as T;
}

/**
 * Convert a value into the specified schema without throwing an error.
 */
export function coerce<T = any>(schema: ASchema<T>, input: unknown): Result<T> {
    const ctx = newValidationContext();
    const result = schema[ValidationsKey].coerce(input, ctx);
    if (ctx.errors.length) {
        return {
            success: false,
            errors: ctx.errors,
        };
    }
    return {
        success: true,
        value: result as T,
    };
}

/**
 * Try to convert input to match the specified schema. Throws a [ValidationException] if conversion fails.
 */
export function coerceUnsafe<T = any>(schema: ASchema<T>, input: unknown): T {
    const ctx = newValidationContext();
    const result = schema[ValidationsKey].coerce(input, ctx);
    if (ctx.errors.length) {
        throw new ValidationException({
            message: `Unable to coerce input. ${ctx.errors[0]?.message}`,
            errors: ctx.errors,
        });
    }
    return result as T;
}

/**
 * Serialize a value into a JSON string.
 */
export function encode<T = any>(schema: ASchema<T>, input: T): Result<string> {
    try {
        const context = newValidationContext();
        const result = schema[ValidationsKey].encode(input, context);
        if (context.errors.length || typeof result === 'undefined') {
            return {
                success: false,
                errors: context.errors,
            };
        }
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (err instanceof ValidationException) {
            return {
                success: false,
                errors: err.errors,
            };
        }
        const errList = errors(schema, input);
        if (errList.length) {
            return {
                success: false,
                errors: errList,
            };
        }
        return {
            success: false,
            errors: [
                {
                    message: err instanceof Error ? err.message : `${err}`,
                    data: err,
                },
            ],
        };
    }
}

export function encodeUnsafe<T = any>(schema: ASchema<T>, input: T): string {
    const result = encode(schema, input);
    if (!result.success) {
        throw new ValidationException({
            message: result.errors.length
                ? result.errors[0]!.message
                : `Unknown error`,
            errors: result.errors,
        });
    }
    return result.value;
}

export function errors(schema: ASchema, input: unknown): ValueError[] {
    const errorList: ValueError[] = [];
    try {
        schema[ValidationsKey].decode(input, {
            errors: errorList,
            instancePath: '',
            schemaPath: '',
            depth: 0,
            maxDepth: 500,
            exitOnFirstError: false,
        });
    } catch (err) {
        errorList.push({ instancePath: '', schemaPath: '', message: `${err}` });
    }
    return errorList;
}
