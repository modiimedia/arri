import { describe, it, expect } from 'vitest';
import {
    parseString,
    parseNullableString,
    parseBoolean,
    parseNullableBoolean,
    parseTimestamp,
    parseNullableTimestamp,
    parseNumberFloat,
    parseNullableNumberFloat,
    parseNumberInt,
    parseNullableNumberInt,
    parseNumberBigInt,
    parseNullableNumberBigInt,
    parseNumberUnsignedBigInt,
    parseNullableNumberUnsignedBigInt,
} from './parsing';

describe('parsing', () => {
    describe('parseString', () => {
        it('returns string if input is string', () => {
            expect(parseString('hello')).toBe('hello');
            expect(parseString('')).toBe('');
        });
        it('returns fallback if input is not string', () => {
            expect(parseString(123)).toBe('');
            expect(parseString(null, 'default')).toBe('default');
            expect(parseString({}, 'default')).toBe('default');
        });
    });

    describe('parseNullableString', () => {
        it('returns string if input is string', () => {
            expect(parseNullableString('hello')).toBe('hello');
        });
        it('returns null if input is not string', () => {
            expect(parseNullableString(123)).toBeNull();
            expect(parseNullableString(null)).toBeNull();
            expect(parseNullableString(undefined)).toBeNull();
            expect(parseNullableString({})).toBeNull();
        });
    });

    describe('parseBoolean', () => {
        it('returns boolean if input is boolean', () => {
            expect(parseBoolean(true)).toBe(true);
            expect(parseBoolean(false)).toBe(false);
        });
        it('returns fallback if input is not boolean', () => {
            expect(parseBoolean('true')).toBe(false);
            expect(parseBoolean(1)).toBe(false);
            expect(parseBoolean(null, true)).toBe(true);
        });
    });

    describe('parseNullableBoolean', () => {
        it('returns boolean if input is boolean', () => {
            expect(parseNullableBoolean(true)).toBe(true);
            expect(parseNullableBoolean(false)).toBe(false);
        });
        it('returns null if input is not boolean', () => {
            expect(parseNullableBoolean('true')).toBeNull();
            expect(parseNullableBoolean(1)).toBeNull();
            expect(parseNullableBoolean(null)).toBeNull();
        });
    });

    describe('parseTimestamp', () => {
        it('returns Date if input is Date', () => {
            const date = new Date();
            expect(parseTimestamp(date)).toBe(date);
        });
        it('returns Date if input is string', () => {
            const dateStr = '2023-01-01T00:00:00.000Z';
            const parsed = parseTimestamp(dateStr);
            expect(parsed).toBeInstanceOf(Date);
            expect(parsed.toISOString()).toBe(dateStr);
        });
        it('returns fallback if input is not string or Date', () => {
            const fallback = new Date('2024-01-01T00:00:00.000Z');
            expect(parseTimestamp(123).getTime()).toBe(new Date(0).getTime());
            expect(parseTimestamp(null, fallback)).toBe(fallback);
        });
    });

    describe('parseNullableTimestamp', () => {
        it('returns Date if input is Date', () => {
            const date = new Date();
            expect(parseNullableTimestamp(date)).toBe(date);
        });
        it('returns Date if input is string', () => {
            const dateStr = '2023-01-01T00:00:00.000Z';
            const parsed = parseNullableTimestamp(dateStr);
            expect(parsed).toBeInstanceOf(Date);
            expect(parsed?.toISOString()).toBe(dateStr);
        });
        it('returns null if input is not string or Date', () => {
            expect(parseNullableTimestamp(123)).toBeNull();
            expect(parseNullableTimestamp(null)).toBeNull();
        });
    });

    describe('parseNumberFloat', () => {
        it('returns number if input is valid number', () => {
            expect(parseNumberFloat(1.5)).toBe(1.5);
            expect(parseNumberFloat(0)).toBe(0);
            expect(parseNumberFloat(-1.5)).toBe(-1.5);
        });
        it('returns fallback if input is not a number or is NaN', () => {
            expect(parseNumberFloat('1.5')).toBe(0.0);
            expect(parseNumberFloat(NaN)).toBe(0.0);
            expect(parseNumberFloat(null, 2.5)).toBe(2.5);
        });
    });

    describe('parseNullableNumberFloat', () => {
        it('returns number if input is valid number', () => {
            expect(parseNullableNumberFloat(1.5)).toBe(1.5);
            expect(parseNullableNumberFloat(0)).toBe(0);
            expect(parseNullableNumberFloat(-1.5)).toBe(-1.5);
        });
        it('returns null if input is not a number or is NaN', () => {
            expect(parseNullableNumberFloat('1.5')).toBeNull();
            expect(parseNullableNumberFloat(NaN)).toBeNull();
            expect(parseNullableNumberFloat(null)).toBeNull();
        });
    });

    describe('parseNumberInt', () => {
        it('returns number if input is valid integer within range', () => {
            expect(parseNumberInt(5, 0, 10)).toBe(5);
            expect(parseNumberInt(0, 0, 10)).toBe(0);
            expect(parseNumberInt(10, 0, 10)).toBe(10);
            expect(parseNumberInt(-5, -10, 10)).toBe(-5);
        });
        it('returns fallback if input is not an integer', () => {
            expect(parseNumberInt(5.5, 0, 10)).toBe(0);
            expect(parseNumberInt('5', 0, 10)).toBe(0);
            expect(parseNumberInt(NaN, 0, 10)).toBe(0);
        });
        it('returns fallback if input is out of range', () => {
            expect(parseNumberInt(-1, 0, 10)).toBe(0);
            expect(parseNumberInt(11, 0, 10)).toBe(0);
            expect(parseNumberInt(-1, 0, 10, 5)).toBe(5);
        });
    });

    describe('parseNullableNumberInt', () => {
        it('returns number if input is valid integer within range', () => {
            expect(parseNullableNumberInt(5, 0, 10)).toBe(5);
            expect(parseNullableNumberInt(0, 0, 10)).toBe(0);
            expect(parseNullableNumberInt(10, 0, 10)).toBe(10);
            expect(parseNullableNumberInt(-5, -10, 10)).toBe(-5);
        });
        it('returns null if input is not an integer', () => {
            expect(parseNullableNumberInt(5.5, 0, 10)).toBeNull();
            expect(parseNullableNumberInt('5', 0, 10)).toBeNull();
            expect(parseNullableNumberInt(NaN, 0, 10)).toBeNull();
        });
        it('returns null if input is out of range', () => {
            expect(parseNullableNumberInt(-1, 0, 10)).toBeNull();
            expect(parseNullableNumberInt(11, 0, 10)).toBeNull();
        });
    });

    describe('parseNumberBigInt', () => {
        it('returns bigint if input is bigint', () => {
            expect(parseNumberBigInt(BigInt(10))).toBe(BigInt(10));
            expect(parseNumberBigInt(10n)).toBe(10n);
            expect(parseNumberBigInt(-10n)).toBe(-10n);
        });
        it('returns bigint if input is string', () => {
            expect(parseNumberBigInt('10')).toBe(10n);
            expect(parseNumberBigInt('-10')).toBe(-10n);
        });
        it('returns bigint if input is number', () => {
            expect(parseNumberBigInt(10)).toBe(10n);
            expect(parseNumberBigInt(-10)).toBe(-10n);
        });
        it('returns fallback if input is not valid type', () => {
            expect(parseNumberBigInt(null)).toBe(0n);
            expect(parseNumberBigInt(true, 5n)).toBe(5n);
        });
    });

    describe('parseNullableNumberBigInt', () => {
        it('returns bigint if input is bigint', () => {
            expect(parseNullableNumberBigInt(10n)).toBe(10n);
            expect(parseNullableNumberBigInt(-10n)).toBe(-10n);
        });
        it('returns bigint if input is string', () => {
            expect(parseNullableNumberBigInt('10')).toBe(10n);
            expect(parseNullableNumberBigInt('-10')).toBe(-10n);
        });
        it('returns bigint if input is number', () => {
            expect(parseNullableNumberBigInt(10)).toBe(10n);
            expect(parseNullableNumberBigInt(-10)).toBe(-10n);
        });
        it('returns null if input is not valid type', () => {
            expect(parseNullableNumberBigInt(null)).toBeNull();
            expect(parseNullableNumberBigInt(true)).toBeNull();
            expect(parseNullableNumberBigInt(undefined)).toBeNull();
        });
    });

    describe('parseNumberUnsignedBigInt', () => {
        it('returns bigint if input is positive bigint', () => {
            expect(parseNumberUnsignedBigInt(10n)).toBe(10n);
            expect(parseNumberUnsignedBigInt(0n)).toBe(0n);
        });
        it('returns fallback if input is negative bigint', () => {
            expect(parseNumberUnsignedBigInt(-10n)).toBe(0n);
            expect(parseNumberUnsignedBigInt(-10n, 5n)).toBe(5n);
        });
        it('returns bigint if input is positive string', () => {
            expect(parseNumberUnsignedBigInt('10')).toBe(10n);
        });
        it('returns fallback if input is negative string', () => {
            expect(parseNumberUnsignedBigInt('-10')).toBe(0n);
        });
        it('returns bigint if input is positive number', () => {
            expect(parseNumberUnsignedBigInt(10)).toBe(10n);
        });
        it('returns fallback if input is negative number', () => {
            expect(parseNumberUnsignedBigInt(-10)).toBe(0n);
        });
        it('returns fallback if input is not valid type', () => {
            expect(parseNumberUnsignedBigInt(null)).toBe(0n);
        });
    });

    describe('parseNullableNumberUnsignedBigInt', () => {
        it('returns bigint if input is positive bigint', () => {
            expect(parseNullableNumberUnsignedBigInt(10n)).toBe(10n);
            expect(parseNullableNumberUnsignedBigInt(0n)).toBe(0n);
        });
        it('returns null if input is negative bigint', () => {
            expect(parseNullableNumberUnsignedBigInt(-10n)).toBeNull();
        });
        it('returns bigint if input is positive string', () => {
            expect(parseNullableNumberUnsignedBigInt('10')).toBe(10n);
        });
        it('returns null if input is negative string', () => {
            expect(parseNullableNumberUnsignedBigInt('-10')).toBeNull();
        });
        it('returns bigint if input is positive number', () => {
            expect(parseNullableNumberUnsignedBigInt(10)).toBe(10n);
        });
        it('returns null if input is negative number', () => {
            expect(parseNullableNumberUnsignedBigInt(-10)).toBeNull();
        });
        it('returns null if input is not valid type', () => {
            expect(parseNullableNumberUnsignedBigInt(null)).toBeNull();
        });
    });
});
