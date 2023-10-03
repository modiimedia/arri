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

const PostValidator = compileV2(Post);
const goodInput: Post = {
    id: "",
    isFeatured: false,
    userId: "",
    user: {
        id: "",
        photo: {
            url: "",
            width: 500,
            height: null,
        },
    },
    type: "text",
    title: "",
    content: "",
    tags: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    numComments: 199,
    numLikes: 2888,
    unknownField: {
        blah: "blah",
        blahBlah: {
            blah: false,
        },
    },
    comments: [
        {
            commentType: "TEXT",
            user: {
                id: "1",
                photo: undefined,
            },
            userId: "1",
            text: "You suck",
        },
        {
            commentType: "IMAGE",
            user: {
                id: "2",
                photo: {
                    url: "",
                    height: 10,
                    width: 10,
                },
            },
            userId: "2",
            imageUrl: "https://someimage.com/image.jpg",
        },
    ],
    numArray: [50, 100, 20],
    stringArray: ["50", "100", "20"],
    metadata: {
        foo: {
            key: "foo",
            createdAt: new Date(),
        },
        bar: {
            key: "bar",
            createdAt: new Date(),
        },
    },
};
it("validates good input", () => {
    expect(PostValidator.validate(goodInput));
});
it("doesn't validate bad input", () => {
    const badInput1 = {
        ...goodInput,
        numArray: ["1", "2", "50"],
    };
    expect(PostValidator.validate(badInput1)).toBe(false);
    const badInput2 = {
        ...goodInput,
        metadata: { foo: { name: "blah", createdAt: 0 } },
    };
    expect(!PostValidator.validate(badInput2)).toBe(false);
});
