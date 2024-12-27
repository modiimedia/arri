import { a } from "../../../../../../languages/ts/ts-schema/dist";
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
