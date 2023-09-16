import { defineRpc } from "arri";
import { a } from "arri-validate";

export default defineRpc({
    method: "get",
    params: undefined,
    response: a.object({
        id: a.string(),
        username: a.string(),
        email: a.string(),
        createdAt: a.int32(),
    }),
    handler() {
        return {
            id: "12345",
            username: "johndoe",
            email: "johndoe@gmail.com",
            createdAt: new Date().getTime(),
        };
    },
});
