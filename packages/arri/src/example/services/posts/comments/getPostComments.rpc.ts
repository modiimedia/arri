import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../../../";

export default defineRpc({
    method: "get",
    params: Type.Object({
        postId: Type.String(),
    }),
    response: Type.Object({
        items: Type.Array(
            Type.Object({
                id: Type.String(),
                createdAt: Type.Date(),
                content: Type.String(),
                userId: Type.String(),
            }),
        ),
    }),
    handler: () => ({
        items: [],
    }),
} as const);
