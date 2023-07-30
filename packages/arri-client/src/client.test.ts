import type { H3Event } from "h3";
import { ArriClient, type ApiDefinition } from "./client";
import { z } from "zod";

describe("ApiDefinition Tests", () => {
    test("", async () => {
        const UpdateUserBody = z.object({
            id: z.string(),
            name: z.string(),
        });
        const GetUserPostsQuery = z.object({
            cursor: z.string(),
        });
        interface TestDef extends ApiDefinition {
            get: {
                "/users/:userId": {
                    path: "/users/:userId";
                    method: "get";
                    handler: (event: H3Event) => string;
                };
                "/users/:userId/posts": {
                    path: "/users/:userId/posts";
                    method: "get";
                    schema: {
                        query: typeof GetUserPostsQuery;
                    };
                    handler: (
                        event: H3Event
                    ) => Array<{ id: string; content: string }>;
                };
            };
            head: any;
            patch: any;
            post: {
                "/users/:userId": {
                    path: "/users/:userId";
                    method: "post";
                    schema: {
                        body: typeof UpdateUserBody;
                    };
                    handler: (event: H3Event) => string;
                };
            };
            put: any;
            delete: any;
            connect: any;
            options: any;
            trace: any;
        }
        const client = new ArriClient<TestDef>();
        expectTypeOf(client.get("/users/:userId")).toEqualTypeOf<
            Promise<string>
        >();
        expectTypeOf(client.get("/users/:userId/posts")).toEqualTypeOf<
            Promise<Array<{ id: string; content: string }>>
        >();
    });
});
