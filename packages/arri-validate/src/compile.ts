/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/dot-notation */
import {
    type SafeResult,
    type ASchema,
    type InferType,
    ValidationError,
    isAScalarSchema,
    isAStringEnumSchema,
} from "./_index";
import { type ScalarType } from "./compiler/common";
import { createParsingTemplate } from "./compiler/parse";
import { createSerializationTemplate } from "./compiler/serialize";
import { createValidationTemplate } from "./compiler/validate";
import {
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    int8Max,
    int8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
    uint8Max,
    uint8Min,
} from "./lib/numberConstants";

export interface CompiledValidator<TSchema extends ASchema<any>> {
    /**
     * Determine if a type matches a schema. This is a type guard.
     */
    validate: (input: unknown) => input is InferType<TSchema>;
    /**
     * Parse a JSON string or the result of JSON.parse(). Throws an error if parsing fails.
     */
    parse: (input: unknown) => InferType<TSchema>;
    /**
     * Parse a JSON string or the result of JSON.parse() without throwing an error
     */
    safeParse: (input: unknown) => SafeResult<InferType<TSchema>>;
    /**
     * Serialize to JSON
     */
    serialize: (input: InferType<TSchema>) => string;
    compiledCode: {
        serialize: string;
        parse: string;
        validate: string;
    };
}

type CompiledParser<TSchema extends ASchema<any>> =
    CompiledValidator<TSchema>["parse"];

function validateInt(input: number, minVal: number, maxValue: number) {
    return Number.isInteger(input) && input >= minVal && input <= maxValue;
}

function compiledBigIntParser(
    input: unknown,
    isUnsigned: boolean,
    isNullable: boolean,
): any {
    if (typeof input === "string") {
        if (isNullable && input === "null") {
            return null;
        }
        try {
            const val = BigInt(input);
            if (isUnsigned) {
                if (val >= BigInt("0")) {
                    return val;
                }
                throw new ValidationError({
                    message: "uint64 must be greater than or equal to 0",
                    errors: [
                        {
                            message:
                                "uint64 must be greater than or equal to 0",
                            schemaPath: "/type",
                            instancePath: "",
                        },
                    ],
                });
            }
            return val;
        } catch (err) {
            throw new ValidationError({
                message: `Error transforming ${input} to BigInt`,
                errors: [
                    {
                        schemaPath: "/type",
                        instancePath: "",
                        data: err,
                    },
                ],
            });
        }
    }
    if (typeof input === "bigint") {
        if (isUnsigned) {
            if (input >= BigInt("0")) {
                return input;
            }
            throw new ValidationError({
                message: "uint64 must be greater than or equal to 0",
                errors: [
                    {
                        message: "uint64 must be greater than or equal to 0",
                        schemaPath: "/type",
                        instancePath: "",
                    },
                ],
            });
        }
        return input;
    }
    if (isNullable && input === null) {
        return null;
    }
    throw new ValidationError({
        message: "Expected BigInt or Integer string",
        errors: [
            {
                schemaPath: "/type",
                instancePath: "",
            },
        ],
    });
}

function compiledIntParser(
    input: unknown,
    minNum: number,
    maxNum: number,
    isNullable: boolean,
): any {
    if (typeof input === "number") {
        if (validateInt(input, minNum, maxNum)) {
            return input;
        }
        throw new ValidationError({
            message: `Expected valid integer between ${minNum} & ${maxNum}`,
            errors: [
                {
                    instancePath: "",
                    schemaPath: "/type",
                },
            ],
        });
    }
    if (typeof input === "string") {
        const parsedInput = Number(input);
        if (validateInt(parsedInput, minNum, maxNum)) {
            return parsedInput;
        }
        if (isNullable && input === "null") {
            return null;
        }
        throw new ValidationError({
            message: `Expected valid integer between ${minNum} & ${maxNum}`,
            errors: [
                {
                    instancePath: "",
                    schemaPath: "/type",
                },
            ],
        });
    }
    if (isNullable && input === null) {
        return null;
    }
    throw new ValidationError({
        message: `Expected valid integer between ${minNum} & ${maxNum}`,
        errors: [
            {
                instancePath: "",
                schemaPath: "/type",
            },
        ],
    });
}

