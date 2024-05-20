import {
    dartClientGenerator,
    defineConfig,
    kotlinClientGenerator,
    typescriptClientGenerator,
} from "arri";
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
        typescriptClientGenerator({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/ts/testClient.rpc.ts",
            ),
            prettierOptions: prettierConfig,
        }),
        dartClientGenerator({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/dart/lib/test_client.rpc.dart",
            ),
        }),
        kotlinClientGenerator({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/kotlin/src/main/kotlin/TestClient.rpc.kt",
            ),
        }),
    ],
});
