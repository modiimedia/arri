import { z } from "zod";
import { defineRoute } from "../../routes";

export default defineRoute({
    path: "/hello-world",
    method: "get",
    schema: {
        query: z.object({
            limit: z.string().transform((val, ctx) => {
                if (isNaN(Number(val))) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Must be a number",
                    });
                }
                return z.number().parse(val);
            }),
        }),
    },
    handler() {
        return {
            message: "hello world",
        };
    },
});
