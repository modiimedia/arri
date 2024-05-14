declare module "virtual:arri/app" {
    import "@arrirpc/server";
    import { type ArriApp } from "@arrirpc/server";
    const app: ArriApp;
    export default app;
}
