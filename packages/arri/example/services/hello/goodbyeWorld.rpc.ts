import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../../src/procedures";

export default defineRpc({
    method: "post",
    params: Type.Object({
        message: Type.String(),
    }),
    response: Type.Object({
        id: Type.String(),
        message: Type.String(),
    }),
    handler({ params }) {
        return { id: "12345", message: params.message + "!!!!!!!!!!!!" };
    },
});
