import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import {
    $$Book,
    $$NestedObject,
    $$ObjectWithEveryType,
    $$ObjectWithNullableFields,
    $$ObjectWithOptionalFields,
    $$RecursiveObject,
    $$UnionAdjacent,
    $$UnionExternal,
    $$UnionInternal,
    Book,
    BookClone,
    Enumerator,
    ExampleClient,
    NestedObject,
    ObjectWithEveryType,
    ObjectWithEveryTypeClone,
    ObjectWithNullableFields,
    ObjectWithOptionalFields,
    RecursiveObject,
    UnionAdjacent,
    UnionExternal,
    UnionInternal,
} from './referenceClient';

const testDate = new Date('2001-01-01T16:00:00.000Z');
const referenceDir = path.resolve(__dirname, '../../../../tests/test-files');
const testFile = (filename: string) =>
    fs.readFileSync(path.resolve(referenceDir, filename), 'utf8');

function assertValidation<T>(
    validate: (input: unknown) => boolean,
    inputs: { good: T[]; bad: unknown[] },
) {
    const label = (input: unknown) =>
        JSON.stringify(input, (_, val) =>
            typeof val === 'bigint' ? `${val}n` : val,
        );
    for (const input of inputs.good) {
        expect(validate(input), `should accept ${label(input)}`).toBe(true);
    }
    for (const input of inputs.bad) {
        expect(validate(input), `should reject ${label(input)}`).toBe(false);
    }
}

const nonObjects = [null, undefined, 'hello world', 1, true, []];

describe('Book', () => {
    const targetValue: Book = {
        id: '1',
        name: 'The Adventures of Tom Sawyer',
        createdAt: testDate,
        updatedAt: testDate,
    };
    const jsonReference = testFile('Book.json');
    test('JSON Parsing', () => {
        const result = $$Book.fromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);
    });
    test('JSON Output', () => {
        expect($$Book.toJsonString(targetValue)).toEqual(jsonReference);
    });
    test('URL Query String Output', () => {
        expect($$Book.toUrlSearchParamsString(targetValue)).toEqual(
            `id=1&name=The+Adventures+of+Tom+Sawyer&createdAt=2001-01-01T16%3A00%3A00.000Z&updatedAt=2001-01-01T16%3A00%3A00.000Z`,
        );
    });
    test('Cloning', () => {
        const testDate = new Date('01/01/2001 10:00 AM');
        const input: Book = {
            id: '1',
            name: 'Foo',
            createdAt: testDate,
            updatedAt: testDate,
        };
        const output = BookClone(input);
        expect(input).toStrictEqual(output);
        input.createdAt = new Date('01/01/2001 10:01 AM');
        expect(input).not.toStrictEqual(output);
    });
    test('Validation', () => {
        assertValidation($$Book.validate, {
            good: [targetValue],
            bad: [
                ...nonObjects,
                {},
                { ...targetValue, id: 1 },
                { ...targetValue, name: null },
                { ...targetValue, createdAt: '2001-01-01T16:00:00.000Z' },
                { ...targetValue, updatedAt: undefined },
            ],
        });
    });
});

describe('NestedObject', () => {
    const noSpecialCharsTargetValue: NestedObject = {
        id: '1',
        content: 'hello world',
    };
    const noSpecialCharsJson = testFile('NestedObject_NoSpecialChars.json');
    const specialCharsTargetValue: NestedObject = {
        id: '1',
        content:
            'double-quote: " | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000',
    };
    const specialCharsJson = testFile('NestedObject_SpecialChars.json');
    test('JSON Parsing', () => {
        expect($$NestedObject.fromJsonString(noSpecialCharsJson)).toStrictEqual(
            noSpecialCharsTargetValue,
        );
        expect($$NestedObject.fromJsonString(specialCharsJson)).toStrictEqual(
            specialCharsTargetValue,
        );
    });
    test('JSON Output', () => {
        expect($$NestedObject.toJsonString(noSpecialCharsTargetValue)).toEqual(
            noSpecialCharsJson,
        );
        expect($$NestedObject.toJsonString(specialCharsTargetValue)).toEqual(
            specialCharsJson,
        );
    });
    test('Validation', () => {
        assertValidation($$NestedObject.validate, {
            good: [noSpecialCharsTargetValue, specialCharsTargetValue],
            bad: [
                ...nonObjects,
                {},
                { id: '1' },
                { ...noSpecialCharsTargetValue, id: 1 },
                { ...noSpecialCharsTargetValue, content: null },
            ],
        });
    });
});

