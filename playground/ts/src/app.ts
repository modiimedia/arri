import { ArriApp, handleCors } from '@arrirpc/server';

const app = new ArriApp({
    async onRequest(event) {
        handleCors(event, {
            origin: '*',
        });
    },
});

export default app;
