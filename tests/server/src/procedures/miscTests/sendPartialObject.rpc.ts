import { defineRpc } from "arri";
import { a } from "arri-validate";
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
