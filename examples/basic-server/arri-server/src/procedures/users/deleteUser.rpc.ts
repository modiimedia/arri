import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";

export default defineRpc({
    method: "get",
    params: Type.Object({
        id: Type.String(),
    }),
    response: Type.Object({
        id: Type.String(),
        name: Type.String(),
    }),
    handler({ params }) {
        return {
            id: params.id,
            name: "John Doe!!!",
        };
    },
});
