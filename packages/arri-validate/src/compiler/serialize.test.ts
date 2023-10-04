import { a } from "../_index";
import { compileV2 } from "../compile";

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

const postValidator = compileV2(Post);

it("should output valid json", () => {
    const postInput: Post = {
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
    };
    const result = postValidator.serialize(postInput);
    JSON.parse(result);
    expect(a.safeParse(Post, result).success);
});

it("serializes strings", () => {
    const Compiled = compileV2(a.string());
    expect(Compiled.serialize("Hello World")).toBe("Hello World");
});
it("serializes timestamp", () => {
    const Compiled = compileV2(a.timestamp());
    const input = new Date();
    expect(Compiled.serialize(input)).toBe(input.toISOString());
});
it("serializes boolean", () => {
    const Compiled = compileV2(a.boolean());
    expect(Compiled.serialize(true)).toBe("true");
});
it("serializes enum", () => {
    const Compiled = compileV2(
        a.stringEnum(["ADMIN", "STANDARD", "MODERATOR"]),
    );
    expect(Compiled.serialize("ADMIN")).toBe("ADMIN");
});
it("serializes objects", () => {
    const Compiled = compileV2(
        a.object({
            a: a.string(),
            b: a.stringEnum(["A", "B", "C"]),
            c: a.number(),
            d: a.boolean(),
            e: a.timestamp(),
        }),
    );
    const inputDate = new Date();
    expect(
        Compiled.serialize({
            a: "hello world",
            b: "B",
            c: 10,
            d: false,
            e: inputDate,
        }),
    ).toBe(
        `{"a":"hello world","b":"B","c":10,"d":false,"e":"${inputDate.toISOString()}"}`,
    );
});

it("serializes objects will nullable fields", () => {
    const Compiled = compileV2(
        a.object(
            {
                a: a.nullable(a.string()),
                b: a.nullable(a.stringEnum(["B"])),
                c: a.nullable(a.number()),
                d: a.nullable(a.boolean()),
                e: a.nullable(a.timestamp()),
            },
            { id: "NullableObject" },
        ),
    );
    const inputDate = new Date();
    expect(
        Compiled.serialize({
            a: "hello world",
            b: "B",
            c: 10,
            d: false,
            e: inputDate,
        }),
    ).toBe(
        `{"a":"hello world","b":"B","c":10,"d":false,"e":"${inputDate.toISOString()}"}`,
    );
    expect(
        Compiled.serialize({ a: null, b: null, c: null, d: null, e: null }),
    ).toBe(`{"a":null,"b":null,"c":null,"d":null,"e":null}`);
});
