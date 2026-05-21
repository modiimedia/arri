export function parseString(input: unknown, fallback = ''): string {
    if (typeof input !== 'string') {
        return fallback;
    }
    return input;
}

export function parseBoolean(input: unknown, fallback = false): boolean {
    if (typeof input !== 'boolean') {
        return fallback;
    }
    return input;
}

export function parseTimestamp(input: unknown, fallback = new Date(0)): Date {
    if (typeof input === 'string') {
        return new Date(input);
    }
    if (input instanceof Date) {
        return input;
    }
    return fallback;
}

export function parseNumberFloat(input: unknown, fallback = 0.0): number {
    if (typeof input !== 'number' || Number.isNaN(input)) {
        return fallback;
    }
    return input;
}

export function parseNumberInt(
    input: unknown,
    min: number,
    max: number,
    fallback = 0,
): number {
    if (
        typeof input !== 'number' ||
        !Number.isInteger(input) ||
        input < min ||
        input > max
    ) {
        return fallback;
    }
    return input;
}

export function parseNumberBigInt(
    input: unknown,
    fallback = BigInt(0),
): BigInt {
    if (typeof input === 'bigint') {
        return input;
    }
    if (typeof input === 'string') {
        let val = BigInt(input);
        return val;
    }
    if (typeof input === 'number') {
        let val = BigInt(input);
        return val;
    }
    return fallback;
}

export function parseNumberUnsignedBigInt(
    input: unknown,
    fallback = BigInt(0),
): BigInt {
    if (typeof input === 'bigint') {
        if (input < BigInt(0)) {
            return fallback;
        }
        return input;
    }
    if (typeof input === 'string') {
        let val = BigInt(input);
        if (val < BigInt(0)) {
            return fallback;
        }
        return val;
    }
    if (typeof input === 'number') {
        let val = BigInt(input);
        if (val < BigInt(0)) {
            return fallback;
        }
        return val;
    }
    return fallback;
}
