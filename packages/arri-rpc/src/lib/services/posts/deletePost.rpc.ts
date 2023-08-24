import { Type } from "@sinclair/typebox";
import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "post",
    response: Type.String(),
    handler: () => ({ message: "Hello world" }),
});
