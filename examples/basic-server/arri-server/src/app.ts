import { Type } from "@sinclair/typebox";
import { Arri } from "arri";

const app = new Arri();

const User = Type.Object(
    {
        id: Type.String(),
        name: Type.String(),
        email: Type.String(),
        createdAt: Type.Integer(),
    },
    {
        $id: "User",
    },
);

app.registerRpc("users.getUser", {
    method: "get",
    params: Type.Object({
        userId: Type.String(),
    }),
    response: User,
    handler({ params }) {
        return {
            id: params.userId,
            name: "John Doe",
            email: "johndoe@gmail.com",
            createdAt: new Date().getTime(),
        };
    },
});

app.registerRpc("users.updateUser", {
    params: Type.Object({
        userId: Type.String(),
        data: Type.Omit(User, ["id"], { $id: "UserUpdateData" }),
    }),
    response: User,
    handler({ params }) {
        return {
            id: params.userId,
            name: params.data.name,
            email: params.data.email,
        };
    },
});

export default app;
