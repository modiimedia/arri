import { createApp, createRouter } from "h3";
import { initializeProcedures } from "./router";

const app = createApp();
const router = createRouter();
initializeProcedures(router, []);
app.use(router);

export default app;
