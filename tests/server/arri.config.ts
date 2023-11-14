import path from "path";
import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "arri/dist/codegen";

export default defineConfig({
    srcDir: "src",
    port: 2020,
    entry: "app.ts",
    clientGenerators: [
        typescriptClientGenerator({
            clientName: "TestClient",
            outputFile: path.resolve(
                __dirname,
                "../clients/client-typescript/testClient.rpc.ts",
            ),
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
