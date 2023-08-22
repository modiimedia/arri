import { defineRpc } from "../../arri-rpc";
import { Type } from "@sinclair/typebox";

export default defineRpc({
    method: "get",
    params: Type.Object({
        userId: Type.String(),
    }),
    async handler({ params }) {
        return {
            id: params.userId,
            title: "Hello world",
        };
    },
});