describe('ObjectWithEveryType', () => {
    const targetValue: ObjectWithEveryType = {
        string: '',
        boolean: false,
        timestamp: testDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enum: 'BAZ',
        object: {
            id: '1',
            content: 'hello world',
        },
        array: [true, false, false],
        record: {
            A: true,
            B: false,
        },
        unionExternal: {
            type: 'array',
            value: ['hello', 'world'],
        },
        unionInternal: {
            shape: 'circle',
            radius: 2.5,
        },
        unionAdjacent: {
            kind: 'nullable-timestamp',
            data: testDate,
        },
        any: 'hello world',
    };
    const jsonReference = testFile('ObjectWithEveryType.json');
    const emptyJsonReference = testFile(
        'ObjectWithOptionalFields_AllUndefined.json',
    );
    test('JSON parsing', () => {
        const result = $$ObjectWithEveryType.fromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);

        const emptyJsonResult =
            $$ObjectWithEveryType.fromJsonString(emptyJsonReference);
        expect(emptyJsonResult).toStrictEqual($$ObjectWithEveryType.new());
    });
    test('JSON output', () => {
        expect($$ObjectWithEveryType.toJsonString(targetValue)).toEqual(
            jsonReference,
        );
    });
    test('Cloning', () => {
        const output = ObjectWithEveryTypeClone(targetValue);
        expect(targetValue).toStrictEqual(output);
        output.array[0] = false;
        expect(targetValue).not.toStrictEqual(output);
        const output2 = ObjectWithEveryTypeClone(targetValue);
        if (output2.unionInternal.shape === 'circle') {
            output2.unionInternal.radius = 100;
        }
        expect(targetValue).not.toStrictEqual(output2);
    });
    test('Validation', () => {
        const withField = (field: keyof ObjectWithEveryType, val: unknown) => ({
            ...targetValue,
            [field]: val,
        });
        assertValidation($$ObjectWithEveryType.validate, {
            good: [
                targetValue,
                $$ObjectWithEveryType.new(),
                withField('int8', -128),
                withField('int8', 127),
                withField('uint8', 0),
                withField('uint8', 255),
                withField('int16', -32768),
                withField('int16', 32767),
                withField('uint16', 0),
                withField('uint16', 65535),
                withField('int32', -2147483648),
                withField('int32', 2147483647),
                withField('uint32', 0),
                withField('uint32', 4294967295),
                withField('int64', -9223372036854775808n),
                withField('int64', 9223372036854775807n),
                withField('uint64', 0n),
                withField('uint64', 18446744073709551615n),
            ],
            bad: [
                ...nonObjects,
                {},
                withField('string', 1),
                withField('boolean', 'true'),
                withField('timestamp', '2001-01-01T16:00:00.000Z'),
                withField('timestamp', new Date(NaN)),
                withField('float32', '1.5'),
                withField('float64', '1.5'),
                withField('int8', -129),
                withField('int8', 128),
                withField('int8', 1.5),
                withField('uint8', -1),
                withField('uint8', 256),
                withField('int16', -32769),
                withField('int16', 32768),
                withField('uint16', -1),
                withField('uint16', 65536),
                withField('int32', -2147483649),
                withField('int32', 2147483648),
                withField('uint32', -1),
                withField('uint32', 4294967296),
                withField('int64', 1),
                withField('int64', '1'),
                withField('int64', -9223372036854775809n),
                withField('int64', 9223372036854775808n),
                withField('uint64', 1),
                withField('uint64', '1'),
                withField('uint64', -1n),
                withField('uint64', 18446744073709551616n),
                withField('enum', 'UNKNOWN'),
                withField('object', { id: '1' }),
                withField('array', ['true']),
                withField('record', { A: 'true' }),
                withField('unionExternal', { type: 'unknown', value: true }),
                withField('unionInternal', { shape: 'unknown' }),
                withField('unionAdjacent', { kind: 'unknown', data: true }),
            ],
        });
    });
});

