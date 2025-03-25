# Arri-RPC Eslint Plugin and Configs

This library provides some useful lint rules when building schemas for Arri-RPC.

If you are using Arri Schema standalone the only lint rule you probably want is `arri/prefer-modular-imports` to keep bundle sizes lower.

## Installation

```bash
# npm
npm i --save-dev @arrirpc/eslint-plugin

# pnpm
pnpm i --save-dev @arrirpc/eslint-plugin
```

## Usage

### Flat File Config

#### Use one of the premade configurations

- **recommended**: turns on all of the lint rules related to schema building and codegen
- **all**: the same as recommended but also includes the `prefer-modular-imports` rule

```js
// eslint.config.js
import arri from '@arrirpc/eslint-plugin/configs';

// turn on lint rules related to schema building and codegen
export default [
    arri.recommended,
    {
        files: ['src/**/*.ts'],
    },
];


// turn on all arri lint rules
export default [
    arri.all,
    {
        files: ['src/**/*.ts']
    }
]
```

#### Manual setup

The plugin can be enabled in flat file configs like so.

```js
// eslint.config.js
import arri from '@arrirpc/eslint';

export default [
    {
        plugins: {
            arri,
        },
        rules: {
            // check to see if an ID has been assigned to root a.object() schemas
            'arri/no-anonymous-object': 2,
            // check to see if an ID has been assigned to a.enumerator() or a.stringEnum() schemas
            'arri/no-anonymous-enumerator': 2,
            // check to see if an ID has been assigned to a.discriminator() schemas
            'arri/no-anonymous-discriminator': 2,
            // check to see if an ID has been assigned to a.recursive() schemas
            'arri/no-anonymous-recursive': 2,
            // enforce using arri's tree-shakable imports instead of the non tree-shakable imports to keep bundle sizes lower
            'arri/prefer-modular-imports': 2,
        },
    },
];
```

### Legacy Eslint Config

#### Using the default recommended configuration

```jsonc
// Arri-RPC recommended
{
    "extends": ["plugin:@arrirpc/legacy-config-recommended"],
    "files": ["**/*.ts"],
}

// all rules
{
    "extends": ["plugin:@arrirpc/legacy-config-all"],
    "files": ["**/*.ts"]
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
        // enforce usage of modular imports to reduce bundle size
        "@arrirpc/prefer-modular-imports": 2,
    },
}
```
