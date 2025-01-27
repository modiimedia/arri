import { type SchemaFormElements } from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import * as a from './_namespace';

describe('Type Inference', () => {
    it('infers basic array types', () => {
        const IntArraySchema = a.array(a.int16());
        type IntArraySchema = a.infer<typeof IntArraySchema>;
        assertType<IntArraySchema>([1, 2, 3]);
        const StringArraySchema = a.array(a.string());
        type StringArraySchema = a.infer<typeof StringArraySchema>;
        assertType<StringArraySchema>(['1', '2', '3']);
    });
    it('infers arrays of objects', () => {
        const ObjectSchema = a.object({
            id: a.string(),
            category: a.object({
                id: a.string(),
            }),
        });
        const ArraySchema = a.array(ObjectSchema);
        type ArraySchema = a.infer<typeof ArraySchema>;
        assertType<ArraySchema>([{ id: '', category: { id: '' } }]);
        const ObjectSchemaWithOptionals = a.object({
            id: a.string(),
            category: a.optional(a.object({ id: a.nullable(a.string()) })),
            createdAt: a.optional(a.timestamp()),
        });
        const ArrayWithOptionalsSchema = a.array(ObjectSchemaWithOptionals);
        type ArrayWithOptionalsSchema = a.infer<
            typeof ArrayWithOptionalsSchema
        >;
        assertType<ArrayWithOptionalsSchema>([
            {
                id: '',
                createdAt: new Date(),
                category: {
                    id: '',
                },
            },
            {
                id: '',
                createdAt: undefined,
                category: {
                    id: null,
                },
            },
            {
                id: '',
                createdAt: new Date(),
                category: undefined,
            },
        ]);
    });
    it('infers nested arrays', () => {
        const ArraySchema = a.array(
            a.array(a.array(a.stringEnum(['YES', 'NO']))),
        );
        type ArraySchema = a.infer<typeof ArraySchema>;
        assertType<ArraySchema>([
            [
                ['YES', 'YES'],
                ['NO', 'YES'],
                ['YES', 'YES'],
            ],
            [['YES']],
            [],
        ]);
    });
});

describe('Parsing', () => {
    const StringArray = a.array(a.string());
    const NumberArray = a.array(a.number());
    const ObjectArray = a.array(
        a.object({
            id: a.string(),
            date: a.timestamp(),
        }),
    );
    it('outputs valid arrays', () => {
        const input = ['a', 'b', 'c'];
        const result = a.parseUnsafe(StringArray, input);
        expect(result).toStrictEqual(input);
    });
    it('accepts good input', () => {
        const numberArr = [1, 2, 3, 4, 5];
        const numberArrResult = a.parse(NumberArray, numberArr);
        expect(numberArrResult.success);
        if (numberArrResult.success) {
            expect(numberArrResult.value).toStrictEqual(numberArr);
        }
        const numberJsonArrResult = a.parse(
            NumberArray,
            JSON.stringify(numberArr),
        );
        expect(numberJsonArrResult.success);
        if (numberJsonArrResult.success) {
            expect(numberJsonArrResult.value).toStrictEqual(numberArr);
        }
        const objectArr = [
            { id: '123111', date: new Date() },
            { id: 'alsdkfja', date: new Date() },
        ];
        expect(a.parse(ObjectArray, objectArr).success).toBe(true);
        expect(a.parse(ObjectArray, JSON.stringify(objectArr)).success).toBe(
            true,
        );
    });

    it('rejects bad input', () => {
        const numberArr = [1, '1', 4];
        expect(a.parse(NumberArray, numberArr).success).toBe(false);
        expect(a.parse(NumberArray, JSON.stringify(numberArr)).success).toBe(
            false,
        );
        const objectArr = [
            { id: '123124', date: 0 },
            { id: '1l3kj431lkj', date: 0 },
        ];
        expect(a.parse(ObjectArray, objectArr).success).toBe(false);
        expect(a.parse(ObjectArray, JSON.stringify(objectArr)).success).toBe(
            false,
        );
        const nestedArr = [
            [1, 2, 3],
            [1, 2, 3],
        ];
        expect(a.parse(NumberArray, nestedArr).success).toBe(false);
        const nestedStringArr = [
            ['1', '2', '3'],
            ['1', '2', '3'],
        ];
        expect(a.parse(StringArray, nestedStringArr).success).toBe(false);
    });

    it('parses array of nullable strings', () => {
        const input = [null, null, 'goodbye'];
        const Schema = a.array(a.nullable(a.string()));
        expect(a.parseUnsafe(Schema, input)).toStrictEqual(input);
        expect(a.parseUnsafe(Schema, JSON.stringify(input))).toStrictEqual(
            input,
        );
    });
});

describe('Serialization', () => {
    it('serializes to valid json', () => {
        const SimpleSchema = a.array(a.number());
        type SimpleSchema = a.infer<typeof SimpleSchema>;
        const input: SimpleSchema = [1, 10, 25];
        expect(a.serializeUnsafe(SimpleSchema, input)).toBe('[1,10,25]');
        const ComplexSchema = a.array(
            a.object({
                id: a.string(),
                role: a.stringEnum(['HOST', 'CUSTOMER']),
            }),
        );
        type ComplexSchema = a.infer<typeof ComplexSchema>;
        const input2: ComplexSchema = [
            { id: '1', role: 'CUSTOMER' },
            { id: '2', role: 'HOST' },
        ];
        expect(a.serializeUnsafe(ComplexSchema, input2)).toBe(
            `[{"id":"1","role":"CUSTOMER"},{"id":"2","role":"HOST"}]`,
        );
    });
});

it('Produces Valid ATD', () => {
    const SimpleSchema = a.array(a.number(), {
        id: 'ArraySchema',
        description: 'hello world',
    });
    expect(JSON.parse(JSON.stringify(SimpleSchema))).toStrictEqual({
        elements: {
            type: 'float64',
            metadata: {},
        },
        metadata: {
            id: 'ArraySchema',
            description: 'hello world',
        },
    } satisfies SchemaFormElements);
});

describe('standard-schema support', async () => {
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<string[]>>(a.array(a.string()));
        const result = await a.array(a.string())['~standard'].validate('');
        if (!result.issues) assertType<string[]>(result.value);
    });
});
