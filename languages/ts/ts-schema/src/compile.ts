import { isSchemaFormEnum, isSchemaFormType, Schema } from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { createStandardSchemaProperty } from './adapters';
import { createParsingTemplate as getSchemaDecodingCode } from './compiler/parse';
import { createSerializationV2Template as getSchemaSerializationCode } from './compiler/serialize';
import { createValidationTemplate as getSchemaValidationCode } from './compiler/validate';
import { Result, ValidationException } from './errors';
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
} from './lib/numberConstants';
import {
    type ASchema,
    ASchemaStrict,
    type InferType,
    newValidationContext,
    SchemaValidator,
    ValidationContext,
} from './schemas';

export {
    getSchemaDecodingCode,
    getSchemaSerializationCode,
    getSchemaValidationCode,
};

export interface CompiledValidator<TSchema extends ASchema<any>> {
    schema: ASchemaStrict<TSchema>;
    /**
     * Determine if a type matches a schema. This is a type guard.
     */
    validate: (input: unknown) => input is InferType<TSchema>;
    /**
     * Parse a JSON string or the result of JSON.parse(). Returns a Result<T>.
     */
    parse: (input: unknown) => Result<InferType<TSchema>>;
    /**
     * Parse a JSON string or the result of JSON.parse(). Throws an error if parsing fails.
     */
    parseUnsafe: (input: unknown) => InferType<TSchema>;
    /**
     * Coerce an object into <T>. Returns Result<T>.
     */
    coerce: (input: unknown) => Result<InferType<TSchema>>;
    /**
     * Coerce an object into <T>. Throws an error if coercion fails.
     */
    coerceUnsafe: (input: unknown) => InferType<TSchema>;
    /**
     * Serialize to JSON
     */
    serialize: (input: InferType<TSchema>) => Result<string>;
    /**
     * Serialize to JSON. Throws an error if it fails.
     */
    serializeUnsafe: (input: InferType<TSchema>) => string;
    /**
     * The ATD Schema
     */
    compiledCode: {
        parse: string;
        coerce: string;
        serialize: string;
        validate: string;
    };
}

type CompiledValidatorWithAdapters<TSchema extends ASchema> =
    CompiledValidator<TSchema> & StandardSchemaV1<InferType<TSchema>>;

/**
 * Create compiled versions of the `decode()`, `validate()`, and `serialize()` functions
 */
