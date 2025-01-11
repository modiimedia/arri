import { StandardSchemaV1 } from '@standard-schema/spec';

import * as a from './_namespace';

const NumberRecordSchema = a.record(a.int32());
type NumberRecordSchema = a.infer<typeof NumberRecordSchema>;
const StringRecordSchema = a.record(a.string());
type StringRecordSchema = a.infer<typeof StringRecordSchema>;
const ObjectRecordSchema = a.record(
    a.object({
        id: a.string(),
        type: a.stringEnum(['notification', 'alert']),
    }),
);
type ObjectRecordSchema = a.infer<typeof ObjectRecordSchema>;
test('Type Inference', () => {
    assertType<NumberRecordSchema>({ '1': 1, '2': 2 });
    assertType<StringRecordSchema>({ a: 'a', b: 'b' });
    assertType<ObjectRecordSchema>({
        a: {
            id: '12345',
            type: 'notification',
        },
        b: {
            id: '123456',
            type: 'alert',
        },
    });
});

describe('Parsing', () => {
    it('accepts good input', () => {
        expect(a.safeParse(NumberRecordSchema, { '1': 1, '2': 2 }).success);
        expect(
            a.safeParse(StringRecordSchema, {
                '1': '1',
                '2': '2',
                [`A song titled "Song"`]: `A song titled "Song"`,
            }).success,
        );
        expect(
            a.safeParse(ObjectRecordSchema, {
                a: { id: '12345', type: 'notification' },
                b: { id: '12345', type: 'alert' },
            }).success,
        );
        expect(
            a.safeParse(
                ObjectRecordSchema,
                JSON.stringify({
                    a: { id: '12345', type: 'notification' },
                }),
            ).success,
        );
    });
    it('rejects bad input', () => {
        expect(
            a.safeParse(NumberRecordSchema, { '1': '1', '2': '2' }).success,
        ).toBe(false);
        expect(
            a.safeParse(StringRecordSchema, { '1': null, '2': '2' }).success,
        ).toBe(false);
        expect(
            a.safeParse(ObjectRecordSchema, {
                a: { id: '12345', type: 'blahasdlfkj' },
                b: { id: '12345', type: 'alert' },
            }).success,
        ).toBe(false);
    });
});

it('produces valid ATD schema', () => {
    const output = JSON.parse(JSON.stringify(a.record(a.float64())));
    expect(output).toStrictEqual({
        values: {
            type: 'float64',
            metadata: {},
        },
        metadata: {},
    });
});

describe('Serialization', () => {
    it('Creates Valid JSON', () => {
        const inputs: NumberRecordSchema = {
            Foo: 0,
            Bar: 1,
            Baz: 2,
            '"Foo" "Bar" "Baz"': 3,
        };
        const result = a.serialize(NumberRecordSchema, inputs);
        JSON.parse(result);
        expect(result).toBe(
            `{"Foo":0,"Bar":1,"Baz":2,"\\"Foo\\" \\"Bar\\" \\"Baz\\"":3}`,
        );
    });
});

describe('standard-schema support', () => {
    const Schema = a.record(a.float64());
    type Schema = a.infer<typeof Schema>;
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<Schema>>(Schema);
        const result = await Schema['~standard'].validate('');
        if (!result.issues) assertType<Schema>(result.value);
    });
    it('outputs the same result via the standard interface', async () => {
        const input: any = {
            FOO: 1,
            BAR: 2,
        };
        expect(a.validate(Schema, input)).toBe(true);
        let standardResult = await Schema['~standard'].validate(input);
        expect(typeof standardResult.issues).toBe('undefined');
        if (!standardResult.issues) {
            expect(standardResult.value).toStrictEqual(input);
        }
        input.BAZ = 'hello world';
        expect(a.validate(Schema, input)).toBe(false);
        standardResult = await Schema['~standard'].validate(input);
        expect(standardResult.issues?.length).toBe(1);
        expect(standardResult.issues?.[0]?.path).toStrictEqual(['BAZ']);
    });
});
