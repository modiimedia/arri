/* eslint-disable @typescript-eslint/no-loss-of-precision */
import { a } from "../_index";
import { type ASchema } from "../schemas";

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
    float32: {
        schema: a.float64(),
        goodInputs: [1491.13941, -134918.134],
        badInputs: ["hello world", true, null],
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
                type: "",
            },
            { id: "" },
            {},
        ],
        badInputs: [{ id: 1, createdAt: null }, null, "hello world"],
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
};
