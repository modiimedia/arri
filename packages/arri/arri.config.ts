import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "./src/codegen/_index";
import { defineConfig } from "./src/config";

export default defineConfig({
    port: 4040,
    rootDir: __dirname,
    srcDir: "example",
    entry: "app.ts",
    procedureDir: "services",
    clientGenerators: [
        typescriptClientGenerator({
            outputFile: "example.ts",
            clientName: "ExampleClient",
        }),
        dartClientGenerator({
            outputFile: "example.dart",
            clientName: "ExampleClient",
        }),
    ],
});
