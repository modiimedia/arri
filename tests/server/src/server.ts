import { listen } from "@joshmossas/listhen";
import { toNodeListener } from "arri";
import app from "virtual:arri/app";

void listen(toNodeListener(app.h3App), {
    port: process.env.PORT ?? 2020,
    public: true,
    http2: true,
});
