# Arri Typebox Adapter

Let's you reuse your [Typebox](https://github.com/sinclairzx81/typebox) schemas with Arri-RPC

## Installation

```bash
npm install @arrirpc/typebox-adapter

pnpm install @arrirpc/typebox-adapter
```

## Usage

Simply wrap your typebox schemas with `typeboxAdapter()` to use them with arrirpc. Additionally metadata such as `$id` and `description` will be converted over.

```ts
// updateUser.rpc.ts
import { defineRpc } from "@arrirpc/server";
import { typeboxAdapter } from "@arrripc/typebox-adapter";
import { Type } from "typebox";

const User = Type.Object(
    {
        id: Type.String(),
        name: Type.String(),
    },
    {
        $id: "User",
    },
);

export default defineRpc({
    params: typeboxAdapter(User),
    response: typeboxAdapter(User),
    handler({ params }) {
        // typebox keys are now available
        console.log(params.id);
        return params;
    },
});
```