describe('ObjectWithOptionalFields', () => {
    const allUndefinedTargetValue: ObjectWithOptionalFields = {
        string: undefined,
        boolean: undefined,
        timestamp: undefined,
        float32: undefined,
        float64: undefined,
        int8: undefined,
        uint8: undefined,
        int16: undefined,
        uint16: undefined,
        int32: undefined,
        uint32: undefined,
        int64: undefined,
        uint64: undefined,
        enum: undefined,
        object: undefined,
        array: undefined,
        record: undefined,
        unionExternal: undefined,
        unionInternal: undefined,
        unionAdjacent: undefined,
        any: undefined,
    };
    const noUndefinedTargetValue: ObjectWithOptionalFields = {
        string: '',
        boolean: false,
        timestamp: testDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enum: 'BAZ',
        object: {
            id: '1',
            content: 'hello world',
        },
        array: [true, false, false],
        record: {
            A: true,
            B: false,
        },
        unionExternal: {
            type: 'array',
            value: ['hello', 'world'],
        },
        unionInternal: {
            shape: 'circle',
            radius: 2.5,
        },
        unionAdjacent: {
            kind: 'nullable-timestamp',
            data: testDate,
        },
        any: 'hello world',
    };
    const allUndefinedJson = testFile(
        'ObjectWithOptionalFields_AllUndefined.json',
    );
    const noUndefinedJson = testFile(
        'ObjectWithOptionalFields_NoUndefined.json',
    );
    test('JSON parsing', () => {
        expect(
            $$ObjectWithOptionalFields.fromJsonString(allUndefinedJson),
        ).toStrictEqual(allUndefinedTargetValue);
        expect(
            $$ObjectWithOptionalFields.fromJsonString(noUndefinedJson),
        ).toStrictEqual(noUndefinedTargetValue);
    });
    test('JSON output', () => {
        expect(
            $$ObjectWithOptionalFields.toJsonString(allUndefinedTargetValue),
        ).toEqual(allUndefinedJson);
        expect(
            $$ObjectWithOptionalFields.toJsonString(noUndefinedTargetValue),
        ).toEqual(noUndefinedJson);
    });
    test('Validation', () => {
        const withField = (
            field: keyof ObjectWithOptionalFields,
            val: unknown,
        ) => ({
            ...noUndefinedTargetValue,
            [field]: val,
        });
        assertValidation($$ObjectWithOptionalFields.validate, {
            good: [
                {},
                allUndefinedTargetValue,
                noUndefinedTargetValue,
                withField('int64', -9223372036854775808n),
                withField('int64', undefined),
            ],
            bad: [
                // an empty array currently passes since every field is optional and isObject() allows arrays
                ...nonObjects.filter((input) => !Array.isArray(input)),
                withField('string', 1),
                withField('string', null),
                withField('timestamp', '2001-01-01T16:00:00.000Z'),
                withField('timestamp', new Date(NaN)),
                withField('int8', 128),
                withField('int64', 1),
                withField('int64', 9223372036854775808n),
                withField('uint64', -1n),
                withField('enum', 'UNKNOWN'),
                withField('object', {}),
            ],
        });
    });
});

