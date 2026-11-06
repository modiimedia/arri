import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

export const ObjectWithEveryNullableType = a.object(
    'ObjectWithEveryNullableType',
    {
        any: a.nullable(a.any()),
        boolean: a.nullable(a.boolean()),
        string: a.nullable(a.string()),
        timestamp: a.nullable(a.timestamp()),
        float32: a.nullable(a.float32()),
        float64: a.nullable(a.float64()),
        int8: a.nullable(a.int8()),
        uint8: a.nullable(a.uint8()),
        int16: a.nullable(a.int16()),
        uint16: a.nullable(a.uint16()),
        int32: a.nullable(a.int32()),
        uint32: a.nullable(a.uint32()),
        int64: a.nullable(a.int64()),
        uint64: a.nullable(a.uint64()),
        enumerator: a.nullable(a.enumerator(['A', 'B', 'C'])),
        array: a.nullable(a.array(a.nullable(a.boolean()))),
        object: a.nullable(
            a.object({
                string: a.nullable(a.string()),
                boolean: a.nullable(a.boolean()),
                timestamp: a.nullable(a.timestamp()),
            }),
        ),
        record: a.nullable(a.record(a.nullable(a.uint64()))),
        /** @deprecated */
        discriminator: a.nullable(
            a.discriminator('type', {
                A: a.object({
                    title: a.nullable(a.string()),
                }),
                B: a.object({
                    title: a.nullable(a.string()),
                    description: a.nullable(a.string()),
                }),
            }),
        ),
        unionExternal: a.nullable(
            a.union({
                object: a.object({
                    id: a.string(),
                    content: a.string(),
                }),
                array: a.array(a.string()),
                boolean: a.boolean(),
                'nullable-timestamp': a.nullable(a.timestamp()),
            }),
        ),
        unionInternal: a.nullable(
            a.union(
                {
                    rectangle: a.object({
                        width: a.float64(),
                        height: a.float64(),
                    }),
                    circle: a.object({
                        radius: a.float64(),
                    }),
                },
                { tagKey: 'shape' },
            ),
        ),
        unionAdjacent: a.nullable(
            a.union(
                {
                    object: a.object({
                        id: a.string(),
                        content: a.string(),
                    }),
                    array: a.array(a.string()),
                    boolean: a.boolean(),
                    'nullable-timestamp': a.nullable(a.timestamp()),
                },
                {
                    tagKey: 'kind',
                    valueKey: 'data',
                },
            ),
        ),
        nestedObject: a.nullable(
            a.object({
                id: a.nullable(a.string()),
                timestamp: a.nullable(a.timestamp()),
                data: a.nullable(
                    a.object({
                        id: a.nullable(a.string()),
                        timestamp: a.nullable(a.timestamp()),
                        data: a.nullable(
                            a.object({
                                id: a.nullable(a.string()),
                                timestamp: a.nullable(a.timestamp()),
                            }),
                        ),
                    }),
                ),
            }),
        ),
        nestedArray: a.nullable(
            a.array(
                a.nullable(
                    a.array(
                        a.nullable(
                            a.object({
                                id: a.nullable(a.string()),
                                timestamp: a.nullable(a.timestamp()),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    },
);

export default defineRpc({
    params: ObjectWithEveryNullableType,
    response: ObjectWithEveryNullableType,
    handler({ params }) {
        return params;
    },
});
