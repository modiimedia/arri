export * from './errors';
import type { Schema } from '@arrirpc/type-defs';

import { ValueError } from './errors';

// this is a hack to ensure no type inference errors since TS sometimes has issues typing Symbol.for
function secretSymbol<T extends string>(key: T) {
    return Symbol.for(key) as any as ` Symbol.for(${T})`;
}

export const v1 = secretSymbol('universal-validator/v1');

type RequireKeys<T extends object, K extends keyof T> = Required<Pick<T, K>> &
    Omit<T, K>;

export interface UValidator<TOut, TIn = unknown> {
    readonly [v1]: UValidatorProps<TOut, TIn>;
}

export interface UValidatorWith<TOut, K extends RequirableKey, TIn = unknown> {
    readonly [v1]: RequireKeys<UValidatorProps<TOut, TIn>, K>;
}

export interface UValidatorAll<TOut, TIn = unknown> {
    readonly [v1]: Required<UValidatorProps<TOut, TIn>>;
}

export type RequirableKey = keyof Omit<
    UValidatorProps<any>,
    'output' | 'input' | 'vendor'
>;

interface UValidatorProps<TOut, TIn = unknown> {
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
     * A type guard that returns true if the input matches the specified type.
     */
    readonly validate?: (input: unknown) => input is TOut;
    /**
     * Transform an object or JSON string into T
     */
    readonly parse?: (input: TIn, omitErrors?: boolean) => Result<TOut>;
    /**
     * Transform T into a JSON string
     */
    readonly serialize?: (input: TOut, omitErrors?: boolean) => Result<string>;
    /**
     * Attempt to coerce an input into T
     */
    readonly coerce?: (input: TIn, omitErrors?: boolean) => Result<TOut>;
    /**
     * Return all the errors with an input
     */
    readonly errors?: (input: TIn) => ValueError[];
    /**
     * Return a valid Arri Type Definition (ATD) representing T
     */
    readonly toAtd?: () => Schema;
    /**
     * Return a valid JSON schema representing T
     */
    readonly toJsonSchema?: () => any;
}

export type Result<T> = ResultSuccess<T> | ResultFailure;
export type ResultSuccess<T> = { success: true; value: T };
export type ResultFailure = { success: false; errors: ValueError[] };

export type Infer<TSchema extends UValidator<any>> = Required<
    TSchema[typeof v1]
>['output'];

export type InferInput<TSchema extends UValidator<any>> = Required<
    TSchema[typeof v1]
>['input'];
