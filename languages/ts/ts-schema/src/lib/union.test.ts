import { SchemaFormUnion } from '@arrirpc/type-defs';
import { a, matchUnion, unwrapUnion } from '../_index';

const UnionSchema = a.union('UnionSchema', {
    OBJECT: a.object({
        foo: a.string(),
        bar: a.boolean(),
    }),
    NUMBER: a.float64(),
    BOOLEAN: a.boolean(),
    ARRAY: a.array(a.string()),
});
type UnionSchema = a.infer<typeof UnionSchema>;

describe('Type Inference', () => {
    it('infers discriminator schema type', () => {
        assertType<UnionSchema>({
            OBJECT: {
                foo: '',
                bar: true,
            },
        });
        assertType<UnionSchema>({
            BOOLEAN: true,
        });
        assertType<UnionSchema>({
            NUMBER: 5.5,
        });
        assertType<UnionSchema>({
            ARRAY: ['hello', 'world'],
        });
    });
});

describe('Parsing', () => {
    const parse = (input: unknown) => a.parse(UnionSchema, input);
    it('parses compliant objects', () => {
        const objectInput: UnionSchema = {
            OBJECT: {
                foo: 'hello world',
                bar: false,
            },
        };
        const numberInput: UnionSchema = {
            NUMBER: 15,
        };
        const booleanInput: UnionSchema = {
            BOOLEAN: true,
        };
        const arrayInput: UnionSchema = {
            ARRAY: ['hello', 'world'],
        };
        const objectResult = parse(objectInput);
        expect(objectResult.success).toBe(true);
        if (objectResult.success) {
            expect(objectResult.value).toStrictEqual({
                OBJECT: { foo: 'hello world', bar: false },
            });
        }
        const numberResult = parse(numberInput);
        expect(numberResult.success).toBe(true);
        if (numberResult.success) {
            expect(numberResult.value).toStrictEqual({ NUMBER: 15 });
        }
        const booleanResult = parse(booleanInput);
        expect(booleanResult.success).toBe(true);
        if (booleanResult.success) {
            expect(booleanResult.value).toStrictEqual({
                BOOLEAN: true,
            });
        }
        const arrayResult = parse(arrayInput);
        expect(arrayResult.success).toBe(true);
        if (arrayResult.success) {
            expect(arrayResult.value).toStrictEqual({
                ARRAY: ['hello', 'world'],
            });
        }
    });
    it('reject uncompliant objects', () => {
        const myType = {
            FOO: 'foo',
        };
        const emptyObject = {};
        expect(parse(myType).success).toBe(false);
        expect(parse(emptyObject).success).toBe(false);
    });
});

describe('Validation', () => {
    it('validates compliant objects', () => {
        const objectInput: UnionSchema = {
            OBJECT: {
                foo: 'hello world',
                bar: false,
            },
        };
        const numberInput: UnionSchema = {
            NUMBER: 15,
        };
        const booleanInput: UnionSchema = {
            BOOLEAN: true,
        };
        const arrayInput: UnionSchema = {
            ARRAY: ['hello', 'world'],
        };
        expect(a.validate(UnionSchema, objectInput)).toBe(true);
        expect(a.validate(UnionSchema, numberInput)).toBe(true);
        expect(a.validate(UnionSchema, booleanInput)).toBe(true);
        expect(a.validate(UnionSchema, arrayInput)).toBe(true);
    });
    it('rejects uncompliant objects', () => {
        const myType = {
            FOO: 'foo',
        };
        const emptyObject = {};
        expect(a.validate(UnionSchema, myType)).toBe(false);
        expect(a.validate(UnionSchema, emptyObject)).toBe(false);
    });
});

describe('Serialization', () => {
    it('serializes correctly', () => {
        const objectInput: UnionSchema = {
            OBJECT: {
                foo: 'hello world',
                bar: false,
            },
        };
        const numberInput: UnionSchema = {
            NUMBER: 15,
        };
        const booleanInput: UnionSchema = {
            BOOLEAN: true,
        };
        const arrayInput: UnionSchema = {
            ARRAY: ['hello', 'world'],
        };
        expect(a.serializeUnsafe(UnionSchema, objectInput)).toBe(
            `{"OBJECT":{"foo":"hello world","bar":false}}`,
        );
        expect(a.serializeUnsafe(UnionSchema, numberInput)).toBe(
            `{"NUMBER":15}`,
        );
        expect(a.serializeUnsafe(UnionSchema, booleanInput)).toBe(
            `{"BOOLEAN":true}`,
        );
        expect(a.serializeUnsafe(UnionSchema, numberInput)).toBe(
            `{"NUMBER":15}`,
        );
    });
});

