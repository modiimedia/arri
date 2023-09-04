import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
    kotlinClientGenerator,
} from "arri/dist/codegen.mjs";

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
        kotlinClientGenerator({
            clientName: "ExampleClient",
            outFile: "../client-kotlin/example_client.rpc.kt",
            packageName: "com.example.client",
        }),
    ],
});
