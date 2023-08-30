import { defineConfig } from "./src/config";

export default defineConfig({
    rootDir: __dirname,
    srcDir: "example",
    entry: "app.ts",
    procedureDir: "services",
});