describe('ObjectWithNullableFields', () => {
    const allNullTargetValue: ObjectWithNullableFields = {
        string: null,
        boolean: null,
        timestamp: null,
        float32: null,
        float64: null,
        int8: null,
        uint8: null,
        int16: null,
        uint16: null,
        int32: null,
        uint32: null,
        int64: null,
        uint64: null,
        enum: null,
        object: null,
        array: null,
        record: null,
        unionExternal: null,
        unionInternal: null,
        unionAdjacent: null,
        any: null,
    };
    const noNullTargetValue: ObjectWithNullableFields = {
        string: '',
        boolean: true,
        timestamp: testDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enum: 'BAZ',
        object: {
            id: '',
            content: '',
        },
        array: [true, false, false],
        record: {
            A: true,
            B: false,
        },
        unionExternal: {
            type: 'array',
            value: ['hello', 'world'],
        },
        unionInternal: {
            shape: 'circle',
            radius: 2.5,
        },
        unionAdjacent: {
            kind: 'boolean',
            data: true,
        },
        any: { message: 'hello world' },
    };
    const allNullJsonReference = testFile(
        'ObjectWithNullableFields_AllNull.json',
    );
    const noNullJsonReference = testFile(
        'ObjectWithNullableFields_NoNull.json',
    );
    test('JSON parsing', () => {
        const allNullResult =
            $$ObjectWithNullableFields.fromJsonString(allNullJsonReference);
        const noNullResult =
            $$ObjectWithNullableFields.fromJsonString(noNullJsonReference);
        expect(allNullResult).toStrictEqual(allNullTargetValue);
        expect(noNullResult).toStrictEqual(noNullTargetValue);
    });
    test('JSON output', () => {
        expect(
            $$ObjectWithNullableFields.toJsonString(allNullTargetValue),
        ).toEqual(allNullJsonReference);
        expect(
            $$ObjectWithNullableFields.toJsonString(noNullTargetValue),
        ).toEqual(noNullJsonReference);
    });
    test('Validation', () => {
        const withField = (
            field: keyof ObjectWithNullableFields,
            val: unknown,
        ) => ({
            ...noNullTargetValue,
            [field]: val,
        });
        assertValidation($$ObjectWithNullableFields.validate, {
            good: [
                allNullTargetValue,
                noNullTargetValue,
                withField('int64', -9223372036854775808n),
                withField('int64', null),
            ],
            bad: [
                ...nonObjects,
                {},
                withField('string', undefined),
                withField('string', 1),
                withField('timestamp', '2001-01-01T16:00:00.000Z'),
                withField('timestamp', new Date(NaN)),
                withField('int8', 128),
                withField('int64', 1),
                withField('int64', 9223372036854775808n),
                withField('uint64', -1n),
                withField('enum', 'UNKNOWN'),
                withField('object', {}),
            ],
        });
    });
});

describe('UnionExternal', () => {
    const emptyJsonReference = testFile(
        'ObjectWithOptionalFields_AllUndefined.json',
    );
    const variants: { name: string; value: UnionExternal; file: string }[] = [
        {
            name: 'object',
            value: {
                type: 'object',
                value: { id: '1', content: 'hello world' },
            },
            file: 'UnionExternal_Object.json',
        },
        {
            name: 'array',
            value: { type: 'array', value: ['hello', 'world'] },
            file: 'UnionExternal_Array.json',
        },
        {
            name: 'boolean',
            value: { type: 'boolean', value: true },
            file: 'UnionExternal_Boolean.json',
        },
        {
            name: 'nullable-timestamp',
            value: { type: 'nullable-timestamp', value: testDate },
            file: 'UnionExternal_Timestamp.json',
        },
        {
            name: 'nullable-timestamp (null)',
            value: { type: 'nullable-timestamp', value: null },
            file: 'UnionExternal_TimestampNull.json',
        },
    ];
    for (const variant of variants) {
        describe(`${variant.name} variant`, () => {
            const jsonReference = testFile(variant.file);
            test('JSON Parsing', () => {
                expect(
                    $$UnionExternal.fromJsonString(jsonReference),
                ).toStrictEqual(variant.value);
            });
            test('JSON Output', () => {
                expect($$UnionExternal.toJsonString(variant.value)).toBe(
                    jsonReference,
                );
            });
            test('Validation', () => {
                expect($$UnionExternal.validate(variant.value)).toBe(true);
            });
            test('Cloning', () => {
                const cloned = $$UnionExternal.clone(variant.value);
                expect(cloned).toStrictEqual(variant.value);
            });
        });
    }
    test('JSON parsing falls back to new() when no variant matches', () => {
        expect(
            $$UnionExternal.fromJsonString(emptyJsonReference),
        ).toStrictEqual($$UnionExternal.new());
    });
    test('Cloning is deep', () => {
        const value: UnionExternal = {
            type: 'object',
            value: { id: '1', content: 'hello world' },
        };
        const cloned = $$UnionExternal.clone(value);
        if (cloned.type === 'object') {
            cloned.value.content = 'hello world!!!';
        }
        expect(cloned).not.toStrictEqual(value);
    });
    test('URL query string output is unsupported', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(
            $$UnionExternal.toUrlSearchParamsString({
                type: 'boolean',
                value: true,
            }),
        ).toBe('');
        expect(warn).toHaveBeenCalledOnce();
        warn.mockRestore();
    });
});

