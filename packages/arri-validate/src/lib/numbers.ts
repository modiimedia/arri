import {
    type AScalarSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationData,
} from "../schemas";

const numberTypes = [
    "float32",
    "float64",
    "int16",
    "int32",
    "int8",
    "uint16",
    "uint32",
    "uint8",
] as const;

/**
 * Alias for float64 as that is the only number type that Javascript uses
 *
 * @example
 * const SomeNum = a.number()
 */
export function number(opts: ASchemaOptions = {}) {
    return float64(opts);
}

function coerceNumber(input: unknown, options: ValidationData) {
    if (typeof input === "string") {
        const parsedInput = Number(input);
        if (Number.isNaN(parsedInput)) {
            options.errors.push({
                instancePath: `${options.instancePath}`,
                schemaPath: `${options.schemaPath}/type`,
                message: `Unable to coerce ${typeof input} into a number`,
            });
            return undefined;
        }
        return parseNumber(parsedInput, options);
    }
    return parseNumber(input, options);
}

export function float32(opts: ASchemaOptions = {}) {
    return numberScalarType("float32", opts, (input) => {
        return {
            success: true,
        };
    });
}
export function float64(opts: ASchemaOptions = {}) {
    return numberScalarType("float64", opts, (input) => {
        return {
            success: true,
        };
    });
}
export function int8(opts: ASchemaOptions = {}) {
    return numberScalarType("int8", opts, (input) => {
        const isValid = validateInt(input, -128, 127);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: "Must be an valid integer between -128 and 127",
        };
    });
}
export function uint8(opts: ASchemaOptions = {}) {
    return numberScalarType("uint8", opts, (input) => {
        const isValid = validateInt(input, 0, 255);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: "Must be a valid integer between 0 and 255",
        };
    });
}
export function int16(opts: ASchemaOptions = {}) {
    return numberScalarType("int16", opts, (input) => {
        const isValid = validateInt(input, -32768, 32767);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: "Must be a valid integer between -32,768 and 32,767",
        };
    });
}
export function uint16(opts: ASchemaOptions = {}) {
    return numberScalarType("uint16", opts, (input) => {
        const isValid = validateInt(input, 0, 65535);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message: "Must be a valid integer between 0 and 65,535",
        };
    });
}
export function int32(opts: ASchemaOptions = {}) {
    return numberScalarType("int32", opts, (input) => {
        const isValid = validateInt(input, -2147483648, 2147483647);
        if (isValid) {
            return {
                success: true,
            };
        }
        return {
            success: false,
            message:
                "Must be a valid integer between -2,147,483,648 and 2,147,483,647",
        };
    });
}
export function uint32(opts: ASchemaOptions = {}) {
    return numberScalarType("uint32", opts, (input) => {
        const isValid = validateInt(input, 0, 4294967295);
        if (isValid) {
            return { success: true };
        }
        return {
            success: false,
            message: "Must be a valid integer between 0 and 4,294,967,295",
        };
    });
}

function validateNumber(input: unknown): input is number {
    return typeof input === "number" || !Number.isNaN(input);
}
function validateInt(input: number, minVal: number, maxValue: number) {
    return Number.isInteger(input) && input >= minVal && input <= maxValue;
}
function serializeNumber(input: number): string {
    return input.toString();
}
function parseNumber(input: unknown, options: ValidationData) {
    if (options.instancePath.length === 0 && typeof input === "string") {
        const result = Number(input);
        if (Number.isNaN(result)) {
            options?.errors.push({
                instancePath: options.instancePath,
                schemaPath: options.schemaPath,
                message: `Invalid number`,
            });
            return undefined;
        }
        return result;
    }
    if (typeof input === "number" && !Number.isNaN(input)) {
        return input;
    }
    options?.errors.push({
        instancePath: options.instancePath,
        schemaPath: options.schemaPath,
        message: "Invalid number",
    });
    return undefined;
}

function numberScalarType<TType extends (typeof numberTypes)[number]>(
    type: TType,
    opts: ASchemaOptions,
    numTypeMatcher: (
        input: number,
    ) => { success: true } | { success: false; message: string },
): AScalarSchema<TType, number> {
    return {
        type,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: 0,
                validate(input): input is number {
                    const isNum = validateNumber(input);
                    if (!isNum) {
                        return false;
                    }
                    return numTypeMatcher(input).success;
                },
                parse(input, options) {
                    const result = parseNumber(input, options);
                    if (options.errors.length) {
                        return undefined;
                    }
                    if (typeof result !== "number") {
                        options?.errors.push({
                            instancePath: options.instancePath,
                            schemaPath: options.schemaPath,
                            message: "Invalid number",
                        });
                        return undefined;
                    }
                    const matchResult = numTypeMatcher(result);
                    if (matchResult.success) {
                        return result;
                    }
                    options?.errors.push({
                        instancePath: options.instancePath,
                        schemaPath: options.schemaPath,
                        message: matchResult.message,
                    });
                    return undefined;
                },
                serialize: serializeNumber,
                coerce(input, options) {
                    const result = coerceNumber(input, options);
                    if (!result) {
                        options.errors.push({
                            instancePath: options.instancePath,
                            schemaPath: options.schemaPath,
                            message: `Unable to coerce ${typeof input} to ${type}`,
                        });
                        return undefined;
                    }
                    const matchResult = numTypeMatcher(result);
                    if (matchResult.success) {
                        return result;
                    }
                    options.errors.push({
                        instancePath: options.instancePath,
                        schemaPath: options.schemaPath,
                        message: matchResult.message,
                    });
                    return undefined;
                },
            },
        },
    };
}
