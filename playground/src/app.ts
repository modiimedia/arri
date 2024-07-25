import { a } from "@arrirpc/schema";
import { ArriApp, defineRpc, defineService, handleCors } from "@arrirpc/server";

const app = new ArriApp({
    async onRequest(event) {
        handleCors(event, {
            origin: "*",
        });
    },
    onError(error) {
        console.log({
            name: error.name,
            code: error.code,
            message: error.message,
            cause: error.cause,
            stack: error.stack,
        });
    },
});

const usersService = defineService("users", {
    getUser: defineRpc({
        params: a.object("GetUserParams", {
            userId: a.string(),
        }),
        response: a.object("User", {
            id: a.string(),
            name: a.string(),
            createdAt: a.timestamp(),
        }),
        handler({ params }) {
            return {
                id: params.userId,
                name: "",
                createdAt: new Date(),
            };
        },
    }),
});

app.use(usersService);

export default app;
