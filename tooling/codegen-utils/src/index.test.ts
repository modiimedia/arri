import { a } from "@arrirpc/schema";

import {
    type AppDefinition,
    createAppDefinition,
    removeDisallowedChars,
    type RpcDefinition,
    setNestedObjectProperty,
    stringStartsWithNumber,
    unflattenObject,
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

    test("String starts with number", () => {
        const passingInputs = [
            "1foo",
            "2foo",
            "3foo",
            "4foo",
            "5foo",
            "6foo",
            "7foo",
            "8foo",
            "9foo",
        ];
        const failingInputs = ["foo", "bar", "baz", "oof"];
        for (const input of passingInputs) {
            expect(stringStartsWithNumber(input)).toBe(true);
        }
        for (const input of failingInputs) {
            expect(stringStartsWithNumber(input)).toBe(false);
        }
    });
});

test("create app definition", () => {
    const SettingsParams = a.object(
        {
            userId: a.string(),
        },
        {
            id: "SettingsParams",
        },
    );
    const Settings = a.object(
        {
            colorScheme: a.enumerator(["SYSTEM", "LIGHT", "DARK"]),
        },
        {
            id: "Settings",
        },
    );

    const result = createAppDefinition({
        procedures: {
            sayHello: {
                transport: "http",
                method: "post",
                path: "/say-hello",
            },
            createConnection: {
                transport: "ws",
                path: "/ws",
                params: a.object({
                    message: a.string(),
                }),
                response: a.object({
                    message: a.string(),
                }),
            },
            "utils.getSettings": {
                transport: "http",
                method: "get",
                path: "/utils/get-settings",
                params: SettingsParams,
                response: Settings,
            },
        },
    });
    const expectedResult: AppDefinition = {
        schemaVersion: "0.0.7",
        procedures: {
            sayHello: {
                transport: "http",
                method: "post",
                path: "/say-hello",
                params: undefined,
                response: undefined,
            },
            createConnection: {
                transport: "ws",
                path: "/ws",
                params: "CreateConnectionParams",
                response: "CreateConnectionResponse",
            },
            "utils.getSettings": {
                transport: "http",
                method: "get",
                path: "/utils/get-settings",
                params: "SettingsParams",
                response: "Settings",
            },
        },
        definitions: {
            CreateConnectionParams: {
                properties: {
                    message: {
                        type: "string",
                        metadata: {},
                    },
                },
                metadata: {},
            },
            CreateConnectionResponse: {
                properties: {
                    message: {
                        type: "string",
                        metadata: {},
                    },
                },
                metadata: {},
            },
            SettingsParams: {
                properties: {
                    userId: {
                        type: "string",
                        metadata: {},
                    },
                },
                metadata: {
                    id: "SettingsParams",
                },
            },
            Settings: {
                properties: {
                    colorScheme: {
                        enum: ["SYSTEM", "LIGHT", "DARK"],
                        metadata: {},
                    },
                },
                metadata: {
                    id: "Settings",
                },
            },
        },
    };
    expect(JSON.parse(JSON.stringify(result))).toStrictEqual(
        JSON.parse(JSON.stringify(expectedResult)),
    );
});
