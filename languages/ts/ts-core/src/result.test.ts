import { Err, Ok, Result, ResultErr, ResultOk } from './result';

test('ok()', () => {
    function getResult(): Result<string, Error> {
        return Ok('hello world');
    }
    const okResult = getResult();
    expect(okResult.ok).toBe(true);
    if (okResult.ok) expect(okResult.value).toBe('hello world');
    expect(okResult.unwrap()).toBe('hello world');
    expect(okResult.unwrapErr()).toBe(null);
    expect(okResult.map?.((val) => val.toUpperCase()).unwrap()).toBe(
        'HELLO WORLD',
    );
    expect(okResult.mapErr?.((_) => new Error('foo')).unwrapErr()).toBe(null);

    switch (okResult.ok) {
        case true:
            expect(okResult instanceof ResultOk).toBe(true);
            break;
        case false:
            expect.unreachable();
    }

    // chaining
    expect(
        okResult
            .map((val) => val.toUpperCase())
            .mapErr((_) => new Error('foo'))
            .unwrap(),
    ).toBe('HELLO WORLD');
});
test('err()', () => {
    function getError(): Result<string, Error> {
        return Err(new Error('failed'));
    }
    const errResult = getError();
    expect(errResult.ok).toBe(false);
    if (!errResult.ok) expect(errResult.error?.message).toBe('failed');
    expect(errResult.unwrap()).toBe(null);
    expect(errResult.unwrapErr()?.message).toBe('failed');
    expect(errResult.map?.((val) => val.toUpperCase()).unwrap()).toBe(null);
    expect(
        errResult.mapErr?.((_) => new Error('foo')).unwrapErr()?.message,
    ).toBe('foo');
    switch (errResult.ok) {
        case false:
            expect(errResult instanceof ResultErr).toBe(true);
            break;
        case true:
            expect.unreachable();
    }

    // chaining
    expect(
        errResult
            .map((val) => val.toUpperCase())
            .mapErr((_) => new Error('foo'))
            .unwrapErr()?.message,
    ).toBe('foo');
});

test('andThen()', () => {
    function parseNumber(input: string): Result<number, 'NOT_A_NUMBER'> {
        const value = Number(input);
        return Number.isNaN(value) ? Err('NOT_A_NUMBER') : Ok(value);
    }
    function nonZero(value: number): Result<number, 'ZERO'> {
        return value === 0 ? Err('ZERO') : Ok(value);
    }
    const parsed: Result<number, 'NOT_A_NUMBER' | 'ZERO'> =
        parseNumber('2').andThen(nonZero);
    expect(parsed.unwrap()).toBe(2);
    expect(parseNumber('0').andThen(nonZero).unwrapErr()).toBe('ZERO');

    const neverCalled = vi.fn(nonZero);
    expect(parseNumber('abc').andThen(neverCalled).unwrapErr()).toBe(
        'NOT_A_NUMBER',
    );
    expect(neverCalled).not.toHaveBeenCalled();
});

test('orElse()', () => {
    function readCache(): Result<string, 'CACHE_MISS'> {
        return Err('CACHE_MISS');
    }
    function readDisk(): Result<string, 'NOT_FOUND'> {
        return Ok('from disk');
    }
    const recovered: Result<string, 'NOT_FOUND'> = readCache().orElse(readDisk);
    expect(recovered.unwrap()).toBe('from disk');
    expect(
        readCache()
            .orElse(() => Err('NOT_FOUND'))
            .unwrapErr(),
    ).toBe('NOT_FOUND');

    const neverCalled = vi.fn(readDisk);
    const ok: Result<string, 'CACHE_MISS'> = Ok('from cache');
    expect(ok.orElse(neverCalled).unwrap()).toBe('from cache');
    expect(neverCalled).not.toHaveBeenCalled();
});
