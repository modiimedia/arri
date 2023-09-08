import { writeFileSync } from "fs";
import a from ".";

const User = a.object(
    {
        id: a.string(),
        role: a.stringEnum(["standard", "admin", "moderator"]),
        createdAt: a.timestamp(),
    },
    { id: "User" },
);
type User = a.infer<typeof User>;
const UserParams = a.pick(User, ["id"], { id: "UserParams" });

const Post = a.object(
    {
        id: a.string(),
        title: a.string(),
        metadata: a.object({
            numLikes: a.int32(),
            numComments: a.int32(),
        }),
        userId: a.string(),
        user: User,
    },
    { id: "Post" },
);
type Post = a.infer<typeof Post>;
const PostParams = a.pick(Post, ["id"], { id: "PostParams" });

test("", () => {
    const def = {
        procedures: {
            "users.getUser": {
                method: "get",
                path: "/users/get-user",
                params: "UserParams",
                response: "User",
            },
            "posts.getPost": {
                method: "get",
                path: "/posts/get-post",
                params: "PostParams",
                response: "Post",
            },
        },
        models: {
            User,
            UserParams,
            Post,
            PostParams,
        },
    };
    writeFileSync("output.json", JSON.stringify(def));
});
