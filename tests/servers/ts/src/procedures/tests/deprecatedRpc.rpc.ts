import { a } from "../../../../../../languages/ts/ts-schema/dist";
import { defineRpc } from "@arrirpc/server";

export default defineRpc({
    description:
        "If the target language supports it. Generated code should mark this procedure as deprecated.",
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
