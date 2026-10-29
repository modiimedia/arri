import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'pathe';
import prettier from 'prettier';

import { a } from '../../languages/ts/ts-schema/src/_index';
import {
    createAppDefinition,
    SchemaFormDiscriminator,
} from '../../tooling/codegen-utils/src';

const Enumerator = a.enumerator(['FOO', 'BAR', 'BAZ'], { id: 'Enumerator' });
type Enumerator = a.infer<typeof Enumerator>;

const NestedObject = a.object(
    {
        id: a.string(),
        content: a.string(),
    },
    { id: 'NestedObject' },
);
type NestedObject = a.infer<typeof NestedObject>;

const LegacyDiscriminator: SchemaFormDiscriminator = {
    discriminator: 'typeName',
    mapping: {
        A: { properties: { id: { type: 'string' } } },
        B: { properties: { id: { type: 'string' }, name: { type: 'string' } } },
        C: {
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                date: { type: 'timestamp' },
            },
        },
    },
    metadata: {
        id: 'LegacyDiscriminator',
    },
};

// UnionExternal and UnionAdjacent share the same variants so the same data can be compared across tagging formats
const unionVariants = {
    object: NestedObject,
    array: a.array(a.string()),
    boolean: a.boolean(),
    'nullable-timestamp': a.nullable(a.timestamp()),
};
const UnionExternal = a.union('UnionExternal', unionVariants);
type UnionExternal = a.infer<typeof UnionExternal>;
const UnionAdjacent = a.union('UnionAdjacent', unionVariants, {
    tagKey: 'kind',
    valueKey: 'data',
});
type UnionAdjacent = a.infer<typeof UnionAdjacent>;
// internally tagged unions require every variant to be an object
const UnionInternal = a.union(
    'UnionInternal',
    {
        rectangle: a.object({
            width: a.float64(),
            height: a.float64(),
        }),
        circle: a.object({
            radius: a.float64(),
        }),
    },
    { tagKey: 'shape' },
);
type UnionInternal = a.infer<typeof UnionInternal>;

const EmptyObject = a.object({});

const ObjectWithEveryType = a.object(
    {
        string: a.string(),
        boolean: a.boolean(),
        timestamp: a.timestamp(),
        float32: a.float32(),
        float64: a.float64(),
        int8: a.int8(),
        uint8: a.uint8(),
        int16: a.int16(),
        uint16: a.uint16(),
        int32: a.int32(),
        uint32: a.uint32(),
        int64: a.int64(),
        uint64: a.uint64(),
        enum: Enumerator,
        object: NestedObject,
        array: a.array(a.boolean()),
        record: a.record(a.boolean()),
        unionExternal: UnionExternal,
        unionInternal: UnionInternal,
        unionAdjacent: UnionAdjacent,
        any: a.any(),
    },
    {
        id: 'ObjectWithEveryType',
    },
);
type ObjectWithEveryType = a.infer<typeof ObjectWithEveryType>;

const ObjectWithOptionalFields = a.partial(ObjectWithEveryType, {
    id: 'ObjectWithOptionalFields',
});
type ObjectWithOptionalFields = a.infer<typeof ObjectWithOptionalFields>;

const ObjectWithNullableFields = a.object(
    {
        string: a.nullable(a.string()),
        boolean: a.nullable(a.boolean()),
        timestamp: a.nullable(a.timestamp()),
        float32: a.nullable(a.float32()),
        float64: a.nullable(a.float64()),
        int8: a.nullable(a.int8()),
        uint8: a.nullable(a.uint8()),
        int16: a.nullable(a.int16()),
        uint16: a.nullable(a.uint16()),
        int32: a.nullable(a.int32()),
        uint32: a.nullable(a.uint32()),
        int64: a.nullable(a.int64()),
        uint64: a.nullable(a.uint64()),
        enum: a.nullable(Enumerator),
        object: a.nullable(NestedObject),
        array: a.nullable(a.array(a.boolean())),
        record: a.nullable(a.record(a.boolean())),
        unionExternal: a.nullable(UnionExternal),
        unionInternal: a.nullable(UnionInternal),
        unionAdjacent: a.nullable(UnionAdjacent),
        any: a.nullable(a.any()),
    },
    {
        id: 'ObjectWithNullableFields',
    },
);
type ObjectWithNullableFields = a.infer<typeof ObjectWithNullableFields>;

interface RecursiveObject {
    left: RecursiveObject | null;
    right: RecursiveObject | null;
}
const RecursiveObject = a.recursive<RecursiveObject>(
    (self) =>
        a.object({
            left: a.nullable(self),
            right: a.nullable(self),
        }),
    { id: 'RecursiveObject' },
);

