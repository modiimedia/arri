import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "arri/dist/codegen.mjs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prettierConfig = require("../../../.prettierrc");

export default defineConfig({
    rootDir: __dirname,
    srcDir: "src",
    entry: "app.ts",
    port: 2020,
    procedureDir: "procedures",
    clientGenerators: [
        typescriptClientGenerator({
            clientName: "ExampleClient",
            outputFile: "../client-ts/exampleClient.rpc.ts",
            prettierOptions: prettierConfig,
        }),
        dartClientGenerator({
            clientName: "ExampleClient",
            outputFile: "../client-dart/lib/example_client.rpc.dart",
        }),
    ],
});
