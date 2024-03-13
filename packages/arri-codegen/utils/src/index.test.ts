import {
    unflattenObject,
    setNestedObjectProperty,
    removeDisallowedChars,
    type RpcDefinition,
} from "./index";

describe("unflattenObject()", () => {
    test("Simple Unflatten", () => {
        const flattened = {
            "hello.world": "hello world",
            "another.nested.message": "hello world",
        };
        expect(JSON.stringify(unflattenObject(flattened))).toEqual(
            JSON.stringify({
                hello: {
                    world: "hello world",
                },
                another: {
                    nested: {
                        message: "hello world",
                    },
                },
            }),
        );
    });

    test("Complex Unflatten", () => {
        const input: Record<string, RpcDefinition> = {
            "posts.getPost": {
                transport: "http",
                method: "get",
                path: "/posts/get-post",
                params: "PostsGetPostParams",
                response: "PostsGetPostResponse",
            },
            "posts.updatePost": {
                transport: "http",
                method: "post",
                path: "/posts/update-post",
                params: "PostsUpdatePostParams",
                response: "PostsUpdatePostResponse",
            },
            "posts.comments.getComment": {
                transport: "http",
                method: "get",
                path: "/posts/comments/get-comment",
                params: "GetCommentParams",
                response: "GetCommentResponse",
            },
            "users.getUser": {
                transport: "http",
                method: "get",
                path: "/users/getUser",
                params: "UserParams",
                response: "User",
            },
        };
        expect(JSON.stringify(unflattenObject(input))).toEqual(
            JSON.stringify({
                posts: {
                    getPost: {
                        transport: "http",
                        method: "get",
                        path: "/posts/get-post",
                        params: "PostsGetPostParams",
                        response: "PostsGetPostResponse",
                    },
                    updatePost: {
                        transport: "http",
                        method: "post",
                        path: "/posts/update-post",
                        params: "PostsUpdatePostParams",
                        response: "PostsUpdatePostResponse",
                    },
                    comments: {
                        getComment: {
                            transport: "http",
                            method: "get",
                            path: "/posts/comments/get-comment",
                            params: "GetCommentParams",
                            response: "GetCommentResponse",
                        },
                    },
                },
                users: {
                    getUser: {
                        transport: "http",
                        method: "get",
                        path: "/users/getUser",
                        params: "UserParams",
                        response: "User",
                    },
                },
            }),
        );
    });
});

describe("setNestedObjectProperty()", () => {
    test("Assign some values", () => {
        const blah: Record<string, any> = {};
        setNestedObjectProperty("users.1", { id: 1, name: "John Doe" }, blah);
        setNestedObjectProperty("users.2", { id: 2, name: "Suzy Q" }, blah);
        expect(blah).toStrictEqual({
            users: {
                1: {
                    id: 1,
                    name: "John Doe",
                },
                2: {
                    id: 2,
                    name: "Suzy Q",
                },
            },
        });
    });
});

describe("String utils", () => {
    test("Remove symbols", () => {
        const disallowed = "!@#$%^&*()+|}{[];:'\"~/,=";
        const input = "+hello_%world!";
        expect(removeDisallowedChars(input, disallowed)).toBe("hello_world");
    });
});
