import { type ArriApp } from "arri";

function registerRoutes(app: ArriApp) {
    app.compat.get("/hello-from-node", (req, res) => {
        res.write("Hello world");
        res.end();
    });
}

export default registerRoutes;
