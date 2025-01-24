import * as UValidator from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty,
    createUValidatorProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AScalarSchema,
    type ASchemaOptions,
    type NumberType,
    SchemaValidator,
    type ValidationContext,
    ValidationsKey,
} from '../schemas';
import {
    int8Max,
    int8Min,
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    int64Max,
    int64Min,
    uint8Max,
    uint8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
    uint64Max,
    uint64Min,
} from './numberConstants';

/**
 * Alias for float64 as that is the only number type that Javascript uses
 *
 * @example
 * const Schema = a.number()
 * a.validate(Schema, 1.5) // true
 */
export function number(opts: ASchemaOptions = {}) {
    return float64(opts);
}

function coerceNumber(input: unknown, options: ValidationContext) {
    if (typeof input === 'string') {
        const decodedInput = Number(input);
        if (Number.isNaN(decodedInput)) {
            options.errors.push({
                instancePath: `${options.instancePath}`,
                schemaPath: `${options.schemaPath}/type`,
                message: `Error at ${
                    options.instancePath
                }. Unable to coerce ${typeof input} into a number`,
            });
            return undefined;
        }
        return decodeNumber(decodedInput, options);
    }
    return decodeNumber(input, options);
}

export function float32(opts: ASchemaOptions = {}) {
    return numberScalarType('float32', opts, () => {
        return {
            success: true,
        };
    });
}
export function float64(opts: ASchemaOptions = {}) {
    return numberScalarType('float64', opts, () => {
        return {
            success: true,
        };
    });
}
export function int8(opts: ASchemaOptions = {}) {
    return numberScalarType('int8', opts, (input) => {
        const isValid = validateInt(input, int8Min, int8Max);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: `Must be an valid integer between ${int8Min} and ${int8Max}`,
        };
    });
}
export function uint8(opts: ASchemaOptions = {}) {
    return numberScalarType('uint8', opts, (input) => {
        const isValid = validateInt(input, uint8Min, uint8Max);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: `Must be a valid integer between ${uint8Min} and ${uint8Max}`,
        };
    });
}
export function int16(opts: ASchemaOptions = {}) {
    return numberScalarType('int16', opts, (input) => {
        const isValid = validateInt(input, int16Min, int16Max);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: `Must be a valid integer between ${int16Min} and ${int16Max}`,
        };
    });
}
export function uint16(opts: ASchemaOptions = {}) {
    return numberScalarType('uint16', opts, (input) => {
        const isValid = validateInt(input, uint16Min, uint16Max);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: `Must be a valid integer between ${uint16Min} and ${uint16Max}`,
        };
    });
}
export function int32(opts: ASchemaOptions = {}) {
    return numberScalarType('int32', opts, (input) => {
        const isValid = validateInt(input, int32Min, int32Max);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: `Must be a valid integer between ${int32Min} and ${int32Max}`,
        };
    });
}
export function uint32(opts: ASchemaOptions = {}) {
    return numberScalarType('uint32', opts, (input) => {
        const isValid = validateInt(input, uint32Min, uint32Max);
        if (isValid) {
            return { success: true };
        }
        return {
            success: false,
            message: `Must be a valid integer between ${uint32Min} and ${uint32Max}`,
        };
    });
}

export function int64(
    opts: ASchemaOptions = {},
): AScalarSchema<'int64', bigint> {
    function isType(input: unknown): input is bigint {
        return (
            typeof input === 'bigint' && input >= int64Min && input <= int64Max
        );
    }
    function parse(
        input: unknown,
        context: ValidationContext,
    ): bigint | undefined {
        if (typeof input === 'string' || typeof input === 'number') {
            try {
                const val = BigInt(input);
                if (isType(val)) {
                    return val;
                }
                context.errors.push({
                    message: `Error at ${context.instancePath}. Invalid int64.`,
                    schemaPath: `${context.schemaPath}/type`,
                    instancePath: context.instancePath,
                });
                return undefined;
            } catch (_) {
                context.errors.push({
                    message: `Error at ${context.instancePath}. Unable to transform ${input} to BigInt`,
                    schemaPath: `${context.schemaPath}/type`,
                    instancePath: context.instancePath,
                });
                return undefined;
            }
        }
        if (isType(input)) {
            return input;
        }
        context.errors.push({
            message: `Error at ${context.instancePath}. Expected BigInt or integer string`,
            schemaPath: `${context.schemaPath}/type`,
            instancePath: context.instancePath,
        });
        return undefined;
    }
    const validator: SchemaValidator<bigint> = {
        output: BigInt('0'),
        validate: isType,
        parse: parse,
        coerce: parse,
        serialize(input, context) {
            if (context.instancePath.length === 0) {
                return input.toString();
            }
            return `"${input.toString()}"`;
        },
    };
    const result: AScalarSchema<'int64', bigint> = {
        type: 'int64',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(isType, parse),
    };
    hideInvalidProperties(result);
    return result;
}

