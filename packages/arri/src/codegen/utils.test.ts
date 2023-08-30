import {
    type ProcedureDefinition,
    unflattenObject,
    setNestedObjectProperty,
    removeDisallowedChars,
} from "./utils";

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
        const input: Record<string, ProcedureDefinition> = {
            "posts.getPost": {
                method: "get",
                path: "/posts/get-post",
                params: "PostsGetPostParams",
                response: "PostsGetPostResponse",
            },
            "posts.updatePost": {
                method: "post",
                path: "/posts/update-post",
                params: "PostsUpdatePostParams",
                response: "PostsUpdatePostResponse",
            },
            "posts.comments.getComment": {
                method: "get",
                path: "/posts/comments/get-comment",
                params: "GetCommentParams",
                response: "GetCommentResponse",
            },
            "users.getUser": {
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
                        method: "get",
                        path: "/posts/get-post",
                        params: "PostsGetPostParams",
                        response: "PostsGetPostResponse",
                    },
                    updatePost: {
                        method: "post",
                        path: "/posts/update-post",
                        params: "PostsUpdatePostParams",
                        response: "PostsUpdatePostResponse",
                    },
                    comments: {
                        getComment: {
                            method: "get",
                            path: "/posts/comments/get-comment",
                            params: "GetCommentParams",
                            response: "GetCommentResponse",
                        },
                    },
                },
                users: {
                    getUser: {
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
