import { Type } from "@sinclair/typebox";
import { ArriServer } from "../../../packages/arri/src/_index";

export const Arri = new ArriServer();

Arri.registerRpc("example.helloWorld", {
    params: Type.Object({
        message: Type.String(),
    }),
    response: Type.Object({
        message: Type.String(),
    }),
    handler() {
        return {
            message: "Hello world",
        };
    },
});

export default Arri.h3App;
