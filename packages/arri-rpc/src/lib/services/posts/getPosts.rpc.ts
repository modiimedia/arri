import { defineRpc } from "../../arri-rpc";

export default defineRpc({
    method: "get",
    async handler(_) {
        return [];
    },
});
