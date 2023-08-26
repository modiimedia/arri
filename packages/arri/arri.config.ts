import { defineConfig } from "./src/config";

export default defineConfig({
    rootDir: __dirname,
    srcDir: "src",
    entry: "./example/entry.ts",
    procedureDir: "/example/services",
});