describe('UnionInternal', () => {
    const targetValue: UnionInternal = {
        shape: 'rectangle',
        width: 10.7,
        height: 5.3,
    };
    const jsonReference = testFile('UnionInternal_Rectangle.json');
    test('JSON Parsing', () => {
        expect($$UnionInternal.fromJsonString(jsonReference)).toStrictEqual(
            targetValue,
        );
    });
    test('JSON Output', () => {
        expect($$UnionInternal.toJsonString(targetValue)).toBe(jsonReference);
    });
    test('Validation', () => {
        expect($$UnionInternal.validate(targetValue)).toBe(true);
        expect(
            $$UnionInternal.validate({
                shape: 'triangle',
                width: 50,
                height: 25,
            }),
        ).toBe(false);
    });
    test('Cloning', () => {
        const cloned = $$UnionInternal.clone(targetValue);
        expect(cloned).toStrictEqual(targetValue);
        if (cloned.shape === 'rectangle') {
            cloned.width = 100;
        }
        expect(cloned).not.toStrictEqual(targetValue);
    });
    test('JSON parsing falls back to new() for a missing or unknown tag', () => {
        expect($$UnionInternal.fromJsonString('{}')).toStrictEqual(
            $$UnionInternal.new(),
        );
        expect(
            $$UnionInternal.fromJsonString(
                '{"shape":"triangle","width":50,"height":25}',
            ),
        ).toStrictEqual($$UnionInternal.new());
    });
    test('Validation rejects a known tag with invalid fields', () => {
        expect(
            $$UnionInternal.validate({
                shape: 'circle',
                width: 50,
                height: 25,
            }),
        ).toBe(false);
        expect($$UnionInternal.validate({ width: 50, height: 25 })).toBe(false);
    });
    test('URL query string output', () => {
        expect($$UnionInternal.toUrlSearchParamsString(targetValue)).toBe(
            'shape=rectangle&width=10.7&height=5.3',
        );
        expect(
            $$UnionInternal.toUrlSearchParamsString({
                shape: 'circle',
                radius: 2.5,
            }),
        ).toBe('shape=circle&radius=2.5');
    });
});

