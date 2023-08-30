import { Type } from "@sinclair/typebox";
import { Arri, defineMiddleware } from "../_index";

const app = new Arri();

app.registerMiddleware(defineMiddleware((event) => {}));

app.registerRpc("users.getAnotherUser", {
    method: "get",
    params: undefined,
    response: Type.Object({
        message: Type.String(),
    }),
    handler({ params }) {
        return {
            message: "hello world",
        };
    },
});

app.registerRpc("comments.getComment", {
    method: "get",
    params: Type.Object({
        commentId: Type.String(),
    }),
    response: Type.Object({
        id: Type.String(),
        username: Type.Optional(Type.String()),
        content: Type.String(),
    }),
    handler: ({ params }) => {
        return {
            id: params.commentId,
            username: "josh",
            content: "Wow you really suck!",
        };
    },
});

app.registerRpc("posts.getPost", {
    method: "get",
    params: undefined,
    response: Type.Object({
        id: Type.String(),
        title: Type.String(),
        imageUrl: Type.String(),
        numLikes: Type.Integer(),
        numComments: Type.Integer(),
        numViews: Type.Integer(),
        createdAt: Type.Date(),
        authorId: Type.String(),
    }),
    handler() {
        return {
            id: "12345",
            title: "Hello world",
            imageUrl: "https://source.unsplash.com/random",
            numComments: 100,
            numLikes: 100000012312314,
            numViews: 12414125131513,
            createdAt: new Date(),
            authorId: "1",
        };
    },
});

app.registerRpc("users.blah", {
    method: "get",
    params: undefined,
    response: Type.Object({
        value: Type.Enum({
            option1: "1",
            option2: "2",
        }),
    }),
    handler: () => {
        const result = {
            value: "1",
        } as const;
        return result;
    },
});

app.registerRpc("users.updateUser", {
    method: "get",
    params: Type.Object({
        userId: Type.Number(),
        date: Type.Date(),
    }),
    response: Type.Object({
        id: Type.String(),
        email: Type.String(),
        username: Type.String(),
        updatedAt: Type.Date(),
    }),
    handler({ params }) {
        return {
            id: params.userId.toString(),
            email: "josh@josh.com",
            username: "joshjosh",
            updatedAt: new Date(),
        };
    },
});
export default app;
