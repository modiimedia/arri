import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";

export default defineRpc({
    method: "get",
    params: undefined,
    response: Type.Object({
        date: Type.Integer(),
        message: Type.String(),
    }),
    handler() {
        return {
            date: new Date().getTime(),
            message: "Hello world!!!",
        };
    },
});
