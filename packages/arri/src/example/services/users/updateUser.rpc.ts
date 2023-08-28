import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../../_index";

export default defineRpc({
    method: "post",
    params: Type.Object({
        userId: Type.String(),
        data: Type.Object({
            firstName: Type.String(),
            lastName: Type.String(),
        }),
    }),
    response: undefined,
    async handler({ params }) {},
});
