import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'pathe';
import prettier from 'prettier';

import {
    ArriHeaders,
    encodeMessage,
    Message,
} from '../../languages/ts/ts-core/src/_index';
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
            width: 10.7,
            height: 5.3,
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
    await writeMessageFixtures(outDir);
}

interface CanonicalMessageFixture {
    name: string;
    description: string;
    message: Message;
}

interface NonCanonicalMessageFixture {
    name: string;
    description: string;
    nonCanonicalInput: string;
    expectedMessage: Message;
}

interface InvalidMessageFixture {
    name: string;
    description: string;
    input: string | Uint8Array;
    recoverableReqId?: string;
}

const utf8 = (input: string) => new TextEncoder().encode(input);

const canonicalMessageFixtures: CanonicalMessageFixture[] = [
    {
        name: 'Invocation',
        description:
            'INVOCATION with every reserved header, custom headers, and a body',
        message: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            reqId: '1',
            contentType: 'application/json',
            accept: 'application/json',
            clientVersion: '1.2.0',
            headers: new ArriHeaders([
                ['authorization', 'Bearer abc123'],
                ['x-tenant-id', 'tenant_1'],
            ]),
            body: utf8('{"id":"12345"}'),
        },
    },
    {
        name: 'Invocation_Minimal',
        description: 'INVOCATION with only an rpc name',
        message: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            headers: new ArriHeaders(),
        },
    },
    {
        name: 'Invocation_NoBody',
        description:
            'INVOCATION for a procedure with a streamed input (the body is omitted)',
        message: {
            type: 'INVOCATION',
            rpcName: 'chat.sendMessages',
            reqId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
            headers: new ArriHeaders(),
        },
    },
    {
        name: 'Invocation_LastMsgId',
        description: 'INVOCATION resuming an output stream',
        message: {
            type: 'INVOCATION',
            rpcName: 'users.watchUser',
            reqId: '2',
            accept: 'application/json',
            lastMsgId: '42',
            headers: new ArriHeaders(),
            body: utf8('{"id":"12345"}'),
        },
    },
    {
        name: 'Invocation_SpecialHeaderValues',
        description:
            'header values containing tabs, colons, and other printable ASCII',
        message: {
            type: 'INVOCATION',
            rpcName: 'sendObject',
            reqId: '3',
            headers: new ArriHeaders([
                ['x-url', 'https://example.com:8080/a?b=c'],
                ['x-tabbed', 'a\tb'],
                ['x-symbols', `~!@#$%^&*()_+-={}[]|\\:";'<>?,./`],
            ]),
            body: utf8('{"id":"1","content":"hello world"}'),
        },
    },
    {
        name: 'Ok',
        description: 'OK with custom headers and a body',
        message: {
            type: 'OK',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders([['x-cache', 'HIT']]),
            body: utf8('{"id":"12345","name":"John Doe"}'),
        },
    },
    {
        name: 'Ok_NoBody',
        description: 'OK for a procedure without a response',
        message: {
            type: 'OK',
            reqId: '1',
            headers: new ArriHeaders(),
        },
    },
    {
        name: 'Error',
        description: 'ERROR with a typed error body',
        message: {
            type: 'ERROR',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders(),
            body: utf8(
                '{"code":"NOT_FOUND","message":"User not found","type":"USER_NOT_FOUND","data":{"userId":"12345"}}',
            ),
        },
    },
    {
        name: 'Error_ConnectionLevel',
        description: 'ERROR without a req-id (connection-level error)',
        message: {
            type: 'ERROR',
            headers: new ArriHeaders(),
            body: utf8(
                '{"code":"PROTOCOL_ERROR","message":"Invalid message. Missing empty line after headers."}',
            ),
        },
    },
    {
        name: 'StreamStart',
        description: 'STREAM_START with a content type and custom headers',
        message: {
            type: 'STREAM_START',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders([['x-stream-name', 'users']]),
        },
    },
    {
        name: 'StreamData',
        description: 'STREAM_DATA with a msg-id',
        message: {
            type: 'STREAM_DATA',
            reqId: '1',
            msgId: '1',
            body: utf8('{"id":"12345","name":"John Doe"}'),
        },
    },
    {
        name: 'StreamData_BodyWithEmptyLines',
        description:
            'STREAM_DATA whose body contains "\\n\\n" (only the first "\\n\\n" ends the head)',
        message: {
            type: 'STREAM_DATA',
            reqId: '1',
            body: utf8('line one\n\nline two\n\n'),
        },
    },
    {
        name: 'StreamData_BinaryBody',
        description:
            'STREAM_DATA whose body is arbitrary bytes (null bytes, invalid UTF-8, "\\n\\n", "\\r\\n")',
        message: {
            type: 'STREAM_DATA',
            reqId: '1',
            body: new Uint8Array([
                0x00, 0xff, 0xfe, 0x0a, 0x0a, 0x0d, 0x0a, 0x80, 0x7f, 0x00,
            ]),
        },
    },
    {
        name: 'StreamEnd',
        description: 'STREAM_END with a reason',
        message: {
            type: 'STREAM_END',
            reqId: '1',
            reason: 'no more events',
        },
    },
    {
        name: 'StreamEnd_NoReason',
        description: 'STREAM_END with only a req-id',
        message: {
            type: 'STREAM_END',
            reqId: '1',
        },
    },
    {
        name: 'Cancel',
        description: 'CANCEL with a reason',
        message: {
            type: 'CANCEL',
            reqId: '1',
            reason: 'user navigated away',
        },
    },
    {
        name: 'ConnectionStart',
        description: 'CONNECTION_START with a heartbeat interval',
        message: {
            type: 'CONNECTION_START',
            heartbeatInterval: 20000,
        },
    },
    {
        name: 'Heartbeat',
        description: 'HEARTBEAT with a heartbeat interval',
        message: {
            type: 'HEARTBEAT',
            heartbeatInterval: 20000,
        },
    },
    {
        name: 'Heartbeat_NoInterval',
        description: 'HEARTBEAT without any headers',
        message: {
            type: 'HEARTBEAT',
        },
    },
    {
        name: 'GoAway',
        description: 'GOAWAY with a reason',
        message: {
            type: 'GOAWAY',
            reason: 'server restarting',
        },
    },
];

