import { a } from "@arrirpc/schema";
import {
    ArriApp,
    defineError,
    defineMiddleware,
    getHeader,
    handleCors,
} from "@arrirpc/server";

import { manualRouter, manualService } from "./routes/other";

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
app.use(manualService);

export default app;