function getCompiledParser<TSchema extends ASchema<any>>(
    input: string,
    schema: TSchema,
): { fn: CompiledParser<TSchema>; code: string } {
    if (isAScalarSchema(schema)) {
        switch (schema.type as ScalarType) {
            case "float32":
            case "float64":
                return {
                    fn: function (input: any) {
                        if (typeof input === "string") {
                            if (schema.nullable) {
                                if (input === "null") {
                                    return null;
                                }
                            }
                            const result = Number(input);
                            if (Number.isNaN(result)) {
                                throw new ValidationError({
                                    message: `Unable to parse number from ${input}`,
                                    errors: [
                                        {
                                            instancePath: "",
                                            schemaPath: "/type",
                                        },
                                    ],
                                });
                            }
                            return result;
                        }
                        if (typeof input === "number") {
                            return input;
                        }
                        if (schema.nullable && input === null) {
                            return null;
                        }
                        throw new ValidationError({
                            message: `Expected number. Got ${typeof input}.`,
                            errors: [{ instancePath: "", schemaPath: "/type" }],
                        });
                    },
                    code: "",
                };
            case "int64":
                return {
                    fn: function (input: unknown) {
                        return compiledBigIntParser(
                            input,
                            false,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "uint64":
                return {
                    fn: function (input: unknown) {
                        return compiledBigIntParser(
                            input,
                            true,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "int32":
                return {
                    fn: function (input: unknown) {
                        return compiledIntParser(
                            input,
                            int32Min,
                            int32Max,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "int16":
                return {
                    fn: function (input: unknown) {
                        return compiledIntParser(
                            input,
                            int16Min,
                            int16Max,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "int8":
                return {
                    fn: function (input: unknown) {
                        return compiledIntParser(
                            input,
                            int8Min,
                            int8Max,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "uint32":
                return {
                    fn: function (input: unknown) {
                        return compiledIntParser(
                            input,
                            uint32Min,
                            uint32Max,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "uint16":
                return {
                    fn: function (input: unknown) {
                        return compiledIntParser(
                            input,
                            uint16Min,
                            uint16Max,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "uint8":
                return {
                    fn: function (input: unknown) {
                        return compiledIntParser(
                            input,
                            uint8Min,
                            uint8Max,
                            schema.nullable ?? false,
                        );
                    },
                    code: "",
                };
            case "boolean":
                return {
                    fn: function (input: unknown) {
                        if (typeof input === "boolean") {
                            return input;
                        }
                        if (typeof input === "string") {
                            if (input === "true") {
                                return true;
                            }
                            if (input === "false") {
                                return false;
                            }
                            if (schema.nullable && input === "null") {
                                return null;
                            }
                            throw new ValidationError({
                                message: `Expected boolean. Got ${typeof input}.`,
                                errors: [
                                    {
                                        instancePath: "",
                                        schemaPath: "/type",
                                    },
                                ],
                            });
                        }
                        if (schema.nullable && input === null) {
                            return null;
                        }
                        throw new ValidationError({
                            message: `Expected boolean. Got ${typeof input}.`,
                            errors: [
                                {
                                    instancePath: "",
                                    schemaPath: "/type",
                                },
                            ],
                        });
                    },
                    code: "",
                };
            case "string":
                return {
                    fn: function (input: unknown) {
                        if (typeof input === "string") {
                            if (schema.nullable && input === "null") {
                                return null;
                            }
                            return input;
                        }
                        if (schema.nullable && input === null) {
                            return input;
                        }
                        throw new ValidationError({
                            message: `Expected string. Got ${typeof input}.`,
                            errors: [
                                {
                                    instancePath: "",
                                    schemaPath: "/type",
                                },
                            ],
                        });
                    },
                    code: "",
                };
            case "timestamp":
                return {
                    fn: function (input: unknown) {
                        if (
                            typeof input === "object" &&
                            input instanceof Date
                        ) {
                            return input;
                        }
                        if (typeof input === "string") {
                            if (schema.nullable && input === "null") {
                                return null;
                            }
                            return new Date(input);
                        }
                        if (schema.nullable && input === null) {
                            return input;
                        }
                        throw new ValidationError({
                            message: `Expected instance of Date or ISO date string. Got ${typeof input}.`,
                            errors: [
                                {
                                    instancePath: "",
                                    schemaPath: "/type",
                                },
                            ],
                        });
                    },
                    code: "",
                };
            default:
                break;
        }
    }
    if (isAStringEnumSchema(schema)) {
        return {
            fn: function (input: unknown) {
                if (typeof input === "string") {
                    for (const val of schema.enum as string[]) {
                        if (input === val) {
                            return val;
                        }
                    }
                    if (schema.nullable && input === "null") {
                        return null;
                    }
                    throw new ValidationError({
                        message: `Expected one of the following values: [${(
                            schema.enum as string[]
                        ).join(", ")}]`,
                        errors: [
                            {
                                instancePath: "",
                                schemaPath: "/enum",
                            },
                        ],
                    });
                }
                if (schema.nullable && input === null) {
                    return input;
                }
                throw new ValidationError({
                    message: `Expected one of the following values: [${(
                        schema.enum as string[]
                    ).join(", ")}]`,
                    errors: [
                        {
                            instancePath: "",
                            schemaPath: "/enum",
                        },
                    ],
                });
            },
            code: "",
        };
    }
    const parseCode = createParsingTemplate(input, schema);
    return { fn: new Function(input, parseCode) as any, code: parseCode };
}

/**
 * Create compiled versions of the `parse()`, `validate()`, and `serialize()` functions
 */
export function compile<TSchema extends ASchema<any>>(
    schema: TSchema,
): CompiledValidator<TSchema> {
    const serializeCode = createSerializationTemplate("input", schema);
    const validateCode = createValidationTemplate("input", schema);
    const parse = getCompiledParser("input", schema);
    const serialize = new Function(
        "input",
        serializeCode,
    ) as CompiledValidator<TSchema>["serialize"];
    const validate = new Function(
        "input",
        validateCode,
    ) as CompiledValidator<TSchema>["validate"];

    return {
        validate,
        parse: parse.fn,
        safeParse(input) {
            try {
                const result = parse.fn(input);
                return {
                    success: true,
                    value: result,
                };
            } catch (err) {
                if (
                    typeof err === "object" &&
                    err !== null &&
                    "instancePath" in err &&
                    "schemaPath" in err &&
                    "message" in err
                ) {
                    return {
                        success: false,
                        error: new ValidationError({
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            message: `${err.message}`,
                            errors: [
                                {
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    instancePath: `${err.instancePath}`,
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    schemaPath: `${err.schemaPath}`,
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    message: `${err.message}`,
                                },
                            ],
                        }),
                    };
                }
                return {
                    success: false,
                    error: new ValidationError({
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        message: `${err}`,
                        errors: [],
                    }),
                };
            }
        },
        // eslint-disable-next-line no-eval
        serialize,
        compiledCode: {
            validate: validateCode,
            parse: parse.code,
            serialize: serializeCode,
        },
    };
}
