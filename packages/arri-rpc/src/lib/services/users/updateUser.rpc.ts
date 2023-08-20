import { z } from "zod";
import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "post",
    params: z.object({
        userId: z.string(),
        data: z.object({
            firstName: z.string(),
            lastName: z.string(),
        }),
    }),
    async handler({ params }) {},
});
