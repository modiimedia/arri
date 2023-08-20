import { z } from "zod";
import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "get",
    params: z.object({
        userId: z.string(),
    }),
    async handler({ params }) {
        return {
            userId: params.userId,
        };
    },
});
