export function parseString(input: unknown, fallback = ''): string {
    if (typeof input === 'string') return input;
    return fallback;
}

export function parseNullableString(input: unknown): string | null {
    if (typeof input === 'string') return input;
    return null;
}

export function parseBoolean(input: unknown, fallback = false): boolean {
    if (typeof input === 'boolean') return input;
    return fallback;
}

export function parseNullableBoolean(input: unknown): boolean | null {
    if (typeof input === 'boolean') return input;
    return null;
}

export function parseTimestamp(input: unknown, fallback = new Date(0)): Date {
    if (typeof input === 'string') return new Date(input);
    if (input instanceof Date) return input;
    return fallback;
}

export function parseNullableTimestamp(input: unknown): Date | null {
    if (typeof input === 'string') return new Date(input);
    if (input instanceof Date) return input;
    return null;
}

export function parseNumberFloat(input: unknown, fallback = 0.0): number {
    if (typeof input === 'number' && !Number.isNaN(input)) return input;
    return fallback;
}

export function parseNullableNumberFloat(input: unknown): number | null {
    if (typeof input === 'number' && !Number.isNaN(input)) return input;
    return null;
}

export function parseNumberInt(
    input: unknown,
    min: number,
    max: number,
    fallback = 0,
): number {
    if (
        typeof input === 'number' &&
        Number.isInteger(input) &&
        input >= min &&
        input <= max
    ) {
        return input;
    }
    return fallback;
}

export function parseNullableNumberInt(
    input: unknown,
    min: number,
    max: number,
): number | null {
    if (
        typeof input === 'number' &&
        Number.isInteger(input) &&
        input >= min &&
        input <= max
    ) {
        return input;
    }
    return null;
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

export function parseNullableNumberBigInt(input: unknown): BigInt | null {
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
    return null;
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

export function parseNullableNumberUnsignedBigInt(
    input: unknown,
): BigInt | null {
    if (typeof input === 'bigint') {
        if (input < BigInt(0)) {
            return null;
        }
        return input;
    }
    if (typeof input === 'string') {
        let val = BigInt(input);
        if (val < BigInt(0)) {
            return null;
        }
        return val;
    }
    if (typeof input === 'number') {
        let val = BigInt(input);
        if (val < BigInt(0)) {
            return null;
        }
        return val;
    }
    return null;
}
