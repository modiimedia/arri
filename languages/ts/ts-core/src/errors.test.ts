import { ArriError, serializeArriError } from './errors';

test('encode arri errors', () => {
    const err = new ArriError({
        code: 1234,
        message: 'foo',
        data: { foo: 'foo' },
    });
    let result = serializeArriError(err, false);
    expect(result).toBe(`{"code":1234,"message":"foo","data":{"foo":"foo"}}`);
    result = serializeArriError(err, true);
    const parsedResult = JSON.parse(result);
    expect(Array.isArray(parsedResult.stack)).toBe(true);
    expect(
        (parsedResult.stack as string[]).every(
            (item) => typeof item === 'string',
        ),
    ).toBe(true);
});

test('decode arri errors', () => {
    const input = `{"code":54321,"message":"foo","data":{"foo":"foo"}}`;
    const result = ArriError.fromJSONString(input);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.code).toBe(54321);
    expect(result.value.message).toBe('foo');
    expect(result.value.data).toStrictEqual({ foo: 'foo' });
});
