import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";
import { typeboxAdapter } from "arri-adapter-typebox";

export default defineRpc({
    params: typeboxAdapter(
        Type.Object({
            id: Type.String(),
            timestamp: Type.Integer(),
        }),
    ),
    response: typeboxAdapter(
        Type.Object({
            message: Type.String(),
        }),
    ),
    handler() {
        return {
            message: "",
        };
    },
});
