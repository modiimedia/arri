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

interface RecursiveObject {
    value: bigint;
    child: RecursiveObject | null;
}
const RecursiveObject = a.recursive<RecursiveObject>((self) =>
    a.object({
        value: a.uint64(),
        child: a.nullable(self),
    }),
);

export type RecursiveUnion =
    | { type: "CHILD"; data: RecursiveUnion }
    | { type: "CHILDREN"; data: RecursiveUnion[] }
    | { type: "TEXT"; data: string }
    | { type: "SHAPE"; data: { width: number; height: number } };
export const RecursiveUnion = a.recursive<RecursiveUnion>(
    "RecursiveUnion",
    (self) =>
        a.discriminator("type", {
            CHILD: a.object({ data: self }),
            CHILDREN: a.object({
                data: a.array(self),
            }),
            TEXT: a.object({
                data: a.string(),
            }),
            SHAPE: a.object({
                data: a.object({
                    width: a.number(),
                    height: a.number(),
                }),
            }),
        }),
);

export const validationTestSuites: Record<
    string,
    {
        schema: ASchema;
        goodInputs: any[];
        badInputs: any[];
        onlyTestSerialization?: boolean;
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
            // BigInt("9223372036854775808"),
            // BigInt("-9223372036854775809"),
            null,
            {},
        ],
    },
    int32: {
        schema: a.int32(),
        goodInputs: [491451, -13411],
        badInputs: [999999999999999, -999999999999999, 199.5, "hello world"],
    },
    uint32: {
        schema: a.uint32(),
        goodInputs: [4815141, 100],
        badInputs: [-1, 100.5, 1399999999999999, "hello world"],
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
        schema: a.object({
            id: a.nullable(a.string()),
            createdAt: a.nullable(a.timestamp()),
            count: a.nullable(a.number()),
            isActive: a.nullable(a.boolean()),
            tags: a.nullable(a.array(a.string())),
            metadata: a.nullable(a.record(a.string())),
            unknown: a.nullable(a.any()),
        }),
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
        badInputs: [{ a: true, b: true, c: "true" }, { a: "null" }, null],
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
                a: "hi",
                b: BigInt("0"),
            },
            {
                a: null,
            },
            null,
            true,
        ],
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
                count: -1,
                limit: null,
            },
            null,
            { id: "1" },
        ],
    },
    "object with strict true": {
        schema: a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { strict: true },
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
    "object with strict false": {
        schema: a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { strict: false },
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
    "recursive object": {
        schema: RecursiveObject,
        goodInputs: [
            {
                value: BigInt("1"),
                child: null,
            },
            {
                value: BigInt("1"),
                child: {
                    value: BigInt("2"),
                    child: {
                        value: BigInt("3"),
                        child: null,
                    },
                },
            },
        ],
        badInputs: [
            true,
            false,
            {},
            {
                value: BigInt("1"),
                child: {
                    value: BigInt("2"),
                    child: {
                        value: null,
                        child: null,
                    },
                },
            },
            {
                value: BigInt("1"),
                child: {
                    value: BigInt("2"),
                    child: {
                        value: BigInt("3"),
                        child: true,
                    },
                },
            },
        ],
    },
    "recursive discriminator": {
        schema: RecursiveUnion,
        goodInputs: [
            {
                type: "CHILD",
                data: {
                    type: "CHILDREN",
                    data: [
                        {
                            type: "TEXT",
                            data: "Hello world",
                        },
                        {
                            type: "SHAPE",
                            data: {
                                width: 1,
                                height: 2,
                            },
                        },
                        {
                            type: "CHILD",
                            data: {
                                type: "TEXT",
                                data: "Hello world",
                            },
                        },
                    ],
                },
            },
        ],
        badInputs: [
            {},
            null,
            {
                type: "CHILD",
                data: {
                    type: "CHILDREN",
                    data: [
                        {
                            type: "CIRCLE",
                            data: {
                                width: 1,
                                height: 2,
                            },
                        },
                    ],
                },
            },
        ],
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
            null,
        ],
        badInputs: [],
    },
    "nullable any": {
        schema: a.nullable(a.any()),
        goodInputs: [
            "[]",
            "[true, false]",
            '{ "a": "a", "b": null }',
            "true",
            "false",
            "1",
            "null",
        ],
        expectedResults: [
            [],
            [true, false],
            { a: "a", b: null },
            true,
            false,
            1,
            null,
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
    "recursive object": {
        schema: RecursiveObject,
        goodInputs: [
            `{"value": "1", "child": null}`,
            `{
                "value": "1",
                "child": {
                    "value": "2",
                    "child": {
                        "value": "3",
                        "child": null
                    }
                }
            }`,
        ],
        expectedResults: [
            {
                value: BigInt("1"),
                child: null,
            },
            {
                value: BigInt("1"),
                child: {
                    value: BigInt("2"),
                    child: {
                        value: BigInt("3"),
                        child: null,
                    },
                },
            },
        ],
        badInputs: [
            `{
                "value": "1",
                "child": {
                    "value": "2",
                    "child": {
                        "value": "hello world",
                        "child": null
                    }
                }
            }`,
        ],
    },
};

export const serializationTestSuites: Record<
    string,
    { schema: ASchema; inputs: any[] }
> = {
    "object with characters needing escaping": {
        schema: a.object({
            description: a.string(),
        }),
        inputs: [
            { description: '"What are you doing?" said Veronica' },
            { description: "hello\nworld\nhow are you\b\f\n\r\t" },
            {
                description:
                    '\t\tShe say, "Hello Johnathon! How Are You?"\n"Fine..." He replied quietly.',
            },
            {
                description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi a odio pulvinar, ultricies purus et, lacinia nunc. Mauris mattis consequat egestas. Donec nulla mi, commodo sit amet commodo in, faucibus non nisi. Maecenas libero felis, hendrerit et tempor viverra, cursus quis sapien. In consequat turpis sed velit venenatis, eu laoreet justo efficitur. Praesent id lorem neque. Donec blandit commodo sem eu viverra. Suspendisse ullamcorper suscipit tellus, eget condimentum risus aliquam sed.

Proin a luctus dui, vitae maximus augue. Fusce id lacinia tortor. Ut sit amet dignissim urna, eget tincidunt lacus. Pellentesque elementum nisi sagittis, laoreet tortor vel, euismod elit. Donec lacinia at sapien finibus euismod. Quisque non convallis lacus, sed pulvinar lectus. Sed sed dolor auctor, efficitur leo vel, cursus dolor. Curabitur vel felis nec ipsum molestie fermentum in et quam. Sed in turpis scelerisque, tempor lectus a, vulputate lectus. Nunc porttitor mi a lacus facilisis laoreet.

Curabitur tincidunt libero vel enim rhoncus, quis sagittis sapien placerat. Praesent odio nulla, euismod non rutrum vel, egestas eu sapien. Suspendisse nec enim arcu. Nunc vel libero in nisi suscipit dapibus. Proin nec hendrerit nibh, pulvinar tempus quam. Nullam non enim a felis ultricies pharetra. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Pellentesque faucibus nulla eget purus fermentum, rutrum placerat purus congue. Nam tincidunt nibh nisi, nec eleifend dolor fermentum sodales.

Sed euismod dignissim molestie. Ut vel semper est. Sed volutpat, dolor quis congue laoreet, sapien augue ultrices ipsum, sit amet lobortis mi risus nec ante. Quisque in felis pharetra, semper massa sed, tempor leo. Duis sollicitudin arcu eu dapibus dignissim. Pellentesque cursus non nulla non iaculis. Cras egestas lorem ut magna sodales bibendum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Etiam fringilla lacinia orci, id posuere elit convallis quis. Mauris aliquam turpis nec mi sodales, sed blandit tellus ultrices. Sed eros orci, pulvinar et magna vitae, pulvinar condimentum erat. Mauris id lacinia elit, eu volutpat nunc. Aliquam pharetra ligula et metus dapibus, sit amet ornare sem vestibulum. Quisque laoreet eget quam imperdiet rhoncus. Sed diam sem, varius nec metus interdum, ultricies eleifend ex. Sed vestibulum a libero ut venenatis.`,
            },
            {
                description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce non lorem tincidunt, molestie mi quis, pharetra dui. Mauris nec auctor leo, et interdum leo. Praesent non metus ut augue commodo blandit. Sed eu ultrices ex. Maecenas maximus mi neque, nec tempus justo viverra vitae. Fusce vitae mi nec risus lacinia tincidunt. Fusce vel velit risus. Nullam fermentum, eros ut vulputate scelerisque, est ipsum posuere tellus, non congue ligula odio a dolor.
Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas metus nisi, facilisis ut odio congue, aliquam iaculis erat. Nullam a odio ornare ex interdum venenatis ut vel orci. Quisque pretium tempus odio, at malesuada mi egestas quis. Nullam pretium suscipit mauris quis aliquam. Vestibulum porttitor lobortis tellus id dictum. Maecenas nec ultricies purus.
Vivamus ut ultrices neque. Mauris consectetur, massa ut feugiat tincidunt, tellus urna vehicula tellus, nec vehicula ante metus in lectus. Donec sollicitudin lectus justo, id porta est accumsan eget. Nulla tincidunt maximus enim. Phasellus et ipsum bibendum, tempor mauris sit amet, viverra odio. Nulla vitae tristique neque. Nunc semper orci quis est consectetur euismod. Donec id ante sed lectus pellentesque molestie malesuada non elit. Fusce porta felis in blandit placerat. Nullam eleifend mauris augue, consequat iaculis leo vestibulum a. Maecenas sed orci nunc. In porta mauris dolor, fringilla iaculis mauris imperdiet at. Proin congue quis turpis vel feugiat. Nunc vestibulum tellus nec scelerisque convallis.
Quisque sem lectus, egestas ac eros pretium, viverra vestibulum ante. Suspendisse non nunc semper, ultrices diam id, commodo felis. Donec velit mauris, lobortis id ipsum nec, porta efficitur augue. Nam accumsan erat massa, quis tristique ante bibendum id. Etiam risus velit, pellentesque ut dui sed, pellentesque elementum sem. Nulla semper nisl eget ligula suscipit, in rutrum turpis posuere. Fusce ut elit viverra, egestas massa pretium, elementum risus. Vivamus porttitor eleifend lobortis.
Donec dapibus lectus magna, quis fringilla dui viverra quis. Vestibulum vulputate efficitur enim. Duis sagittis at erat eget semper. Donec vitae arcu fermentum, convallis felis et, tristique felis. Duis semper turpis ac odio mattis, vitae interdum mauris suscipit. Nulla facilisis dolor id sodales tempus. Nulla vestibulum tincidunt hendrerit. Vivamus eget ornare odio, vel commodo sem. Suspendisse ullamcorper pretium est, quis euismod nulla aliquet ut. In eu erat molestie, congue mauris id, vestibulum elit. Sed gravida aliquam tortor tincidunt lobortis. Donec dui velit, aliquet ut euismod ac, feugiat sit amet lacus.
Suspendisse tortor quam, sagittis ac elementum tempus, dictum ut mi. Curabitur egestas interdum neque a sollicitudin. Phasellus non eros vitae velit tempus condimentum in quis libero. Aenean et pellentesque turpis. Phasellus eget sapien hendrerit, auctor augue vitae, rutrum massa. Quisque aliquam viverra commodo. Proin iaculis massa lectus, eget vestibulum metus dignissim a. Integer pulvinar egestas urna vel porttitor.
Fusce porttitor neque et libero finibus, nec egestas magna commodo. Etiam aliquam pharetra ex et venenatis. Suspendisse luctus tincidunt orci ac maximus. Proin feugiat eget nunc non fermentum. Pellentesque vulputate sapien quis vehicula condimentum. Sed eget diam volutpat, sagittis erat nec, gravida nisi. Sed in euismod nisi, eget hendrerit ligula. Nunc varius eros tincidunt leo imperdiet consectetur. Cras lobortis arcu nec facilisis gravida. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Donec rhoncus pulvinar eros et lacinia. Integer elit nisl, tempor id enim eget, varius viverra libero. Sed ornare, sem a auctor gravida, diam turpis cursus ipsum, sed rhoncus nisi velit posuere nibh. Phasellus at felis justo. Phasellus gravida ut eros et eleifend. Donec consectetur scelerisque mollis. Nulla sed mauris felis. Donec lacinia tortor augue. Proin malesuada vitae purus vel vestibulum. Pellentesque odio elit, suscipit in mattis at, ullamcorper ac tortor. Sed sagittis finibus augue nec dictum. Pellentesque nisi elit, gravida ut nisl sed, auctor rutrum mi. In egestas pretium ipsum, eu aliquet mi scelerisque a. Morbi quis odio eget odio congue condimentum eu vitae augue. Etiam elit quam, venenatis et aliquet non, lobortis rutrum enim. Aenean arcu lorem, sagittis sit amet luctus ac, ultrices vitae lacus.
Etiam feugiat commodo blandit. Mauris suscipit tristique sapien, ac condimentum felis mattis non. Proin vehicula velit sit amet auctor vehicula. Quisque dapibus, tortor et mattis aliquet, velit erat fermentum nibh, a interdum libero magna a massa. Nullam sem eros, tincidunt faucibus luctus sit amet, ullamcorper ac nisl. Cras in rhoncus dui, a volutpat sapien. Nam hendrerit ipsum ante, rutrum viverra tortor viverra semper. Etiam nec ligula eu nibh pulvinar elementum ut sed nibh.
Nunc lacinia enim in mattis condimentum. Praesent dapibus viverra eros, sit amet varius lorem consectetur nec. Sed in metus scelerisque odio molestie porttitor. Ut vehicula erat dolor, eu eleifend mi hendrerit quis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel nisi pellentesque lorem ullamcorper iaculis. Vivamus nisl quam, dapibus a felis a, facilisis varius mauris. Cras ultricies mauris diam, nec viverra ante placerat ut. Etiam malesuada aliquet auctor. Morbi sit amet felis nunc. Aenean facilisis rutrum arcu, id vestibulum metus efficitur sit amet. Suspendisse volutpat magna ipsum, id blandit dolor luctus et. Suspendisse a elit quis nisl euismod sodales. Curabitur vel lacus vel leo feugiat consectetur a id libero. In rhoncus, ante ut interdum cursus, tortor urna semper ex, et ullamcorper magna nisi ut nunc.
Nulla ut volutpat sapien. Etiam tincidunt blandit orci, non bibendum nisl scelerisque a. Etiam condimentum feugiat mauris vitae semper. Donec lobortis euismod euismod. Sed consequat non mauris eget luctus. Morbi porta elit quis posuere pharetra. Nullam mollis leo et nunc condimentum, vel tempor sem accumsan. Etiam sed turpis a ipsum lacinia dapibus. Donec purus arcu, commodo at ligula eget, varius mattis ex. Nullam viverra risus turpis, ut vehicula mauris pretium non. Maecenas pharetra est vel odio tincidunt laoreet. Duis facilisis erat sagittis felis mattis, nec rutrum risus fringilla. Cras pharetra consectetur ipsum ac accumsan. Praesent euismod turpis in tortor ullamcorper, sed scelerisque orci lobortis. Nullam non dui ut tortor iaculis tempus.
In a iaculis tellus, sit amet placerat nunc. Etiam consectetur augue nec leo aliquet, ut condimentum elit facilisis. Aliquam sed mi augue. Phasellus quis fermentum mauris. Nam non leo rutrum, accumsan orci a, tincidunt lacus. Donec non turpis orci. Sed scelerisque risus risus, sed blandit orci cursus id.
Cras pulvinar ex eu pharetra ullamcorper. Aliquam suscipit mauris elementum lectus viverra accumsan. Mauris posuere semper est cursus efficitur. In in metus accumsan, auctor tortor non, posuere felis. In eu massa urna. Mauris hendrerit id tellus eu eleifend. In vitae ipsum in mauris laoreet ullamcorper a eget tellus. Cras mauris dolor, vulputate sed eros quis, venenatis fringilla leo. Aenean iaculis nisi ac lectus ultrices viverra. Duis in velit sapien. Vivamus dapibus commodo justo sit amet lacinia. Etiam vitae nisl at tortor feugiat facilisis in ac tellus. Praesent turpis nisl, volutpat vel fringilla eu, tempor vitae dui. Pellentesque vitae ornare nibh.
Nullam eget mi lectus. In hac habitasse platea dictumst. Nam sollicitudin fermentum arcu at sagittis. Cras condimentum neque hendrerit neque suscipit sodales. Ut faucibus volutpat mi a sollicitudin. Sed ut pretium ipsum. Fusce at consequat turpis. Ut et dui quam. Vestibulum aliquet massa quis malesuada facilisis. Nunc rutrum commodo metus, nec venenatis mauris ultricies id. Maecenas at sollicitudin risus. Donec at elementum sapien, at sagittis magna. Nullam accumsan diam ex, a hendrerit mi tincidunt bibendum. Aenean pellentesque pulvinar pulvinar. Suspendisse in metus bibendum, venenatis arcu eleifend, bibendum lectus. Donec nisl nisi, imperdiet quis ornare et, commodo eu elit.
Integer vel tellus sed felis gravida efficitur dapibus eu odio. Aenean faucibus ligula vel sem ultricies rhoncus. Donec posuere arcu sit amet erat blandit mollis. Nunc mollis dictum dolor, sit amet volutpat sem venenatis at. Suspendisse eget elit arcu. Vivamus malesuada leo a efficitur consequat. Fusce ante turpis, volutpat eu varius ac, pellentesque vel eros. Ut in justo libero. Phasellus gravida condimentum vehicula.
Duis ornare posuere enim, eget consequat velit suscipit a. Donec mattis magna id diam scelerisque mollis vitae nec turpis. Quisque in eros dignissim, iaculis libero sit amet, tincidunt dolor. Maecenas ut aliquet lacus, eu ultrices risus. Sed bibendum sagittis augue, non maximus ipsum. Suspendisse tempus, nisi sit amet tincidunt fringilla, sapien lectus laoreet erat, vel molestie ligula urna vel nulla. Aliquam vehicula auctor leo sed euismod. Etiam posuere diam quam, eu porttitor orci ullamcorper lacinia. Fusce sollicitudin dignissim lacinia. Sed at erat sed mi pharetra rutrum. Aenean vestibulum, nulla ut lobortis consequat, ante tortor ullamcorper arcu, sit amet interdum libero neque ut turpis. Suspendisse sed lacus nisi. In id iaculis dui.
Nullam in nulla sed velit pretium ultrices nec at est. Phasellus lacinia euismod ligula, at bibendum nulla pharetra tempor. Nunc eu tempus urna. Cras imperdiet fringilla fringilla. Sed massa tellus, sollicitudin id luctus eget, blandit ac ante. Phasellus vitae interdum nibh. Quisque consectetur dapibus turpis pulvinar imperdiet. Nulla facilisi. Nam tincidunt, leo consectetur eleifend interdum, ante ligula consectetur mauris, nec luctus orci velit non felis. Praesent facilisis, dui et finibus rhoncus, eros arcu consequat sapien, sed rutrum sem ante quis odio. Sed porta at erat at laoreet. Proin leo urna, fringilla a enim vitae, malesuada rhoncus eros. Duis tempus nisl et orci consequat luctus.
Proin libero magna, ultrices eu urna vitae, ultrices pellentesque ligula. Cras scelerisque molestie diam, nec euismod odio cursus ut. Vestibulum viverra ligula non justo rutrum, sed condimentum lectus scelerisque. Vestibulum a lacinia dui, vel faucibus neque. Vivamus in elit urna. Donec id consectetur lacus. In viverra aliquet maximus. Quisque ut est sit amet metus scelerisque congue ut non nunc.
Cras ut dapibus augue. Nam molestie consectetur pulvinar. In id tempor sem. Pellentesque rutrum condimentum lectus, quis ultricies ligula lacinia id. Fusce ullamcorper dignissim consequat. Pellentesque tincidunt commodo magna, vel semper sem luctus elementum. Duis elementum iaculis enim ut varius. Donec vitae blandit ligula. Morbi semper, felis quis varius semper, nisi mauris bibendum libero, eu volutpat purus arcu at lectus. Morbi augue eros, pellentesque et nunc sed, tristique pellentesque sem. Sed condimentum non lorem sit amet vulputate. Nam non molestie augue, eget consectetur ex. Aenean sit amet ante faucibus metus maximus porttitor eu vitae nunc. Duis cursus dui scelerisque tortor molestie, sit amet feugiat est commodo. Vivamus eleifend, magna a bibendum dignissim, ex velit convallis felis, sed ultricies nisl augue ut nisi.
Praesent massa arcu, pretium id magna non, tincidunt aliquam dui. Fusce a elit at nisi accumsan malesuada. Maecenas auctor tellus nisi, at faucibus mauris congue id. Sed commodo metus nibh, placerat consequat magna tempus ac. Aenean id ex ultrices, dictum eros sed, varius felis. Nunc elementum et purus eget iaculis. Sed in euismod nibh. Integer euismod commodo lacus a tempor. Vivamus venenatis sapien leo, quis rhoncus tellus hendrerit lobortis. In hac habitasse platea dictumst. Sed maximus lobortis risus, eu varius augue gravida quis.
Pellentesque vel luctus lectus, et tempus felis. Sed leo purus, ornare ornare mauris sed, tincidunt iaculis nisl. Praesent sapien dolor, sagittis ac sollicitudin eu, finibus id nisl. Proin placerat, risus vitae rhoncus bibendum, turpis erat maximus risus, in finibus ante neque vitae nisl. Nam quis posuere lectus. Fusce ornare, turpis non vehicula aliquam, massa neque facilisis purus, eu vestibulum leo neque et tellus. Donec porta quam non pharetra volutpat. Nunc tellus mi, eleifend a libero a, consequat vehicula justo. Nullam aliquet elementum elit. Nulla ut metus sollicitudin, ornare erat eu, consectetur eros. Aenean pretium pulvinar lectus non suscipit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin quis tellus augue. Praesent commodo aliquam dolor, at finibus quam auctor in. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Vivamus imperdiet leo vel ullamcorper gravida. Mauris ac purus at enim luctus mollis. Donec pretium metus in diam tristique dapibus. Fusce consequat vitae mi vitae volutpat. Aliquam faucibus congue commodo. Fusce sed diam augue. Nam condimentum ex vitae accumsan accumsan. Etiam laoreet mauris tellus, a gravida odio scelerisque in. Aenean gravida ipsum convallis, pretium neque sed, posuere nulla. Praesent id elementum urna. Suspendisse quis neque sed risus tempor ornare. Cras dolor enim, consectetur eget dui pharetra, condimentum egestas metus. Donec scelerisque, ex a tempor iaculis, augue tortor laoreet eros, vitae auctor erat urna id odio. Nulla lacinia a velit in consectetur. Pellentesque et ligula auctor, bibendum mauris ut, molestie tortor. In tristique ac lectus vitae consequat.
Donec id interdum mauris. Phasellus eget aliquam arcu. Duis molestie imperdiet dictum. Morbi imperdiet ultricies tellus nec suscipit. Donec placerat elit ac accumsan volutpat. Etiam eu justo dictum, cursus orci sed, bibendum dolor. Nulla mauris turpis, imperdiet a dictum ut, vulputate mattis arcu. Nunc efficitur nibh sed mi vehicula, id rhoncus justo tempor. Pellentesque ac lorem purus.
Curabitur mi ipsum, euismod ut pharetra vel, aliquet vel mauris. Donec tincidunt orci est, eget vulputate nibh laoreet sed. Aliquam convallis sollicitudin ex. Suspendisse eu tristique felis, sed gravida dui. Morbi vel neque nec ligula viverra lobortis vitae vitae tellus. Phasellus elementum arcu vel volutpat iaculis. Integer tincidunt erat vitae sollicitudin commodo. Donec tristique suscipit pharetra. Vivamus at nulla porta, sagittis ante quis, dignissim diam. Mauris at convallis diam. Sed accumsan id ipsum eu dictum. Praesent tempus sapien ut vehicula dignissim. Sed pretium erat at pulvinar porta. Nunc tristique augue sed tellus cursus viverra vel nec turpis.
Aenean tempus, nibh id fringilla porttitor, leo lectus vulputate nunc, sit amet pulvinar odio metus eget mauris. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque scelerisque at lacus ac cursus. Nullam nec tellus eros. Sed consequat urna non sapien auctor, ac malesuada nulla faucibus. Aliquam nec urna sem. Curabitur lobortis tincidunt finibus. Fusce elementum lobortis mattis. Phasellus nec turpis sapien. Donec sit amet odio in ligula condimentum hendrerit. Quisque congue dapibus aliquam. Suspendisse mauris leo, fermentum a mauris quis, dictum feugiat sapien. Quisque vitae lacinia nunc. Ut feugiat mollis sapien, id vestibulum neque mattis sit amet. Phasellus ut varius justo.
Ut dignissim, neque a vestibulum tempus, ex ante faucibus leo, vel bibendum est risus vitae tellus. Vivamus dictum molestie commodo. Suspendisse pellentesque vehicula orci vitae volutpat. Donec consectetur est non libero tincidunt, eu porttitor lorem finibus. Suspendisse sit amet ipsum velit. Pellentesque eget mauris a urna pharetra finibus sed sit amet quam. Donec ultrices nunc a imperdiet placerat. Cras magna nibh, pellentesque vitae lacinia vitae, tempus quis ante. Praesent elementum nec sapien quis aliquam. Integer aliquet ante ipsum, in mattis tortor lacinia sit amet. Donec ut nulla ut tellus aliquet laoreet. Duis a cursus leo, nec venenatis dolor.
Phasellus non urna mi. Pellentesque a ligula eget nunc porttitor placerat quis et lectus. Proin dictum tristique dignissim. Cras tincidunt ligula at finibus consequat. Donec vehicula nec quam eget pretium. Nulla sem justo, placerat vitae viverra ac, consectetur nec nunc. In augue tellus, tristique ac tellus ut, mollis rhoncus nisi. In erat velit, venenatis non dignissim at, euismod sit amet mi.
Sed enim lacus, eleifend eu ex nec, luctus accumsan diam. Vivamus rutrum nunc purus, eget molestie magna venenatis suscipit. Suspendisse ac urna vel eros tempus vulputate non vitae metus. Suspendisse urna dui, semper in dignissim vitae, fermentum quis sem. Suspendisse potenti. Sed ac tellus ultrices, feugiat felis sit amet, feugiat magna. Sed pellentesque nulla nunc, vitae commodo dolor tristique vitae. Suspendisse diam massa, gravida et lectus ac, pellentesque gravida dui. Donec a justo quis leo fringilla pulvinar id quis ex. Quisque a tellus nisl. Quisque condimentum erat mauris, sit amet gravida quam pellentesque nec. Cras porttitor est porta venenatis eleifend. Donec eu est consectetur, imperdiet velit id, sodales ipsum. Phasellus vel tempor odio, id egestas nibh.
Nunc at diam posuere, suscipit diam in, commodo enim. Curabitur neque dui, sollicitudin consequat diam id, lacinia dictum mauris. Donec faucibus, orci feugiat tempus lobortis, est mauris varius risus, at tristique tortor lorem vel mi. Phasellus dapibus molestie tincidunt. Suspendisse pretium diam sapien, ac rhoncus eros posuere eu. Ut semper tellus sed velit consectetur, fringilla rutrum sapien gravida. Etiam dictum felis nunc, eget ultrices nibh mollis et. Duis a turpis justo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Nulla facilisi. Suspendisse varius venenatis urna nec convallis. Proin semper maximus fringilla. Quisque dignissim sem vel pretium facilisis. Pellentesque efficitur iaculis massa ac dapibus. Cras vehicula, odio eu laoreet tristique, est neque aliquam urna, id varius augue massa a mi. Etiam sit amet tristique sapien. Vivamus bibendum felis nec dictum venenatis. Sed posuere, diam id auctor mollis, risus ex facilisis erat, id viverra sapien risus accumsan metus. Etiam non eros quis eros malesuada molestie. Donec porttitor non enim eget laoreet. Duis bibendum sodales scelerisque. Ut condimentum faucibus sem, ac sagittis mauris scelerisque nec.
Pellentesque neque mauris, tincidunt euismod mi a, iaculis pellentesque lectus. Cras euismod accumsan nisi in feugiat. Nunc velit lorem, dignissim vel viverra sed, hendrerit ut magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam dapibus, lectus non bibendum tincidunt, arcu enim convallis odio, sit amet ultricies tortor leo in dolor. Aliquam mattis ipsum cursus lorem aliquam interdum. Aenean lobortis vulputate elit, facilisis fringilla purus tincidunt et. Proin pellentesque porta luctus. Sed massa purus, bibendum at tempor quis, aliquam eget eros. Sed tincidunt scelerisque lectus eget laoreet. In auctor et nisl vitae volutpat. Praesent consequat leo est, in gravida massa hendrerit at. Etiam finibus dui quis turpis finibus ullamcorper.
Curabitur urna dolor, bibendum bibendum aliquam in, ultricies ut sapien. Quisque consectetur sed ante sit amet mollis. Ut varius mauris libero, egestas ultricies sapien fermentum eget. Etiam eu ligula id tellus viverra pulvinar. Morbi laoreet enim ac dui dapibus tincidunt. Nam auctor maximus diam sed venenatis. Quisque rhoncus dui vel tortor consequat, volutpat pharetra nisl molestie. Vivamus dui dui, sollicitudin quis risus sed, consectetur malesuada arcu. Pellentesque facilisis fermentum purus, a bibendum augue malesuada id. Praesent iaculis nec velit non iaculis. Maecenas rutrum vulputate congue. Pellentesque blandit vehicula magna. Suspendisse tempor, lorem a venenatis rhoncus, metus augue gravida felis, ac ultricies eros nibh sit amet nisl. Nulla quis diam et tortor hendrerit mattis quis vel eros.
Vestibulum odio dolor, sagittis a fermentum quis, fermentum a ipsum. Aenean posuere ex id nulla accumsan, at vulputate orci gravida. Vestibulum eu nulla sed lacus hendrerit gravida a eu elit. Fusce varius augue sed ullamcorper auctor. Sed ac sagittis orci. Sed elementum eleifend ante, et accumsan nunc laoreet sed. Suspendisse et magna cursus ex consequat semper.
Sed placerat vel nunc non eleifend. Aenean et erat malesuada, tincidunt nulla in, viverra sem. Nunc magna nibh, fermentum eu tortor nec, ullamcorper convallis ex. Etiam sed lectus vitae sem pellentesque tincidunt quis porta purus. Nunc tortor mi, fringilla nec justo vitae, euismod vulputate odio. Curabitur malesuada scelerisque luctus. In hendrerit, odio finibus aliquet fermentum, est odio lacinia odio, ut interdum urna dolor et eros. Nulla facilisi. Praesent ornare blandit metus, a viverra leo semper vel. Ut nisl diam, pharetra quis tempus sed, tristique ut quam.
Duis ut leo eget elit convallis molestie. Quisque orci dui, pellentesque quis est et, tristique feugiat velit. Nam feugiat, quam sed ornare suscipit, ligula tellus faucibus ipsum, sed mattis magna nunc in est. Nulla commodo vel neque eget imperdiet. Proin euismod leo vitae lacinia lacinia. Nam vestibulum augue non lobortis fringilla. In non lacus tortor. Integer ultricies convallis ex, a pharetra eros venenatis lobortis. Suspendisse malesuada enim massa, at vestibulum dui vulputate a. Praesent tincidunt accumsan sem vitae rhoncus. Sed nec orci a augue bibendum gravida.
Praesent non feugiat arcu, non pulvinar massa. Nulla facilisi. Sed ornare vehicula condimentum. Sed urna ligula, semper sit amet dignissim vel, porta nec turpis. Ut facilisis ante risus, in egestas ante varius vel. Suspendisse faucibus sem at dictum fringilla. Aenean quam sapien, aliquam et ultricies id, euismod id erat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Duis ut lectus sodales, luctus odio ac, pellentesque sapien. Mauris maximus risus sit amet mauris varius sodales. Praesent luctus, massa sed dapibus congue, dui est consectetur lacus, at blandit leo nulla quis urna. Vivamus luctus erat ut augue mollis eleifend. Vestibulum sollicitudin eros id augue tempus sodales. Nunc et metus ipsum. Maecenas tristique enim at ex pharetra bibendum. Integer eu aliquet sem, nec auctor metus.
Nullam ante ex, cursus nec ex quis, euismod placerat mauris. Vivamus nisi risus, elementum non risus vel, pulvinar pretium metus. Vivamus vitae tellus risus. Mauris sit amet sagittis nulla, non efficitur lorem. Aliquam aliquam, nunc non faucibus euismod, urna justo condimentum felis, malesuada aliquet ipsum massa eu ligula. Etiam justo nisi, vehicula ut est eu, sollicitudin cursus dolor. Aliquam fermentum enim nec mi cursus porttitor.
Aenean et aliquet nisi. Proin sed hendrerit nulla. Nullam egestas sollicitudin felis non vulputate. Donec vitae interdum velit, eget mollis metus. In non sollicitudin dolor, quis consequat lectus. Integer eu neque risus. Quisque id nisi nec eros molestie congue ac ac purus. In pretium dolor hendrerit facilisis sodales. Proin tortor nulla, sollicitudin at sollicitudin ac, iaculis vitae enim. Phasellus gravida dolor sem, a suscipit sem aliquet et.
Donec quis ante lacinia urna eleifend pretium sed non mauris. Vivamus laoreet odio odio, eleifend viverra ex ultricies nec. Fusce at laoreet magna. Praesent velit sapien, vulputate quis dapibus et, porta at est. Fusce tempus venenatis purus sit amet vulputate. Nulla rhoncus neque facilisis pretium gravida. Praesent ut arcu eget dui aliquam tempor. Aliquam cursus, urna at posuere tempus, nisi tellus luctus lectus, in tincidunt massa velit sed nisl. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas sollicitudin dictum felis a lacinia. Aenean non condimentum urna. Quisque viverra magna nec viverra bibendum. Ut vitae leo eget felis pulvinar porta mattis ut dui. Pellentesque vitae est porta, elementum magna ac, fringilla tortor. Phasellus hendrerit diam eu lobortis lacinia. Aenean gravida velit ac sem ornare, a ornare metus suscipit.
Nullam vehicula sit amet neque rutrum fermentum. Quisque felis libero, euismod sed sapien ac, eleifend fringilla dui. Maecenas id tellus vel lorem fermentum auctor. Aliquam convallis justo a eleifend ornare. Fusce at ante et nulla accumsan cursus. Pellentesque elementum elit sed interdum accumsan. Quisque pharetra, neque id gravida accumsan, mi ante feugiat ipsum, id egestas risus ex non ligula. Aliquam vehicula tortor a nulla pulvinar ornare. Donec in sodales nulla. Morbi sit amet nibh fermentum, dignissim dui sed, ultrices est. Nam efficitur mi volutpat, consequat turpis eget, elementum felis. Mauris ut odio viverra, cursus libero vel, tincidunt lorem. Aenean vitae dolor eu tortor euismod placerat sed vitae velit. Curabitur non ipsum blandit, ultricies est eget, porta nisl. Nulla sit amet nisi id urna aliquet scelerisque eu vitae nunc.
Vivamus nec neque urna. Donec auctor velit ante, at vulputate purus tincidunt eleifend. In finibus tempus sapien et molestie. Quisque blandit magna magna, a interdum libero semper a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam ultrices, augue in tristique pretium, lacus dui maximus lorem, vitae vestibulum lectus justo quis lorem. Pellentesque id vehicula tortor, eget iaculis libero. Etiam mauris nisl, commodo a mauris ut, convallis scelerisque ex. Sed pharetra et nibh vitae efficitur. Fusce at porttitor mi. Proin vitae venenatis felis. In scelerisque sapien at neque iaculis tempor.
Cras malesuada nunc non aliquam pulvinar. Fusce id purus vel diam tincidunt mattis et vel leo. Sed sodales efficitur ipsum, sed gravida magna iaculis quis. Suspendisse ac nibh a justo sodales faucibus ac ac orci. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur eu tristique odio. Integer in dignissim libero.
Donec ipsum diam, ultrices id diam vel, vehicula efficitur tortor. Nullam eget enim porttitor, tempus sem id, gravida velit. Ut mi velit, tristique nec eros in, scelerisque iaculis nisl. Praesent eu luctus nibh, id ullamcorper nunc. Etiam finibus risus eget elit cursus, et commodo erat ornare. Cras tempus, sem nec sollicitudin lobortis, lacus urna placerat est, id vehicula orci felis in massa. Suspendisse vel sapien rutrum, dignissim sem id, tincidunt tellus. Morbi at nulla et velit feugiat molestie. Integer at venenatis augue. Aenean laoreet maximus lacus, in lacinia lectus efficitur vitae.
Integer sed rhoncus felis. Ut fringilla imperdiet fringilla. Vivamus feugiat mauris sit amet eros feugiat ultricies. In bibendum porttitor congue. Vivamus mattis lorem ac laoreet semper. Ut lacinia, velit ac egestas posuere, risus orci hendrerit libero, sit amet elementum nisi augue eget justo. Nullam varius nisi eu aliquam sollicitudin. Praesent ut dapibus urna. Nunc fermentum interdum turpis, et pellentesque ex faucibus tincidunt. Phasellus fermentum orci nec nisi commodo, in lobortis mi laoreet.
Sed vulputate dui dolor, nec aliquam mauris hendrerit quis. Nam nec metus placerat, consequat lorem quis, volutpat lorem. Integer malesuada neque in luctus varius. Ut at dui neque. Ut a mattis diam. Suspendisse malesuada odio ut arcu dictum ultricies. In hac habitasse platea dictumst. Nunc sed lorem cursus, auctor diam eu, vestibulum tellus. Mauris sit amet erat fringilla, efficitur massa non, tincidunt tellus. Mauris blandit leo nec commodo finibus. Praesent finibus dolor sed magna accumsan aliquet. Cras lobortis nunc turpis, ut sagittis libero posuere ac. Duis mollis diam at interdum tincidunt.
Donec ut dui sem. Suspendisse laoreet, mauris nec rutrum sodales, mi sapien tristique mi, quis tincidunt lectus lorem vitae elit. Proin diam erat, cursus in mi id, luctus vehicula tortor. Pellentesque nec laoreet nibh, sed semper nibh. Vestibulum posuere magna quis laoreet cursus. Mauris hendrerit blandit est non efficitur. Nam euismod at purus nec semper.
Nullam odio diam, egestas id arcu id, venenatis semper ipsum. Fusce molestie vestibulum rhoncus. Nunc a ligula consectetur, ullamcorper urna non, porttitor leo. Curabitur nunc nisi, rutrum nec nisl sed, euismod condimentum ipsum. Nam convallis dolor sit amet ipsum auctor, tristique eleifend felis suscipit. Donec eu magna justo. Proin venenatis in justo vitae consequat. Mauris semper est ut dui rhoncus, eu fermentum dui ultrices. Cras ut commodo purus, nec fermentum leo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
Nunc hendrerit turpis vitae nulla fringilla, non semper orci viverra. Cras ornare laoreet augue eget tempor. Suspendisse congue odio et risus cursus, ut vulputate enim scelerisque. Proin ipsum orci, dapibus tincidunt orci nec, dignissim luctus libero. Proin feugiat nec nibh vitae scelerisque. Duis quis quam imperdiet, volutpat sapien id, malesuada ligula. Fusce consectetur nisl et felis blandit, in venenatis ipsum porta.
Sed in commodo libero. Vestibulum sit amet convallis libero. Aenean tincidunt sodales ante, eu gravida est malesuada eget. In hac habitasse platea dictumst. Curabitur ac sem vestibulum, blandit dui et, imperdiet dolor. Sed mollis, orci ut iaculis bibendum, eros enim bibendum enim, a lobortis nulla leo quis quam. Sed sodales enim vel scelerisque elementum. Aliquam nec erat imperdiet augue accumsan sodales. Vivamus luctus dolor nunc, id elementum turpis consequat eu. Ut consequat maximus tempus. Integer blandit velit massa. Maecenas elementum risus pharetra congue eleifend. Vestibulum blandit commodo pretium. Fusce nec tellus non erat pellentesque molestie eget nec nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            },
        ],
    },
    "object with unicode characters": {
        schema: a.object({
            description: a.string(),
        }),
        inputs: [
            {
                description: "hello \u00ff",
            },
        ],
    },
};
