# @arrirpc/codegen-utils

This library contains a number of utilities that to assist in creating generators for Arri RPC. To See more complete usage example checkout one of the official arri client generators.

## Creating a Generator Plugin

```ts
import { defineGeneratorPlugin } from "@arrirpc/codegen-utils";

// add any options needed for your plugin here
export interface MyPluginOptions {
    a: string;
    b: string;
}

export default defineGeneratorPlugin((options: MyPluginOptions) => {
    return {
        options,
        generator: async (appDef, isDevServer) => {
            // generate something using the app definition and the specified options
        },
    };
});
```

## Other Utilities

```ts
// type guards
isAddDefinition(input);
isRpcDefinition(input);
isServiceDefinition(input);
isSchema(input);
isSchemaFormEmpty(input);
isSchemaFormType(input);
isSchemaFormEnum(input);
isSchemaFormElements(inputs);
isSchemaFormProperties(input);
isSchemaFormValues(input);
isSchemaFormDiscriminator(input);
isSchemaFormRef(input);

unflattenProcedures({
    "v1.users.getUser": {
        transport: "http",
        path: "/v1/users/get-user",
        method: "get",
    },
    "v1.users.createUser": {
        transport: "http",
        path: "/v1/users/create-user",
        method: "post",
    },
});
/**
 * outputs the following
 * {
 *   v1: {
 *     users: {
 *       getUser: {
 *         transport: "http",
 *         path: "/v1/users/get-user",
 *         method: "get",
 *       },
 *       createUser: {
 *          transport: "http",
 *          path: "/v1/users/create-user",
 *          method: "post",
 *       }
 *     }
 *   }
 * }
 */

removeDisallowedChars(input, disallowedChars);
camelCase(input, opts);
kebabCase(input);
pascalCase(input, opts);
snakeCase(input, opts);
titleCase(input, opts);
flatCase(input, opts);
upperFirst(input);
lowerFirst(input);
isUppercase(input);
```

## Development

### Building

Run `pnpm nx build codegen-utils` to build the library.

### Running unit tests

Run `pnpm nx test codegen-utils` to execute the unit tests via [Vitest](https://vitest.dev).
