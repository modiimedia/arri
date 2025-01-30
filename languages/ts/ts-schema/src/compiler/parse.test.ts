import { isEqual } from 'lodash';

import { a } from '../_index';
import { compile } from '../compile';
import {
    coercionTestSuites,
    parsingTestSuites,
    validationTestSuites,
} from '../testSuites';

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key]!;
    describe(key, () => {
        const Compiled = compile(suite.schema);
        for (let i = 0; i < suite.goodInputs.length; i++) {
            test(`Good Input - ${i + 1}`, () => {
                const input = suite.goodInputs[i];
                expect(isEqual(Compiled.parse(input), input));
                if (typeof input === 'object') {
                    expect(
                        isEqual(
                            Compiled.parse(Compiled.serialize(input)),
                            input,
                        ),
                    );
                }
            });
        }
        for (let i = 0; i < suite.badInputs.length; i++) {
            test(`Bad input - ${i + 1}`, () => {
                const input = suite.badInputs[i];
                expect(Compiled.parse(input).success).toBe(false);
                expect(a.parse(suite.schema, input).success).toBe(false);
            });
        }
    });
}

describe('parsing test suites', () => {
    for (const key of Object.keys(parsingTestSuites)) {
        const suite = parsingTestSuites[key]!;
        describe(key, () => {
            const Compiled = compile(suite.schema);
            for (let i = 0; i < suite.goodInputs.length; i++) {
                test(`${key} - Good Input ${i}`, () => {
                    const input = suite.goodInputs[i];
                    const expectedResult = suite.expectedResults[i];
                    const actualResult = Compiled.parse(input);
                    if (!actualResult.success) {
                        console.log(Compiled.compiledCode.parse);
                        console.log(input, 'Should parse');
                    }
                    expect(actualResult.success).toBe(true);
                    if (!actualResult.success) return;
                    const serializedResult = Compiled.serialize(
                        actualResult.value,
                    );
                    expect(serializedResult.success).toBe(true);
                    if (!serializedResult.success) return;
                    expect(actualResult.value).toStrictEqual(expectedResult);
                    expect(
                        Compiled.parseUnsafe(serializedResult.value),
                    ).toStrictEqual(expectedResult);
                    expect(actualResult.value).toStrictEqual(
                        a.parseUnsafe(suite.schema, input),
                    );
                });
            }
            for (let i = 0; i < suite.badInputs.length; i++) {
                test(`${key} - Bad Input ${i}`, () => {
                    const input = suite.badInputs[i];
                    const result = Compiled.parse(input);
                    if (result.success) {
                        console.log(Compiled.compiledCode.parse);
                        console.log(input, 'Should NOT parse');
                    }
                    expect(result.success).toBe(false);
                });
            }
        });
    }
});

describe('coercion test suites', () => {
    for (const key of Object.keys(coercionTestSuites)) {
        const suite = coercionTestSuites[key]!;
        describe(key, () => {
            const Compiled = compile(suite.schema);
            for (let i = 0; i < suite.goodInputs.length; i++) {
                test(`${key} - Good Input ${i}`, () => {
                    const input = suite.goodInputs[i];
                    const expectedResult = suite.expectedResults[i];
                    const actualResult = Compiled.coerce(input);
                    if (!actualResult.success) {
                        console.log({
                            schema: suite.schema,
                            input: input,
                            inputIndex: i,
                            errors: actualResult.errors,
                        });
                        console.log(input, 'Should coerce');
                    }
                    expect(actualResult.success).toBe(true);
                    if (!actualResult.success) return;
                    const serializedResult = Compiled.serialize(
                        actualResult.value,
                    );
                    expect(serializedResult.success).toBe(true);
                    if (!serializedResult.success) return;
                    expect(actualResult.value).toStrictEqual(expectedResult);
                    expect(
                        Compiled.coerceUnsafe(serializedResult.value),
                    ).toStrictEqual(expectedResult);
                    expect(actualResult.value).toStrictEqual(
                        a.coerceUnsafe(suite.schema, input),
                    );
                });
            }
            for (let i = 0; i < suite.badInputs.length; i++) {
                test(`${key} - Bad Input ${i}`, () => {
                    const input = suite.badInputs[i];
                    const result = Compiled.coerce(input);
                    if (result.success) {
                        console.log({
                            schema: suite.schema,
                            input: input,
                            inputIndex: i,
                            result: result.value,
                        });
                        console.log(input, 'Should NOT coerce');
                    }
                    expect(result.success).toBe(false);
                });
            }
        });
    }
});

