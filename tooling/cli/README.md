# Arri CLI

Command line interface for ARRI-RPC

## Table of Contents

- [Commands](#commands)
- [Usage with an Arri Server](#usage-with-an-arri-server)
- [Usage with an App Definition](#usage-with-an-app-definition)

## Commands

Run `arri --help` to get a full list of commands

| Cmd                          | Description                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| build                        | Use the currently registered server plugin to build your arri server and run the code generators                                                    |
| dev                          | Run the currently registered server plugin in dev mode (basically watches for changes and rebuilds the server and reruns code generators as needed) |
| codegen [input-file]         | Run generate clients specified in the `arri.config.ts`. See [here](#running-arri-codegen) for details.                                              |
| export [format] [input-file] | Export AppDefinition to various formats. See [here](#exporting-json-schema) for details.                                                            |
| init [dir]                   | Scaffold an arri app/library                                                                                                                        |
| list                         | List available arri versions                                                                                                                        |
| use [version]                | Update arri dependencies to a specific version (checks recursively for package.json, pubspec.yaml, cargo.toml, etc)                                 |
| version                      | Print current CLI version                                                                                                                           |

## Usage with an Arri server

The Arri CLI will automatically rerun code generators on hot-reload during development, and when building for production.

#### Register your server plugin

```ts
// arri.config.ts
import { defineConfig, servers } from 'arri';

// registering the typescript server plugin
export default defineConfig({
    server: servers.tsServer({
        srcDir: 'src',
        entry: 'app.ts',
        port: 3000,
    }),
    generators: [
        // client generators go here
    ],
});

// registering the go server plugin
export default defineConfig({
    server: servers.goServer({}),
    generators: [
        // client generators go here
    ],
});
```

#### Start developing your server

```bash
arri dev
arri build
```

You can also skip codegen during build

```bash
arri build --skip-codegen
```

## Usage with an App Definition

`arri codegen` gives you the ability to run code generators against an already generated [Arri App Definition](/specifications/arri_app_definition.md). This is useful in cases where you don't have access to the backend but do have access to an App Definition file. So basically if you have multiple separate frontend teams, this allows you to distribute your `__definition.json` file to them and they will be able to generate type-safe client(s). (You could also make it available as an HTTP endpoint on the server if you are okay exposing that data publicly)

Before running codegen you need to setup a valid Arri Config

```ts
// arri.config.ts
import { defineConfig, generators } from 'arri';

export default defineConfig({
    generators: [
        generators.dartClient({
            clientName: 'Client',
            outputPath: '<some-output-file>',
        }),
        generators.typescriptClient({
            clientName: 'Client',
            outputPath: '<some-output-file>',
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

## Exporting JSON Schema

`arri export json-schema` allows you to export your AppDefinition types as a [JSON Schema](https://json-schema.org/) file. This is useful for:

- **Editor support** - YAML/JSON files using Arri-defined schemas can get autocomplete in VS Code, IntelliJ, etc.
- **Interoperability** - Integration with tools that consume JSON Schema (OpenAPI, documentation generators, etc.)
- **Configuration validation** - Users defining config files can reference a JSON Schema URL for validation

### Basic Usage

```bash
# Export from a local file
arri export json-schema ./path/to/AppDefinition.json

# Export from a TS/JS file
arri export json-schema ./path/to/definitions.ts

# Export from an HTTP endpoint
arri export json-schema https://example.com/__definition
```

### Export Flags

| Flag          | Aliases | Description                                                  |
| ------------- | ------- | ------------------------------------------------------------ |
| --output      | -o      | Output file path for JSON Schema. Default is `./schema.json` |
| --id          |         | `$id` to use in the JSON Schema                              |
| --title       |         | Title for the JSON Schema                                    |
| --description |         | Description for the JSON Schema                              |

### Example

```bash
arri export json-schema ./AppDefinition.json -o ./schemas/api.schema.json --id "https://example.com/schemas/api.json" --title "My API Schema" --description "API type definitions"
```

This will generate a JSON Schema file with all your type definitions in the `$defs` section, which can then be used for validation and editor support.
