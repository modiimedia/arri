import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";
import { typeboxAdapter } from "arri-adapter-typebox";

const params = typeboxAdapter(
    Type.Object({
        string: Type.String(),
        boolean: Type.Boolean(),
        integer: Type.Integer(),
        number: Type.Number(),
        enumField: Type.Enum({
            A: "A",
            B: "B",
            C: "C",
        }),
        object: Type.Object({
            string: Type.String(),
        }),
        array: Type.Array(Type.Boolean()),
        optionalString: Type.Optional(Type.String()),
    }),
);

const response = typeboxAdapter(
    Type.Object({
        message: Type.String(),
    }),
);

export default defineRpc({
    params,
    response,
    handler() {
        return {
            message: "ok",
        };
    },
});
