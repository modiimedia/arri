import { defineRpc } from "arri";
import { a } from "arri-validate";

export default defineRpc({
    method: "get",
    params: undefined,
    response: a.object({
        message: a.string(),
    }),
    handler() {
        return {
            message: "ok",
        };
    },
});
