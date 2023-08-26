import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../../";

export default defineRpc({
    method: "post",
    response: Type.Object({
        total: Type.Integer(),
        items: Type.Array(
            Type.Object({
                id: Type.String(),
                createdAt: Type.Date(),
                content: Type.String(),
            }),
        ),
    }),
    params: Type.Object({
        total: Type.Number(),
        items: Type.Array(Type.Undefined()),
    }),
    async handler(_) {
        return {
            total: 10,
            items: [],
        };
    },
});
