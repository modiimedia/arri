import { toNodeListener } from "arri";
import { listen } from "listhen";
import app from "virtual:arri/app";

void listen(toNodeListener(app.h3App), {
    port: process.env.PORT ?? 2020,
    public: true,
});
