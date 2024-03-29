import { readFileSync } from "fs";
import path from "path";
import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "arri/dist/codegen";

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
                "../clients/client-typescript/testClient.rpc.ts",
            ),
            prettierOptions: prettierConfig,
        }),
        dartClientGenerator({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/client-dart/lib/test_client.rpc.dart",
            ),
        }),
    ],
});
