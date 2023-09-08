import a from "arri-validate";

export const User = a.object(
    {
        id: a.string(),
        name: a.string(),
        email: a.string({ nullable: true }),
        createdAt: a.timestamp(),
    },
    { id: "User" },
);
export type User = a.infer<typeof User>;
export const UserParams = a.object(
    {
        userId: a.string(),
    },
    { id: "UserParams" },
);

export const Post = a.object(
    {
        id: a.string(),
        title: a.string(),
        content: a.string(),
        createdAt: a.timestamp(),
        numLikes: a.int32(),
        numComments: a.int32(),
        userId: a.string(),
        user: User,
    },
    { id: "Post", optionalProperties: ["user"] },
);
export type Post = a.infer<typeof Post>;
export const PostParams = a.object(
    {
        postId: a.string(),
    },
    { id: "PostParams" },
);
export type PostParams = a.infer<typeof PostParams>;
