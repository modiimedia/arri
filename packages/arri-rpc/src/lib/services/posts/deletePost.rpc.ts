import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "get",
    handler: () => ({ message: "Hello world" }),
});
