export type Result<T, E> = ResultOk<T, E> | ResultErr<T, E>;

export class ResultOk<T, E> {
    readonly ok = true;
    constructor(readonly value: T) {}
    unwrap(): T {
        return this.value;
    }
    unwrapErr(): E | null {
        return null;
    }
    map<U>(fn: (value: T) => U): Result<U, E> {
        return new ResultOk(fn(this.value));
    }
    mapErr<F>(_fn: (error: E) => F): Result<T, F> {
        return this as unknown as ResultOk<T, F>;
    }
    andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F> {
        return fn(this.value);
    }
    orElse<U, F>(_fn: (error: E) => Result<U, F>): Result<T | U, F> {
        return this as unknown as ResultOk<T, F>;
    }
    unwrapOr(_fallback: T): T {
        return this.value;
    }
}

export class ResultErr<T, E> {
    readonly ok = false;
    constructor(readonly error: E) {}
    unwrap(): T | null {
        return null;
    }
    unwrapErr(): E {
        return this.error;
    }
    map<U>(_fn: (value: T) => U): Result<U, E> {
        return this as unknown as ResultErr<U, E>;
    }
    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        return new ResultErr(fn(this.error));
    }
    andThen<U, F>(_fn: (value: T) => Result<U, F>): Result<U, E | F> {
        return this as unknown as ResultErr<U, E>;
    }
    orElse<U, F>(fn: (error: E) => Result<U, F>): Result<T | U, F> {
        return fn(this.error);
    }
    unwrapOr(fallback: T): T {
        return fallback;
    }
}

export function Ok<T, E = never>(input: T): ResultOk<T, E> {
    return new ResultOk(input);
}

export function Err<E, T = never>(err: E): ResultErr<T, E> {
    return new ResultErr(err);
}
