import { type Static, Type } from "@sinclair/typebox";
import { ArriApplication } from "../lib/arri-rpc";
import { defineRpcMiddleware } from "../lib/router";

const app = new ArriApplication();
app.registerMiddleware(defineRpcMiddleware((event) => {}));

app.registerRpc("users.getUser", {
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

const UserSchema = Type.Object(
    {
        id: Type.String(),
        createdAt: Type.Date(),
        updatedAt: Type.Date(),
        email: Type.String(),
    },
    { $id: "UserSchema" }
);

const PostResponse = Type.Object({
    null: Type.Null(),
    undefined: Type.Undefined(),
    unint8Array: Type.Uint8Array(),
    bigInt: Type.BigInt(),
    union: Type.Union([Type.Literal("option1"), Type.Literal("option2")]),
    enum: Type.Enum({
        option1: "option1",
        option2: "option2",
    }),
    array: Type.Array(
        Type.Object({
            id: Type.String(),
            name: Type.String(),
        })
    ),
    record: Type.Record(
        Type.String(),
        Type.Object({
            id: Type.String(),
            name: Type.String(),
            updatedAt: Type.Number(),
        })
    ),
    ref: Type.Ref(UserSchema),
});

type PostResponse = Static<typeof PostResponse>;

app.registerRpc("posts.getPost", {
    method: "get",
    params: Type.Object({
        postId: Type.String(),
    }),
    response: PostResponse,
    handler: () => {
        return {
            null: null,
            // eslint-disable-next-line object-shorthand
            undefined: undefined,
            unint8Array: new Uint8Array(),
            bigInt: BigInt(0),
            union: "option2" as const,
            enum: "option1" as const,
            array: [{ id: "12345", name: "john" }],
            record: {},
            ref: {
                id: "12345",
                email: "josh@josh",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
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
