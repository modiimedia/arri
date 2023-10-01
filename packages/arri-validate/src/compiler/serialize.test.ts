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
