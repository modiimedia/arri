import { randomUUID } from "node:crypto";
import {
    ArriApp,
    defineError,
    defineMiddleware,
    getHeader,
    handleCors,
    sendStream,
    setHeaders,
    setResponseStatus,
} from "arri";
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

app.route({
    path: "/status",
    method: "get",
    handler() {
        return "ok";
    },
});

app.use(usersRouter);

app.route({
    path: "/event-stream",
    method: "get",
    async handler(event) {
        setHeaders(event, {
            "Transfer-Encoding": "chunked",
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache",
        });
        setResponseStatus(event, 200);
        let sessionId = getHeader(event, "Last-Event-ID");
        if (!sessionId) {
            sessionId = randomUUID();
        }
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        let count = 0;
        const interval = setInterval(async () => {
            if (count >= 100) {
                await cleanup();
                return;
            }
            count++;
            await writer.write(
                encoder.encode(
                    `id: ${sessionId}\nevent: data\ndata: ${JSON.stringify({
                        count,
                        message: "Hello world!",
                    })}\n\n`,
                ),
            );
        }, 10);
        async function cleanup() {
            clearInterval(interval);
            if (!writer.closed) {
                await writer.close();
            }
            if (!event.node.res.closed) {
                event.node.res.end();
            }
        }
        event.node.req
            .on("close", async () => {
                console.log("CLOSED");
                await cleanup();
            })
            .on("end", async () => {
                console.log("ENDED");
                await cleanup();
            });
        event._handled = true;
        await sendStream(event, readable);
    },
});

export default app;
