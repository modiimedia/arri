import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

export default defineRpc({
    description:
        'If the target language supports it. Generated code should mark this procedure as deprecated.',
    isDeprecated: true,
    input: a.object(
        {
            deprecatedField: a.string({ isDeprecated: true }),
        },
        { id: 'DeprecatedRpcParams', isDeprecated: true },
    ),
    output: undefined,
    handler() {},
});
