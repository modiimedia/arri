import { faker } from "@faker-js/faker";
import { defineRpc } from "arri";
import { a } from "arri-validate";

const UserSchema = a.object(
    {
        id: a.string(),
        email: a.string(),
        username: a.string(),
    },
    { id: "UserSchema" },
);

type UserSchema = a.infer<typeof UserSchema>;

export default defineRpc({
    method: "get",
    params: a.object({
        limit: a.number(),
    }),
    response: a.object({
        total: a.int32(),
        items: a.array(UserSchema),
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
