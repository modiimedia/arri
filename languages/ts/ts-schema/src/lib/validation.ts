import { Err, Ok, Result } from '@arrirpc/core';

import { ValidationException, ValueError } from '../errors';
import { type ASchema, newValidationContext, VALIDATOR_KEY } from '../schemas';

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
    return schema[VALIDATOR_KEY].validate(input);
}

/**
 * Parse a JSON string or the result of JSON.parse() without throwing an error.
 */
export function parse<T = any>(
    schema: ASchema<T>,
    input: unknown,
): Result<T, ValueError[]> {
    const ctx = newValidationContext();
    const result = schema[VALIDATOR_KEY].parse(input, ctx);
    if (ctx.errors.length) {
        return Err(ctx.errors);
    }
    return Ok(result as T);
}

/**
 * Parse a JSON string or the result of JSON.parse(). Throws a [ValidationException] if parsing fails.
 */
export function parseUnsafe<T = any>(schema: ASchema<T>, input: unknown): T {
    const ctx = newValidationContext();
    const result = schema[VALIDATOR_KEY].parse(input, ctx);
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
export function coerce<T = any>(
    schema: ASchema<T>,
    input: unknown,
): Result<T, ValueError[]> {
    const ctx = newValidationContext();
    const result = schema[VALIDATOR_KEY].coerce(input, ctx);
    if (ctx.errors.length) {
        return Err(ctx.errors);
    }
    return Ok(result as T);
}

/**
 * Try to convert input to match the specified schema. Throws a [ValidationException] if conversion fails.
 */
export function coerceUnsafe<T = any>(schema: ASchema<T>, input: unknown): T {
    const ctx = newValidationContext();
    const result = schema[VALIDATOR_KEY].coerce(input, ctx);
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
export function serialize<T = any>(
    schema: ASchema<T>,
    input: T,
): Result<string, ValueError[]> {
    try {
        const context = newValidationContext();
        const result = schema[VALIDATOR_KEY].serialize(input, context);
        if (context.errors.length || typeof result === 'undefined') {
            return Err(context.errors);
        }
        return Ok(result);
    } catch (err) {
        if (err instanceof ValidationException) {
            return Err(err.errors);
        }
        const errList = errors(schema, input);
        if (errList.length) {
            return Err(errList);
        }
        return Err([
            {
                message: err instanceof Error ? err.message : `${err}`,
                instancePath: '/',
                data: err,
            },
        ]);
    }
}

export function serializeUnsafe<T = any>(schema: ASchema<T>, input: T): string {
    const result = serialize(schema, input);
    if (!result.ok) {
        throw new ValidationException({
            message: result.error.length
                ? result.error[0]!.message
                : `Unknown error`,
            errors: result.error,
        });
    }
    return result.value;
}

export function errors(
    schema: ASchema,
    input: unknown,
    exitOnFirstError = false,
): ValueError[] {
    const errorList: ValueError[] = [];
    try {
        schema[VALIDATOR_KEY].parse(input, {
            errors: errorList,
            instancePath: '',
            schemaPath: '',
            depth: 0,
            maxDepth: 500,
            exitOnFirstError: exitOnFirstError,
        });
    } catch (err) {
        errorList.push({ instancePath: '', schemaPath: '', message: `${err}` });
    }
    return errorList;
}