export function uint64(
    opts: ASchemaOptions = {},
): AScalarSchema<'uint64', bigint> {
    function isType(input: unknown): input is bigint {
        return (
            typeof input === 'bigint' &&
            input >= uint64Min &&
            input <= uint64Max
        );
    }
    function parse(
        input: unknown,
        context: ValidationContext,
    ): bigint | undefined {
        if (typeof input === 'string' || typeof input === 'number') {
            try {
                const val = BigInt(input);
                if (isType(val)) {
                    return val;
                }
                context.errors.push({
                    message: `Error at ${context.instancePath}. Invalid uint64.`,
                    schemaPath: `${context.schemaPath}/type`,
                    instancePath: context.instancePath,
                });
                return undefined;
            } catch (_) {
                context.errors.push({
                    message: `Error at ${context.instancePath}. Unable to transform ${input} to BigInt.`,
                    schemaPath: `${context.schemaPath}/type`,
                    instancePath: context.instancePath,
                });
                return undefined;
            }
        }
        if (isType(input)) {
            return input;
        }
        context.errors.push({
            message: `Error at ${context.instancePath}. Expected BigInt or integer string.`,
            schemaPath: `${context.schemaPath}/type`,
            instancePath: context.instancePath,
        });
        return undefined;
    }
    const validator: SchemaValidator<bigint> = {
        output: BigInt('0'),
        validate: isType,
        parse: parse,
        coerce: parse,
        serialize(input, context) {
            if (context.instancePath.length === 0) {
                return input.toString();
            }
            return `"${input.toString()}"`;
        },
    };
    const result: AScalarSchema<'uint64', bigint> = {
        type: 'uint64',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(isType, parse),
    };
    hideInvalidProperties(result);
    return result;
}

function validateNumber(input: unknown): input is number {
    return typeof input === 'number';
}
function validateInt(input: number, minVal: number, maxValue: number) {
    return Number.isInteger(input) && input >= minVal && input <= maxValue;
}
function serializeNumber(input: number, _context: ValidationContext): string {
    return input.toString();
}
function decodeNumber(input: unknown, context: ValidationContext) {
    if (context.instancePath.length === 0 && typeof input === 'string') {
        const result = Number(input);
        if (Number.isNaN(result)) {
            context?.errors.push({
                instancePath: context.instancePath,
                schemaPath: `${context.schemaPath}/type`,
                message: `Error at ${context.instancePath}. Invalid number.`,
            });
            return undefined;
        }
        return result;
    }
    if (typeof input === 'number' && !Number.isNaN(input)) {
        return input;
    }
    context?.errors.push({
        instancePath: context.instancePath,
        schemaPath: `${context.schemaPath}/type`,
        message: `Error at ${context.instancePath}. Invalid number.`,
    });
    return undefined;
}

function numberScalarType<TType extends NumberType>(
    type: TType,
    opts: ASchemaOptions,
    numTypeMatcher: (
        input: number,
    ) => { success: true } | { success: false; message: string },
): AScalarSchema<TType, number> {
    const validate = (input: unknown): input is number => {
        const isNum = validateNumber(input);
        if (!isNum) {
            return false;
        }
        return numTypeMatcher(input).success;
    };
    const parse = (
        input: unknown,
        context: ValidationContext,
    ): number | undefined => {
        const result = decodeNumber(input, context);
        if (context.errors.length) {
            return undefined;
        }
        if (typeof result !== 'number') {
            context?.errors.push({
                instancePath: context.instancePath,
                schemaPath: `${context.schemaPath}/type`,
                message: `Error at ${context.instancePath}. Invalid number.`,
            });
            return undefined;
        }
        const matchResult = numTypeMatcher(result);
        if (matchResult.success) {
            return result;
        }
        context?.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/type`,
            message: `Error at ${context.instancePath}. ${matchResult.message}`,
        });
        return undefined;
    };
    const validator: SchemaValidator<number> = {
        output: 0,
        validate,
        parse: parse,
        serialize: serializeNumber,
        coerce(input, options) {
            const result = coerceNumber(input, options);
            if (typeof result !== 'number') {
                options.errors.push({
                    instancePath: options.instancePath,
                    schemaPath: `${options.schemaPath}/type`,
                    message: `Error at ${
                        options.instancePath
                    }. Unable to coerce ${typeof input} to ${type}.`,
                });
                return undefined;
            }
            const matchResult = numTypeMatcher(result);
            if (matchResult.success) {
                return result;
            }
            options.errors.push({
                instancePath: options.instancePath,
                schemaPath: `${options.schemaPath}/type`,
                message: `Error at ${options.instancePath}. ${matchResult.message}`,
            });
            return undefined;
        },
    };
    const result: AScalarSchema<TType, number> = {
        type,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}
