# Arri RPC Monorepo

Arri is an RPC framework designed for effortless type-safety between multiple languages.

This is a work in progress. Things will break.

## Language Client Support

Below are the language client generators that are planned to have first party support. This chart tracks the current progress the implementations for these clients.

| Language   | HTTP | WebSockets |
| ---------- | ---- | ---------- |
| Typescript | ✅   | ✅         |
| Dart       | ✅   | ✅         |
| Rust       | 🚧   | 🚧         |
| Kotlin     | 🚧   | 🚧         |
| Swift      |      |            |
| Go         |      |            |
| Python     |      |            |

✅ completed

🚧 in progress

## Packages

-   [arri](packages/arri/README.md)
-   [arri-adapter-typebox](packages/arri-adapter-typebox/README.md)
-   [arri-client](packages/arri-client/README.md)
-   [arri-client-dart](packages/arri-client-dart/README.md)
-   [arri-codegen](packages/arri-codegen/README.md)
-   [arri-validate](packages/arri-validate/README.md)
-   [json-schema-to-jtd](packages/json-schema-to-jtd/README.md)
-   [jtd-utils](packages/jtd-utils/README.md)
