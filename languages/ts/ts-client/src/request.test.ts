import { InferRpcDispatcherOptions, RpcDispatcher } from './requests';

test('Infer Transport Options', () => {
    type Foo = RpcDispatcher<{ foo: string }>;
    type FooOptions = InferRpcDispatcherOptions<Foo>;
    assertType<FooOptions>({ foo: '' });
});
