import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import {
    Book,
    BookFromJsonString,
    BookToJsonString,
    BookToUrlSearchParamsString,
    Enumerator,
    ExampleClient,
    NestedObject,
    NestedObjectFromJsonString,
    NestedObjectToJsonString,
    ObjectWithEveryType,
    ObjectWithEveryTypeFromJsonString,
    ObjectWithEveryTypeNew,
    ObjectWithEveryTypeToJsonString,
    ObjectWithNullableFields,
    ObjectWithNullableFieldsFromJsonString,
    ObjectWithNullableFieldsToJsonString,
    ObjectWithOptionalFields,
    ObjectWithOptionalFieldsFromJsonString,
    ObjectWithOptionalFieldsToJsonString,
    RecursiveObject,
    RecursiveObjectFromJsonString,
    RecursiveObjectToJsonString,
} from './referenceClientMinimal';

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
        const result = BookFromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);
    });
    test('JSON Output', () => {
        expect(BookToJsonString(targetValue)).toEqual(jsonReference);
    });
    test('URL Query String Output', () => {
        expect(BookToUrlSearchParamsString(targetValue)).toEqual(
            `id=1&name=The+Adventures+of+Tom+Sawyer&createdAt=2001-01-01T16%3A00%3A00.000Z&updatedAt=2001-01-01T16%3A00%3A00.000Z`,
        );
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
        expect(NestedObjectFromJsonString(noSpecialCharsJson)).toStrictEqual(
            noSpecialCharsTargetValue,
        );
        expect(NestedObjectFromJsonString(specialCharsJson)).toStrictEqual(
            specialCharsTargetValue,
        );
    });
    test('JSON Output', () => {
        expect(NestedObjectToJsonString(noSpecialCharsTargetValue)).toEqual(
            noSpecialCharsJson,
        );
        expect(NestedObjectToJsonString(specialCharsTargetValue)).toEqual(
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
        discriminator: {
            typeName: 'C',
            id: '',
            name: '',
            date: testDate,
        },
        any: 'hello world',
    };
    const jsonReference = testFile('ObjectWithEveryType.json');
    const emptyJsonReference = testFile(
        'ObjectWithOptionalFields_AllUndefined.json',
    );
    test('JSON parsing', () => {
        const result = ObjectWithEveryTypeFromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);

        const emptyJsonResult =
            ObjectWithEveryTypeFromJsonString(emptyJsonReference);
        expect(emptyJsonResult).toStrictEqual(ObjectWithEveryTypeNew());
    });
    test('JSON output', () => {
        expect(ObjectWithEveryTypeToJsonString(targetValue)).toEqual(
            jsonReference,
        );
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
        discriminator: undefined,
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
        discriminator: {
            typeName: 'C',
            id: '',
            name: '',
            date: testDate,
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
            ObjectWithOptionalFieldsFromJsonString(allUndefinedJson),
        ).toStrictEqual(allUndefinedTargetValue);
        expect(
            ObjectWithOptionalFieldsFromJsonString(noUndefinedJson),
        ).toStrictEqual(noUndefinedTargetValue);
    });
    test('JSON output', () => {
        expect(
            ObjectWithOptionalFieldsToJsonString(allUndefinedTargetValue),
        ).toEqual(allUndefinedJson);
        expect(
            ObjectWithOptionalFieldsToJsonString(noUndefinedTargetValue),
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
        discriminator: null,
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
        discriminator: {
            typeName: 'C',
            id: '',
            name: '',
            date: testDate,
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
            ObjectWithNullableFieldsFromJsonString(allNullJsonReference);
        const noNullResult =
            ObjectWithNullableFieldsFromJsonString(noNullJsonReference);
        expect(allNullResult).toStrictEqual(allNullTargetValue);
        expect(noNullResult).toStrictEqual(noNullTargetValue);
    });
    test('JSON output', () => {
        expect(
            ObjectWithNullableFieldsToJsonString(allNullTargetValue),
        ).toEqual(allNullJsonReference);
        expect(ObjectWithNullableFieldsToJsonString(noNullTargetValue)).toEqual(
            noNullJsonReference,
        );
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
        const result = RecursiveObjectFromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);
    });
    test('JSON output', () => {
        expect(RecursiveObjectToJsonString(targetValue)).toEqual(jsonReference);
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
