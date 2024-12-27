import { a } from "@arrirpc/schema";

import { defineRoute } from "./route";

test("type inference", () => {
    const QuerySchema = a.object({
        limit: a.uint8(),
    });
    type QuerySchema = a.infer<typeof QuerySchema>;
    const BodySchema = a.object({
        id: a.string(),
        count: a.number(),
        createdAt: a.timestamp(),
    });
    type BodySchema = a.infer<typeof BodySchema>;
    defineRoute({
        path: "/hello-world",
        method: "get",
        query: QuerySchema,
        body: BodySchema,
        async handler(event) {
            assertType<QuerySchema>(event.context.query);
            assertType<BodySchema>(event.context.body);
            return {
                message: "hello world",
            };
        },
        postHandler(event) {
            assertType<{ message: string }>(event.context.response);
        },
    });
    defineRoute({
        path: "/hello-world",
        method: ["get", "post"],
        handler(_) {},
    });
});
