import { HttpAdapter } from './adapter_http';
import { ArriApp } from './app';
import { defineRpc } from './rpc';

test('Type Inference', () => {
    const app = new ArriApp();
    const httpDispatcher = new HttpAdapter();
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
