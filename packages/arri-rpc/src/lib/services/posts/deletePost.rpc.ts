import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "post",
    handler: () => ({ message: "Hello world" }),
});
