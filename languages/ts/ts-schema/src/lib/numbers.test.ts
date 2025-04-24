import { type SchemaFormType } from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import * as a from './_namespace';

test('type inference', () => {
    const Num = a.number();
    type Num = a.infer<typeof Num>;
    const Int = a.int16();
    type Int = a.infer<typeof Int>;
    assertType<Num>(1);
    assertType<Int>(1);
});

describe('parsing', () => {
    it('parses floats', () => {
        const goodInputs = [
            -1341451,
            0.50051,
            -1,
            15415151,
            1241.5555,
            '13560',
            '-1351351.53135',
        ];
        for (const input of goodInputs) {
            expect(a.parse(a.number(), input).success).toBe(true);
            expect(a.parse(a.float32(), input).success).toBe(true);
            expect(a.parse(a.float64(), input).success).toBe(true);
        }
        const badInputs = [
            'hello world',
            '-1.0h',
            { helloWorld: 'helloWorld' },
        ];
        for (const input of badInputs) {
            expect(a.parse(a.number(), input).success).toBe(false);
            expect(a.parse(a.float32(), input).success).toBe(false);
            expect(a.parse(a.float64(), input).success).toBe(false);
        }
    });
    it('parses int8', () => {
        const goodInputs = [0, -128, 127, 50, 10, '-128', '127', '0'];
        for (const input of goodInputs) {
            const result = a.parse(a.int8(), input);
            if (!result.success) {
                console.error('This should pass int8', input);
            }
            expect(result.success).toBe(true);
        }
        const badInputs = [-1000, 200000, 0.5, 'hello world'];
        for (const input of badInputs) {
            const result = a.parse(a.int8(), input);
            if (result.success) {
                console.error('This should fail int8', input);
            }
            expect(result.success).toBe(false);
        }
    });
    it('parses int16', () => {
        const goodInputs = [0, 32767, -32768, '32767', 500];
        for (const input of goodInputs) {
            const result = a.parse(a.int16(), input);
            if (!result.success) {
                console.error('This should pass int16', input);
            }
            expect(result.success).toBe(true);
        }
        const badInputs = [0.5, -32769, 32768, '32767h', 'hello world'];
        for (const input of badInputs) {
            const result = a.parse(a.int16(), input);
            if (result.success) {
                console.error('This should fail int16', input);
            }
            expect(result.success).toBe(false);
        }
    });
    it('parses int32', () => {
        const goodInputs = [0, -2147483648, 2147483647, '2147483647', '500'];
        for (const input of goodInputs) {
            const result = a.parse(a.int32(), input);
            if (!result.success) {
                console.error('This should pass int32', input);
            }
            expect(result.success).toBe(true);
        }
        const badInputs = [
            2147483648,
            -2147483649,
            [],
            {},
            null,
            undefined,
            'hello world',
        ];
        for (const input of badInputs) {
            const result = a.parse(a.int32(), input);
            if (result.success) {
                console.error('This should fail int32', input);
            }
            expect(result.success).toBe(false);
        }
    });
});

describe('int64', () => {
    it('properly infers types', () => {
        const Schema = a.int64();
        type Schema = a.infer<typeof Schema>;
        assertType<Schema>(BigInt('0'));

        const NullableSchema = a.nullable(a.int64());
        type NullableSchema = a.infer<typeof NullableSchema>;
        assertType<NullableSchema>(BigInt('0'));
        assertType<NullableSchema>(null);
    });
    it('parses valid inputs', () => {
        const Schema = a.int64();
        const inputs = [
            131381,
            -135131,
            '1413141',
            BigInt('12453113'),
            '-135915111351',
            BigInt('-115191141'),
        ];
        for (const input of inputs) {
            expect(a.parse(Schema, input).success);
        }
    });
    it('rejects invalid inputs', () => {
        const Schema = a.int64();
        const inputs = [
            '9223372036854775808',
            '-9223372036854775809',
            -1,
            // eslint-disable-next-line no-loss-of-precision
            9999999999999999999999999999999999999999999,
            null,
            '14315h',
        ];
        for (const input of inputs) {
            expect(!a.parse(Schema, input).success);
        }
    });
    it('serializes to json string', () => {
        expect(a.serializeUnsafe(a.int64(), BigInt('123456789'))).toBe(
            '123456789',
        );
    });
});

it('coerces uint8', () => {
    const Schema = a.uint8();
    expect(a.coerceUnsafe(Schema, '99')).toBe(99);
    expect(a.coerceUnsafe(Schema, '10')).toBe(10);
    expect(a.coerceUnsafe(Schema, 99)).toBe(99);

    const ObjectSchema = a.object({
        int8: a.int8(),
        uint8: a.uint8(),
        int16: a.int16(),
        uint16: a.uint16(),
        int32: a.int32(),
        uint32: a.uint32(),
        int64: a.int64(),
        uint64: a.uint64(),
    });
    expect(
        a.coerceUnsafe(ObjectSchema, {
            int8: '0',
            uint8: '0',
            int16: '0',
            uint16: '0',
            int32: '0',
            uint32: '0',
            int64: '0',
            uint64: '0',
        }),
    ).toStrictEqual({
        int8: 0,
        uint8: 0,
        int16: 0,
        uint16: 0,
        int32: 0,
        uint32: 0,
        int64: BigInt(0),
        uint64: BigInt(0),
    });
});

describe('jtd schema production', () => {
    it('produces int8 jtd schema', () => {
        const Schema = a.int8({ id: 'Int8', description: 'An 8 bit integer' });
        expect(JSON.parse(JSON.stringify(Schema))).toStrictEqual({
            type: 'int8',
            metadata: { id: 'Int8', description: 'An 8 bit integer' },
        } satisfies SchemaFormType);
    });
    it('produces int64 jtd schema', () => {
        const Schema = a.int64({
            id: 'Int64',
            description: 'A 64 bit integer',
        });
        expect(JSON.parse(JSON.stringify(Schema))).toStrictEqual({
            type: 'int64',
            metadata: {
                id: 'Int64',
                description: 'A 64 bit integer',
            },
        } satisfies SchemaFormType);
    });
});

describe('standard-schema support', () => {
    it('properly infers types', async () => {
        const Schema = a.number();
        type Schema = a.infer<typeof Schema>;
        assertType<StandardSchemaV1<Schema>>(Schema);
        const result = await Schema['~standard'].validate('');
        if (!result.issues) assertType<Schema>(result.value);

        assertType<StandardSchemaV1<number>>(a.number());
        assertType<StandardSchemaV1<number>>(a.float32());
        assertType<StandardSchemaV1<number>>(a.float64());
        assertType<StandardSchemaV1<number>>(a.int8());
        assertType<StandardSchemaV1<number>>(a.uint8());
        assertType<StandardSchemaV1<number>>(a.int16());
        assertType<StandardSchemaV1<number>>(a.uint16());
        assertType<StandardSchemaV1<number>>(a.int32());
        assertType<StandardSchemaV1<number>>(a.uint32());
        assertType<StandardSchemaV1<bigint>>(a.int64());
        assertType<StandardSchemaV1<bigint>>(a.uint64());
    });
});
