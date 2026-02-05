import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const DiscriminatorWithEmptyObject = a.discriminator(
    'DiscriminatorWithEmptyObject',
    'type',
    {
        EMPTY: a.object({}),
        NOT_EMPTY: a.object({
            foo: a.string(),
            bar: a.float64(),
            baz: a.boolean(),
        }),
    },
);

export default defineRpc({
    input: DiscriminatorWithEmptyObject,
    output: DiscriminatorWithEmptyObject,
    handler({ input }) {
        return input;
    },
});
