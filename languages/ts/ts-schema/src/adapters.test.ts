import { StandardSchemaV1 } from '@standard-schema/spec';

import { a } from './_index';

const Schema = a.object({
    string: a.string(),
    boolean: a.boolean(),
    timestamp: a.timestamp(),
    int8: a.int8(),
    uint8: a.uint8(),
    int16: a.int16(),
    uint16: a.uint16(),
    int32: a.int32(),
    uint32: a.uint32(),
    int64: a.int64(),
    uint64: a.uint64(),
    enumerator: a.enumerator(['FOO', 'BAR', 'BAZ']),
    array: a.array(a.boolean()),
    object: a.object({
        foo: a.string(),
    }),
    discriminator: a.discriminator('type', {
        FOO: a.object({
            foo: a.boolean(),
        }),
        BAR: a.object({
            bar: a.string(),
        }),
    }),
    any: a.any(),
});
type Schema = a.infer<typeof Schema>;

const input: Schema = {
    string: '',
    boolean: false,
    timestamp: new Date(),
    int8: 0,
    uint8: 0,
    int16: 0,
    uint16: 0,
    int32: 0,
    uint32: 0,
    int64: 0n,
    uint64: 0n,
    enumerator: 'FOO',
    array: [true, false, false],
    object: {
        foo: '',
    },
    discriminator: {
        type: 'FOO',
        foo: true,
    },
    any: undefined,
};

test('StandardSchema Type Inference Matches', () => {
    assertType<Schema>(input);
    type StandardSchemaType = StandardSchemaV1.InferOutput<typeof Schema>;
    assertType<StandardSchemaType>(input);
});
