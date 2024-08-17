import { a } from "@arrirpc/schema";
import { ArriApp, defineRpc, handleCors } from "@arrirpc/server";

const app = new ArriApp({
    async onRequest(event) {
        console.log(event.path);
        handleCors(event, {
            origin: "*",
        });
    },
});

app.rpc(
    "books.getBook",
    defineRpc({
        method: "get",
        params: a.object({
            bookId: a.string(),
        }),
        response: a.object({
            id: a.string(),
            name: a.string(),
            createdAt: a.timestamp(),
            updatedAt: a.timestamp(),
        }),
        handler({ params }) {
            return {
                id: params.bookId,
                name: "Hello world",
                createdAt: new Date("2001-01-01"),
                updatedAt: new Date("2020-01-20"),
            };
        },
    }),
);

export default app;
