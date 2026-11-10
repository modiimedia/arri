import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const UnionVariantTypes = a.object('UnionVariantTypes', {
    external: a.union({
        string: a.string(),
        int64: a.int64(),
        uint64: a.uint64(),
        float64: a.float64(),
        enumerator: a.enumerator(['A', 'B']),
        record: a.record(a.string()),
        any: a.any(),
        nullableString: a.nullable(a.string()),
        nullableArray: a.nullable(a.array(a.string())),
        externalUnion: a.union({ text: a.string() }),
        internalUnion: a.union(
            { circle: a.object({ radius: a.float64() }) },
            { tagKey: 'shape' },
        ),
        adjacentUnion: a.union(
            { text: a.string() },
            { tagKey: 'kind', valueKey: 'data' },
        ),
        class: a.string(),
        default: a.string(),
    }),
    adjacent: a.union(
        {
            string: a.string(),
            int64: a.int64(),
            uint64: a.uint64(),
            float64: a.float64(),
            enumerator: a.enumerator(['A', 'B']),
            record: a.record(a.string()),
            any: a.any(),
            nullableString: a.nullable(a.string()),
            nullableArray: a.nullable(a.array(a.string())),
            externalUnion: a.union({ text: a.string() }),
            internalUnion: a.union(
                { circle: a.object({ radius: a.float64() }) },
                { tagKey: 'shape' },
            ),
            adjacentUnion: a.union(
                { text: a.string() },
                { tagKey: 'kind', valueKey: 'data' },
            ),
            class: a.string(),
            default: a.string(),
        },
        { tagKey: 'kind', valueKey: 'data' },
    ),
    internal: a.union(
        {
            class: a.object({
                for: a.string(),
                default: a.string(),
            }),
            default: a.object({
                class: a.string(),
                internalUnion: a.union(
                    { circle: a.object({ radius: a.float64() }) },
                    { tagKey: 'shape' },
                ),
                adjacentUnion: a.union(
                    { text: a.string() },
                    { tagKey: 'kind', valueKey: 'data' },
                ),
                externalUnion: a.union({ text: a.string() }),
            }),
        },
        { tagKey: 'kind' },
    ),
});

export default defineRpc({
    description:
        'Union variants of every value type, nested unions, and names that are reserved words in many languages.',
    params: UnionVariantTypes,
    response: UnionVariantTypes,
    handler({ params }) {
        return params;
    },
});
