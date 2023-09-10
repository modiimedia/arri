import type { Type as JtdType } from "@modii/jtd";

export const SCHEMA_METADATA = Symbol.for("arri.schema_metadata");

export type MaybeNullable<
    T = any,
    TIsNullable extends boolean = false,
> = TIsNullable extends true ? T | null : T;

export interface ArriSchema<T = any> {
    metadata: {
        id?: string;
        description?: string;
        [SCHEMA_METADATA]: {
            output: T;
            optional?: boolean;
            parse: (input: unknown) => T;
            coerce: (input: unknown) => T;
            serialize: (input: unknown) => string;
            validate: (input: unknown) => input is T;
        };
    };
    nullable?: boolean;
}
export function isArriSchema(input: unknown): input is ArriSchema {
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

export interface ScalarTypeSchema<T extends JtdType = any, TVal = any>
    extends ArriSchema<TVal> {
    type: T;
}

export type Resolve<T> = T;

export type ResolveObject<T> = Resolve<{ [k in keyof T]: T[k] }>;

export type InferType<TInput extends ArriSchema<any>> = Resolve<
    TInput["metadata"][typeof SCHEMA_METADATA]["output"]
>;

// basic types

export interface InputOptions {
    id?: string;
    description?: string;
}

// object types

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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
