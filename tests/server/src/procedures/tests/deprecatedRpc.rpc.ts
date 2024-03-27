import { defineRpc } from "arri";
import { a } from "arri-validate";

export default defineRpc({
    description: "This RPC is no longer supported",
    isDeprecated: true,
    params: a.object(
        {
            deprecatedField: a.string({ isDeprecated: true }),
        },
        { id: "DeprecatedRpcParams", isDeprecated: true },
    ),
    response: undefined,
    handler() {},
});