const nonCanonicalMessageFixtures: NonCanonicalMessageFixture[] = [
    {
        name: 'Invocation_MixedCaseHeaders',
        description:
            'header keys are case-insensitive and normalized to lowercase',
        nonCanonicalInput:
            'ARRIRPC/0 INVOCATION users.getUser\nReq-Id: 1\nContent-Type: application/json\nX-Tenant-ID: tenant_1\n\n{"id":"12345"}',
        expectedMessage: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders([['x-tenant-id', 'tenant_1']]),
            body: utf8('{"id":"12345"}'),
        },
    },
    {
        name: 'Invocation_UntrimmedHeaderValues',
        description:
            'leading/trailing spaces and tabs are trimmed from header values, and the space after ":" is optional',
        nonCanonicalInput:
            'ARRIRPC/0 INVOCATION users.getUser\nreq-id:1\naccept: \t application/json\t \nx-foo:\tbar baz  \n\n',
        expectedMessage: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            reqId: '1',
            accept: 'application/json',
            headers: new ArriHeaders([['x-foo', 'bar baz']]),
        },
    },
    {
        name: 'Invocation_HeaderOrder',
        description: 'reserved and custom headers may appear in any order',
        nonCanonicalInput:
            'ARRIRPC/0 INVOCATION users.getUser\nx-foo: 1\ncontent-type: application/json\nx-bar: 2\nreq-id: 1\n\n{"id":"12345"}',
        expectedMessage: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders([
                ['x-foo', '1'],
                ['x-bar', '2'],
            ]),
            body: utf8('{"id":"12345"}'),
        },
    },
    {
        name: 'Invocation_BindingHeaders',
        description: 'headers starting with "arri-" are ignored',
        nonCanonicalInput:
            'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\narri-connection-id: abc123\nArri-Foo: bar\n\n',
        expectedMessage: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            reqId: '1',
            headers: new ArriHeaders(),
        },
    },
    {
        name: 'StreamEnd_IgnoredHeaders',
        description:
            'reserved headers that do not apply to the message type, and custom headers on message types without custom headers, are ignored',
        nonCanonicalInput:
            'ARRIRPC/0 STREAM_END\nreq-id: 1\ncontent-type: application/json\nmsg-id: 5\nx-foo: bar\n\n',
        expectedMessage: {
            type: 'STREAM_END',
            reqId: '1',
        },
    },
];

