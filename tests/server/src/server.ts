import { listen } from "@joshmossas/listhen";
import { toNodeListener } from "arri";
import app from "virtual:arri/app";

void listen(toNodeListener(app.h3App), {
    port: process.env.PORT ?? 2020,
    ws: {
        resolve(info) {
            if (app.h3App.websocket.resolve) {
                return app.h3App.websocket.resolve(info);
            }
            return (
                app.h3App.websocket.hooks ??
                app.h3App.handler.__websocket__ ??
                {}
            );
        },
    },
    public: true,
    http2: true,
});
