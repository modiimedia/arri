import { Type } from "@sinclair/typebox";
import { Arri } from "arri";

const app = new Arri({});

app.registerRpc("test.getTest", {
    method: "get",
    params: undefined,
    response: Type.Object({
        message: Type.String(),
    }),
    handler({ params }, event) {
        return {
            message: "testing!!!",
        };
    },
});

app.registerRoute({
    path: "/routes/:id/blah",
    method: "get",
    query: Type.Object({
        id: Type.String(),
    }),
    body: Type.Object({
        hello: Type.Object({
            id: Type.String(),
        }),
    }),
    handler({ query, params }) {
        return {
            id: query.id,
            routeId: params.id,
        };
    },
});

export default app;
