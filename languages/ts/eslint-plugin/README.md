# Arri-RPC Eslint Plugin and Configs

This library provides some useful lint rules when building Arri RPC schemas.

## Installation

```bash
# npm
npm i --save-dev @arrirpc/eslint-plugin

# pnpm
pnpm i --save-dev @arrirpc/eslint-plugin
```

## Usage

### Ecosystem Note

This library supports both [flat file config format](https://eslint.org/docs/latest/use/configure/configuration-files) and the [legacy config format](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated). Right now, the legacy format is the default. When more of the ecosystem has moved to supporting the new format this library will swap defaults, and potentially drop support for the old format. When such a change happens, it will be marked as a breaking change.

### Flat File Config

#### Using the default recommended configuration

This turns all of the `@arrirpc/eslint` rules on.

```js
// eslint.config.js
import arri from "@arrirpc/eslint-plugin/configs";

export default [
    arri.recommended,
    {
        files: ["src/**/*.ts"], // you will still need to tell eslint which files to lint like so
    },
];
```

#### Manual setup

The plugin can be enabled in flat file configs like so.

```js
// eslint.config.js
import arri from "@arrirpc/eslint";

export default [
    {
        plugins: {
            arri,
        },
        rules: {
            // check to see if an ID has been assigned to root a.object() schemas
            "arri/no-anonymous-object": 2,
            // check to see if an ID has been assigned to a.enumerator() or a.stringEnum() schemas
            "arri/no-anonymous-enumerator": 2,
            // check to see if an ID has been assigned to a.discriminator() schemas
            "arri/no-anonymous-discriminator": 2,
            // check to see if an ID has been assigned to a.recursive() schemas
            "arri/no-anonymous-recursive": 2,
        },
    },
];
```

### Legacy Eslint Config

#### Using the default recommended configuration

This turns all of the `@arrirpc/eslint` rules on

```jsonc
{
    "extends": ["plugin:@arrirpc/legacy-config-recommended"],
    "files": ["**/*.ts"],
}
```

#### Manual Setup

```jsonc
{
    "plugins": ["@arrirpc"],
    "rules": {
        // check to see if an ID has been assigned to root a.object() schemas
        "@arrirpc/no-anonymous-object": 2,
        // check to see if an ID has been assigned to a.enumerator() or a.stringEnum() schemas
        "@arrirpc/no-anonymous-enumerator": 2,
        // check to see if an ID has been assigned to a.discriminator() schemas
        "@arrirpc/no-anonymous-discriminator": 2,
        // check to see if an ID has been assigned to a.recursive() schemas
        "@arrirpc/no-anonymous-recursive": 2,
    },
}
```