const Book = a.object(
    {
        id: a.string({ description: 'The book ID' }),
        name: a.string({ description: 'The book title' }),
        createdAt: a.timestamp({
            description: 'When the book was created',
            isDeprecated: true,
        }),
        updatedAt: a.timestamp({ isDeprecated: true }),
    },
    { id: 'Book', description: 'This is a book' },
);
type Book = a.infer<typeof Book>;

const BookParams = a.object(
    {
        bookId: a.string(),
    },
    { id: 'BookParams' },
);
type BookParams = a.infer<typeof BookParams>;

const def = createAppDefinition({
    info: {
        version: '20',
    },
    procedures: {
        sendObject: {
            path: '/send-object',
            transport: 'http',
            method: 'post',
            params: NestedObject,
            response: NestedObject,
        },
        'books.getBook': {
            path: '/books/get-book',
            transport: 'http',
            method: 'get',
            params: BookParams,
            response: Book,
            description: 'Get a book',
        },
        'books.createBook': {
            path: '/books/create-book',
            transport: 'http',
            method: 'post',
            params: Book,
            response: Book,
            description: 'Create a book',
            isDeprecated: true,
        },
        'books.watchBook': {
            path: '/books/watch-book',
            transport: 'http',
            method: 'get',
            params: BookParams,
            response: Book,
            isEventStream: true,
            isDeprecated: true,
        },
        'books.createConnection': {
            path: '/books/create-connection',
            transport: 'ws',
            params: BookParams,
            response: Book,
        },
    },
    definitions: {
        EmptyObject,
        Book,
        BookParams,
        NestedObject,
        ObjectWithEveryType,
        ObjectWithOptionalFields,
        ObjectWithNullableFields,
        UnionExternal,
        UnionInternal,
        UnionAdjacent,
        RecursiveObject,
        LegacyDiscriminator,
    },
});

