import {
    Result,
    UValidatorWith,
    ValidationException,
} from '@arrirpc/schema-interface';
import * as UValidator from '@arrirpc/schema-interface';
import { isSchemaFormEnum, isSchemaFormType } from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import {
    type ASchema,
    errors as getInputErrors,
    type InferType,
} from './_index';
import { createStandardSchemaProperty } from './adapters';
import { createParsingTemplate as getSchemaDecodingCode } from './compiler/parse';
import { createSerializationV2Template as getSchemaSerializationCode } from './compiler/serialize';
import { createValidationTemplate as getSchemaValidationCode } from './compiler/validate';
import {
    int8Max,
    int8Min,
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    uint8Max,
    uint8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
} from './lib/numberConstants';

export {
    getSchemaDecodingCode,
    getSchemaSerializationCode,
    getSchemaValidationCode,
};

export interface CompiledValidator<TSchema extends ASchema<any>>
    extends StandardSchemaV1<InferType<TSchema>>,
        UValidatorWith<
            InferType<TSchema>,
            'coerce' | 'parse' | 'serialize' | 'validate' | 'toATD'
        > {
    /**
     * Determine if a type matches a schema. This is a type guard.
     */
    validate: (input: unknown) => input is InferType<TSchema>;
    /**
     * Parse a JSON string or the result of JSON.parse(). Throws an error if parsing fails.
     */
    parse: (input: unknown) => Result<InferType<TSchema>>;
    /**
     * Parse a JSON string or the result of JSON.parse(). Throws an error if parsing fails.
     */
    parseUnsafe: (input: unknown) => InferType<TSchema>;
    /**
     * Serialize to JSON
     */
    serialize: (input: InferType<TSchema>) => Result<string>;
    /**
     * Serialize to JSON. Throws an error if it fails.
     */
    serializeUnsafe: (input: InferType<TSchema>) => string;
    compiledCode: {
        parse: string;
        serialize: string;
        validate: string;
    };
}

/**
 * Create compiled versions of the `decode()`, `validate()`, and `serialize()` functions
 */
export function compile<TSchema extends ASchema<any>>(
    schema: TSchema,
): CompiledValidator<TSchema> {
    const validateCode = getSchemaValidationCode('input', schema);
    const parser = getCompiledParser('input', schema);
    const parserFn = parser.fn;
    const serializer = getCompiledSerializer(schema);
    const serializeFn = serializer.fn;
    const serialize = (input: InferType<TSchema>): Result<string> => {
        try {
            const result = serializeFn(input);
            return {
                success: true,
                value: result,
            };
        } catch (err) {
            const errors = getInputErrors(schema, input, true);
            if (errors.length === 0) {
                errors.push({
                    instancePath: '',
                    schemaPath: '',
                    message: err instanceof Error ? err.message : `${err}`,
                    data: err,
                });
            }
            return {
                success: false,
                errors: errors,
            };
        }
    };
    const validate = new Function('input', validateCode) as (
        input: unknown,
    ) => input is InferType<TSchema>;
    const parse = (input: unknown): Result<InferType<TSchema>> => {
        try {
            const result = parserFn(input);
            return {
                success: true,
                value: result,
            };
        } catch (err) {
            const errors = getInputErrors(schema, input, true);
            if (!errors.length) {
                errors.push({
                    message: err instanceof Error ? err.message : '',
                });
            }
            return {
                success: false,
                errors: errors,
            };
        }
    };
    const atd = JSON.parse(JSON.stringify(schema));
    const result: CompiledValidator<TSchema> = {
        validate,
        parse: parse,
        parseUnsafe(input) {
            const result = parse(input);
            if (!result.success) {
                throw new ValidationException({
                    message:
                        result.errors[0]?.message ?? 'Error decoding input',
                    errors: result.errors,
                });
            }
            return result.value;
        },
        serialize,
        serializeUnsafe(input) {
            try {
                return serializeFn(input);
            } catch (err) {
                const errors = getInputErrors(schema, input);
                let errorMessage = err instanceof Error ? err.message : '';
                if (errors.length) {
                    errorMessage =
                        errors[0]!.message ??
                        `Parsing error at ${errors[0]!.instancePath}`;
                }
                throw new ValidationException({
                    message: errorMessage,
                    errors,
                });
            }
        },
        compiledCode: {
            validate: validateCode,
            parse: parser.code,
            serialize: serializer.code,
        },
        '~standard': createStandardSchemaProperty(validate, (input, ctx) => {
            const result = parse(input);
            if (!result.success) {
                ctx.errors = result.errors;
                return undefined;
            }
            return result.value;
        }),
        [UValidator.v1]: {
            vendor: 'arri/compiled',
            validate,
            parse,
            serialize,
            coerce: schema[UValidator.v1].coerce,
            toATD: () => atd,
        },
    };
    return result;
}

