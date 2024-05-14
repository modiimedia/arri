import { type AppDefinition } from "@arrirpc/codegen-utils";
import { a } from "@arrirpc/schema";
import { ArriApp } from "./app";

it("creates valid app definition", () => {
    const app = new ArriApp();
    const SayHelloParams = a.object(
        {
            name: a.string(),
        },
        { id: "SayHelloParams" },
    );
    const SayHelloResponse = a.object(
        {
            message: a.string(),
        },
        { id: "SayHelloResponse" },
    );
    app.rpc({
        name: "sayHello",
        params: SayHelloParams,
        response: SayHelloResponse,
        handler({ params }) {
            return {
                message: `Hello ${params.name}`,
            };
        },
    });
    app.rpc({
        name: "sayHelloStream",
        params: SayHelloParams,
        response: SayHelloResponse,
        isEventStream: true,
        handler({ params, stream }) {
            const timeout = setInterval(async () => {
                await stream.push({ message: `Hello ${params.name}` });
            }, 100);
            stream.onClose(() => {
                clearInterval(timeout);
            });
        },
    });

    const def = app.getAppDefinition();
    const expectedResult: AppDefinition = {
        arriSchemaVersion: "0.0.4",
        procedures: {
            sayHello: {
                transport: "http",
                method: "post",
                path: "/say-hello",
                params: "SayHelloParams",
                response: "SayHelloResponse",
            },
            sayHelloStream: {
                transport: "http",
                method: "get",
                path: "/say-hello-stream",
                params: "SayHelloParams",
                response: "SayHelloResponse",
                isEventStream: true,
            },
        },
        models: {
            SayHelloParams,
            SayHelloResponse,
        },
    };
    expect(JSON.parse(JSON.stringify(def))).toStrictEqual(
        JSON.parse(JSON.stringify(expectedResult)),
    );
});