async function main() {
    const outDir = path.resolve(__dirname, '../../tests/test-files');
    if (existsSync(outDir)) {
        rmSync(outDir, { recursive: true, force: true });
    }
    mkdirSync(outDir);
    writeFileSync(
        path.resolve(outDir, `AppDefinition.json`),
        await prettier.format(JSON.stringify(def), {
            parser: 'json',
            tabWidth: 2,
            endOfLine: 'lf',
        }),
    );
    const files: { filename: string; content: string }[] = [];

    const targetDate = new Date('01/01/2001 10:00 AM CST');

    files.push({
        filename: 'EmptyObject.json',
        content: a.serializeUnsafe(EmptyObject, {}),
    });

    const book: Book = {
        id: '1',
        name: 'The Adventures of Tom Sawyer',
        createdAt: targetDate,
        updatedAt: targetDate,
    };
    files.push({
        filename: 'Book.json',
        content: a.serializeUnsafe(Book, book),
    });

    const bookParams: BookParams = {
        bookId: '1',
    };
    files.push({
        filename: 'BookParams.json',
        content: a.serializeUnsafe(BookParams, bookParams),
    });

    const nestedObject: NestedObject = {
        id: '1',
        content: 'hello world',
    };
    files.push({
        filename: `NestedObject_NoSpecialChars.json`,
        content: a.serializeUnsafe(NestedObject, nestedObject),
    });

    const nestedObjectWithSpecialChars: NestedObject = {
        id: '1',
        content:
            'double-quote: " | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000',
    };
    files.push({
        filename: 'NestedObject_SpecialChars.json',
        content: a.serializeUnsafe(NestedObject, nestedObjectWithSpecialChars),
    });

    const objectWithEveryFieldValue: ObjectWithEveryType = {
        string: '',
        boolean: false,
        timestamp: targetDate,
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
            array: ['hello', 'world'],
        },
        unionInternal: {
            shape: 'circle',
            radius: 2.5,
        },
        unionAdjacent: {
            kind: 'nullable-timestamp',
            data: targetDate,
        },
        any: 'hello world',
    };
    files.push({
        filename: 'ObjectWithEveryType.json',
        content: a.serializeUnsafe(
            ObjectWithEveryType,
            objectWithEveryFieldValue,
        ),
    });
    objectWithEveryFieldValue.record = { B: false, A: true };
    files.push({
        filename: 'ObjectWithEveryType_ReversedRecord.json',
        content: a.serializeUnsafe(
            ObjectWithEveryType,
            objectWithEveryFieldValue,
        ),
    });
    const objectWithOptionalFieldsAllUndefined: ObjectWithOptionalFields = {};
    files.push({
        filename: 'ObjectWithOptionalFields_AllUndefined.json',
        content: a.serializeUnsafe(
            ObjectWithOptionalFields,
            objectWithOptionalFieldsAllUndefined,
        ),
    });
    const objectWithOptionalFieldsNoUndefined: ObjectWithOptionalFields = {
        ...objectWithEveryFieldValue,
        record: { A: true, B: false },
    };
    files.push({
        filename: 'ObjectWithOptionalFields_NoUndefined.json',
        content: a.serializeUnsafe(
            ObjectWithOptionalFields,
            objectWithOptionalFieldsNoUndefined,
        ),
    });
    objectWithOptionalFieldsNoUndefined.record = {
        B: false,
        A: true,
    };
    files.push({
        filename: 'ObjectWithOptionalFields_NoUndefined_ReversedRecord.json',
        content: a.serializeUnsafe(
            ObjectWithOptionalFields,
            objectWithOptionalFieldsNoUndefined,
        ),
    });
    const objectWithNullableFieldsAllNull: ObjectWithNullableFields = {
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
    files.push({
        filename: `ObjectWithNullableFields_AllNull.json`,
        content: a.serializeUnsafe(
            ObjectWithNullableFields,
            objectWithNullableFieldsAllNull,
        ),
    });
    const objectWithNullableFieldsNoNull: ObjectWithNullableFields = {
        string: '',
        boolean: true,
        timestamp: targetDate,
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
            array: ['hello', 'world'],
        },
        unionInternal: {
            shape: 'circle',
            radius: 2.5,
        },
        unionAdjacent: {
            kind: 'boolean',
            data: true,
        },
        any: {
            message: 'hello world',
        },
    };
    files.push({
        filename: 'ObjectWithNullableFields_NoNull.json',
        content: a.serializeUnsafe(
            ObjectWithNullableFields,
            objectWithNullableFieldsNoNull,
        ),
    });
    objectWithNullableFieldsNoNull.record = {
        B: false,
        A: true,
    };
    files.push({
        filename: 'ObjectWithNullableFields_NoNull_ReversedRecord.json',
        content: a.serializeUnsafe(
            ObjectWithNullableFields,
            objectWithNullableFieldsNoNull,
        ),
    });
    // top level unions use different variants than the nested ones in ObjectWithEveryType, etc.
    files.push({
        filename: 'UnionExternal_Object.json',
        content: a.serializeUnsafe(UnionExternal, { object: nestedObject }),
    });
    files.push({
        filename: 'UnionExternal_Boolean.json',
        content: a.serializeUnsafe(UnionExternal, { boolean: true }),
    });
    files.push({
        filename: 'UnionExternal_Array.json',
        content: a.serializeUnsafe(UnionExternal, {
            array: ['hello', 'world'],
        }),
    });
    files.push({
        filename: 'UnionExternal_Timestamp.json',
        content: a.serializeUnsafe(UnionExternal, {
            'nullable-timestamp': targetDate,
        }),
    });
    files.push({
        filename: 'UnionExternal_TimestampNull.json',
        content: a.serializeUnsafe(UnionExternal, {
            'nullable-timestamp': null,
        }),
    });
    files.push({
        filename: 'UnionInternal_Rectangle.json',
        content: a.serializeUnsafe(UnionInternal, {
            shape: 'rectangle',
            width: 50,
            height: 25,
        }),
    });
    files.push({
        filename: 'UnionAdjacent_Object.json',
        content: a.serializeUnsafe(UnionAdjacent, {
            kind: 'object',
            data: nestedObject,
        }),
    });
    files.push({
        filename: 'UnionAdjacent_TimestampNull.json',
        content: a.serializeUnsafe(UnionAdjacent, {
            kind: 'nullable-timestamp',
            data: null,
        }),
    });

    const recursiveObject: RecursiveObject = {
        left: {
            left: {
                left: null,
                right: {
                    left: null,
                    right: null,
                },
            },
            right: null,
        },
        right: {
            left: null,
            right: null,
        },
    };
    files.push({
        filename: 'RecursiveObject.json',
        content: a.serializeUnsafe(RecursiveObject, recursiveObject),
    });

    const legacyDiscriminatorSerialized = `{"typeName":"C","id":"1","name":"John Doe","date":"${targetDate.toISOString()}"}`;
    files.push({
        filename: 'LegacyDiscriminator.json',
        content: legacyDiscriminatorSerialized,
    });

    const mdParts: string[] = [
        'Below are all of the contents of the test JSON files in an easier to read format. Since all of the test files are minified.',
        '',
    ];
    for (const file of files) {
        writeFileSync(path.resolve(outDir, file.filename), file.content);
        mdParts.push(`## ${file.filename}
\`\`\`json
${file.content}
\`\`\`
`);
    }
    writeFileSync(
        path.resolve(outDir, 'README.md'),
        await prettier.format(mdParts.join('\n'), {
            tabWidth: 2,
            endOfLine: 'lf',
            parser: 'markdown',
        }),
    );
}

void main();
