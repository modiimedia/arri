import { faker } from "@faker-js/faker";
import { type Static, Type } from "@sinclair/typebox";
import { defineRpc } from "arri";

const UserSchema = Type.Object(
    {
        id: Type.String(),
        email: Type.String(),
        username: Type.String(),
    },
    { $id: "UserSchema" },
);

type UserSchema = Static<typeof UserSchema>;

export default defineRpc({
    method: "get",
    params: Type.Object({
        limit: Type.Number({ minimum: 1, maximum: 100 }),
    }),
    response: Type.Object({
        total: Type.Literal(1513951),
        items: Type.Array(UserSchema),
    }),
    handler({ params }) {
        const users: UserSchema[] = [];
        for (let i = 0; i < params.limit; i++) {
            users.push({
                id: faker.string.uuid(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
            });
        }
        return {
            total: 1513951 as const,
            items: users,
        };
    },
});
