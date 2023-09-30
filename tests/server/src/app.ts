import { ArriApp } from "arri";
import usersRouter from "./routes/users";

const app = new ArriApp({
    rpcRoutePrefix: "rpcs",
    onRequest(event) {},
});

app.rpc({
    name: "example.helloWorld",
    params: undefined,
    response: undefined,
    handler({ params }) {},
});

app.use(usersRouter);

export default app;
