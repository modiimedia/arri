import type { StandardSchemaV1 } from '@standard-schema/spec';

import * as a from './_namespace';

describe('parsing', () => {
    const parse = (input: unknown) => a.parse(a.string(), input).success;
    it('accepts valid input', () => {
        expect(parse('123453')).toBe(true);
        expect(parse('hello world')).toBe(true);
        expect(parse('{"message": "hello world"}')).toBe(true);
    });
    it('rejects bad input', () => {
        expect(parse(1)).toBe(false);
        expect(parse(undefined)).toBe(false);
        expect(parse({ message: 'hello world' })).toBe(false);
        expect(parse(true)).toBe(false);
    });
});

it('produces valid ATD schema', () => {
    const result = JSON.parse(JSON.stringify(a.string()));
    expect(result).toStrictEqual({
        type: 'string',
        metadata: {},
    });
});

describe('standard-schema support', () => {
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<string>>(a.string());
        const result = await a.string()['~standard'].validate('12345');
        if (!result.issues) {
            assertType<string>(result.value);
        }
    });
    it('produces the same result via the standard-schema interface', async () => {
        expect(a.validate(a.string(), 'hello world')).toBe(true);
        let standardResult = await a
            .string()
            ['~standard'].validate('hello world');
        expect(typeof standardResult.issues).toBe('undefined');
        if (!standardResult.issues) {
            expect(standardResult.value).toBe('hello world');
        }
        expect(a.validate(a.string(), 12345)).toBe(false);
        standardResult = await a.string()['~standard'].validate(12345);
        expect(standardResult.issues?.length).toBe(1);
    });
});
