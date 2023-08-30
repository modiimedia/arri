import { Arri } from "../src/_index";

const app = new Arri({
    rpcDefinitionPath: "my-def",
    rpcRoutePrefix: "rcp",
});

export default app;
