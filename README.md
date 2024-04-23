# Arri RPC Monorepo

Arri is an RPC framework designed for effortless type-safety between multiple languages.

This is a work in progress. Things will break.

## Schema Builder

-   [Arri Validate](packages/arri-validate/README.md)

## Client Generators

Below are the language client generators that are planned to have first party support. This chart tracks the current progress the implementations for these clients.

| Language                                        | HTTP | WebSockets |
| ----------------------------------------------- | ---- | ---------- |
| [Typescript](packages/arri-codegen/typescript/) | ✅   | ✅         |
| [Dart](packages/arri-codegen/dart/)             | ✅   | ✅         |
| [Rust](packages/arri-codegen/rust)              | 🚧   | 🚧         |
| [Kotlin](packages/arri-codegen/kotlin/)         | 🚧   | 🚧         |
| Swift                                           |      |            |
| Go                                              |      |            |
| Python                                          |      |            |

✅ completed

🚧 in progress

## Server Implementations

-   [Typescript](packages/arri/README.md)
