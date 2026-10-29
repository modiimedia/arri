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
        width: 50,
        height: 25,
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
            'shape=rectangle&width=50&height=25',
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
