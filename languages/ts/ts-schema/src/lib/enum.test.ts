import * as a from './_namespace';

const UserRolesSchema = a.stringEnum(['admin', 'standard']);
type UserRolesSchema = a.infer<typeof UserRolesSchema>;
test('type inference', () => {
    assertType<UserRolesSchema>('admin');
    assertType<UserRolesSchema>('standard');
});
describe('parsing', () => {
    const parse = (input: unknown) => a.safeParse(UserRolesSchema, input);
    it('accepts good inputs', () => {
        expect(parse('admin'));
        expect(parse('standard'));
    });

    it('rejects bad inputs', () => {
        const badInput1 = parse('ADMIN');
        expect(!badInput1.success && badInput1.error.errors.length > 0);
        expect(!parse('STANDARD').success);
        expect(!parse(0).success);
        expect(!parse('aldskjfa').success);
    });
});

describe('validation', () => {
    const validate = (input: unknown) => a.validate(UserRolesSchema, input);
    it('accepts good input', () => {
        expect(validate('admin'));
        expect(validate('standard'));
    });
    it('rejects bad input', () => {
        expect(!validate('ADMIN'));
        expect(!validate('STANDARD'));
        expect(!validate(0));
        expect(!validate({ j: 0 }));
    });
});

test('ID shorthand matches standard function', () => {
    const SchemaA = a.enumerator(['A', 'B', 'C'], {
        id: 'MyEnum',
    });
    type SchemaA = a.infer<typeof SchemaA>;
    const SchemaB = a.enumerator('MyEnum', ['A', 'B', 'C']);
    type SchemaB = a.infer<typeof SchemaB>;
    expect(JSON.stringify(SchemaA)).toBe(JSON.stringify(SchemaB));
    const input: SchemaA = 'A';
    assertType<SchemaA>(input);
    assertType<SchemaB>(input);
    expect(a.serialize(SchemaA, input)).toBe(a.serialize(SchemaB, input));
    const goodInputs = ['A', 'B', 'C'];
    const badInputs = ['Hello world', 'D', 'a', 'b'];
    for (const val of goodInputs) {
        expect(a.validate(SchemaA, val)).toBe(true);
        expect(a.validate(SchemaB, val)).toBe(true);
    }
    for (const val of badInputs) {
        expect(a.validate(SchemaA, val)).toBe(false);
        expect(a.validate(SchemaB, val)).toBe(false);
    }
});
