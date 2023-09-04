import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";

export default defineRpc({
    method: "get",
    params: undefined,
    response: Type.Object({
        id: Type.String(),
        username: Type.String(),
        email: Type.String(),
        createdAt: Type.Integer(),
    }),
    handler() {
        return {
            id: "12345",
            username: "johndoe",
            email: "johndoe@gmail.com",
            createdAt: new Date().getTime(),
        };
    },
});
