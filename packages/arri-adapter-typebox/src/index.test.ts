import { Type } from "@sinclair/typebox";
import type { a } from "arri-validate";
import { typeboxAdapter } from "./index";

test("Type Inference", () => {
    const Schema = typeboxAdapter(
        Type.Object({
            id: Type.String(),
            email: Type.String(),
            createdAt: Type.Integer(),
        }),
    );
    type Schema = a.infer<typeof Schema>;
    assertType<Schema>({
        id: "string",
        email: "string",
        createdAt: 0,
    });
    const SchemaWithOptionals = typeboxAdapter(
        Type.Object({
            id: Type.String(),
            email: Type.Optional(Type.String()),
            role: Type.Enum({
                standard: "standard",
                admin: "admin",
            }),
            posts: Type.Array(
                Type.Object({
                    id: Type.String(),
                    title: Type.String(),
                    numComments: Type.Optional(Type.Integer()),
                    numLikes: Type.Optional(Type.Integer()),
                }),
            ),
        }),
    );
    type SchemaWithOptionals = a.infer<typeof SchemaWithOptionals>;
    assertType<SchemaWithOptionals>({
        id: "12345",
        email: undefined,
        role: "admin",
        posts: [
            {
                id: "123455",
                title: "",
                numComments: 2,
                numLikes: 5,
            },
            {
                id: "123j5",
                title: "1324lk14j",
            },
        ],
    });
});
