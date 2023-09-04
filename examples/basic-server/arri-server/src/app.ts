import { Type } from "@sinclair/typebox";
import { Arri } from "arri";

const app = new Arri();

app.registerRpc("test.getTest", {
    method: "get",
    params: undefined,
    response: Type.Object({
        message: Type.String(),
    }),
    handler() {
        return {
            message: "testing",
        };
    },
});

export default app;