type CompiledDecoder<TSchema extends ASchema<any>> =
    CompiledValidator<TSchema>['parseUnsafe'];

export function getCompiledParser<TSchema extends ASchema<any>>(
    input: string,
    schema: TSchema,
): { fn: CompiledDecoder<TSchema>; code: string } {
    const code = getSchemaDecodingCode(input, schema);
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case 'float32':
            case 'float64':
                if (schema.nullable) {
                    return {
                        fn: nullableFloatDecoder,
                        code,
                    };
                }
                return {
                    fn: compiledFloatDecoder,
                    code,
                };
            case 'int64':
                return {
                    fn(input) {
                        return bigIntDecoder(
                            input,
                            false,
                            schema.nullable ?? false,
                        );
                    },
                    code,
                };
            case 'uint64':
                return {
                    fn(input) {
                        return bigIntDecoder(
                            input,
                            true,
                            schema.nullable ?? false,
                        );
                    },
                    code,
                };
            case 'int32':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            return nullableIntDecoder(
                                input,
                                int32Min,
                                int32Max,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input) {
                        return intDecoder(input, int32Min, int32Max);
                    },
                    code,
                };
            case 'int16':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            return nullableIntDecoder(
                                input,
                                int16Min,
                                int16Max,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input) {
                        return intDecoder(input, int16Min, int16Max);
                    },
                    code,
                };
            case 'int8':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            return nullableIntDecoder(input, int8Min, int8Max);
                        },
                        code,
                    };
                }
                return {
                    fn(input) {
                        return intDecoder(input, int8Min, int8Max);
                    },
                    code,
                };
            case 'uint32':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            return nullableIntDecoder(
                                input,
                                uint32Min,
                                uint32Max,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input) {
                        return intDecoder(input, uint32Min, uint32Max);
                    },
                    code,
                };
            case 'uint16':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            return nullableIntDecoder(
                                input,
                                uint16Min,
                                uint16Max,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input: unknown) {
                        return intDecoder(input, uint16Min, uint16Max);
                    },
                    code,
                };
            case 'uint8':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            return nullableIntDecoder(
                                input,
                                uint8Min,
                                uint8Max,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input: unknown) {
                        return intDecoder(input, uint8Min, uint8Max);
                    },
                    code,
                };
            case 'boolean':
                if (schema.nullable) {
                    return {
                        code,
                        fn(input) {
                            if (typeof input === 'string') {
                                if (input === 'true') {
                                    return true;
                                }
                                if (input === 'false') {
                                    return false;
                                }
                                if (input === 'null') {
                                    return null;
                                }
                            }
                            if (typeof input === 'boolean') {
                                return input;
                            }
                            if (input === null) {
                                return null;
                            }
                            throw new ValidationException({
                                message: `Expected boolean. Got ${typeof input}`,
                                errors: [
                                    {
                                        instancePath: '',
                                        schemaPath: '/type',
                                        message: `Expected boolean. Got ${typeof input}`,
                                    },
                                ],
                            });
                        },
                    };
                }
                return {
                    fn(input) {
                        if (typeof input === 'string') {
                            if (input === 'true') {
                                return true;
                            }
                            if (input === 'false') {
                                return false;
                            }
                        }
                        if (typeof input === 'boolean') {
                            return input;
                        }
                        throw new ValidationException({
                            message: `Expected boolean. Got ${typeof input}`,
                            errors: [
                                {
                                    instancePath: '',
                                    schemaPath: '/type',
                                    message: `Expected boolean. Got ${typeof input}`,
                                },
                            ],
                        });
                    },
                    code,
                };
            case 'string':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            if (typeof input === 'string') {
                                if (input === 'null') {
                                    return null;
                                }
                                return input;
                            }
                            if (input === null) {
                                return null;
                            }
                            throw new ValidationException({
                                message: `Expected string or null. Got ${typeof input}.`,
                                errors: [
                                    {
                                        instancePath: '',
                                        schemaPath: '/type',
                                        message: `Expected string or null. Got ${typeof input}.`,
                                    },
                                ],
                            });
                        },
                        code,
                    };
                }
                return {
                    fn(input) {
                        if (typeof input === 'string') {
                            return input;
                        }
                        throw new ValidationException({
                            message: `Expected string. Got ${typeof input}.`,
                            errors: [
                                {
                                    instancePath: '',
                                    schemaPath: '/type',
                                    message: `Expected string. Got ${typeof input}.`,
                                },
                            ],
                        });
                    },
                    code,
                };
            case 'timestamp':
                if (schema.nullable) {
                    return {
                        fn(input) {
                            if (typeof input === 'string') {
                                const decodedInput = new Date(input);
                                if (!Number.isNaN(decodedInput.getMonth())) {
                                    return decodedInput;
                                }
                                if (input === 'null') {
                                    return null;
                                }
                            }
                            if (
                                typeof input === 'object' &&
                                input instanceof Date
                            ) {
                                return input;
                            }
                            if (input === null) {
                                return null;
                            }
                            throw new ValidationException({
                                message: `Expected instanceof Date, ISO Date string, or null. Got ${typeof input}.`,
                                errors: [
                                    {
                                        instancePath: '',
                                        schemaPath: '/type',
                                        message: `Expected instanceof Date, ISO Date string, or null. Got ${typeof input}.`,
                                    },
                                ],
                            });
                        },
                        code,
                    };
                }
                return {
                    fn(input: unknown) {
                        if (typeof input === 'string') {
                            const decodedInput = new Date(input);
                            if (!Number.isNaN(decodedInput.getMonth())) {
                                return decodedInput;
                            }
                        }
                        if (
                            typeof input === 'object' &&
                            input instanceof Date
                        ) {
                            return input;
                        }
                        throw new ValidationException({
                            message: `Expected instance of Date or ISO date string. Got ${typeof input}.`,
                            errors: [
                                {
                                    instancePath: '',
                                    schemaPath: '/type',
                                    message: `Expected instance of Date or ISO date string. Got ${typeof input}.`,
                                },
                            ],
                        });
                    },
                    code,
                };
            default:
                break;
        }
    }
    if (isSchemaFormEnum(schema)) {
        if (schema.nullable) {
            return {
                fn(input) {
                    if (typeof input === 'string') {
                        for (const val of schema.enum) {
                            if (input === val) {
                                return val;
                            }
                        }
                        if (input === 'null') {
                            return null;
                        }
                    }
                    if (input === null) {
                        return null;
                    }
                    throw new ValidationException({
                        message: `Expected one of the following values: [${schema.enum.join(
                            ', ',
                        )}] or null. Got ${typeof input}.`,
                        errors: [
                            {
                                instancePath: '',
                                schemaPath: '/enum',
                                message: `Expected one of the following values: [${schema.enum.join(
                                    ', ',
                                )}] or null. Got ${typeof input}.`,
                            },
                        ],
                    });
                },
                code,
            };
        }
        return {
            fn(input) {
                if (typeof input === 'string') {
                    for (const val of schema.enum) {
                        if (input === val) {
                            return val;
                        }
                    }
                }
                throw new ValidationException({
                    message: `Expected one of the following values: [${schema.enum.join(
                        ', ',
                    )}]. Got ${typeof input}.`,
                    errors: [
                        {
                            instancePath: '',
                            schemaPath: '/enum',
                            message: `Expected one of the following values: [${schema.enum.join(
                                ', ',
                            )}]. Got ${typeof input}.`,
                        },
                    ],
                });
            },
            code,
        };
    }

    return { fn: new Function(input, code) as any, code };
}

