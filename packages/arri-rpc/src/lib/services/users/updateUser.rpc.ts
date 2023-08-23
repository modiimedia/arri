import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "post",
    params: Type.Object({
        userId: Type.String(),
        data: Type.Object({
            firstName: Type.String(),
            lastName: Type.String(),
        }),
    }),
    async handler({ params }) {
        return "";
    },
});
