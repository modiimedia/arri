# Arri RPC Contribution Guide

I'm really excited that you are interested in contributing to Arri RPC. This guide is designed to help you get your environment setup and give a general overview of the codebase.

If you need any additional guidance, feel free to pop into the Arri RPC [discord](https://discord.gg/3pdbYGDa).

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Building and Running Tests](#building-and-running-tests)
-   [Running Integration Tests](#running-integration-tests)
-   [Project Structure](#project-structure)
-   [Project Scaffolds](#project-scaffolds)
-   [Guidelines For Pull Requests](#guidelines-for-pull-requests)
-   [Obtaining Commit Access](#obtaining-commit-access)

## Prerequisites

To get running with this repo, you need to install [NodeJS](https://nodejs.org/en) and [pnpm](https://pnpm.io/). This is required by the build pipeline and is required to work on the code-generators.

After that you can run

```bash
pnpm i
pnpm build
```

Which will build all the TS projects needed to get started.

You will also need to install the toolchain for whatever language libraries you are looking to work in. For example you need to Rust compiler and Cargo to work on the Rust client library.

To be able to build and run everything you currently need:

-   [The Dart SDK](https://dart.dev/get-dart) for Dart
-   [The Rust compiler & Cargo](https://www.rust-lang.org/learn/get-started) for Rust
-   [The Go compiler](https://go.dev/doc/install) for Go
-   [The Swift compiler](https://www.swift.org/documentation/swift-compiler/) for Swift

## Building and Running Tests

Different languages use different build systems. This project uses [NX](https://nx.dev/) to handle orchestrating builds and running tests in a unified way.

```bash
# basic usage
pnpm nx [target] [project-name]

# examples
pnpm nx build ts-server
pnpm nx compile rust-client
pnpm nx test dart-codegen

# Sidenote:
# If you choose to install NX globally you can omit the `pnpm` prefix
```

For a complete list of available projects you can run `pnpm nx show projects`. Project targets are defined in a `project.json` in that project's respective directory.

A simple project JSON might look like this:

```json
{
    "name": "my-awesome-project",
    "schemaPath": "../../path-to/node_modules/nx/schemas/project-schema.json"
    "targets": {
        "foo": {
            "executor": "nx:run-commands",
            "options": {
                "command": "echo 'foo'",
                "cwd": "path/to/my-awesome-project"
            }
        }
    }
}
```

Which let's me run `pnpm nx foo my-awesome-project`

### Common Targets

-   `test` - run unit tests on the specified project
-   `build` - build the TS project (TS Only)
-   `compile` - compile the project (Non-TS projects only)
-   `lint` - lint the project
-   `typecheck` - run the Typescript type-checker against the project (TS only)

### Global Commands

We also have some npm scripts that execute a target across many projects

-   `pnpm build` - build all TS projects
-   `pnpm compile` - compile all non-TS projects
-   `pnpm test` - run all unit tests
-   `pnpm integration-tests` - start the test server and run all integration tests
-   `pnpm lint` - lint all projects
-   `pnpm typecheck` - type-check all TS projects

## Running Integration Tests

While you can use `pnpm integration-tests` to run all integration tests, it requires you to have the toolchain for every language in this repo.

There are many cases where you might want to run integration tests against a single language client. In order to do that you need to start the test server

```bash
# ensure your code generators are the most recent build
pnpm build

# start the test server
pnpm nx dev test-server-ts
```

Next you need to start the integration tests for the specific client you want to test.

```bash
pnpm nx integration-test test-client-{{language}}
```

That's it.

## Using the Playground

The playground directory is used to experiment with random stuff. You can start the playground dev server like so:

```bash
# spin up the typescript server playground
pnpm nx dev ts-playground

# spin up the go server playground
pnpm nx dev go-playground
```

Just don't commit any changes made in the playground directory.

## Project Structure

This project has the following directories

```fs
|- languages // where all of the language specific code codes
|- tooling // universal Arri RPC tooling like the CLI
|- tests // integration tests and test files
|- internal // misc scripts used internally for local development
```

Any language specific project should be prefixed by the language name. So for example the `python` directory might look like this

```fs
|- languages
    |- python
        |- python-client
        |- python-codegen
        |- python-codegen-reference
        |- python-server
```

## Project Scaffolds

There is currently a scaffolding script that will help you scaffold a "code-generator" or "tooling" project.

```bash
pnpm scaffold
```

For a more complete guide on creating a code generator see [here](/docs/creating-a-custom-generator.md) (Just use `pnpm scaffold` instead of the starter script specified there.)

## Guidelines For Pull Requests

-   Run `pnpm format` before submitting
-   PRs should address primarily a single concern. Example: Do not open a PR that fixes 3 unrelated bugs.
-   Before adding features or submitting a large PR please open up an issue or start a discussion on [discord](https://discord.gg/3pdbYGDa).
-   Provide a good PR description as a record of what change is being made and why it was made. Link to a GitHub issue if it exists.

## Obtaining Commit Access

Anyone who has submitted multiple high-quality PRs may be qualified for getting commit access. I'm pretty open to other people joining on the project so long as they hold themselves to the same vision and quality standard that I have for this project.

This project is not something I will be able to make succeed alone. We will need multiple people who have the same passion and vision for end-to-end type-safety to really bring it over the finish line.
