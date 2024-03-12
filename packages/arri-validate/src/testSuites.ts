/* eslint-disable @typescript-eslint/no-loss-of-precision */
import { a } from "./_index";
import { type ASchema } from "./schemas";

const User = a.object({
    id: a.string(),
    photo: a.optional(
        a.object({
            url: a.string(),
            width: a.nullable(a.int32()),
            height: a.nullable(a.int32()),
        }),
    ),
});

const PostComment = a.discriminator("commentType", {
    TEXT: a.object({
        userId: a.string(),
        user: User,
        text: a.string(),
    }),
    IMAGE: a.object({
        userId: a.string(),
        user: User,
        imageUrl: a.string(),
    }),
    VIDEO: a.object({
        userId: a.string(),
        user: User,
        videoUrl: a.string(),
    }),
});

const Post = a.object({
    id: a.string(),
    isFeatured: a.boolean(),
    userId: a.string(),
    user: User,
    type: a.stringEnum(["text", "image", "video"]),
    title: a.string(),
    content: a.string(),
    tags: a.optional(a.array(a.string())),
    createdAt: a.timestamp(),
    updatedAt: a.timestamp(),
    numComments: a.uint32(),
    numLikes: a.int32(),
    unknownField: a.any(),
    comments: a.array(PostComment),
    numArray: a.array(a.number()),
    stringArray: a.array(a.string()),
    metadata: a.record(
        a.object({
            key: a.string(),
            createdAt: a.timestamp(),
        }),
    ),
});

type Post = a.infer<typeof Post>;

export const validationTestSuites: Record<
    string,
    {
        schema: ASchema;
        goodInputs: any[];
        badInputs: any[];
    }