test('overloaded functions produce the same results', () => {
    const SchemaA = a.union(
        {
            TEXT: a.object({
                userId: a.string(),
                content: a.string(),
            }),
            IMAGE: a.object({
                userId: a.string(),
                imageUrl: a.string(),
            }),
        },
        {
            id: 'Message',
        },
    );
    type SchemaA = a.infer<typeof SchemaA>;
    const SchemaB = a.union('Message', {
        TEXT: a.object({
            userId: a.string(),
            content: a.string(),
        }),
        IMAGE: a.object({
            userId: a.string(),
            imageUrl: a.string(),
        }),
    });
    type SchemaB = a.infer<typeof SchemaB>;
    const input: SchemaA = {
        TEXT: {
            userId: '1',
            content: '',
        },
    };
    assertType<SchemaA>(input);
    assertType<SchemaB>(input);
    expect(JSON.stringify(SchemaA)).toBe(JSON.stringify(SchemaB));
    expect(a.validate(SchemaA, input)).toBe(a.validate(SchemaB, input));
    expect(a.serializeUnsafe(SchemaA, input)).toBe(
        a.serializeUnsafe(SchemaB, input),
    );
});

it('produces valid ATD', () => {
    const result = JSON.parse(
        JSON.stringify(
            a.union('Message', {
                TEXT: a.object({
                    content: a.string(),
                }),
                IMAGE: a.object({
                    url: a.string(),
                }),
                VIDEO: a.object({
                    url: a.string(),
                    length: a.uint64(),
                }),
            }),
        ),
    );
    expect(result).toStrictEqual({
        union: {
            TEXT: {
                properties: {
                    content: {
                        type: 'string',
                        metadata: {},
                    },
                },
                metadata: {},
            },
            IMAGE: {
                properties: {
                    url: {
                        type: 'string',
                        metadata: {},
                    },
                },
                metadata: {},
            },
            VIDEO: {
                properties: {
                    url: {
                        type: 'string',
                        metadata: {},
                    },
                    length: {
                        type: 'uint64',
                        metadata: {},
                    },
                },
                metadata: {},
            },
        },
        metadata: {
            id: 'Message',
        },
    } satisfies SchemaFormUnion);
});

describe('union helpers', () => {
    const UnionType = a.union({
        foo: a.object({
            message: a.string(),
        }),
        bar: a.array(a.boolean()),
        baz: a.nullable(a.timestamp()),
    });
    type UnionType = a.infer<typeof UnionType>;
    function getInput(): UnionType {
        return {
            foo: {
                message: 'hello world',
            },
        };
    }
    test('unwrap union', () => {
        const [key, value] = unwrapUnion(getInput());
        switch (key) {
            case 'foo':
                assertType<string>(value.message);
                expect(true, 'should hit this branch');
                break;
            case 'bar':
                assertType<boolean[]>(value);
                expect(false, 'should not hit this branch');
                break;
            case 'baz':
                assertType<Date | null>(value);
                expect(false, 'should not hit this branch');
                break;
            default:
                key satisfies never;
                expect(false, 'should not hit this branch');
                break;
        }
    });

    test('match union', () => {
        const result = matchUnion(getInput(), {
            foo: (val) => {
                assertType<string>(val.message);
                return val.message;
            },
            bar: (val: boolean[]) => {
                assertType<boolean[]>(val);
                return 'unexpected';
            },
            baz: (val: Date | null) => {
                assertType<Date | null>(val);
                return 'unexpected';
            },
        });
        expect(result).toBe('hello world');
    });
});

// test('loop union helper', () => {
//     const MySchema = a.union({
//         foo: a.object({
//             message: a.string(),
//         }),
//         bar: a.boolean(),
//         baz: a.nullable(a.string()),
//     });
//     type MySchema = a.infer<typeof MySchema>;
//     const input: MySchema = {
//         foo: {
//             message: 'hello world',
//         },
//     };
//     const [key, value] = loopUnionHelper(input as MySchema);
// });
