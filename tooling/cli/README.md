# Arri CLI

Command line interface for ARRI-RPC

## Table of Contents

-   [Commands](#commands)
-   [Usage with @arrirpc/server](#usage-with-arrirpcserver)

## Commands

Run `arri --help` to get a full list of commands

| Cmd                  | Description                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| codegen [input-file] | Run generate clients specified in the `arri.config.ts`. See [here](/README.md#creating-schemas-for-custom-server-implementations) for details. |
| init [dir]           | Scaffold an arri app/library                                                                                                                   |
| list                 | List available arri versions                                                                                                                   |
| use [version]        | Update arri dependencies to a specific version (checks recursively for package.json, pubspec.yaml, cargo.toml, etc)                            |
| version              | Print current CLI version                                                                                                                      |

## Usage with @arrirpc/server

@arrirpc/server will automatically rerun code generators on hot-reload during development, and when building for production.

For full details visit the [server docs](https://github.com/modiimedia/arri/blob/master/packages/arri/README.md)

#### 1) Create an `arri.config.ts`

```ts
import { defineConfig } from "arri";

export default defineConfig({
    srcDir: "src",
    entry: "app.ts",
    port: 3000,
    generators: [
        // client generators go here (can be imported from arri)
    ],
});
```

#### 2) Develop your server

```bash
arri dev
arri build
```
