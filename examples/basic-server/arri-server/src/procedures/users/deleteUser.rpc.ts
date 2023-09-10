import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";
import { a } from "arri-validate";

export default defineRpc({
    method: "get",
    params: a.object({
        id: a.string(),
    }),
    response: a.object({
        id: a.string(),
        name: a.string(),
    }),
    handler({ params }) {
        return {
            id: params.id,
            name: "John Doe!!!",
        };
    },
});
