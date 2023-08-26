import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../../";

export default defineRpc({
    params: undefined,
    response: Type.Object({
        val: Type.Enum({
            option1: 0,
            option2: 1,
        }),
    }),
    handler: () => ({
        val: 1,
    }),
    postHandler: ({ response }) => ({}),
});
