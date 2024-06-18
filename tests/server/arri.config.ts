import { defineConfig, generators } from "arri";
import { readFileSync } from "fs";
import path from "path";

const prettierConfig = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../.prettierrc"), {
        encoding: "utf-8",
    }),
);

export default defineConfig({
    srcDir: "src",
    port: 2020,
    entry: "app.ts",
    serverEntry: "server.ts",
    http2: true,
    generators: [
        generators.typescriptClient({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/ts/testClient.rpc.ts",
            ),
            prettierOptions: prettierConfig,
        }),
        generators.dartClient({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/dart/lib/test_client.rpc.dart",
            ),
        }),
        generators.kotlinClient({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/kotlin/src/main/kotlin/TestClient.rpc.kt",
            ),
        }),
        generators.rustClient({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/rust/src/test_client.g.rs",
            ),
        }),
    ],
});
