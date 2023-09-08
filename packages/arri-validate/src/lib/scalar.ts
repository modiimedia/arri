import { type Type as JtdType, type Schema as JtdSchema } from "jtd";
import { type ActualValue, type ArriSchema, _SCHEMA } from "./typedefs";
import { ArriValidationError, avj } from "./validation";

export interface InputOptions<TDefault, TNullable extends boolean = false> {
    id?: string;
    description?: string;
    default?: TDefault;
    nullable?: TNullable;
}

export interface ScalarTypeSchema<
    T extends JtdType = any,
    TVal = any,
    TNullable extends boolean = any,
> extends ArriSchema<TVal, TNullable> {
    type: T;
}

function scalarType<
    TType extends JtdType,
    TVal = any,
    TNullable extends boolean = false,
>(
    type: TType,
    output: TVal,
    opts: InputOptions<TVal, TNullable>,
): ScalarTypeSchema<TType, TVal, TNullable> {
    const schema: JtdSchema = {
        type,
        nullable: opts.nullable,
    };
    const validator = avj.compile(schema, true);
    const serializer = avj.compileSerializer(schema);
    const isType = (input: unknown): input is ActualValue<TVal, TNullable> =>
        validator(input);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [_SCHEMA]: {
                default: opts.default,
                output,
                parse: (input) => {
                    if (isType(input)) {
                        return input;
                    }
                    throw new ArriValidationError(validator.errors ?? []);
                },
                serialize: (input: unknown) => serializer(input),
                validate: isType,
                toJtdSchema: () => schema,
            },
        },
    };
}

export function string<TNullable extends boolean = false>(
    opts: InputOptions<string, TNullable> = {},
) {
    return scalarType("string", "", opts);
}
export function timestamp<TNullable extends boolean = false>(
    opts: InputOptions<Date, TNullable> = {},
) {
    return scalarType("timestamp", new Date(), opts);
}
export function float32<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("float32", 0, opts);
}
export function float64<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("float64", 0, opts);
}
export function int8<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("int8", 0, opts);
}
export function uint8<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("uint8", 0, opts);
}
export function int16<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("int16", 0, opts);
}
export function uint16<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("uint16", 0, opts);
}
export function int32<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
) {
    return scalarType("int32", 0, opts);
}
export function uint32<TNullable extends boolean = false>(
    opts: InputOptions<number, TNullable> = {},
): ScalarTypeSchema<"uint32", number, TNullable> {
    return scalarType("uint32", 0, opts);
}

export function boolean<TNullable extends boolean = false>(
    opts: InputOptions<boolean, TNullable> = {},
): ScalarTypeSchema<"boolean", boolean, TNullable> {
    return scalarType("boolean", false, opts);
}
