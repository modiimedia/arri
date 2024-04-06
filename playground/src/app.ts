import { ArriApp } from "arri";

const app = new ArriApp({
    appInfo: {
        title: "My Awesome API",
        description: "Hello world",
        version: "1.0.1",
        minimumClientVersion: "1.0.1",
        maximumClientVersion: "1.0.1",
    },
});

export default app;
