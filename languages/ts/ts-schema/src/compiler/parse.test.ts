import { isEqual } from 'lodash';

import { a } from '../_index';
import { compile } from '../compile';
import { parsingTestSuites, validationTestSuites } from '../testSuites';

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key]!;
    describe(key, () => {
        const Compiled = compile(suite.schema);
        for (let i = 0; i < suite.goodInputs.length; i++) {
            test(`Good Input - ${i + 1}`, () => {
                const input = suite.goodInputs[i];
                expect(isEqual(Compiled.decode(input), input));
                if (typeof input === 'object') {
                    expect(
                        isEqual(Compiled.decode(Compiled.encode(input)), input),
                    );
                }
            });
        }
        for (let i = 0; i < suite.badInputs.length; i++) {
            test(`Bad input - ${i + 1}`, () => {
                const input = suite.badInputs[i];
                expect(Compiled.decode(input).success).toBe(false);
                expect(a.decode(suite.schema, input).success).toBe(false);
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
                    const actualResult = Compiled.decode(input);
                    if (!actualResult.success) {
                        console.log(Compiled.compiledCode.decode);
                        console.log(input, 'Should parse');
                    }
                    expect(actualResult.success).toBe(true);
                    if (!actualResult.success) return;
                    const serializedResult = Compiled.encode(
                        actualResult.value,
                    );
                    expect(serializedResult.success).toBe(true);
                    if (!serializedResult.success) return;
                    expect(actualResult.value).toStrictEqual(expectedResult);
                    expect(
                        Compiled.decodeUnsafe(serializedResult.value),
                    ).toStrictEqual(expectedResult);
                    expect(actualResult.value).toStrictEqual(
                        a.decodeUnsafe(suite.schema, input),
                    );
                });
            }
            for (let i = 0; i < suite.badInputs.length; i++) {
                test(`${key} - Bad Input ${i}`, () => {
                    const input = suite.badInputs[i];
                    const result = Compiled.decode(input);
                    if (result.success) {
                        console.log(Compiled.compiledCode.decode);
                        console.log(input, 'Should NOT parse');
                    }
                    expect(result.success).toBe(false);
                });
            }
        });
    }
});

it('parses floats', () => {
    const Compiled = a.compile(a.number());
    expect(Compiled.decodeUnsafe('1')).toBe(1);
    expect(Compiled.decodeUnsafe(1)).toBe(1);
    expect(Compiled.decodeUnsafe('1500.5')).toBe(1500.5);
    expect(!Compiled.decode('hello world').success);
    expect(!Compiled.decode(true).success);
});

it('parses ints', () => {
    const Compiled = a.compile(a.uint32());
    expect(Compiled.decodeUnsafe('1')).toBe(1);
    expect(Compiled.decodeUnsafe(1)).toBe(1);
    expect(!Compiled.decode('1500.5').success);
    expect(!Compiled.decode(-100).success);
    expect(!Compiled.decode(true).success);
});

it('parses timestamps', () => {
    const val = new Date();
    const Compiled = a.compile(a.timestamp());
    expect(Compiled.decodeUnsafe(val).getTime()).toBe(val.getTime());
    expect(Compiled.decodeUnsafe(val.toISOString()).getTime()).toBe(
        val.getTime(),
    );
});

it('parses arrays', () => {
    const CompiledSimple = a.compile(a.array(a.int8()));
    expect(CompiledSimple.decodeUnsafe([1, 2, 3, 4, 5])).toStrictEqual([
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
    expect(LooseSchema.decode(input).success);
    expect(LooseSchema.decode(inputWithAdditionalFields).success);
    expect(StrictSchema.decode(input).success);
    expect(!StrictSchema.decode(inputWithAdditionalFields).success);
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
        expect(CompiledValidator.decodeUnsafe(input)).toStrictEqual(input);
        expect(
            CompiledValidator.decodeUnsafe(
                CompiledValidator.encodeUnsafe(input),
            ),
        ).toStrictEqual(input);
    }
});
