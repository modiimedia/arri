import { a } from "@arrirpc/schema";
import { defineRpc } from "@arrirpc/server";
import { ObjectWithEveryType } from "./sendObject.rpc";

const input = a.partial(ObjectWithEveryType, {
    id: "ObjectWithEveryOptionalType",
});

export default defineRpc({
    params: input,
    response: input,
    handler({ params }) {
        return params;
    },
});
