import { defineRoute } from "arri";

export default defineRoute({
    path: "/hello-world-2",
    method: "get",
    handler: () => "hello world!~~~",
});
