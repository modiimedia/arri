import { a } from "@arrirpc/schema";
import { defineError, defineRpc } from "@arrirpc/server";

export default defineRpc({
    params: a.object("SendErrorParams", {
        code: a.uint16(),
        message: a.string(),
    }),
    response: undefined,
    handler({ params }) {
        throw defineError(params.code, { message: params.message });
    },
});
