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
