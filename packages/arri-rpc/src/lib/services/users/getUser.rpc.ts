import { defineRpc } from "../../arri-rpc";
import { Type } from "@sinclair/typebox";

export default defineRpc({
    method: "get",
    params: Type.Object(
        {
            userId: Type.String(),
            limit: Type.Integer({ maximum: 100, minimum: 10 }),
        },
        { $id: "usersGetUserParams" }
    ),
    async handler({ params }) {
        return {
            userId: params.userId,
        };
    },
});
