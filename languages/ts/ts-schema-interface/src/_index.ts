export * from './errors';

import type { Schema } from '@arrirpc/type-defs';

import { ValueError } from './errors';

function secretSymbol<T extends string>(key: T) {
    return Symbol.for(key) as any as ` Symbol.for(${T})`;
}

export const v1 = secretSymbol('arri/validator/v1');

export type ArriValidator<T> =
    | ArriNativeValidator<T>
    | ArriTransformedValidator<T>;

/**
 * A "native" schema means that the object itself conforms to the [Arri Type Definition]("https://github.com/modiimedia/arri/blob/master/specifications/arri_type_definition.md") specification
 * This interface does not type check to ensure the rest of the object matches. It exists for ATD schema builders like `@arrirpc/schema` to tell `@arrirpc/server` how to validate/decode/encode
 *
 * @example ```ts
 * // SchemaFormType
 * const Foo = { type: "boolean" };
 *
 * // SchemaFormProperties
 * const Bar = { properties: { foo: { type: "string" } } };
 * ```
 */
export interface ArriNativeValidator<T> {
    readonly [v1]: {
        /**
         * When set to true that means that the parent object is a valid Arri Type Definition.
         * So it does not need to be transformed
         */
        readonly isAtd: true;
        /**
         * A type guard for T
         */
        readonly validate: (input: unknown) => input is T;
        /**
         * Take a JSON string or an untransformed Javascript object and attempt to transform it to T
         */
        readonly decodeJson: (input: unknown) => Result<T>;
        /**
         * Transform T into a JSON string
         */
        readonly encodeJson: (input: T) => Result<string>;
        /**
         * Take an object string key/values and convert them into T
         */
        readonly decodeQueryString: (
            input: Record<string, string>,
        ) => Result<T>;
        /**
         * Inferred type associated with the validator
         */
        readonly type?: T;
    };
}

export interface ArriTransformedValidator<T> {
    readonly [v1]: {
        readonly isAtd: false;
        readonly validate: (input: unknown) => input is T;
        readonly decodeJson: (input: unknown) => Result<T>;
        readonly encodeJson: (input: T) => Result<string>;
        readonly decodeQueryString: (input: unknown) => Result<T>;
        readonly toAtd: () => Schema;
        /**
         * Inferred type associated with the validator
         */
        readonly type?: T;
    };
}

export type Result<T> =
    | { success: true; value: T }
    | { success: false; errors: ValueError[] };
