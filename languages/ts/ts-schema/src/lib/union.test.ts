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
    const parse = (input: unknown) => a.parse(UnionSchema, input).success;
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
        expect(parse(objectInput)).toBe(true);
        expect(parse(numberInput)).toBe(true);
        expect(parse(booleanInput)).toBe(true);
        expect(parse(arrayInput)).toBe(true);
    });
    it('reject uncompliant objects', () => {
        const myType = {
            FOO: 'foo',
        };
        const emptyObject = {};
        expect(parse(myType)).toBe(false);
        expect(parse(emptyObject)).toBe(false);
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
