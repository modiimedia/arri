import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "./packages/json-schema-to-jtd/vite.config.ts",
    "./packages/arri-codegen/dart/vite.config.ts",
    "./packages/arri-validate/vite.config.ts",
    "./packages/arri-codegen/typescript/vite.config.ts",
    "./packages/arri-codegen/kotlin/vite.config.ts",
    "./packages/arri-codegen/utils/vite.config.ts",
    "./packages/arri/vite.config.ts",
    "./packages/adapters/typebox/vite.config.ts",
    "./packages/jtd-utils/vite.config.ts",
    "./tests/clients/client-typescript/vite.config.ts",
    "./packages/arri-client/vite.config.ts",
]);