export function compile<TSchema extends ASchema<any>>(
    schema: TSchema,
): CompiledValidatorWithAdapters<TSchema> {
    const validateCode = getSchemaValidationCode('input', schema);
    const parser = getCompiledParser('input', schema, false);
    const parserFn = parser.fn;
    const coercer = getCompiledParser('input', schema, true);
    const coercerFn = coercer.fn;
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
            return {
                success: false,
                errors: [
                    {
                        instancePath: '/',
                        message: err instanceof Error ? err.message : `${err}`,
                    },
                ],
            };
        }
    };
    const validate = new Function('input', validateCode) as (
        input: unknown,
    ) => input is InferType<TSchema>;
    const parse = (input: unknown): Result<InferType<TSchema>> => {
        const context = newValidationContext();
        try {
            const result = parserFn(input, context);
            if (context.errors.length) {
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
            if (context.errors.length) {
                return {
                    success: false,
                    errors: context.errors,
                };
            }
            return {
                success: false,
                errors: [
                    {
                        message: err instanceof Error ? err.message : `${err}`,
                        instancePath: '/',
                    },
                ],
            };
        }
    };
    const coerce = (input: unknown): Result<InferType<TSchema>> => {
        const context = newValidationContext();
        try {
            const result = coercerFn(input, context);
            if (context.errors.length) {
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
            if (context.errors.length) {
                return {
                    success: false,
                    errors: context.errors,
                };
            }
            return {
                success: false,
                errors: [
                    {
                        message: err instanceof Error ? err.message : `${err}`,
                        instancePath: '/',
                    },
                ],
            };
        }
    };
    const result: CompiledValidatorWithAdapters<TSchema> = {
        schema: JSON.parse(JSON.stringify(schema)),
        validate,
        parse: parse,
        parseUnsafe(input) {
            const context = newValidationContext();
            const result = parserFn(input, context);
            if (context.errors.length) {
                throw new ValidationException({ errors: context.errors });
            }
            return result!;
        },
        coerce: coerce,
        coerceUnsafe(input) {
            const context = newValidationContext();
            const result = coercerFn(input, context);
            if (context.errors.length) {
                throw new ValidationException({ errors: context.errors });
            }
            return result!;
        },
        serialize,
        serializeUnsafe(input) {
            return serializeFn(input);
        },
        compiledCode: {
            validate: validateCode,
            parse: parser.code,
            coerce: coercer.code,
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
    };
    return result;
}

type CompiledParser<TSchema extends ASchema<any>> = SchemaValidator<
    InferType<TSchema>
>['parse'];

export function getCompiledParser<TSchema extends ASchema<any>>(
    input: string,
    schema: Schema,
    shouldCoerce: boolean,
): { fn: CompiledParser<TSchema>; code: string } {
    const code = getSchemaDecodingCode(input, schema, shouldCoerce);
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
                    fn(input, context) {
                        return bigIntDecoder(
                            input,
                            false,
                            schema.nullable ?? false,
                            context,
                        );
                    },
                    code,
                };
            case 'uint64':
                return {
                    fn(input, context) {
                        return bigIntDecoder(
                            input,
                            true,
                            schema.nullable ?? false,
                            context,
                        );
                    },
                    code,
                };
            case 'int32':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            return nullableIntDecoder(
                                input,
                                int32Min,
                                int32Max,
                                context,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input, context) {
                        return intDecoder(input, int32Min, int32Max, context);
                    },
                    code,
                };
            case 'int16':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            return nullableIntDecoder(
                                input,
                                int16Min,
                                int16Max,
                                context,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input, context) {
                        return intDecoder(input, int16Min, int16Max, context);
                    },
                    code,
                };
            case 'int8':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            return nullableIntDecoder(
                                input,
                                int8Min,
                                int8Max,
                                context,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input, context) {
                        return intDecoder(input, int8Min, int8Max, context);
                    },
                    code,
                };
            case 'uint32':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            return nullableIntDecoder(
                                input,
                                uint32Min,
                                uint32Max,
                                context,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input, context) {
                        return intDecoder(input, uint32Min, uint32Max, context);
                    },
                    code,
                };
            case 'uint16':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            return nullableIntDecoder(
                                input,
                                uint16Min,
                                uint16Max,
                                context,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input: unknown, context) {
                        return intDecoder(input, uint16Min, uint16Max, context);
                    },
                    code,
                };
            case 'uint8':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            return nullableIntDecoder(
                                input,
                                uint8Min,
                                uint8Max,
                                context,
                            );
                        },
                        code,
                    };
                }
                return {
                    fn(input: unknown, context) {
                        return intDecoder(input, uint8Min, uint8Max, context);
                    },
                    code,
                };
            case 'boolean':
                if (shouldCoerce) {
                    if (schema.nullable) {
                        return {
                            code,
                            fn(input, context) {
                                switch (input) {
                                    case true:
                                        return true;
                                    case false:
                                        return false;
                                    case 'true':
                                    case 'TRUE':
                                    case '1':
                                    case 1:
                                        return true;
                                    case 'false':
                                    case 'FALSE':
                                    case '0':
                                    case 0:
                                        return false;
                                    case null:
                                    case 'null':
                                        return null;
                                    default:
                                        context.errors.push({
                                            instancePath: '/',
                                            schemaPath: '/type',
                                            message: `Unable to coerce ${input} into boolean`,
                                        });
                                        return undefined;
                                }
                            },
                        };
                    }
                    return {
                        code,
                        fn(input, context) {
                            switch (input) {
                                case true:
                                    return true;
                                case false:
                                    return false;
                                case 'true':
                                case 'TRUE':
                                case '1':
                                case 1:
                                    return true;
                                case 'false':
                                case 'FALSE':
                                case '0':
                                case 0:
                                    return false;
                                default:
                                    context.errors.push({
                                        instancePath: '/',
                                        schemaPath: '/type',
                                        message: `Unable to coerce ${input} into boolean`,
                                    });
                                    return undefined;
                            }
                        },
                    };
                }
                if (schema.nullable) {
                    return {
                        code,
                        fn(input, context) {
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
                            context.errors.push({
                                instancePath: '',
                                schemaPath: '/type',
                                message: `Expected boolean. Got ${typeof input}`,
                            });
                            return undefined;
                        },
                    };
                }
                return {
                    fn(input, context) {
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
                        context.errors.push({
                            instancePath: '',
                            schemaPath: '/type',
                            message: `Expected boolean. Got ${typeof input}`,
                        });
                        return undefined;
                    },
                    code,
                };
            case 'string':
                if (schema.nullable) {
                    return {
                        fn(input, context) {
                            if (typeof input === 'string') {
                                if (input === 'null') {
                                    return null;
                                }
                                return input;
                            }
                            if (input === null) {
                                return null;
                            }
                            context.errors.push({
                                instancePath: '',
                                schemaPath: '/type',
                                message: `Expected string or null. Got ${typeof input}.`,
                            });
                            return undefined;
                        },
                        code,
                    };
                }
                return {
                    fn(input, context) {
                        if (typeof input === 'string') {
                            return input;
                        }
                        context.errors.push({
                            message: `Expected string. Got ${typeof input}.`,
                            instancePath: '/',
                            schemaPath: '/type',
                        });
                        return undefined;
                    },
                    code,
                };
            case 'timestamp':
                if (shouldCoerce) {
                    if (schema.nullable) {
                        return {
                            fn(input, context) {
                                if (typeof input === 'string') {
                                    const decodedInput = new Date(input);
                                    if (
                                        !Number.isNaN(decodedInput.getMonth())
                                    ) {
                                        return decodedInput;
                                    }
                                    if (input === 'null') {
                                        return null;
                                    }
                                }
                                if (typeof input === 'number') {
                                    const decodedInput = new Date(input);
                                    if (
                                        !Number.isNaN(decodedInput.getMonth())
                                    ) {
                                        return decodedInput;
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
                                context.errors.push({
                                    instancePath: '',
                                    schemaPath: '/type',
                                    message: `Expected instanceof Date, ISO Date string, or null. Got ${typeof input}.`,
                                });
                                return undefined;
                            },
                            code,
                        };
                    }
                    return {
                        fn(input, context) {
                            if (typeof input === 'string') {
                                const decodedInput = new Date(input);
                                if (!Number.isNaN(decodedInput.getMonth())) {
                                    return decodedInput;
                                }
                            }
                            if (typeof input === 'number') {
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
                            context.errors.push({
                                instancePath: '',
                                schemaPath: '/type',
                                message: `Expected instanceof Date or ISO Date string. Got ${typeof input}.`,
                            });
                            return undefined;
                        },
                        code,
                    };
                }
                if (schema.nullable) {
                    return {
                        fn(input, context) {
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
                            context.errors.push({
                                instancePath: '',
                                schemaPath: '/type',
                                message: `Expected instanceof Date, ISO Date string, or null. Got ${typeof input}.`,
                            });
                            return undefined;
                        },
                        code,
                    };
                }
                return {
                    fn(input: unknown, context) {
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
                        context.errors.push({
                            instancePath: '',
                            schemaPath: '/type',
                            message: `Expected instance of Date or ISO date string. Got ${typeof input}.`,
                        });
                        return undefined;
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
                fn(input, context) {
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
                    context.errors.push({
                        instancePath: '',
                        schemaPath: '/enum',
                        message: `Expected one of the following values: [${schema.enum.join(
                            ', ',
                        )}] or null. Got ${typeof input}.`,
                    });
                    return undefined;
                },
                code,
            };
        }
        return {
            fn(input, context) {
                if (typeof input === 'string') {
                    for (const val of schema.enum) {
                        if (input === val) {
                            return val;
                        }
                    }
                }
                context.errors.push({
                    instancePath: '',
                    schemaPath: '/enum',
                    message: `Expected one of the following values: [${schema.enum.join(
                        ', ',
                    )}]. Got ${typeof input}.`,
                });
                return undefined;
            },
            code,
        };
    }
    return { fn: new Function(input, 'context', code) as any, code };
}

function compiledFloatDecoder(
    input: unknown,
    context: ValidationContext,
): number | undefined {
    if (typeof input === 'string') {
        const decodedVal = Number(input);
        if (!Number.isNaN(decodedVal)) {
            return decodedVal;
        }
        context.errors.push({
            instancePath: '',
            schemaPath: '/type',
            message: `Unable to decode number from ${input}`,
        });
        return undefined;
    }
    if (typeof input === 'number' && !Number.isNaN(input)) {
        return input;
    }
    context.errors.push({
        instancePath: '',
        schemaPath: '/type',
        message: `Expected number. Got ${typeof input}`,
    });
    return undefined;
}

function nullableFloatDecoder(
    input: unknown,
    context: ValidationContext,
): number | null | undefined {
    if (typeof input === 'string') {
        const decodedVal = Number(input);
        if (!Number.isNaN(decodedVal)) {
            return decodedVal;
        }
        if (input === 'null') {
            return null;
        }
        context.errors.push({
            instancePath: '',
            schemaPath: '/type',
            message: `Unable to decode number from ${input}`,
        });
        return undefined;
    }
    if (typeof input === 'number' && !Number.isNaN(input)) {
        return input;
    }
    if (input === null) {
        return null;
    }
    context.errors.push({
        instancePath: '',
        schemaPath: '/type',
        message: `Expected number or null. Got ${typeof input}`,
    });
    return undefined;
}

function bigIntDecoder(
    input: unknown,
    isUnsigned: boolean,
    isNullable: boolean,
    context: ValidationContext,
): any {
    if (typeof input === 'string' || typeof input === 'number') {
        if (isNullable && input === 'null') {
            return null;
        }
        try {
            const val = BigInt(input);
            if (isUnsigned) {
                if (val >= uint64Min && val <= uint64Max) {
                    return val;
                }
                context.errors.push({
                    message:
                        'uint64 must an integer between 0 and 18,446,744,073,709,551,615',
                    schemaPath: '/type',
                    instancePath: '',
                });
                return undefined;
            }
            if (val >= int64Min && val <= int64Max) {
                return val;
            }
            context.errors.push({
                schemaPath: '/type',
                instancePath: '/',
                message: `int64 must be an integer between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807`,
            });
            return undefined;
        } catch (err) {
            context.errors.push({
                schemaPath: '/type',
                instancePath: '',
                data: err,
                message: `Error transforming ${input} to BigInt`,
            });
            return undefined;
        }
    }
    if (typeof input === 'bigint') {
        if (isUnsigned) {
            if (input >= uint64Min && input <= uint64Max) {
                return input;
            }
            context.errors.push({
                message: 'uint64 must be greater than or equal to 0',
                schemaPath: '/type',
                instancePath: '/',
            });
        }
        if (input >= int64Min && input <= int64Max) {
            return input;
        }
        context.errors.push({
            schemaPath: '/type',
            instancePath: '/',
            message: `int64 must be an integer between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807`,
        });
        return undefined;
    }
    if (isNullable && input === null) {
        return null;
    }
    context.errors.push({
        schemaPath: '/type',
        instancePath: '/',
        message: 'Expected BigInt or Integer string',
    });
    return undefined;
}

function nullableIntDecoder(
    input: unknown,
    minNum: number,
    maxNum: number,
    context: ValidationContext,
): number | null | undefined {
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
    context.errors.push({
        instancePath: '',
        schemaPath: '/type',
        message: `Expected valid integer between ${minNum} & ${maxNum} or null. Got ${typeof input}.`,
    });
    return undefined;
}

function intDecoder(
    input: unknown,
    minNum: number,
    maxNum: number,
    context: ValidationContext,
): any {
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
    context.errors.push({
        instancePath: '',
        schemaPath: '/type',
        message: `Expected valid integer between ${minNum} & ${maxNum}`,
    });
    return undefined;
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
