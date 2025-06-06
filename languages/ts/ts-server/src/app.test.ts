import { type AppDefinition } from '@arrirpc/codegen-utils';
import { a } from '@arrirpc/schema';
import { getHeaders } from 'h3';

import { ArriApp } from './app';
import { defineEventStreamRpc } from './eventStreamRpc';
import { defineMiddleware } from './middleware';
import { defineRpc } from './rpc';

it('creates valid app definition', () => {
    const app = new ArriApp();
    const SayHelloParams = a.object(
        {
            name: a.string(),
        },
        { id: 'SayHelloParams' },
    );
    const SayHelloResponse = a.object(
        {
            message: a.string(),
        },
        { id: 'SayHelloResponse' },
    );
    app.rpc(
        'sayHello',
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
        'sayHelloStream',
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
        schemaVersion: '0.0.8',
        procedures: {
            sayHello: {
                transport: 'http',
                method: 'post',
                path: '/say-hello',
                params: 'SayHelloParams',
                response: 'SayHelloResponse',
            },
            sayHelloStream: {
                transport: 'http',
                method: 'post',
                path: '/say-hello-stream',
                params: 'SayHelloParams',
                response: 'SayHelloResponse',
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

it('allows for H3 Utilities in App Hooks', () => {
    const app = new ArriApp({
        onRequest(event) {
            getHeaders(event);
        },
        onError(error, event) {
            getHeaders(event);
        },
        onAfterResponse(event) {
            getHeaders(event);
        },
        onBeforeResponse(event) {
            getHeaders(event);
        },
    });
    app.use(
        defineMiddleware((event) => {
            getHeaders(event);
        }),
    );
    app.rpc(
        'myRpc',
        defineRpc({
            params: a.object({
                id: a.string(),
            }),
            response: undefined,
            handler({ params }, event) {
                assertType<string>(params.id);
                getHeaders(event);
            },
            postHandler(_, event) {
                getHeaders(event);
            },
        }),
    );
    app.route({
        path: '/some-route',
        method: 'get',
        handler(event) {
            getHeaders(event);
        },
        postHandler(event) {
            getHeaders(event);
        },
    });
});
