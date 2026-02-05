import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

export const ObjectWithEveryType = a.object('ObjectWithEveryType', {
    any: a.any(),
    boolean: a.boolean(),
    string: a.string(),
    timestamp: a.timestamp(),
    float32: a.float32(),
    float64: a.float64(),
    int8: a.int8(),
    uint8: a.uint8(),
    int16: a.int16(),
    uint16: a.uint16(),
    int32: a.int32(),
    uint32: a.uint32(),
    int64: a.int64(),
    uint64: a.uint64(),
    enumerator: a.enumerator(['A', 'B', 'C']),
    array: a.array(a.boolean()),
    object: a.object({
        string: a.string(),
        boolean: a.boolean(),
        timestamp: a.timestamp(),
    }),
    record: a.record(a.uint64()),
    discriminator: a.discriminator('type', {
        A: a.object({
            title: a.string(),
        }),
        B: a.object({
            title: a.string(),
            description: a.string(),
        }),
    }),
    nestedObject: a.object({
        id: a.string(),
        timestamp: a.timestamp(),
        data: a.object({
            id: a.string(),
            timestamp: a.timestamp(),
            data: a.object({
                id: a.string(),
                timestamp: a.timestamp(),
            }),
        }),
    }),
    nestedArray: a.array(
        a.array(
            a.object({
                id: a.string(),
                timestamp: a.timestamp(),
            }),
        ),
    ),
});

export default defineRpc({
    input: ObjectWithEveryType,
    output: ObjectWithEveryType,
    handler({ input }) {
        return input;
    },
});
