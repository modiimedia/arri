import {
    ArriApp,
    defineError,
    defineMiddleware,
    getHeader,
    readBody,
} from "arri";
import usersRouter from "./routes/users";

const app = new ArriApp({
    rpcRoutePrefix: "rpcs",
    onRequest(event) {},
    async onError(error, event) {
        console.log("BODY", await readBody(event));
        console.log(error);
    },
});

app.use(
    defineMiddleware((event) => {
        const authHeader = getHeader(event, "x-test-header");
        if (!authHeader?.length) {
            throw defineError(401, {
                statusMessage: "Missing test auth header 'x-test-header'",
            });
        }
    }),
);

app.route({
    path: "/status",
    method: "get",
    handler() {
        return "ok";
    },
});

app.use(usersRouter);

export default app;