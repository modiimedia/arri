import {
    RequirableKey,
    UValidator,
    UValidatorAll,
    UValidatorWith,
    v1,
} from './interface';

export function isUValidator<T = any>(input: unknown): input is UValidator<T> {
    if (typeof input !== 'object' || !input) return false;
    if (!(v1 in input) || typeof input[v1] !== 'object' || !input[v1]) {
        return false;
    }
    return 'vendor' in input[v1] && typeof input[v1].vendor === 'string';
}

export function isUValidatorWith<K extends RequirableKey, T = any>(
    keys: K[],
    input: unknown,
): input is UValidatorWith<T, K> {
    if (!isUValidator(input)) return false;
    for (const key of keys) {
        if (typeof input[v1][key] !== 'function') {
            return false;
        }
    }
    return true;
}

export function isUValidatorAll<T = any>(
    input: unknown,
): input is UValidatorAll<T> {
    if (!isUValidator(input)) return false;
    const keyMap: Record<RequirableKey, number> = {
        validate: 0,
        parse: 0,
        serialize: 0,
        coerce: 0,
        errors: 0,
        toAtd: 0,
        toJsonSchema: 0,
    };
    for (const key of Object.keys(keyMap)) {
        if (typeof input[v1][key as RequirableKey] !== 'function') {
            return false;
        }
    }
    return true;
}
