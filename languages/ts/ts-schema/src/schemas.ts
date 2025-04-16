import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormValues,
    type Type as JtdType,
    TypeValues,
} from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { ValueError } from './errors';

function secretSymbol<T extends string>(key: T) {
    return Symbol.for(key) as any as ` Symbol.for(${T})`;
}

export type MaybeNullable<
    T = any,
    TIsNullable extends boolean = false,
> = TIsNullable extends true ? T | null : T;

export interface ValidationContext {
    instancePath: string;
    schemaPath: string;
    errors: ValueError[];
    exitOnFirstError: boolean;
    depth: number;
    maxDepth: number;
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export function newValidationContext(
    exitOnFirstError = false,
    maxDepth = 500,
): ValidationContext {
    return {
        instancePath: '',
        schemaPath: '',
        errors: [],
        exitOnFirstError,
        depth: 0,
        maxDepth,
    };
}

export const VALIDATOR_KEY = secretSymbol('arri/schema/validator/v1');

export interface SchemaValidator<T, TOptional extends boolean = false> {
    output: T;
    optional: TOptional;
    validate: (input: unknown) => input is T;
    parse: (input: unknown, context: ValidationContext) => T | undefined;
    coerce: (input: unknown, context: ValidationContext) => T | undefined;
    serialize: (input: T, context: ValidationContext) => string | undefined;
}

export interface SchemaMetadata {
    [key: string]: any;
    id?: string;
    description?: string;
    isDeprecated?: boolean;
}

export type WithAdapters<T = any> = StandardSchemaV1<T>;

export interface ASchema<T = any, TOptional extends boolean = false> {
    metadata?: SchemaMetadata;
    isNullable?: boolean;
    [VALIDATOR_KEY]: SchemaValidator<T, TOptional>;
}
export type ASchemaStrict<TSchema extends ASchema> = Omit<
    TSchema,
    typeof VALIDATOR_KEY
>;
export function isASchema(input: unknown): input is ASchema {
    if (typeof input !== 'object' || !input) {
        return false;
    }
    if (
        'metadata' in input &&
        typeof input.metadata === 'object' &&
        input.metadata
    ) {
        if (
            'id' in input.metadata &&
            typeof input.metadata.id !== 'string' &&
            typeof input.metadata.id !== 'undefined'
        ) {
            return false;
        }
        if (
            'description' in input.metadata &&
            typeof input.metadata.description !== 'string' &&
            typeof input.metadata.description !== 'undefined'
        ) {
            return false;
        }
        if (
            'isDeprecated' in input.metadata &&
            typeof input.metadata.isDeprecated !== 'boolean' &&
            typeof input.metadata.isDeprecated !== 'undefined'
        ) {
            return false;
        }
    }
    return VALIDATOR_KEY in input;
}
export type ASchemaWithAdapters<
    T = any,
    TOptional extends boolean = false,
> = ASchema<T, TOptional> & WithAdapters<T>;

export interface ASchemaOptions {
    id?: string;
    description?: string;
    isDeprecated?: boolean;
}

export type Resolve<T> = T;
export type ResolveObject<T> = Resolve<{ [k in keyof T]: T[k] }>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InferType<TInput extends ASchema<any>> = Resolve<
    TInput[typeof VALIDATOR_KEY]['output']
>;

/**
 * Infer a specific subtype of a discriminated union.
 * In order for this to work you must first infer the union type using `a.infer`
 * Then pass the type result to this
 *
 * @example
 * ```ts
 * const Shape = a.discriminator(
 *   "type",
 *   {
 *     "RECTANGLE": a.object({
 *       width: a.number(),
 *       height: a.number(),
 *     }),
 *     "CIRCLE": a.object({
 *       radius: a.number(),
 *      }),
 *   }
 * );
 *
 * type Shape = a.infer<typeof Shape>;
 * // { type: "RECTANGLE"; width: number; height: number } | { type: "CIRCLE"; radius: number; }
 *
 * type ShapeTypeRectangle = a.infer<Shape, "type", "RECTANGLE">
 * // { type: "RECTANGLE"; width: number; height: number; }
 *
 * type ShapeTypeCircle = a.infer<Shape, "type", "CIRCLE">
 * // { type: "CIRCLE"; radius: number; }
 * ```
 */
export type InferSubType<
    TUnion extends Record<string, any>,
    TKey extends keyof TUnion,
    TVal extends TUnion[TKey],
> = TUnion extends Record<TKey, TVal> ? TUnion : never;

// basic types
export interface AScalarSchema<T extends JtdType | NumberType = any, TVal = any>
    extends ASchema<TVal> {
    type: T;
}
export function isAScalarSchema(input: unknown): input is AScalarSchema {
    return (
        isASchema(input) &&
        'type' in input &&
        typeof input.type === 'string' &&
        (TypeValues.includes(input.type as any) ||
            NumberTypeValues.includes(input.type as any))
    );
}
export type AScalarSchemaWithAdapters<
    T extends JtdType | NumberType = any,
    TVal = any,
> = AScalarSchema<T, TVal> & WithAdapters<TVal>;

export const NumberTypeValues = [
    'float32',
    'float64',
    'int8',
    'int16',
    'int32',
    'int64',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
] as const;
export type NumberType = (typeof NumberTypeValues)[number];

// arrays
export interface AArraySchema<TInnerSchema extends ASchema<any> = any>
    extends ASchema<Array<InferType<TInnerSchema>>> {
    elements: TInnerSchema;
}
export function isAAraySchema(input: unknown): input is AArraySchema {
    return isASchema(input) && isSchemaFormElements(input);
}
export type AArraySchemaWithAdapters<TInnerSchema extends ASchema<any> = any> =
    AArraySchema<TInnerSchema> & WithAdapters<InferType<TInnerSchema>[]>;

// string enums
export interface AStringEnumSchema<TValues extends string[]>
    extends ASchema<TValues[number]> {
    enum: TValues;
}
export function isAStringEnumSchema(
    input: unknown,
): input is AStringEnumSchema<any> {
    return isASchema(input) && isSchemaFormEnum(input);
}
export type AStringEnumSchemaWithAdapters<T extends string[]> =
    AStringEnumSchema<T> & WithAdapters<T[number]>;

// discriminators
export interface ADiscriminatorSchema<T> extends ASchema<T> {
    discriminator: string;
    mapping: Record<string, AObjectSchema<any>>;
}
export function isADiscriminatorSchema(
    input: unknown,
): input is ADiscriminatorSchema<any> {
    return isASchema(input) && isSchemaFormDiscriminator(input);
}
export type ADiscriminatorSchemaWithAdapters<T> = ADiscriminatorSchema<T> &
    WithAdapters<T>;

// records
export interface ARecordSchema<TInnerSchema extends ASchema<any>>
    extends ASchema<Record<string, InferType<TInnerSchema>>> {
    values: TInnerSchema;
}
export function isARecordSchema(input: unknown): input is ARecordSchema<any> {
    return isASchema(input) && isSchemaFormValues(input);
}
export type ARecordSchemaWithAdapters<TInnerSchema extends ASchema<any>> =
    ARecordSchema<TInnerSchema> &
        WithAdapters<Record<string, InferType<TInnerSchema>>>;

// object types
export interface AObjectSchema<TVal = any, TStrict extends boolean = false>
    extends ASchema<TVal> {
    properties: Record<string, ASchema>;
    optionalProperties?: Record<string, ASchema>;
    isStrict?: TStrict;
}
export function isAObjectSchema(input: unknown): input is AObjectSchema {
    return isASchema(input) && isSchemaFormProperties(input);
}
export type AObjectSchemaWithAdapters<
    T = any,
    TStrict extends boolean = false,
> = AObjectSchema<T, TStrict> & WithAdapters<T>;

export interface AObjectSchemaOptions<TAdditionalProps extends boolean = false>
    extends ASchemaOptions {
    /**
     * @deprecated use "isStrict" instead
     */
    strict?: TAdditionalProps;
    /**
     * Allow this object to include additional properties not specified here
     */
    isStrict?: TAdditionalProps;
}

// object helper types
export type InferObjectOutput<
    TInput extends Record<any, ASchema<any, any>> = any,
> = ResolveObject<
    PartialBy<InferObjectRawType<TInput>, InferObjectOptionalKeys<TInput>>
>;

export type InferObjectOptionalKeys<
    TInput extends Record<any, ASchema<any, any>>,
> = {
    [K in keyof TInput]: TInput[K][typeof VALIDATOR_KEY]['optional'] extends true
        ? K
        : never;
}[keyof TInput];

export type InferObjectRawType<TInput extends Record<any, ASchema<any, any>>> =
    {
        [TKey in keyof TInput]: TInput[TKey][typeof VALIDATOR_KEY]['output'];
    };

export function isObject(input: unknown): input is Record<any, any> {
    return typeof input === 'object' && input !== null;
}

// recursive types
export interface ARefSchema<T> extends ASchema<T> {
    ref: string;
}
export function isARefSchema(input: unknown): input is ARefSchema<any> {
    return isASchema(input) && isSchemaFormRef(input);
}
export type ARefSchemaWithAdapters<T> = ARefSchema<T> & WithAdapters<T>;
