import {
    arriSafeRequest,
    INT64_MAX,
    INT64_MIN,
    isArriError,
    UINT64_MAX,
} from './_index';

test('error messages', async () => {
    const request = await arriSafeRequest({
        url: 'http://thisurldoesntexist.blah',
        method: 'get',
        responseFromJson() {},
        responseFromString() {},
        serializer() {
            return undefined;
        },
        headers: undefined,
        clientVersion: '',
    });
    expect(!request.success);
    if (!request.success) {
        expect(isArriError(request.error));
        expect(request.error.code).toBe(500);
    }
});

test('64 bit integer limits', () => {
    expect(INT64_MIN).toBe(BigInt(-1) * BigInt(2) ** BigInt(63));
    expect(INT64_MAX).toBe(BigInt(2) ** BigInt(63) - BigInt(1));
    expect(UINT64_MAX).toBe(BigInt(2) ** BigInt(64) - BigInt(1));
});
