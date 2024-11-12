import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "./languages/dart/dart-codegen/vite.config.ts",
    "./languages/kotlin/kotlin-codegen/vite.config.ts",
    "./languages/ts/ts-client/vite.config.ts",
    "./languages/ts/ts-codegen/vite.config.ts",
    "./languages/ts/ts-server/vite.config.ts",
    "./tooling/cli/vite.config.ts",
    "./tooling/codegen-utils/vite.config.ts",
    "./tooling/eslint-plugin/vite.config.ts",
    "./tooling/json-schema-to-jtd/vite.config.ts",
    "./tooling/jtd-utils/vite.config.ts",
    "./tooling/schema/vite.config.ts",
    "./tooling/schema-typebox-adapter/vite.config.ts",
    "./tests/clients/ts/vite.config.ts",
]);
