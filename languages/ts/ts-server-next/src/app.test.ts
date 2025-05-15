import { ArriApp } from './app';
import { defineRpc } from './rpc';
import { HttpDispatcher } from './transport_http';

test('Type Inference', () => {
    const app = new ArriApp();
    const httpDispatcher = new HttpDispatcher();
    app.use(httpDispatcher);

    app.rpc(
        'foo',
        defineRpc({
            async handler({ params }) {
                assertType<undefined>(params);
            },
        }),
    );
});
