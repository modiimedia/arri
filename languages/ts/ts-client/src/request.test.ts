import { InferRequestHandlerOptions, RpcDispatcher } from './requests';

test('Infer Transport Options', () => {
    type Foo = RpcDispatcher<{ foo: string }>;
    type FooOptions = InferRequestHandlerOptions<Foo>;
    assertType<FooOptions>({ foo: '' });
});
