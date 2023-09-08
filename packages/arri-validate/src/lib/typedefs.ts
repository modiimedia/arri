export const _SCHEMA = Symbol.for("arri._schema");

export type ActualValue<
    T = any,
    TIsNullable extends boolean = false,
> = TIsNullable extends true ? T | null : T;

export interface ArriSchema<T = any, TIsNullable extends boolean = false> {
    metadata: {
        id?: string;
        description?: string;
        [_SCHEMA]: {
            default?: ActualValue<T, TIsNullable>;
            output: ActualValue<T, TIsNullable>;
            parse: (input: unknown) => ActualValue<T, TIsNullable>;
            serialize: (input: unknown) => string;
            validate: (input: unknown) => input is ActualValue<T, TIsNullable>;
        };
    };
    nullable?: TIsNullable;
}

export type Resolve<T> = T;

export type ResolveObject<T> = Resolve<{ [k in keyof T]: T[k] }>;

export type ResolveExtendableObject<T> = ResolveObject<T> & Record<any, any>;

export type InferType<TInput extends ArriSchema<any, any>> = Resolve<
    TInput["metadata"][typeof _SCHEMA]["output"]
>;
