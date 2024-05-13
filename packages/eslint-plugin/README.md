# Arri-RPC Eslint Plugin

## Installation

```bash
# npm
npm i --save-dev @arrirpc/eslint-plugin

# pnpm
pnpm i --save-dev @arrirpc/eslint-plugin
```

## Usage

### Use the default recommended configuration

```json
{
    "extends": ["plugin:@arrirpc/recommended"]
}
```

### Access the rules directly

```json
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
        "@arrirpc/no-anonymous-recursive": 2
    }
}
```
