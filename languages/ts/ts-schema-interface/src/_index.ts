export * from './errors';

import { ValueError } from './errors';

function secretSymbol<T extends string>(key: T) {
    return Symbol.for(key) as any as ` Symbol.for(${T})`;
}

export const v1 = secretSymbol('universal-validator/v1');

type RequireKeys<T extends object, K extends keyof T> = Required<Pick<T, K>> &
    Omit<T, K>;

export interface UValidator<T> {
    readonly [v1]: UValidatorMethods<T>;
}

export interface UValidatorWith<
    TOut,
    K extends keyof UValidatorMethods<TOut, TIn>,
    TIn = unknown,
> {
    readonly [v1]: RequireKeys<UValidatorMethods<TOut, TIn>, K>;
}

export interface UniValidatorAll<TOut, TIn = unknown> {
    readonly [v1]: Required<UValidatorMethods<TOut, TIn>>;
}

interface UValidatorMethods<TOut, TIn = unknown> {
    /**
     * The inferred output type
     */
    readonly output?: TOut;
    /**
     * The inferred input type
     */
    readonly input?: TIn;
    /**
     * The library that has implemented this interface
     */
    readonly vendor: string;
    /**
     * Return all the errors with an input
     */
    readonly errors?: (input: TIn) => ValueError[];
    /**
     * A type guard that returns true if the input matches the specified type.
     */
    readonly isValid?: (input: unknown) => input is TOut;
    /**
     * Transform an object or JSON string into T
     */
    readonly decodeJSON?: (input: TIn, omitErrors?: boolean) => Result<TOut>;
    /**
     * Transform T into a JSON string
     */
    readonly encodeJSON?: (input: TOut, omitErrors?: boolean) => Result<string>;
    /**
     * Attempt to coerce an input into T
     */
    readonly coerce?: (input: TIn, omitErrors?: boolean) => Result<TOut>;
    /**
     * Return a valid JSON schema representing T
     */
    readonly toJSONSchema?: () => any;
    /**
     * Return a valid Arri Type Definition representing T
     */
    readonly toATD?: () => any;
}

export type Result<T> =
    | { success: true; value: T }
    | { success: false; errors: ValueError[] };

export type Infer<TSchema extends UValidator<any>> = Required<
    TSchema[typeof v1]
>['output'];

export type InferInput<TSchema extends UValidator<any>> = Required<
    TSchema[typeof v1]
>['input'];
