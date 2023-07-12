import { z } from "zod";
import { defineRoute } from "../../../routes";

export const User = z.object({
    id: z.string(),
    name: z.string(),
    created: z.number(),
});

export type User = z.infer<typeof User>;

export default defineRoute({
    id: "UserUpdateRoute",
    path: "/users/:userId",
    method: "post",
    schema: {
        body: User.partial(),
    },
    handler(event) {
        return {
            userId: event.context.params?.userId,
            data: event.context.body,
        };
    },
});
