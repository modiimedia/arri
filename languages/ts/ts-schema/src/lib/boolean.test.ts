import { type SchemaFormType } from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import * as a from './_namespace';
describe('parsing', () => {
    const parse = (input: unknown) => a.parse(a.boolean(), input).success;
    it('accepts good input', () => {
        expect(parse(true)).toBe(true);
        expect(parse(false)).toBe(true);
        expect(parse('true')).toBe(true);
        expect(parse('false')).toBe(true);
    });
    it('rejects bad input', () => {
        expect(parse(1)).toBe(false);
        expect(parse('1')).toBe(false);
        expect(parse(0)).toBe(false);
        expect(parse(undefined)).toBe(false);
        expect(parse(null)).toBe(false);
        expect(parse(123451)).toBe(false);
        expect(parse('hello world')).toBe(false);
        expect(parse([true, false])).toBe(false);
        expect(parse({ '1': true })).toBe(false);
    });
});
describe('validation', () => {
    const validate = (input: unknown) => a.validate(a.boolean(), input);
    it('accepts valid inputs', () => {
        expect(validate(true)).toBe(true);
        expect(validate(false)).toBe(true);
    });
    it('rejects bad inputs', () => {
        expect(validate('true')).toBe(false);
        expect(validate('false')).toBe(false);
        expect(validate(0)).toBe(false);
        expect(validate(1)).toBe(false);
        expect(validate({})).toBe(false);
    });
});

describe('coercion', () => {
    const coerce = (input: unknown) => a.coerce(a.boolean(), input).success;
    it('coerces good input', () => {
        expect(coerce('true')).toBe(true);
        expect(coerce('TRUE')).toBe(true);
        expect(coerce('false')).toBe(true);
        expect(coerce('FALSE')).toBe(true);
        expect(coerce(0)).toBe(true);
        expect(coerce(1)).toBe(true);
    });
    it('does not coerce bad input', () => {
        expect(coerce('hello world')).toBe(false);
        expect(coerce(1235)).toBe(false);
        expect(coerce(-1235131)).toBe(false);
        expect(coerce(-1)).toBe(false);
        expect(coerce('-1')).toBe(false);
        expect(coerce({ helloWorld: 'helloWorld' })).toBe(false);
    });
});

it('produces valid ATD schema', () => {
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

describe('standard-schema support', () => {
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<boolean>>(a.boolean());
        const result = await a.boolean()['~standard'].validate('');
        if (!result.issues) assertType<boolean>(result.value);
    });
});
