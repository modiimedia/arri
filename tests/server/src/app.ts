import { randomUUID } from "node:crypto";
import {
    ArriApp,
    defineError,
    defineEventHandler,
    defineMiddleware,
    getHeader,
    getRequestHeader,
    setHeaders,
    setResponseStatus,
} from "arri";
import usersRouter from "./routes/users";

const app = new ArriApp({
    rpcRoutePrefix: "rpcs",
    appInfo: {
        version: "10",
    },
});

app.use(
    defineMiddleware((event) => {
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

app.use(usersRouter);

app.h3Router.get(
    "/event-stream",
    defineEventHandler((event) => {
        setHeaders(event, {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache",
        });
        setResponseStatus(event, 200);
        let session = getRequestHeader(event, "last-event-id");
        if (!session) {
            session = randomUUID();
        }
        let count = 0;
        const sendResponse = (data: any) =>
            event.node.res.write(`data: ${data}\n\n`);
        sendResponse(
            JSON.stringify({
                id: count,
                message: "hello world",
            }),
        );
        const interval = setInterval(() => {
            count++;
            sendResponse(
                JSON.stringify({
                    id: count,
                    message: "hello world!!! " + count * 10,
                }),
            );
        }, 500);
        event.node.req
            .on("end", () => {
                clearInterval(interval);
                console.log("REQUEST END");
            })
            .on("close", () => {
                console.log("REQUEST CLOSE");
                clearInterval(interval);
            });

        event._handled = true;
    }),
);

export default app;