const invalidMessageFixtures: InvalidMessageFixture[] = [
    {
        name: 'Empty',
        description: 'empty input',
        input: '',
    },
    {
        name: 'MissingHeadEnd',
        description: 'no empty line after the headers',
        input: 'ARRIRPC/0 OK\nreq-id: 1\n',
        recoverableReqId: '1',
    },
    {
        name: 'CrlfLineEndings',
        description: '"\\r\\n" line endings are not supported',
        input: 'ARRIRPC/0 OK\r\nreq-id: 1\r\n\n',
    },
    {
        name: 'NonAsciiHeaderValue',
        description: 'header values must be ASCII',
        input: 'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\nx-name: café\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'ControlCharacterInHead',
        description:
            'the head may not contain control characters other than tab and line feed',
        input: 'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\nx-foo: a\x00b\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'WrongPrefix',
        description: 'first line does not start with "ARRIRPC/"',
        input: 'HTTP/1.1 OK\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'UnsupportedVersion',
        description: 'unsupported protocol version',
        input: 'ARRIRPC/1 OK\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'LowercaseMessageType',
        description: 'message types are case-sensitive',
        input: 'ARRIRPC/0 ok\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'UnknownMessageType',
        description: 'unknown message type',
        input: 'ARRIRPC/0 FOO\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'MissingMessageType',
        description: 'first line has no message type',
        input: 'ARRIRPC/0\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'EmptyFirstLine',
        description: 'message starts with an empty line',
        input: '\nARRIRPC/0 OK\n\n',
    },
    {
        name: 'Invocation_MissingRpcName',
        description: 'INVOCATION without an rpc name',
        input: 'ARRIRPC/0 INVOCATION\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'Invocation_ExtraTokens',
        description: 'INVOCATION with more than one rpc name',
        input: 'ARRIRPC/0 INVOCATION users.getUser extra\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'Ok_ExtraTokens',
        description: 'only INVOCATION may have content after the message type',
        input: 'ARRIRPC/0 OK users.getUser\nreq-id: 1\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'DuplicateHeader',
        description: 'header keys may only appear once (case-insensitive)',
        input: 'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\nX-Foo: 1\nx-foo: 2\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'HeaderMissingColon',
        description: 'header line without a ":"',
        input: 'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\nx-foo\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'HeaderEmptyKey',
        description: 'header line with an empty key',
        input: 'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\n: foo\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'HeaderInvalidKey',
        description: 'header keys must be HTTP token characters',
        input: 'ARRIRPC/0 INVOCATION users.getUser\nreq-id: 1\nx foo: bar\n\n',
        recoverableReqId: '1',
    },
    {
        name: 'ReqIdWithSpace',
        description: 'req-id must be visible ASCII (no spaces)',
        input: 'ARRIRPC/0 OK\nreq-id: a b\n\n',
    },
    {
        name: 'ReqIdEmpty',
        description: 'req-id must not be empty',
        input: 'ARRIRPC/0 OK\nreq-id: \n\n',
    },
    {
        name: 'ReqIdTooLong',
        description: 'req-id must be at most 128 characters',
        input: `ARRIRPC/0 OK\nreq-id: ${'a'.repeat(129)}\n\n`,
    },
    {
        name: 'HeartbeatIntervalNotANumber',
        description: 'heartbeat-interval must be a non-negative integer',
        input: 'ARRIRPC/0 HEARTBEAT\nheartbeat-interval: abc\n\n',
    },
    {
        name: 'HeartbeatIntervalNegative',
        description: 'heartbeat-interval must be a non-negative integer',
        input: 'ARRIRPC/0 HEARTBEAT\nheartbeat-interval: -1\n\n',
    },
    {
        name: 'HeartbeatIntervalDecimal',
        description: 'heartbeat-interval must be a non-negative integer',
        input: 'ARRIRPC/0 HEARTBEAT\nheartbeat-interval: 1.5\n\n',
    },
];

function messageToManifestJson(msg: Message): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(msg)) {
        if (value === undefined) continue;
        if (value instanceof ArriHeaders) {
            result[key] = [...value];
            continue;
        }
        if (value instanceof Uint8Array) {
            if (value.length === 0) continue;
            try {
                result.body = new TextDecoder('utf-8', { fatal: true }).decode(
                    value,
                );
            } catch {
                result.bodyBase64 = Buffer.from(value).toString('base64');
            }
            continue;
        }
        result[key] = value;
    }
    return result;
}

