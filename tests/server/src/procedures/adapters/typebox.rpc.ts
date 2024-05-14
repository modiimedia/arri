import { typeboxAdapter } from "@arrirpc/adapter-typebox";
import { defineRpc } from "@arrirpc/server";
import { Type } from "@sinclair/typebox";

const TypeBoxObject = typeboxAdapter(
    Type.Object(
        {
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
        },
        {
            $id: "TypeBoxObject",
        },
    ),
);

export default defineRpc({
    params: TypeBoxObject,
    response: TypeBoxObject,
    handler({ params }) {
        return params;
    },
});
