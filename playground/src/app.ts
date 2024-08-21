import { ArriApp, handleCors } from "@arrirpc/server";

const app = new ArriApp({
    async onRequest(event) {
        console.log(event.path);
        handleCors(event, {
            origin: "*",
        });
    },
});

export default app;
