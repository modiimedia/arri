import { type SchemaFormType } from '@arrirpc/type-defs';

import * as a from './_namespace';
describe('parsing', () => {
    const parse = (input: unknown) => a.safeParse(a.boolean(), input).success;
    it('accepts good input', () => {
        expect(parse(true));
        expect(parse(false));
        expect(parse('true'));
        expect(parse('false'));
    });
    it('rejects bad input', () => {
        expect(!parse(1));
        expect(!parse('1'));
        expect(!parse(0));
        expect(!parse(undefined));
        expect(!parse(null));
        expect(!parse(123451));
        expect(!parse('hello world'));
        expect(!parse([true, false]));
        expect(!parse({ '1': true }));
    });
});
describe('validation', () => {
    const validate = (input: unknown) => a.validate(a.boolean(), input);
    it('accepts valid inputs', () => {
        expect(validate(true));
        expect(validate(false));
    });
    it('rejects bad inputs', () => {
        expect(!validate('true'));
        expect(!validate('false'));
        expect(!validate(0));
        expect(!validate(1));
        expect(!validate({}));
    });
});

describe('coercion', () => {
    const coerce = (input: unknown) => a.safeCoerce(a.boolean(), input).success;
    it('coerces good input', () => {
        expect(!coerce('true'));
        expect(!coerce('TRUE'));
        expect(!coerce('false'));
        expect(!coerce('FALSE'));
        expect(!coerce(0));
        expect(!coerce(1));
    });
    it('does not coerce bad input', () => {
        expect(!coerce('hello world'));
        expect(!coerce(1235));
        expect(!coerce(-1235131));
        expect(!coerce(-1));
        expect(!coerce('-1'));
        expect(!coerce({ helloWorld: 'helloWorld' }));
    });
});

it('produces valid JTD schema', () => {
    const Schema = a.boolean();
    expect(JSON.parse(JSON.stringify(Schema))).toStrictEqual({
        type: 'boolean',
        metadata: {},
    } satisfies SchemaFormType);
    const SchemaWithMetadata = a.boolean({
        id: 'Bool',
        description: 'Boolean value',
    });
    expect(JSON.parse(JSON.stringify(SchemaWithMetadata))).toStrictEqual({
        type: 'boolean',
        metadata: { id: 'Bool', description: 'Boolean value' },
    } satisfies SchemaFormType);
});
