import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const UnionInternalGetRequest = a.union(
    {
        'with-fields': a.object({
            string: a.string(),
            nullableString: a.nullable(a.string()),
            optionalString: a.optional(a.string()),
            float64: a.float64(),
            int64: a.int64(),
            boolean: a.boolean(),
            timestamp: a.timestamp(),
            nullableEnum: a.nullable(a.enumerator(['A', 'B'])),
        }),
        empty: a.object({}),
    },
    { id: 'UnionInternalGetRequest', tagKey: 'kind' },
);

export default defineRpc({
    description:
        'GET requests send params through url query params. Only internally tagged unions can be represented this way.',
    method: 'get',
    params: UnionInternalGetRequest,
    response: UnionInternalGetRequest,
    handler({ params }) {
        return params;
    },
});
