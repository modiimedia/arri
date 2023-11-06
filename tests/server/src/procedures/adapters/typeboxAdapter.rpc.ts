import { Type } from "@sinclair/typebox";
import { defineRpc } from "arri";
import { typeboxAdapter } from "arri-adapter-typebox";

export default defineRpc({
    params: typeboxAdapter(
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
    ),
    response: typeboxAdapter(
        Type.Object({
            message: Type.String(),
        }),
    ),
    handler() {
        return {
            message: "ok",
        };
    },
});
