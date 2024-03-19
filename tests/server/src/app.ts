import {
    ArriApp,
    defineError,
    defineMiddleware,
    defineWebSocketHandler,
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
});

app.h3Router.use(
    "/_ws",
    defineWebSocketHandler({
        open(peer) {
            console.log("[ws] open", peer);
        },
        message(peer, message) {
            console.log("[ws] message", peer, message);
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            peer.send(`you sent "${message}"`);
        },
        close(peer, event) {
            console.log("[ws] close", peer, event);
        },
        error(peer, error) {
            console.log("[ws] error", peer, error);
        },
    }),
);

app.use(
    defineMiddleware((event) => {
        console.log(event);
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
