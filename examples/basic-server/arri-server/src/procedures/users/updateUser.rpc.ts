import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";

export default defineRpc({
    method: "get",
    params: Type.Object({
        userId: Type.String(),
    }),
    response: Type.Object({
        id: Type.String(),
        username: Type.String(),
        email: Type.String(),
    }),
    handler({ params }) {
        return {
            id: params.userId,
            username: "johndoe",
            email: "johndoe@gmail.com",
        };
    },
});
