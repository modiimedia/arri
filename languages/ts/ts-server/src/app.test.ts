import { type AppDefinition } from "@arrirpc/codegen-utils";
import { a } from "@arrirpc/schema";

import { ArriApp } from "./app";
import { defineEventStreamRpc } from "./eventStreamRpc";
import { defineRpc } from "./rpc";

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
    app.rpc(
        "sayHello",
        defineRpc({
            params: SayHelloParams,
            response: SayHelloResponse,
            handler({ params }) {
                return {
                    message: `Hello ${params.name}`,
                };
            },
        }),
    );
    app.rpc(
        "sayHelloStream",
        defineEventStreamRpc({
            params: SayHelloParams,
            response: SayHelloResponse,
            handler({ params, stream }) {
                const timeout = setInterval(async () => {
                    await stream.push({ message: `Hello ${params.name}` });
                }, 100);
                stream.onClosed(() => {
                    clearInterval(timeout);
                });
            },
        }),
    );

    const def = app.getAppDefinition();
    const expectedResult: AppDefinition = {
        schemaVersion: "0.0.6",
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
        definitions: {
            SayHelloParams,
            SayHelloResponse,
        },
    };
    expect(JSON.parse(JSON.stringify(def))).toStrictEqual(
        JSON.parse(JSON.stringify(expectedResult)),
    );
});
