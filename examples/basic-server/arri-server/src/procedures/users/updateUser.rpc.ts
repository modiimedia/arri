import { defineRpc } from "arri";
import { a } from "arri-validate";

export default defineRpc({
    method: "get",
    params: a.object({
        userId: a.string(),
    }),
    response: a.object({
        id: a.string(),
        username: a.string(),
        email: a.string(),
    }),
    handler({ params }) {
        return {
            id: params.userId,
            username: "johndoe",
            email: "johndoe@gmail.com",
        };
    },
});
