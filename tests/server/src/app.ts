import {
    ArriApp,
    defineError,
    defineMiddleware,
    getHeader,
    handleCors,
} from "arri";
import { a } from "arri-validate";
import usersRouter from "./routes/users";

const app = new ArriApp({
    rpcRoutePrefix: "rpcs",
    appInfo: {
        version: "10",
    },
    onRequest(event) {
        handleCors(event, {
            origin: "*",
        });
    },
    onBeforeResponse(event) {
        console.log({
            rpc: event.context.rpcName,
            response: event.context.response,
        });
    },
});

app.use(
    defineMiddleware((event) => {
        if (event.path.includes("/send-object-stream")) {
            return;
        }
        const authHeader = getHeader(event, "x-test-header");
        if (
            !authHeader?.length &&
            event.path !== "/status" &&
            event.path !== "/favicon.ico"
        ) {
            throw defineError(401, {
                statusMessage: "Missing test auth header 'x-test-header'",
            });
        }
    }),
);

app.use(
    defineMiddleware((event) => {
        console.log(`REQUEST`, event.context.rpcName);
    }),
);

app.route({
    path: "/status",
    method: "get",
    handler() {
        return "ok";
    },
});

app.registerModels({
    ManuallyAddedModel: a.object({
        hello: a.string(),
    }),
});

app.use(usersRouter);

export default app;
