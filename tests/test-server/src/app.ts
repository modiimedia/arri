import { ArriApp } from "arri";

const app = new ArriApp({
    rpcRoutePrefix: "rpcs",
});

app.rpc("users.getUser", {
    params: undefined,
    response: undefined,
    handler({ params }) {},
});