function compiledFloatDecoder(input: unknown): number {
    if (typeof input === 'string') {
        const decodedVal = Number(input);
        if (!Number.isNaN(decodedVal)) {
            return decodedVal;
        }
        throw new ValidationException({
            message: `Unable to decode number from ${input}`,
            errors: [
                {
                    instancePath: '',
                    schemaPath: '/type',
                    message: `Unable to decode number from ${input}`,
                },
            ],
        });
    }
    if (typeof input === 'number' && !Number.isNaN(input)) {
        return input;
    }
    throw new ValidationException({
        message: `Expected number. Got ${typeof input}`,
        errors: [
            {
                instancePath: '',
                schemaPath: '/type',
                message: `Expected number. Got ${typeof input}`,
            },
        ],
    });
}

function nullableFloatDecoder(input: unknown): number | null {
    if (typeof input === 'string') {
        const decodedVal = Number(input);
        if (!Number.isNaN(decodedVal)) {
            return decodedVal;
        }
        if (input === 'null') {
            return null;
        }
        throw new ValidationException({
            message: `Unable to decode number from ${input}`,
            errors: [
                {
                    instancePath: '',
                    schemaPath: '/type',
                    message: `Unable to decode number from ${input}`,
                },
            ],
        });
    }
    if (typeof input === 'number' && !Number.isNaN(input)) {
        return input;
    }
    if (input === null) {
        return null;
    }
    throw new ValidationException({
        message: `Expected number or null. Got ${typeof input}`,
        errors: [
            {
                instancePath: '',
                schemaPath: '/type',
                message: `Expected number or null. Got ${typeof input}`,
            },
        ],
    });
}

