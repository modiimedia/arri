import { defineRoute } from "arri";

export default defineRoute({
    path: "/hello-world",
    method: "get",
    handler: () => "hello world!",
});
