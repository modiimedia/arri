import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../../src/procedures";

export default defineRpc({
    params: undefined,
    response: Type.Object({
        message: Type.String(),
    }),
    handler() {
        return {
            message: "hello world",
        };
    },
});
