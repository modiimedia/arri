export type Result<T, E> = ResultOk<T> | ResultErr<E>;

export interface ResultOk<T> {
    ok: true;
    value: T;
    unwrap(): T;
    unwrapOr(fallback: T): T;
    unwrapErr(): undefined;
}

export interface ResultErr<E> {
    ok: false;
    error: E;
    unwrap(): undefined;
    unwrapOr<T>(fallback: T): T;
    unwrapErr(): E;
}

export function Ok<T>(val: T): ResultOk<T> {
    return {
        ok: true,
        value: val,
        unwrap: () => val,
        unwrapOr: (_) => val,
        unwrapErr: () => undefined,
    };
}

export function Err<E>(err: E): ResultErr<E> {
    return {
        ok: false,
        error: err,
        unwrap: () => undefined,
        unwrapOr: <T>(fallback: T) => fallback,
        unwrapErr: () => err,
    };
}