function toBytes(input: string | Uint8Array): Uint8Array {
    return typeof input === 'string' ? utf8(input) : input;
}

function toReadableEscapedText(bytes: Uint8Array): string {
    let result = '';
    for (const byte of bytes) {
        if (byte === 0x0a) {
            result += '\\n\n';
        } else if (byte === 0x09) {
            result += '\\t';
        } else if (byte === 0x5c) {
            result += '\\\\';
        } else if (byte >= 0x20 && byte <= 0x7e) {
            result += String.fromCharCode(byte);
        } else {
            result += `\\x${byte.toString(16).padStart(2, '0')}`;
        }
    }
    return result;
}

async function writeMessageFixtures(outDir: string) {
    const msgDir = path.resolve(outDir, 'messages');
    mkdirSync(msgDir);
    const manifest = {
        description:
            'Arri RPC message fixtures. See /specifications/arri_rpc.md and the README.md in this directory.',
        valid: [] as Record<string, unknown>[],
        invalid: [] as Record<string, unknown>[],
    };
    const mdParts: string[] = [
        '# Arri RPC Message Fixtures',
        '',
        'Test fixtures for the [Arri RPC message format](/specifications/arri_rpc.md). Every implementation should be tested against these files.',
        '',
        '`Messages.json` (in the parent directory) lists every fixture:',
        '',
        '- `valid`: messages that must parse successfully into `message`.',
        '  - When `canonical` is `true`, encoding `message` must produce the fixture file byte-for-byte.',
        '  - Headers are `[key, value]` pairs since header order is significant when encoding. Canonical order is `req-id` followed by the remaining reserved headers in the order they are listed in the spec, followed by custom headers in insertion order.',
        '  - UTF-8 bodies are stored in `body`. Other bodies are base64 encoded in `bodyBase64`.',
        '- `invalid`: messages that must fail to parse. When `reqId` is present, the parser must still recover that `req-id` so the receiver can respond with an `ERROR` for that call.',
        '',
        'The `.arrimsg` files are raw bytes. Do not let editors or git change their line endings.',
        '',
        'Below is a readable version of each file. Line feeds are shown as `\\n` followed by a line break, tabs as `\\t`, and other non-printable bytes as `\\xNN`.',
        '',
    ];
    const addFile = (
        name: string,
        description: string,
        bytes: Uint8Array,
    ): string => {
        const filename = `${name}.arrimsg`;
        writeFileSync(path.resolve(msgDir, filename), bytes);
        mdParts.push(`## ${filename}

${description}

\`\`\`txt
${toReadableEscapedText(bytes)}
\`\`\`
`);
        return `messages/${filename}`;
    };

    for (const fixture of canonicalMessageFixtures) {
        const file = addFile(
            fixture.name,
            fixture.description,
            encodeMessage(fixture.message),
        );
        manifest.valid.push({
            name: fixture.name,
            description: fixture.description,
            file,
            canonical: true,
            message: messageToManifestJson(fixture.message),
        });
    }
    for (const fixture of nonCanonicalMessageFixtures) {
        const file = addFile(
            fixture.name,
            fixture.description,
            toBytes(fixture.nonCanonicalInput),
        );
        manifest.valid.push({
            name: fixture.name,
            description: fixture.description,
            file,
            canonical: false,
            message: messageToManifestJson(fixture.expectedMessage),
        });
    }
    for (const fixture of invalidMessageFixtures) {
        const file = addFile(
            `Invalid_${fixture.name}`,
            fixture.description,
            toBytes(fixture.input),
        );
        const entry: Record<string, unknown> = {
            name: fixture.name,
            description: fixture.description,
            file,
        };
        if (fixture.recoverableReqId !== undefined) {
            entry.reqId = fixture.recoverableReqId;
        }
        manifest.invalid.push(entry);
    }

    writeFileSync(
        path.resolve(outDir, 'Messages.json'),
        await prettier.format(JSON.stringify(manifest), {
            parser: 'json',
            tabWidth: 2,
            endOfLine: 'lf',
        }),
    );
    writeFileSync(
        path.resolve(msgDir, 'README.md'),
        await prettier.format(mdParts.join('\n'), {
            tabWidth: 2,
            endOfLine: 'lf',
            parser: 'markdown',
        }),
    );
}

void main();
