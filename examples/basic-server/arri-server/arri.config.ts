import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "arri/dist/codegen";

export default defineConfig({
    rootDir: __dirname,
    srcDir: "src",
    entry: "app.ts",
    port: 3000,
    procedureDir: "procedures",
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
