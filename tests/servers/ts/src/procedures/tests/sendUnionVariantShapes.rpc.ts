import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const UnionVariantShapes = a.object('UnionVariantShapes', {
    internal: a.union(
        {
            empty: a.object({}),
            'all-optional': a.object({
                first: a.optional(a.string()),
                second: a.optional(a.int32()),
            }),
            mixed: a.object({
                required: a.string(),
                optional: a.optional(a.string()),
                nullable: a.nullable(a.string()),
            }),
            nested: a.object({
                array: a.array(a.object({ id: a.string() })),
                record: a.record(a.int64()),
                object: a.object({ timestamp: a.timestamp() }),
            }),
        },
        { tagKey: 'kind' },
    ),
    external: a.union({
        empty: a.object({}),
        'all-optional': a.object({
            first: a.optional(a.string()),
            second: a.optional(a.int32()),
        }),
        mixed: a.object({
            required: a.string(),
            optional: a.optional(a.string()),
            nullable: a.nullable(a.string()),
        }),
    }),
    adjacent: a.union(
        {
            empty: a.object({}),
            'all-optional': a.object({
                first: a.optional(a.string()),
                second: a.optional(a.int32()),
            }),
            mixed: a.object({
                required: a.string(),
                optional: a.optional(a.string()),
                nullable: a.nullable(a.string()),
            }),
        },
        { tagKey: 'kind', valueKey: 'data' },
    ),
});

export default defineRpc({
    description:
        'Union variants with no fields, only optional fields, a mix of required, optional, and nullable fields, and nested fields.',
    params: UnionVariantShapes,
    response: UnionVariantShapes,
    handler({ params }) {
        return params;
    },
});