> = {
    any: {
        schema: a.any(),
        goodInputs: [
            "hello world",
            true,
            false,
            1,
            1.5,
            -100.5,
            [1, 2],
            { a: { b: { c: "" } } },
        ],
        badInputs: [],
    },
    string: {
        schema: a.string(),
        goodInputs: [
            "hello world",
            `Hello "world"`,
            `Hello\nworld`,
            `Hello\tworld`,
        ],
        badInputs: [1, false, null, {}],
    },
    "nullable string": {
        schema: a.nullable(a.string()),
        goodInputs: ["hello world", null],
        badInputs: [1, false, ["foo", "bar"], { foo: "foo" }],
    },
    boolean: {
        schema: a.boolean(),
        goodInputs: [true, false],
        badInputs: [null, "hello world", {}, [true, false]],
    },
    "nullable boolean": {
        schema: a.nullable(a.boolean()),
        goodInputs: [true, false, null],
        badInputs: ["hello world", {}, [true, false, null]],
    },
    float64: {
        schema: a.float64(),
        goodInputs: [131431.4134, -141341.1341],
        badInputs: ["hello world", true, null],
    },
    "nullable float64": {
        schema: a.nullable(a.float64()),
        goodInputs: [null, 113511.5, -1351351.05],
        badInputs: ["hello world", true],
    },
    float32: {
        schema: a.float64(),
        goodInputs: [1491.13941, -134918.134],
        badInputs: ["hello world", true, null],
    },
    "nullable float32": {
        schema: a.nullable(a.float32()),
        goodInputs: [1351.5, -1151.315, null],
        badInputs: ["hello world", true],
    },
    int64: {
        schema: a.int64(),
        goodInputs: [
            BigInt("1"),
            BigInt("9223372036854775807"),
            BigInt("-9223372036854775808"),
        ],
        badInputs: [
            BigInt("9223372036854775808"),
            BigInt("-9223372036854775809"),
            null,
            {},
        ],
    },
    int32: {
        schema: a.int32(),
        goodInputs: [491451, -13411],
        badInputs: [
            999999999999999999,
            -9999999999999999999,
            199.5,
            "hello world",
        ],
    },
    uint32: {
        schema: a.uint32(),
        goodInputs: [4815141, 100],
        badInputs: [-1, 100.5, 13999999999999999999999, "hello world"],
    },
    int16: {
        schema: a.int16(),
        goodInputs: [-32768, 32767],
        badInputs: ["hello world", null, {}, [], -32769, 32768, 1.5],
    },
    uint16: {
        schema: a.uint16(),
        goodInputs: [0, 65535],
        badInputs: ["hello world", null, {}, [], -1, 65536, 1.5],
    },
    "nullable int16": {
        schema: a.nullable(a.int16()),
        goodInputs: [null, -32768, 32767],
        badInputs: [undefined, "hello world", 1.5],
    },
    int8: {
        schema: a.int8(),
        goodInputs: [-128, 127],
        badInputs: [null, -129, 128, "hello world"],
    },
    uint8: {
        schema: a.uint8(),
        goodInputs: [0, 255],
        badInputs: [null, -1, 1.5, 256, "hello world"],
    },
    "nullable uint8": {
        schema: a.nullable(a.uint8()),
        goodInputs: [0, 255, null],
        badInputs: [undefined, -1, 1.5, "hello world"],
    },
    enum: {
        schema: a.stringEnum(["A", "B", "C"]),
        goodInputs: ["A", "B", "C"],
        badInputs: ["a", "b", "c", "hello world", null, false, true, {}, []],
    },
    "nullable enum": {
        schema: a.nullable(a.stringEnum(["A", "B", "C"])),
        goodInputs: ["A", "B", "C", null],
        badInputs: ["a", false, true, ["A", null]],
    },
    timestamp: {
        schema: a.timestamp(),
        goodInputs: [new Date()],
        badInputs: [null, true, false, {}, "hello world"],
    },
    "nullable timestamp": {
        schema: a.nullable(a.timestamp()),
        goodInputs: [new Date(), null],
        badInputs: [true, false, {}, [], "hello world"],
    },
    "simple object": {
        schema: a.object({
            id: a.string(),
            createdAt: a.timestamp(),
            count: a.int32(),
            isActive: a.boolean(),
        }),
        goodInputs: [
            { id: "", createdAt: new Date(), count: 1, isActive: false },
        ],
        badInputs: [
            { id: "", createdAt: null, count: 1, isActive: true },
            "hello world",
            null,
            [],
        ],
    },
    "nullable object": {
        schema: a.nullable(
            a.object({
                id: a.string(),
                createdAt: a.timestamp(),
            }),
        ),
        goodInputs: [{ id: "", createdAt: new Date() }, null],
        badInputs: [true, false, { id: null, createdAt: null }],
    },
    "complex object": {
        schema: Post,
        goodInputs: [
            {
                id: "1",
                isFeatured: false,
                userId: "1234",
                user: {
                    id: "2",
                    photo: {
                        url: "https://source.unsplash.com",
                        width: null,
                        height: null,
                    },
                },
                type: "text",
                title: "Hello World",
                content: "Hello World",
                tags: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
                numComments: 134,
                numLikes: 1351351,
                unknownField: {
                    blah: "blah",
                    blahBlah: {
                        blahBlahBlah: null,
                    },
                },
                comments: [
                    {
                        commentType: "TEXT",
                        userId: "2",
                        user: {
                            id: "2",
                            photo: undefined,
                        },
                        text: "You suck",
                    },
                    {
                        commentType: "IMAGE",
                        userId: "3",
                        user: {
                            id: "3",
                            photo: undefined,
                        },
                        imageUrl: "",
                    },
                ],
                numArray: [1, 2, 3],
                stringArray: ["a", "b", "c"],
                metadata: {
                    hello: {
                        key: "name",
                        createdAt: new Date(),
                    },
                    world: {
                        key: "name",
                        createdAt: new Date(),
                    },
                },
            },
        ] satisfies Post[],
        badInputs: [
            {
                id: "1",
                isFeatured: false,
                userId: "1234",
                user: {
                    id: "2",
                    photo: {
                        url: "https://source.unsplash.com",
                        width: null,
                        height: null,
                    },
                },
                type: "text",
                title: "Hello World",
                content: "Hello World",
                tags: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
                numComments: 134,
                numLikes: 1351351,
                unknownField: {
                    blah: "blah",
                    blahBlah: {
                        blahBlahBlah: null,
                    },
                },
                comments: [
                    {
                        commentType: "TEXT",
                        userId: "2",
                        user: {
                            id: "2",
                            photo: undefined,
                        },
                        text: "You suck",
                    },
                    {
                        commentType: "IMAGE",
                        userId: "3",
                        user: {
                            id: "3",
                            photo: undefined,
                        },
                        imageUrl: "",
                    },
                ],
                numArray: [1, 2, 3],
                stringArray: ["a", "b", 0],
                metadata: {
                    hello: {
                        key: "name",
                        createdAt: new Date(),
                    },
                    world: {
                        key: "name",
                        createdAt: new Date(),
                    },
                },
            },
        ],
    },
    "object with nullable fields": {
        schema: a.object(
            {
                id: a.nullable(a.string()),
                createdAt: a.nullable(a.timestamp()),
                count: a.nullable(a.number()),
                isActive: a.nullable(a.boolean()),
                tags: a.nullable(a.array(a.string())),
                metadata: a.nullable(a.record(a.string())),
                unknown: a.nullable(a.any()),
            },
            {
                id: "logserializer",
            },
        ),
        goodInputs: [
            {
                id: null,
                createdAt: null,
                count: null,
                isActive: null,
                tags: null,
                metadata: null,
                unknown: null,
            },
            {
                id: "",
                createdAt: new Date(),
                count: 0,
                isActive: true,
                tags: [],
                metadata: {
                    a: "a",
                    b: "b",
                },
                unknown: {
                    blah: true,
                },
            },
        ],
        badInputs: [
            "hello world",
            {
                id: null,
                createdAt: "hello world",
                count: null,
                isActive: null,
                metadata: { a: false },
            },
        ],
    },
    "object with optional fields": {
        schema: a.partial(
            a.object({
                id: a.string(),
                createdAt: a.timestamp(),
                type: a.stringEnum(["a", "b"]),
            }),
        ),
        goodInputs: [
            {
                id: "",
                createdAt: new Date(),
                type: "a",
            },
            { id: "" },
            {},
        ],
        badInputs: [
            { id: 1, createdAt: null },
            null,
            "hello world",
            { id: "", createdAt: new Date(), type: "" },
        ],
    },
    "array of strings": {
        schema: a.array(a.string()),
        goodInputs: [["hello world", "goodbye world"], ["a", "b", "c"], []],
        badInputs: [["hello world", true], [1, 2, 3], {}, true, false],
    },
    "array of nullable strings": {
        schema: a.array(a.nullable(a.string())),
        goodInputs: [
            [null, "hello world"],
            [null, null, null],
            ["hello", "goodbye"],
        ],
        badInputs: [
            [null, null, true],
            ["hello world", false],
            {},
            "hello world",
        ],
    },
    "nullable array of strings": {
        schema: a.nullable(a.array(a.string())),
        goodInputs: [null, ["hello world", "goodbye world"], []],
        badInputs: [["hello world", null], "hello world", true, false, {}],
    },
    "array of numbers": {
        schema: a.array(a.number()),
        goodInputs: [[1, 2, 3.5], [-1, -100, 100.5], []],
        badInputs: [["hello world"], null, false, true, [true]],
    },
    "array of objects": {
        schema: a.array(
            a.object({
                a: a.string(),
                b: a.timestamp(),
                c: a.object({
                    a: a.string(),
                    b: a.uint64(),
                }),
            }),
        ),
        goodInputs: [[{ a: "", b: new Date(), c: { a: "", b: BigInt("0") } }]],
        badInputs: [[null, {}]],
    },
    discriminator: {
        schema: a.discriminator("type", {
            CREATED: a.object({
                itemId: a.string(),
                createdAt: a.timestamp(),
            }),
            UPDATED: a.object({
                itemId: a.string(),
                createdAt: a.timestamp(),
                updatedAt: a.timestamp(),
            }),
            DELETED: a.object({
                itemId: a.string(),
                createdAt: a.timestamp(),
                updatedAt: a.timestamp(),
                deletedAt: a.timestamp(),
            }),
        }),
        goodInputs: [
            { type: "CREATED", itemId: "1", createdAt: new Date() },
            {
                type: "DELETED",
                itemId: "2",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: new Date(),
            },
            {
                type: "UPDATED",
                itemId: "3",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        badInputs: [
            false,
            true,
            { type: "CREATED", createdAt: "01/01/2001" },
            { type: "MOVED", itemId: "1", createdAt: new Date() },
        ],
    },
    "record with boolean values": {
        schema: a.record(a.boolean()),
        goodInputs: [{ a: true, b: false }, {}],
        badInputs: [
            { a: true, b: true, c: "true" },
            { a: "null" },
            null,
            [true],
        ],
    },
    "record with objects": {
        schema: a.record(
            a.object({
                name: a.string(),
                count: a.number(),
                date: a.timestamp(),
                subObject: a.object({
                    a: a.string(),
                }),
            }),
        ),
        goodInputs: [
            {
                a: {
                    name: "",
                    count: 1,
                    date: new Date(),
                    subObject: {
                        a: "",
                    },
                },
                b: {
                    name: "John",
                    count: 100.5,
                    date: new Date(),
                    subObject: {
                        a: "",
                    },
                },
            },
        ],
        badInputs: [
            {},
            null,
            {
                a: {
                    name: "",
                    count: null,
                    date: new Date(),
                    subObject: {
                        a: "",
                    },
                },
            },
        ],
    },
    "record with nullable objects": {
        schema: a.record(
            a.nullable(
                a.object({
                    id: a.string(),
                    url: a.string(),
                }),
            ),
        ),
        goodInputs: [
            { a: { id: "", url: "" }, b: { id: "", url: "" } },
            { a: null, b: { id: "", url: "" } },
        ],
        badInputs: [
            { a: { id: 1, url: "" }, b: { id: "", url: "" } },
            true,
            null,
        ],
    },
    "record of int64s": {
        schema: a.record(a.int64()),
        goodInputs: [
            {
                a: BigInt("999999999"),
                b: BigInt("-9999"),
            },
        ],
        badInputs: [
            {
                a: 1,
                b: BigInt("0"),
            },
            {
                a: null,
            },
            null,
            true,
        ],
    },
    "object with characters needing escaping": {
        schema: a.object({
            description: a.string(),
        }),
        goodInputs: [
            { description: "hello\nworld\nhow are you\b\f\n\r\t" },
            {
                description:
                    '\t\tShe say, "Hello Johnathon! How Are You?"\n"Fine..." He replied quietly.',
            },
        ],
        badInputs: [null, false],
    },
    "object with unicode characters": {
        schema: a.object({
            description: a.string(),
        }),
        goodInputs: [
            {
                description: "hello \u00ff",
            },
        ],
        badInputs: [],
    },
    "object with nested modifiers": {
        schema: a.object({
            id: a.string(),
            data: a.partial(
                a.pick(
                    a.object({
                        name: a.string(),
                        description: a.string(),
                        createdAt: a.timestamp(),
                    }),
                    ["name", "createdAt"],
                ),
            ),
        }),
        goodInputs: [
            { id: "12345", data: {} },
            { id: "12345", data: { name: "john", createdAt: new Date() } },
            { id: "1", data: { createdAt: new Date() } },
            { id: "2", data: { name: "" } },
        ],
        badInputs: [
            { id: 1, data: true },
            { id: "1", data: { name: "", createdAt: 1 } },
            { id: "", data: { name: "" } },
        ],
    },
    "object with int64 and uint64": {
        schema: a.object({
            id: a.string(),
            count: a.uint64(),
            limit: a.int64(),
        }),
        goodInputs: [
            {
                id: "1",
                count: BigInt("10000"),
                limit: BigInt("-1000"),
            },
        ],
        badInputs: [
            {
                id: "1",
                count: 0,
                limit: 0,
            },
            null,
            { id: "1" },
        ],
    },
    "object with additionalProperties false": {
        schema: a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { additionalProperties: false },
        ),
        goodInputs: [
            {
                id: "1",
                name: "john",
            },
        ],
        badInputs: [
            {
                id: "1",
                name: "john",
                createdAt: new Date(),
            },
            {
                id: "1",
                name: "john",
                description: "",
            },
            {},
            null,
            true,
        ],
    },
    "object with additionalProperties true": {
        schema: a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { additionalProperties: true },
        ),
        goodInputs: [
            {
                id: "",
                name: "",
                description: "",
            },
            {
                id: "",
                name: "",
                description: "",
                createdAt: new Date(),
            },
        ],
        badInputs: [{}, null, { id: "" }],
    },
};

