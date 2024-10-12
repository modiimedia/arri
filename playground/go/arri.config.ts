import { defineConfig, generators, servers } from "arri";

export default defineConfig({
    server: servers.goServer(),
    generators: [
        generators.typescriptClient({
            outputFile: "clients/ts/src/myClient.g.ts",
            clientName: "Client",
        }),
    ],
});
