# Arri CLI

Command line interface for ARRI-RPC

## Table of Contents

-   [Commands](#commands)
-   [Running code generators](#running-code-generators)
-   [Usage with @arrirpc/server](#usage-with-arrirpcserver)

## Commands

Run `arri --help` to get a full list of commands

| Cmd                  | Description                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| codegen [input-file] | Run generate clients specified in the `arri.config.ts`. See [here](#running-arri-codegen) for details.              |
| init [dir]           | Scaffold an arri app/library                                                                                        |
| list                 | List available arri versions                                                                                        |
| use [version]        | Update arri dependencies to a specific version (checks recursively for package.json, pubspec.yaml, cargo.toml, etc) |
| version              | Print current CLI version                                                                                           |

## Running code generators

Before running codegen you need to setup a valid Arri Config

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    generators: [
        generators.dartClient({
            clientName: "Client",
            outputPath: "<some-output-file>",
        }),
        generators.typescriptClient({
            clientName: "Client",
            outputPath: "<some-output-file>",
        }),
        // etc...
    ],
});
```

Run the codegen command

```bash
# run generators from an app definition file
# app definition files can be TS, JS, or JSON
arri codegen AppDefinition.ts
arri codegen AppDefinition.json

# run generators from an app definition JSON http endpoint
arri codegen https://example.com/__definition
```

### Codegen Flags

| Flag     | Aliases | Description                                                                                                               |
| -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| --config | -c      | Path to an arri config. Default is `arri.config.ts`                                                                       |
| --watch  | -w      | Watch an app definition file for changes. Only works on files. It will throw an error if invoked against an HTTP endpoint |

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
