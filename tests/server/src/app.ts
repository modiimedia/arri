import { ArriApp } from "arri";
import usersRouter from "./routes/users";

const app = new ArriApp({
    rpcRoutePrefix: "rpcs",
    onRequest(event) {},
});

app.route({
    path: "/status",
    method: "get",
    handler() {
        return "ok";
    },
});

app.use(usersRouter);

export default app;
