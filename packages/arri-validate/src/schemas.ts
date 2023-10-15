import {
    type Type as JtdType,
    isDiscriminatorForm,
    isElementsForm,
    isEnumForm,
    isPropertiesForm,
    isTypeForm,
    isValuesForm,
} from "@modii/jtd";
import { type ValueError } from "./lib/validation";

export const SCHEMA_METADATA = Symbol.for("arri.schema_metadata");

export type MaybeNullable<
    T = any,
    TIsNullable extends boolean = false,
> = TIsNullable extends true ? T | null : T;

export interface ValidationData {
    instancePath: string;
    schemaPath: string;
    errors: ValueError[];
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export interface SchemaValidator<T> {
    output: T;
    optional?: boolean;
    parse: (input: unknown, data: ValidationData) => T | undefined;
    coerce: (input: unknown, data: ValidationData) => T | undefined;
    serialize: (input: T) => string;
    validate: (input: unknown) => input is T;
}

export interface SchemaMetadata<T> {
    [key: string]: any;
    id?: string;
    description?: string;
    [SCHEMA_METADATA]: SchemaValidator<T>;
}

export interface ASchema<T = any> {
    metadata: SchemaMetadata<T>;
    nullable?: boolean;
}
export function isASchema(input: unknown): input is ASchema {
    if (typeof input !== "object") {
        return false;
    }
    if (!input || !("metadata" in input)) {
        return false;
    }
    if (
        !input.metadata ||
        typeof input.metadata !== "object" ||
        !(SCHEMA_METADATA in input.metadata) ||
        !input.metadata[SCHEMA_METADATA] ||
        typeof input.metadata[SCHEMA_METADATA] !== "object"
    ) {
        return false;
    }
    return (
        "parse" in input.metadata[SCHEMA_METADATA] &&
        typeof input.metadata[SCHEMA_METADATA] === "object"
    );
}

export interface ASchemaOptions {
    id?: string;
    description?: string;
}

export type Resolve<T> = T;
export type ResolveObject<T> = Resolve<{ [k in keyof T]: T[k] }>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InferType<TInput extends ASchema<any>> = Resolve<
    TInput["metadata"][typeof SCHEMA_METADATA]["output"]
>;

// basic types
export interface AScalarSchema<T extends JtdType = any, TVal = any>
    extends ASchema<TVal> {
    type: T;
}
export function isAScalarSchema(input: unknown): input is AScalarSchema {
    return isASchema(input) && isTypeForm(input);
}

export const NumberTypeValues = [
    "float32",
    "float64",
    "int16",
    "int32",
    "int8",
    "uint16",
    "uint32",
    "uint8",
] as const;
export type NumberType = (typeof NumberTypeValues)[number];
export const NumberValidationMap: Record<
    NumberType,
    { min?: number; max?: number }
> = {
    float32: {
        min: undefined,
        max: undefined,
    },
    float64: {
        min: undefined,
        max: undefined,
    },
    int8: {
        min: undefined,
        max: undefined,
    },
    uint8: {
        min: undefined,
        max: undefined,
    },
    int16: {
        min: undefined,
        max: undefined,
    },
    uint16: {
        min: undefined,
        max: undefined,
    },
    int32: {
        min: undefined,
        max: undefined,
    },
    uint32: {
        min: undefined,
        max: undefined,
    },
};

// arrays
export interface AArraySchema<TInnerSchema extends ASchema<any> = any>
    extends ASchema<Array<InferType<TInnerSchema>>> {
    elements: TInnerSchema;
}
export function isAAraySchema(input: unknown): input is AArraySchema {
    return isASchema(input) && isElementsForm(input);
}

// string enums
export interface AStringEnumSchema<
    TValues extends string[],
    TNullable extends boolean = false,
> extends ASchema<MaybeNullable<TValues[number], TNullable>> {
    enum: TValues;
}
export function isAStringEnumSchema(
    input: unknown,
): input is AStringEnumSchema<any, any> {
    return isASchema(input) && isEnumForm(input);
}

// discriminators
export interface ADiscriminatorSchema<T> extends ASchema<T> {
    discriminator: string;
    mapping: Record<string, AObjectSchema<any>>;
}
export function isADiscriminatorSchema(
    input: unknown,
): input is ADiscriminatorSchema<any> {
    return isASchema(input) && isDiscriminatorForm(input);
}

// records
export interface ARecordSchema<
    TInnerSchema extends ASchema<any>,
    TNullable extends boolean = false,
> extends ASchema<
        MaybeNullable<Record<string, InferType<TInnerSchema>>, TNullable>
    > {
    values: TInnerSchema;
}
export function isARecordSchema(
    input: unknown,
): input is ARecordSchema<any, any> {
    return isASchema(input) && isValuesForm(input);
}

// object types
export interface AObjectSchema<
    TVal = any,
    TAllowAdditionalProperties extends boolean = false,
> extends ASchema<TVal> {
    properties: Record<string, ASchema>;
    optionalProperties?: Record<string, ASchema>;
    additionalProperties?: TAllowAdditionalProperties;
}
export function isAObjectSchema(input: unknown): input is AObjectSchema {
    return isASchema(input) && isPropertiesForm(input);
}

export interface AObjectSchemaOptions<TAdditionalProps extends boolean = false>
    extends ASchemaOptions {
    /**
     * Allow this object to include additional properties not specified here
     */
    additionalProperties?: TAdditionalProps;
}

// object helper types
export type InferObjectOutput<
    TInput = any,
    TAdditionalProps extends boolean = false,
> = TAdditionalProps extends true
    ? ResolveObject<InferObjectRawType<TInput>> & Record<any, any>
    : ResolveObject<InferObjectRawType<TInput>>;

export type InferObjectRawType<TInput> = TInput extends Record<any, any>
    ? {
          [TKey in keyof TInput]: TInput[TKey]["metadata"][typeof SCHEMA_METADATA]["optional"] extends true
              ?
                    | TInput[TKey]["metadata"][typeof SCHEMA_METADATA]["output"]
                    | undefined
              : TInput[TKey]["metadata"][typeof SCHEMA_METADATA]["output"];
      }
    : never;

export function isObject(input: unknown): input is Record<any, any> {
    return typeof input === "object" && input !== null;
}
