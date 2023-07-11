import { test } from "vitest";
import { defineRoute } from "./routes";
import { z } from "zod";

test("routes", () => {
    const route = defineRoute({
        path: "/posts",
        method: "get",
        schema: {
            query: z.object({
                type: z.enum(["media", "all", "text"]).default("all"),
            }),
        },
        handler: (event) => {
            const posts = [
                {
                    id: "1",
                    type: "text",
                },
                {
                    id: "2",
                    type: "media",
                },
            ];
            return posts;
        },
    });
});
