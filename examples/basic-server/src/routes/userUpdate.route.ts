import { defineRoute } from "arri";
import { z } from "zod";

export default defineRoute({
    path: "/users/:userId",
    method: "post",
    schema: {
        body: z.object({
            email: z.string(),
            username: z.string(),
        }),
    },
    handler({ context }) {
        const { userId } = context.params;
        const { email, username } = context.body;
        return {
            id: userId,
            email,
            username,
        };
    },
    postHandler({ context }) {},
});