const ObjectSchema = a.object({
    string: a.string(),
    date: a.timestamp(),
    enum: a.enumerator(["A", "B", "C"]),
    int8: a.int8(),
    int16: a.int16(),
    int32: a.int32(),
    int64: a.int64(),
    uint64: a.uint64(),
    boolean: a.boolean(),
    object: a.object({
        id: a.string(),
        count: a.number(),
    }),
    record: a.record(a.uint64()),
    array: a.array(a.boolean()),
    taggedUnion: a.discriminator("type", {
        USER: a.object({
            id: a.string(),
            name: a.string(),
        }),
        POST: a.object({
            id: a.string(),
            title: a.string(),
            createdAt: a.timestamp(),
        }),
    }),
    any: a.any(),
});

type ObjectSchema = a.infer<typeof ObjectSchema>;

export const parsingTestSuites: Record<
    string,
    {
        schema: ASchema;
        goodInputs: any[];
        expectedResults: any[];
        badInputs: any[];
    }
> = {
    any: {
        schema: a.any(),
        goodInputs: [
            "hello world",
            "[]",
            "[true, false]",
            '{ "a": "a", "b": null }',
            "true",
            "false",
            "1",
            "null",
        ],
        expectedResults: [
            "hello world",
            [],
            [true, false],
            { a: "a", b: null },
            true,
            false,
            1,
            "null",
        ],
        badInputs: [],
    },
    "nullable any": {
        schema: a.nullable(a.any()),
        goodInputs: [
            "hello world",
            "[]",
            "[true, false]",
            '{ "a": "a", "b": null }',
            "true",
            "false",
            "1",
            "null",
        ],
        expectedResults: [
            "hello world",
            [],
            [true, false],
            { a: "a", b: null },
            true,
            false,
            1,
            "null",
        ],
        badInputs: [],
    },
    string: {
        schema: a.string(),
        goodInputs: ["hello world"],
        expectedResults: ["hello world"],
        badInputs: [],
    },
    "nullable string": {
        schema: a.nullable(a.string()),
        goodInputs: [null, "Hello World"],
        expectedResults: [null, "Hello World"],
        badInputs: [false, true, {}],
    },
    timestamp: {
        schema: a.timestamp(),
        goodInputs: ["2001/01/01", new Date("2001/01/01")],
        expectedResults: [new Date("2001/01/01"), new Date("2001/01/01")],
        badInputs: [],
    },
    boolean: {
        schema: a.boolean(),
        goodInputs: [true, false, "true", "false"],
        badInputs: [],
        expectedResults: [true, false, true, false],
    },
    enum: {
        schema: a.enumerator(["A", "B", "C"]),
        goodInputs: ["A", "B", "C"],
        expectedResults: ["A", "B", "C"],
        badInputs: ["D", "F", null, false, {}],
    },
    int64: {
        schema: a.int64(),
        goodInputs: [BigInt(1000), BigInt(-1000), 1000, -1000, "1000", "-1000"],
        expectedResults: [
            BigInt(1000),
            BigInt(-1000),
            BigInt(1000),
            BigInt(-1000),
            BigInt(1000),
            BigInt(-1000),
        ],
        badInputs: [null, true, []],
    },
    "nullable int64": {
        schema: a.nullable(a.int64()),
        goodInputs: [null, BigInt(-1000), "-1000", "null"],
        expectedResults: [null, BigInt(-1000), BigInt(-1000), null],
        badInputs: [true, false, {}],
    },
    uint64: {
        schema: a.uint64(),
        goodInputs: [BigInt(0), BigInt(1000), "0", "1000", 0, 1000],
        expectedResults: [
            BigInt(0),
            BigInt(1000),
            BigInt(0),
            BigInt(1000),
            BigInt(0),
            BigInt(1000),
        ],
        badInputs: ["-1", "-1.5", "1.5", null],
    },
    "object with large integers": {
        schema: a.object({
            int64: a.int64(),
            uint64: a.uint64(),
            nullableInt64: a.nullable(a.int64()),
            nullableUint64: a.nullable(a.uint64()),
        }),
        goodInputs: [
            {
                int64: -1,
                uint64: 1,
                nullableInt64: -1,
                nullableUint64: 1,
            },
            {
                int64: "-1",
                uint64: "1",
                nullableInt64: "-1",
                nullableUint64: "1",
            },
            {
                int64: BigInt(-1),
                uint64: BigInt(1),
                nullableInt64: null,
                nullableUint64: null,
            },
        ],
        expectedResults: [
            {
                int64: BigInt(-1),
                uint64: BigInt(1),
                nullableInt64: BigInt(-1),
                nullableUint64: BigInt(1),
            },
            {
                int64: BigInt(-1),
                uint64: BigInt(1),
                nullableInt64: BigInt(-1),
                nullableUint64: BigInt(1),
            },
            {
                int64: BigInt(-1),
                uint64: BigInt(1),
                nullableInt64: null,
                nullableUint64: null,
            },
        ],
        badInputs: [],
    },
    "object schema": {
        schema: ObjectSchema,
        goodInputs: [
            `{
                "string": "hello world",
                "date": "2001/01/01",
                "enum": "A",
                "int8": 1,
                "int16": 2,
                "int32": 3,
                "int64": "999",
                "uint64": "999",
                "boolean": true,
                "object": {
                    "id": "",
                    "count": 1
                },
                "record": {
                    "a": "0",
                    "b": "1000"
                },
                "array": [true, false, true],
                "taggedUnion": {
                    "type": "USER",
                    "id": "",
                    "name": "Hello"
                },
                "any": {
                    "a": "a",
                    "b": "b"
                }
            }`,
            {
                string: "hello world",
                date: new Date("2001/01/01"),
                enum: "A",
                int8: 1,
                int16: 2,
                int32: 3,
                int64: BigInt(999),
                uint64: BigInt(999),
                boolean: true,
                object: {
                    id: "",
                    count: 1,
                },
                record: {
                    a: BigInt(0),
                    b: BigInt(1000),
                },
                array: [true, false, true],
                taggedUnion: {
                    type: "USER",
                    id: "",
                    name: "Hello",
                },
                any: {
                    a: "a",
                    b: "b",
                },
                blah: "",
                blah2: "",
            },
        ],
        expectedResults: [
            {
                string: "hello world",
                date: new Date("2001/01/01"),
                enum: "A",
                int8: 1,
                int16: 2,
                int32: 3,
                int64: BigInt(999),
                uint64: BigInt(999),
                boolean: true,
                object: {
                    id: "",
                    count: 1,
                },
                record: {
                    a: BigInt(0),
                    b: BigInt(1000),
                },
                array: [true, false, true],
                taggedUnion: {
                    type: "USER",
                    id: "",
                    name: "Hello",
                },
                any: {
                    a: "a",
                    b: "b",
                },
            },
            {
                string: "hello world",
                date: new Date("2001/01/01"),
                enum: "A",
                int8: 1,
                int16: 2,
                int32: 3,
                int64: BigInt(999),
                uint64: BigInt(999),
                boolean: true,
                object: {
                    id: "",
                    count: 1,
                },
                record: {
                    a: BigInt(0),
                    b: BigInt(1000),
                },
                array: [true, false, true],
                taggedUnion: {
                    type: "USER",
                    id: "",
                    name: "Hello",
                },
                any: {
                    a: "a",
                    b: "b",
                },
            },
        ] satisfies ObjectSchema[],
        badInputs: [],
    },
    "object with nullable any": {
        schema: a.object({
            any: a.any(),
            nullableAny: a.nullable(a.any()),
        }),
        goodInputs: [
            {
                any: {},
                nullableAny: null,
            },
            `{"any":{},"nullableAny":null}`,
            {
                any: false,
                nullableAny: {
                    id: "hello",
                },
            },
            `{"any":false,"nullableAny":{"id":"hello"}}`,
        ],
        expectedResults: [
            {
                any: {},
                nullableAny: null,
            },
            {
                any: {},
                nullableAny: null,
            },
            {
                any: false,
                nullableAny: {
                    id: "hello",
                },
            },
            {
                any: false,
                nullableAny: {
                    id: "hello",
                },
            },
        ],
        badInputs: [],
    },
};
