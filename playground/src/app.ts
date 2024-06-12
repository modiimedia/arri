import { ArriApp, handleCors } from "@arrirpc/server";

const app = new ArriApp({
    onRequest(event) {
        handleCors(event, {
            origin: "*",
        });
    },
});

export default app;