function bigIntDecoder(
    input: unknown,
    isUnsigned: boolean,
    isNullable: boolean,
): any {
    if (typeof input === 'string' || typeof input === 'number') {
        if (isNullable && input === 'null') {
            return null;
        }
        try {
            const val = BigInt(input);
            if (isUnsigned) {
                if (val >= BigInt('0')) {
                    return val;
                }
                throw new ValidationException({
                    message: 'uint64 must be greater than or equal to 0',
                    errors: [
                        {
                            message:
                                'uint64 must be greater than or equal to 0',
                            schemaPath: '/type',
                            instancePath: '',
                        },
                    ],
                });
            }
            return val;
        } catch (err) {
            throw new ValidationException({
                message: `Error transforming ${input} to BigInt`,
                errors: [
                    {
                        schemaPath: '/type',
                        instancePath: '',
                        data: err,
                        message: `Error transforming ${input} to BigInt`,
                    },
                ],
            });
        }
    }
    if (typeof input === 'bigint') {
        if (isUnsigned) {
            if (input >= BigInt('0')) {
                return input;
            }
            throw new ValidationException({
                message: 'uint64 must be greater than or equal to 0',
                errors: [
                    {
                        message: 'uint64 must be greater than or equal to 0',
                        schemaPath: '/type',
                        instancePath: '',
                    },
                ],
            });
        }
        return input;
    }
    if (isNullable && input === null) {
        return null;
    }
    throw new ValidationException({
        message: 'Expected BigInt or Integer string',
        errors: [
            {
                schemaPath: '/type',
                instancePath: '',
                message: 'Expected BigInt or Integer string',
            },
        ],
    });
}

