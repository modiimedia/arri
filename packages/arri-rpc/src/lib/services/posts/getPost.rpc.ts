import { z } from "zod";
import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "get",
    params: z.object({
        postId: z.string(),
    }),
    async handler(_) {
        return {
            id: "12345",
            title: "Hello world",
        };
    },
});
