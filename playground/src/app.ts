import { a } from "@arrirpc/schema";
import {
    ArriApp,
    defineEventStreamRpc,
    defineRpc,
    defineService,
    handleCors,
} from "@arrirpc/server";

const app = new ArriApp({
    async onRequest(event) {
        handleCors(event, {
            origin: "*",
        });
    },
});

export default app;
