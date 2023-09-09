import { type ValidateFunction } from "ajv";
import { type SchemaFormType } from "jtd";
import {
    type ScalarTypeSchema,
    type InputOptions,
    SCHEMA_METADATA,
} from "./typedefs";
import { ValidationError, AJV } from "./validation";

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

const validationMap: Record<
    (typeof numberTypes)[number],
    {
        validator: undefined | ValidateFunction<number>;
        parser: undefined | ((input: unknown) => number | undefined);
        serializer: undefined | ((input: unknown) => string);
    }
> = {
    float32: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    float64: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    int16: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    int32: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    int8: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    uint16: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    uint32: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
    uint8: {
        validator: undefined,
        parser: undefined,
        serializer: undefined,
    },
};

// precompile all of the ajv parsers/validators
for (const type of numberTypes) {
    const schema: SchemaFormType = {
        type,
    };
    const validator = AJV.compile<number>(schema);
    const parser = AJV.compileParser<number>(schema);
    const serializer = AJV.compileSerializer(schema);
    validationMap[type] = {
        validator,
        parser: parser as any,
        serializer,
    };
}

function numberScalarType<TType extends (typeof numberTypes)[number]>(
    type: TType,
    opts: InputOptions,
): ScalarTypeSchema<TType, number> {
    const { validator, parser, serializer } = validationMap[type];
    const isType = (input: unknown): input is number => {
        if (validator) {
            return validator(input);
        }
        return typeof input === "number";
    };
    return {
        type,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: 0,
                validate: isType,
                parse: (input): number => {
                    if (typeof input === "string" && parser) {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ValidationError(validator?.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator?.errors ?? []);
                },
                serialize: (input) => {
                    if (serializer) {
                        serializer(input);
                    }
                    return `${input as any}`;
                },
                coerce: (input) => {
                    if (typeof input === "string" && parser) {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                    }
                    if (typeof input === "string") {
                        const result = Number(input);
                        if (Number.isNaN(result)) {
                            throw new ValidationError(validator?.errors ?? []);
                        }
                        if (type.includes("int") && !Number.isInteger(result)) {
                            throw new ValidationError(validator?.errors ?? []);
                        }
                        return result;
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator?.errors ?? []);
                },
            },
        },
    };
}

/**
 * Alias for float64 as that is the only number type that Javascript uses
 *
 * @example
 * const SomeNum = a.number()
 */
export function number(opts: InputOptions = {}) {
    return float64(opts);
}

export function float32(opts: InputOptions = {}) {
    return numberScalarType("float32", opts);
}
export function float64(opts: InputOptions = {}) {
    return numberScalarType("float64", opts);
}
export function int8(opts: InputOptions = {}) {
    return numberScalarType("int8", opts);
}
export function uint8(opts: InputOptions = {}) {
    return numberScalarType("uint8", opts);
}
export function int16(opts: InputOptions = {}) {
    return numberScalarType("int16", opts);
}
export function uint16(opts: InputOptions = {}) {
    return numberScalarType("uint16", opts);
}
export function int32(opts: InputOptions = {}) {
    return numberScalarType("int32", opts);
}
export function uint32(opts: InputOptions = {}) {
    return numberScalarType("uint32", opts);
}
