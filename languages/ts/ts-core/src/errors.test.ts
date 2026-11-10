import {
    ARRI_ERROR_CODES,
    CLIENT_ERROR_CODES,
    ERROR_CODES,
    GENERAL_ERROR_CODES,
    isErrorCode,
    isRetryableErrorCode,
} from './errors';

test('error code groups do not overlap', () => {
    const all = [
        ...ARRI_ERROR_CODES,
        ...GENERAL_ERROR_CODES,
        ...CLIENT_ERROR_CODES,
    ];
    expect(new Set(all).size).toBe(all.length);
    expect(ERROR_CODES).toStrictEqual(all);
});

test('error codes are UPPER_SNAKE_CASE', () => {
    for (const code of ERROR_CODES) {
        expect(code).toMatch(/^[A-Z]+(_[A-Z]+)*$/);
    }
});

test('isErrorCode()', () => {
    expect(isErrorCode('NOT_FOUND')).toBe(true);
    expect(isErrorCode('CANCELLED')).toBe(true);
    expect(isErrorCode('not_found')).toBe(false);
    expect(isErrorCode('USER_NOT_FOUND')).toBe(false);
    expect(isErrorCode(404)).toBe(false);
});

test('isRetryableErrorCode()', () => {
    for (const code of [
        'UNAVAILABLE',
        'TIMEOUT',
        'RATE_LIMITED',
        'CONNECTION_ERROR',
    ]) {
        expect(isRetryableErrorCode(code)).toBe(true);
    }
    for (const code of ['INTERNAL', 'NOT_FOUND', 'INVALID_INPUT', 'UNKNOWN']) {
        expect(isRetryableErrorCode(code)).toBe(false);
    }
});
