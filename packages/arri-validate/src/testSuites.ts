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

export const testSuites: Record<
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
        goodInputs: ["hello world"],
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
        schema: a.object({
            id: a.nullable(a.string()),
            createdAt: a.nullable(a.timestamp()),
            count: a.nullable(a.number()),
            isActive: a.nullable(a.boolean()),
            tags: a.nullable(a.array(a.string())),
            metadata: a.nullable(a.record(a.string())),
        }),
        goodInputs: [
            {
                id: null,
                createdAt: null,
                count: null,
                isActive: null,
                tags: null,
                metadata: null,
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
    "object with multiline strings": {
        schema: a.object({
            description: a.string(),
        }),
        goodInputs: [{ description: "hello\nworld\nhow are you" }],
        badInputs: [null, false],
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
};