function nullableIntDecoder(
    input: unknown,
    minNum: number,
    maxNum: number,
): number | null {
    if (typeof input === 'string') {
        const decodedInput = Number(input);
        if (
            Number.isInteger(decodedInput) &&
            decodedInput >= minNum &&
            decodedInput <= maxNum
        ) {
            return decodedInput;
        }
        if (input === 'null') {
            return null;
        }
    }
    if (
        typeof input === 'number' &&
        Number.isInteger(input) &&
        input >= minNum &&
        input <= maxNum
    ) {
        return input;
    }
    if (input === null) {
        return null;
    }
    throw new ValidationException({
        message: `Expected valid integer between ${minNum} & ${maxNum} or null. Got ${typeof input}.`,
        errors: [
            {
                instancePath: '',
                schemaPath: '/type',
                message: `Expected valid integer between ${minNum} & ${maxNum} or null. Got ${typeof input}.`,
            },
        ],
    });
}

function intDecoder(input: unknown, minNum: number, maxNum: number): any {
    if (typeof input === 'string') {
        const decodedInput = Number(input);
        if (
            Number.isInteger(decodedInput) &&
            decodedInput >= minNum &&
            decodedInput <= maxNum
        ) {
            return decodedInput;
        }
    }
    if (
        typeof input === 'number' &&
        Number.isInteger(input) &&
        input >= minNum &&
        input <= maxNum
    ) {
        return input;
    }
    throw new ValidationException({
        message: `Expected valid integer between ${minNum} & ${maxNum}`,
        errors: [
            {
                instancePath: '',
                schemaPath: '/type',
                message: `Expected valid integer between ${minNum} & ${maxNum}`,
            },
        ],
    });
}

export function getCompiledSerializer<TSchema extends ASchema>(
    schema: TSchema,
): { fn: (input: InferType<TSchema>) => string; code: string } {
    const code = getSchemaSerializationCode('input', schema);
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case 'string':
                if (schema.nullable) {
                    return {
                        fn(input: string | null) {
                            if (typeof input === 'string') {
                                return input;
                            }
                            return 'null';
                        },
                        code,
                    };
                }
                return {
                    fn(input: string) {
                        return input;
                    },
                    code,
                };
            case 'timestamp':
                if (schema.nullable) {
                    return {
                        fn(input: Date | null) {
                            if (typeof input === 'object' && input !== null) {
                                return input.toISOString();
                            }
                            return 'null';
                        },
                        code,
                    };
                }
                return {
                    fn(input: Date) {
                        return input.toISOString();
                    },
                    code,
                };
            case 'boolean':
                if (schema.nullable) {
                    return {
                        fn(input: boolean | null) {
                            if (typeof input === 'boolean') {
                                return `${input}`;
                            }
                            return 'null';
                        },
                        code,
                    };
                }
                return {
                    fn(input: boolean) {
                        return `${input}`;
                    },
                    code,
                };
            case 'float32':
            case 'float64':
            case 'int8':
            case 'int16':
            case 'int32':
            case 'uint8':
            case 'uint16':
            case 'uint32':
                if (schema.nullable) {
                    return {
                        fn(input: number) {
                            if (typeof input === 'number') {
                                return `${input}`;
                            }
                            return `null`;
                        },
                        code,
                    };
                }
                return {
                    fn(input: number) {
                        return `${input}`;
                    },
                    code,
                };
            case 'int64':
            case 'uint64':
                if (schema.nullable) {
                    return {
                        fn(input: bigint | null) {
                            if (typeof input === 'bigint') {
                                return input.toString();
                            }
                            return 'null';
                        },
                        code,
                    };
                }
                return {
                    fn(input: bigint) {
                        return input.toString();
                    },
                    code,
                };
        }
    }
    if (isSchemaFormEnum(schema)) {
        if (schema.nullable) {
            return {
                fn(input: string | null) {
                    if (
                        typeof input === 'string' &&
                        schema.enum.includes(input)
                    ) {
                        return input;
                    }
                    return 'null';
                },
                code,
            };
        }
        return {
            fn(input: string) {
                return input;
            },
            code,
        };
    }
    const fn = new Function('input', code) as any;
    return {
        fn,
        code,
    };
}
