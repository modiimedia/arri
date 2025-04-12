import {
    a,
    InferObjectOptionalKeys,
    type InferSubType,
    type InferType,
    PartialBy,
    ResolveObject,
} from './_index';

describe('InferSubType', () => {
    test('Basic Discriminator', () => {
        const Schema = a.discriminator('type', {
            A: a.object({
                id: a.string(),
            }),
            B: a.object({
                id: a.string(),
                name: a.string(),
            }),
        });
        type Schema = InferType<typeof Schema>;
        type SchemaTypeA = InferSubType<Schema, 'type', 'A'>;
        type SchemaTypeB = InferSubType<Schema, 'type', 'B'>;
        assertType<SchemaTypeA>({ id: '', type: 'A' });
        assertType<SchemaTypeB>({ id: '', type: 'B', name: '' });
    });
});

describe('Optional Keys', () => {
    test('OptionalBy<T, K> type inference', () => {
        type Foo = {
            foo: string;
            bar: boolean;
            baz: number;
        };
        type OptionalFoo = ResolveObject<PartialBy<Foo, 'foo'>>;
        assertType<OptionalFoo>({ bar: true, baz: 0 });
    });
    test('OptionalKeys<T> type inference', () => {
        const input = {
            foo: a.optional(a.string()),
            bar: a.boolean(),
            baz: a.number(),
        } as const;
        a.object(input);
        type Keys = InferObjectOptionalKeys<typeof input>;
        assertType<Keys>('foo');
    });
    test('Inferring Optional Types', () => {
        const Foo = a.object({
            foo: a.string(),
            bar: a.boolean(),
            baz: a.optional(a.number()),
        });
        type Foo = a.infer<typeof Foo>;
        assertType<Foo>({ foo: '', bar: false });
    });
});