describe('UnionAdjacent', () => {
    const variants: { name: string; value: UnionAdjacent; file: string }[] = [
        {
            name: 'object',
            value: {
                kind: 'object',
                data: { id: '1', content: 'hello world' },
            },
            file: 'UnionAdjacent_Object.json',
        },
        {
            name: 'nullable-timestamp (null)',
            value: { kind: 'nullable-timestamp', data: null },
            file: 'UnionAdjacent_TimestampNull.json',
        },
    ];
    for (const variant of variants) {
        describe(`${variant.name} variant`, () => {
            const jsonReference = testFile(variant.file);
            test('JSON Parsing', () => {
                expect(
                    $$UnionAdjacent.fromJsonString(jsonReference),
                ).toStrictEqual(variant.value);
            });
            test('JSON Output', () => {
                expect($$UnionAdjacent.toJsonString(variant.value)).toBe(
                    jsonReference,
                );
            });
            test('Validation', () => {
                expect($$UnionAdjacent.validate(variant.value)).toBe(true);
            });
            test('Cloning', () => {
                const cloned = $$UnionAdjacent.clone(variant.value);
                expect(cloned).toStrictEqual(variant.value);
            });
        });
    }
    test('Validation rejects mismatched tag and value', () => {
        expect(
            $$UnionAdjacent.validate({
                kind: 'boolean',
                data: { id: '1', content: 'hello world' },
            }),
        ).toBe(false);
    });
    test('Cloning is deep', () => {
        const value: UnionAdjacent = {
            kind: 'object',
            data: { id: '1', content: 'hello world' },
        };
        const cloned = $$UnionAdjacent.clone(value);
        if (cloned.kind === 'object') {
            cloned.data.content = 'hello world!!!';
        }
        expect(cloned).not.toStrictEqual(value);
    });
    test('JSON parsing falls back to new() for a missing or unknown tag', () => {
        expect($$UnionAdjacent.fromJsonString('{}')).toStrictEqual(
            $$UnionAdjacent.new(),
        );
        expect(
            $$UnionAdjacent.fromJsonString('{"kind":"triangle","data":true}'),
        ).toStrictEqual($$UnionAdjacent.new());
    });
    test('URL query string output is unsupported', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(
            $$UnionAdjacent.toUrlSearchParamsString({
                kind: 'boolean',
                data: true,
            }),
        ).toBe('');
        expect(warn).toHaveBeenCalledOnce();
        warn.mockRestore();
    });
});

describe('RecursiveObject', () => {
    const targetValue: RecursiveObject = {
        left: {
            left: { left: null, right: { left: null, right: null } },
            right: null,
        },
        right: { left: null, right: null },
    };
    const jsonReference = testFile('RecursiveObject.json');
    test('JSON parsing', () => {
        const result = $$RecursiveObject.fromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);
    });
    test('JSON output', () => {
        expect($$RecursiveObject.toJsonString(targetValue)).toEqual(
            jsonReference,
        );
    });
    test('Validation', () => {
        assertValidation($$RecursiveObject.validate, {
            good: [{ left: null, right: null }, targetValue],
            bad: [
                ...nonObjects,
                {},
                { left: null },
                { left: 'hello world', right: null },
                { left: { left: null }, right: null },
                { left: null, right: { left: null, right: 1 } },
            ],
        });
    });
});

describe('HTTP options', () => {
    const client = new ExampleClient({
        baseUrl: 'https://thisdomaindoesnotexist.thisdomaindoesnotexist',
    });
    test('request hooks', async () => {
        let didFireRequest = false;
        let didFireRequestError = false;
        let didFireResponse = false;
        let didFireResponseError = false;
        try {
            await client.books.getBook(
                { bookId: '1' },
                {
                    timeout: 200,
                    onRequest: (_) => {
                        didFireRequest = true;
                    },
                    onRequestError: (_) => {
                        didFireRequestError = true;
                    },
                    onResponse: (_) => {
                        didFireResponse = true;
                    },
                    onResponseError: (_) => {
                        didFireResponseError = false;
                    },
                },
            );
        } catch (_) {
            // do nothing
        }
        expect(didFireRequest).toBe(true);
        expect(didFireRequestError).toBe(true);
        expect(didFireResponse).toBe(false);
        expect(didFireResponseError).toBe(false);
    });
});

describe('misc', () => {
    test('enum type inference', () => {
        const val: Enumerator = Enumerator.Foo;
        const val2 = Enumerator.Bar;
        assertType<Enumerator>(val);
        assertType<Enumerator>(val2);
        assertType<Enumerator>('FOO');
    });
});
