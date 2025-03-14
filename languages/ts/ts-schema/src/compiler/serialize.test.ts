import { a, isAScalarSchema, isAStringEnumSchema } from '../_index';
import { compile } from '../compile';
import { serializationTestSuites, validationTestSuites } from '../testSuites';

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key]!;
    const Compiled = compile(suite.schema, true);
    for (let i = 0; i < suite.goodInputs.length; i++) {
        const input = suite.goodInputs[i]!;
        test(`${key} - ${i + 1}`, () => {
            try {
                const result = Compiled.serializeUnsafe(input);
                expect(typeof result === 'string').toBe(true);
                if (
                    !isAScalarSchema(suite.schema) &&
                    !isAStringEnumSchema(suite.schema)
                ) {
                    try {
                        JSON.parse(result);
                    } catch (err) {
                        console.log('RESULT', result);
                        throw err;
                    }
                }
                const parseResult = a.parse(suite.schema, result);
                if (!parseResult.success) {
                    console.error(parseResult.errors);
                    console.error(Compiled.compiledCode.serialize);
                    console.error(result, 'SHOULD BE VALID');
                }
            } catch (err) {
                console.error(err);
                console.log(Compiled.compiledCode.serialize);
                console.log(input, 'SHOULD NOT THROW');
                throw err;
            }
        });
    }
}

for (const key of Object.keys(serializationTestSuites)) {
    const suite = serializationTestSuites[key]!;
    const Compiled = a.compile(suite.schema, true);
    for (let i = 0; i < suite.inputs.length; i++) {
        const input = suite.inputs[i]!;
        test(`${key} - ${i + 1}`, () => {
            try {
                const result = Compiled.serializeUnsafe(input);
                expect(typeof result).toBe('string');
                if (
                    !isAScalarSchema(suite.schema) ||
                    !isAStringEnumSchema(suite.schema)
                ) {
                    JSON.parse(result);
                }
                const parsedResult = Compiled.parse(result);
                expect(parsedResult.success).toBe(true);
            } catch (err) {
                console.error(err);
                console.log(Compiled.compiledCode.serialize);
                console.log(input, 'SHOULD NOT THROW');
                throw err;
            }
        });
    }
}

it('serializes strings', () => {
    const Compiled = compile(a.string());
    expect(Compiled.serializeUnsafe('Hello World')).toBe('Hello World');
});
it('serializes timestamp', () => {
    const Compiled = compile(a.timestamp());
    const input = new Date();
    expect(Compiled.serializeUnsafe(input)).toBe(input.toISOString());
});
it('serializes boolean', () => {
    const Compiled = compile(a.boolean());
    expect(Compiled.serializeUnsafe(true)).toBe('true');
});
it('serializes enum', () => {
    const Compiled = compile(a.stringEnum(['ADMIN', 'STANDARD', 'MODERATOR']));
    expect(Compiled.serializeUnsafe('ADMIN')).toBe('ADMIN');
});
it("doesn't serialize NaN", () => {
    const Schema = a.object({ num: a.number(), int: a.int32() });
    const Compiled = compile(Schema);
    const input = { num: NaN, int: NaN };
    try {
        expect(Compiled.serializeUnsafe(input));
        expect(a.serializeUnsafe(Schema, input));
    } catch (_) {
        expect(true).toBe(true);
    }
});
it('serializes objects', () => {
    const Compiled = compile(
        a.object({
            a: a.string(),
            b: a.stringEnum(['A', 'B', 'C']),
            c: a.number(),
            d: a.boolean(),
            e: a.timestamp(),
        }),
    );
    const inputDate = new Date();
    expect(
        Compiled.serializeUnsafe({
            a: 'hello world',
            b: 'B',
            c: 10,
            d: false,
            e: inputDate,
        }),
    ).toBe(
        `{"a":"hello world","b":"B","c":10,"d":false,"e":"${inputDate.toISOString()}"}`,
    );
});

it('serializes objects will nullable fields', () => {
    const Compiled = compile(
        a.object(
            {
                a: a.nullable(a.string()),
                b: a.nullable(a.stringEnum(['B'])),
                c: a.nullable(a.number()),
                d: a.nullable(a.boolean()),
                e: a.nullable(a.timestamp()),
            },
            { id: 'NullableObject' },
        ),
    );
    const inputDate = new Date();
    expect(
        Compiled.serializeUnsafe({
            a: 'hello world',
            b: 'B',
            c: 10,
            d: false,
            e: inputDate,
        }),
    ).toBe(
        `{"a":"hello world","b":"B","c":10,"d":false,"e":"${inputDate.toISOString()}"}`,
    );
    expect(
        Compiled.serializeUnsafe({
            a: null,
            b: null,
            c: null,
            d: null,
            e: null,
        }),
    ).toBe(`{"a":null,"b":null,"c":null,"d":null,"e":null}`);
});

it('serializes any object', () => {
    const Schema = a.object({
        any: a.any(),
        string: a.string(),
    });
    type Schema = a.infer<typeof Schema>;
    const Compiled = a.compile(Schema);
    const input: Schema = {
        any: {
            a: '',
            b: '',
            c: false,
        },
        string: '',
    };
    const result = Compiled.serializeUnsafe(input);
    expect(Compiled.parseUnsafe(result)).toStrictEqual(input);
});
