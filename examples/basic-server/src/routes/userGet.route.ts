import { defineRoute } from "arri";

export default defineRoute({
    path: "/users/:userId",
    method: "get",
    handler: (event) => {
        return {
            id: event.context.params?.userId ?? "",
            username: "johndoe",
            email: "johndoe@gmail.com",
        };
    },
});
