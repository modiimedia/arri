import { z } from "zod";
import { defineRoute } from "../../routes";

export default defineRoute({
    path: "/hello-world",
    method: "post",
    schema: {
        body: z.object({
            message: z.string(),
        }),
    },
    handler({ context }) {
        return context.body?.message ?? "";
    },
});
