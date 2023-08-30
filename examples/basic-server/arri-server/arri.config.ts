import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "arri/dist/codegen";

export default defineConfig({
    rootDir: __dirname,
    entry: "src/app.ts",
    port: 3000,
    clientGenerators: [
        typescriptClientGenerator({
            clientName: "ExampleClient",
            outputFile: "../client-ts/exampleClient.rpc.ts",
        }),
        dartClientGenerator({
            clientName: "ExampleClient",
            outputFile: "../client-dart/lib/example_client.rpc.dart",
        }),
    ],
});
