import { a } from "@arrirpc/schema";
import {
    ArriApp,
    defineError,
    defineMiddleware,
    getHeader,
    handleCors,
    readBody,
} from "@arrirpc/server";

import manualRouter from "./routes/other";

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
    defineMiddleware(async (event) => {
        const authHeader = getHeader(event, "x-test-header");
        if (
            !authHeader?.length &&
            event.path !== "/" &&
            event.path !== "/status" &&
            event.path !== "/favicon.ico"
        ) {
            throw defineError(401, {
                message: "Missing test auth header 'x-test-header'",
            });
        }
        if (event.method !== "GET" && event.method !== "HEAD") {
            console.log({
                rpc: event.context.rpcName,
                path: event.path,
                body: await readBody(event),
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

app.registerDefinitions({
    ManuallyAddedModel: a.object({
        hello: a.string(),
    }),
});

app.use(manualRouter);

export default app;