it('parses floats', () => {
    const Compiled = a.compile(a.number());
    expect(Compiled.parseUnsafe('1')).toBe(1);
    expect(Compiled.parseUnsafe(1)).toBe(1);
    expect(Compiled.parseUnsafe('1500.5')).toBe(1500.5);
    expect(!Compiled.parse('hello world').success);
    expect(!Compiled.parse(true).success);
});

it('parses ints', () => {
    const Compiled = a.compile(a.uint32());
    expect(Compiled.parseUnsafe('1')).toBe(1);
    expect(Compiled.parseUnsafe(1)).toBe(1);
    expect(!Compiled.parse('1500.5').success);
    expect(!Compiled.parse(-100).success);
    expect(!Compiled.parse(true).success);
});

it('parses timestamps', () => {
    const val = new Date();
    const Compiled = a.compile(a.timestamp());
    expect(Compiled.parseUnsafe(val).getTime()).toBe(val.getTime());
    expect(Compiled.parseUnsafe(val.toISOString()).getTime()).toBe(
        val.getTime(),
    );
});

it('parses arrays', () => {
    const CompiledSimple = a.compile(a.array(a.int8()));
    expect(CompiledSimple.parseUnsafe([1, 2, 3, 4, 5])).toStrictEqual([
        1, 2, 3, 4, 5,
    ]);
});

it('respects the strict option', () => {
    const LooseSchema = a.compile(
        a.object({
            id: a.string(),
            name: a.string(),
        }),
    );
    const StrictSchema = a.compile(
        a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { strict: true },
        ),
    );
    const input = {
        id: '',
        name: '',
    };
    const inputWithAdditionalFields = {
        id: '',
        name: '',
        description: '',
    };
    expect(LooseSchema.parse(input).success);
    expect(LooseSchema.parse(inputWithAdditionalFields).success);
    expect(StrictSchema.parse(input).success);
    expect(!StrictSchema.parse(inputWithAdditionalFields).success);
});

it('parses discriminated unions', () => {
    const Schema = a.discriminator('eventType', {
        POST_CREATED: a.object({
            id: a.string(),
            date: a.timestamp(),
        }),
        POST_UPDATED: a.object({
            id: a.string(),
            date: a.timestamp(),
            data: a.object({
                title: a.string(),
                description: a.string(),
            }),
        }),
        POST_DELETED: a.object({
            id: a.string(),
            date: a.timestamp(),
            deletionReason: a.string(),
        }),
    });
    type Schema = a.infer<typeof Schema>;
    const inputs: Schema[] = [
        {
            eventType: 'POST_CREATED',
            id: '1',
            date: new Date(),
        },
        {
            eventType: 'POST_UPDATED',
            id: '2',
            date: new Date(),
            data: {
                title: 'Hello World',
                description: 'Hello World!',
            },
        },
        {
            eventType: 'POST_DELETED',
            id: '3',
            date: new Date(),
            deletionReason: '',
        },
    ];
    const CompiledValidator = a.compile(Schema);
    for (const input of inputs) {
        expect(CompiledValidator.parseUnsafe(input)).toStrictEqual(input);
        expect(
            CompiledValidator.parseUnsafe(
                CompiledValidator.serializeUnsafe(input),
            ),
        ).toStrictEqual(input);
    }
});

it('returns expected amount of errors', () => {
    const Schema = a.object({
        string: a.string(),
        bool: a.boolean(),
        int64: a.int64(),
        object: a.object({
            timestamp: a.timestamp(),
            bool: a.boolean(),
            array: a.array(a.boolean()),
        }),
    });
    type Schema = a.infer<typeof Schema>;
    const $$Schema = a.compile(Schema);
    const goodInput: Schema = {
        string: '',
        bool: false,
        int64: 1000n,
        object: {
            timestamp: new Date(),
            bool: true,
            array: [true, false, false],
        },
    };
    let result = $$Schema.parse(goodInput);
    expect(result.success).toBe(true);
    const badInput = {
        string: true,
        bool: 'false',
        int64: 'hello world',
        object: {
            timestamp: false,
            bool: 'true',
            array: [true, false, 1],
        },
    };
    result = $$Schema.parse(badInput);
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.errors.length).toBe(6);
        expect(result.errors[0]?.instancePath).toBe('/string');
        expect(result.errors[1]?.instancePath).toBe('/bool');
        expect(result.errors[2]?.instancePath).toBe('/int64');
        expect(result.errors[3]?.instancePath).toBe('/object/timestamp');
        expect(result.errors[4]?.instancePath).toBe('/object/bool');
        expect(result.errors[5]?.instancePath).toBe('/object/array/[i]');
    }
});
