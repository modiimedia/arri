import { SchemaFormUnion } from '@arrirpc/type-defs';

import { a, matchUnion, unwrapUnion } from '../_index';

describe('external tagging (default)', () => {
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
        it('infers externally tagged unions', () => {
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
            expect(a.serializeUnsafe(UnionSchema, arrayInput)).toBe(
                `{"ARRAY":["hello","world"]}`,
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
});

describe('internal/adjacent tagging', () => {
    const UnionSchema = a.union(
        'UnionSchema',
        {
            rectangle: a.object({
                width: a.float32(),
                height: a.float32(),
            }),
            circle: a.object({
                radius: a.float32(),
            }),
        },
        {
            tagKey: 'type',
        },
    );
    type UnionSchema = a.infer<typeof UnionSchema>;
    describe('Type Inference', () => {
        it('infers externally tagged unions', () => {
            assertType<UnionSchema>({
                type: 'rectangle',
                width: 15.5,
                height: 15.5,
            });
            assertType<UnionSchema>({
                type: 'circle',
                radius: 15,
            });
        });
    });

    describe('Parsing', () => {
        const parse = (input: unknown) => a.parse(UnionSchema, input);
        it('parses compliant objects', () => {
            const rectangleInput: UnionSchema = {
                type: 'rectangle',
                width: 15.5,
                height: 15.5,
            };
            const circleInput: UnionSchema = {
                type: 'circle',
                radius: 15,
            };
            const rectangleResult = parse(rectangleInput);
            expect(rectangleResult.success).toBe(true);
            if (rectangleResult.success) {
                expect(rectangleResult.value).toStrictEqual({
                    type: 'rectangle',
                    width: 15.5,
                    height: 15.5,
                });
            }
            const circleResult = parse(circleInput);
            expect(circleResult.success).toBe(true);
            if (circleResult.success) {
                expect(circleResult.value).toStrictEqual({
                    type: 'circle',
                    radius: 15,
                });
            }
        });
        it('reject uncompliant objects', () => {
            const polygon = {
                type: 'polygon',
                points: [
                    [1, 5],
                    [10, 10],
                    [7, 5],
                ],
            };
            const emptyObject = {};
            expect(parse(polygon).success).toBe(false);
            expect(parse(emptyObject).success).toBe(false);
        });
    });

    describe('Validation', () => {
        it('validates compliant objects', () => {
            const rectangleInput: UnionSchema = {
                type: 'rectangle',
                width: 15.5,
                height: 15.5,
            };
            const circleInput: UnionSchema = {
                type: 'circle',
                radius: 15.5,
            };

            expect(a.validate(UnionSchema, rectangleInput)).toBe(true);
            expect(a.validate(UnionSchema, circleInput)).toBe(true);
        });
        it('rejects uncompliant objects', () => {
            const myType = {
                type: 'polygon',
                points: [
                    [1, 5],
                    [10, 10],
                    [7, 5],
                ],
            };
            const emptyObject = {};
            expect(a.validate(UnionSchema, myType)).toBe(false);
            expect(a.validate(UnionSchema, emptyObject)).toBe(false);
        });
    });

    describe('Serialization', () => {
        it('serializes correctly', () => {
            const rectangleInput: UnionSchema = {
                type: 'rectangle',
                width: 15.5,
                height: 15.5,
            };
            const circleInput: UnionSchema = {
                type: 'circle',
                radius: 15.5,
            };
            expect(a.serializeUnsafe(UnionSchema, rectangleInput)).toBe(
                `{"type":"rectangle","width":15.5,"height":15.5}`,
            );
            expect(a.serializeUnsafe(UnionSchema, circleInput)).toBe(
                `{"type":"circle","radius":15.5}`,
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
                tagKey: 'kind',
            },
        );
        type SchemaA = a.infer<typeof SchemaA>;
        const SchemaB = a.union(
            'Message',
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
            { tagKey: 'kind' },
        );
        type SchemaB = a.infer<typeof SchemaB>;
        const input: SchemaA = {
            kind: 'TEXT',
            userId: '1',
            content: '',
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
                a.union(
                    'Message',
                    {
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
                    },
                    { tagKey: 'kind' },
                ),
            ),
        );
        expect(result).toStrictEqual({
            tagKey: 'kind',
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
});

describe('internal/adjacent tagging with value key', () => {
    const UnionSchema = a.union(
        'UnionSchema',
        {
            text: a.string(),
            tags: a.array(a.string()),
            image: a.object({
                url: a.string(),
                width: a.float64(),
                height: a.float64(),
            }),
        },
        {
            tagKey: 'kind',
            valueKey: 'content',
        },
    );
    type UnionSchema = a.infer<typeof UnionSchema>;
    describe('Type Inference', () => {
        it('infers externally tagged unions', () => {
            assertType<UnionSchema>({
                kind: 'text',
                content: 'hello world',
            });
            assertType<UnionSchema>({
                kind: 'tags',
                content: ['tag-1', 'tag-2', 'tag-3'],
            });
            assertType<UnionSchema>({
                kind: 'image',
                content: {
                    url: 'https://example.com/foo',
                    width: 15,
                    height: 25,
                },
            });
        });
    });

    describe('Parsing', () => {
        const parse = (input: unknown) => a.parse(UnionSchema, input);
        it('parses compliant objects', () => {
            const textInput: UnionSchema = {
                kind: 'text',
                content: 'hello world',
            };
            const tagInput: UnionSchema = {
                kind: 'tags',
                content: ['tag-1', 'tag-2', 'tag-3'],
            };
            const imageInput: UnionSchema = {
                kind: 'image',
                content: {
                    url: 'https://example.com/foo',
                    width: 15,
                    height: 25,
                },
            };
            const textResult = parse(textInput);
            expect(textResult.success).toBe(true);
            if (textResult.success) {
                expect(textResult.value).toStrictEqual({
                    kind: 'text',
                    content: 'hello world',
                });
            }
            const tagResult = parse(tagInput);
            expect(tagResult.success).toBe(true);
            if (tagResult.success) {
                expect(tagResult.value).toStrictEqual({
                    kind: 'tags',
                    content: ['tag-1', 'tag-2', 'tag-3'],
                });
            }
            const imageResult = parse(imageInput);
            expect(imageResult.success).toBe(true);
            if (imageResult.success) {
                expect(imageResult.value).toStrictEqual({
                    kind: 'image',
                    content: {
                        url: 'https://example.com/foo',
                        width: 15,
                        height: 25,
                    },
                });
            }
        });
        it('reject uncompliant objects', () => {
            const polygon = {
                kind: 'polygon',
                content: [
                    [1, 5],
                    [10, 10],
                    [7, 5],
                ],
            };
            const emptyObject = {};
            expect(parse(polygon).success).toBe(false);
            expect(parse(emptyObject).success).toBe(false);
        });
    });

    describe('Validation', () => {
        it('validates compliant objects', () => {
            const textInput: UnionSchema = {
                kind: 'text',
                content: 'hello world',
            };
            const tagInput: UnionSchema = {
                kind: 'tags',
                content: ['tag-1', 'tag-2', 'tag-3'],
            };
            const imageInput: UnionSchema = {
                kind: 'image',
                content: {
                    url: 'https://example.com/foo',
                    width: 15,
                    height: 25,
                },
            };

            expect(a.validate(UnionSchema, textInput)).toBe(true);
            expect(a.validate(UnionSchema, tagInput)).toBe(true);
            expect(a.validate(UnionSchema, imageInput)).toBe(true);
        });
        it('rejects uncompliant objects', () => {
            const myType = {
                kind: 'polygon',
                content: [
                    [1, 5],
                    [10, 10],
                    [7, 5],
                ],
            };
            const emptyObject = {};
            expect(a.validate(UnionSchema, myType)).toBe(false);
            expect(a.validate(UnionSchema, emptyObject)).toBe(false);
        });
    });

    describe('Serialization', () => {
        it('serializes correctly', () => {
            const textInput: UnionSchema = {
                kind: 'text',
                content: 'hello world',
            };
            const tagInput: UnionSchema = {
                kind: 'tags',
                content: ['tag-1', 'tag-2', 'tag-3'],
            };
            const imageInput: UnionSchema = {
                kind: 'image',
                content: {
                    url: 'https://example.com/foo',
                    width: 15,
                    height: 25,
                },
            };
            expect(a.serializeUnsafe(UnionSchema, textInput)).toBe(
                `{"kind":"text","content":"hello world"}`,
            );
            expect(a.serializeUnsafe(UnionSchema, tagInput)).toBe(
                `{"kind":"tags","content":["tag-1","tag-2","tag-3"]}`,
            );
            expect(a.serializeUnsafe(UnionSchema, imageInput)).toBe(
                `{"kind":"image","content":{"url":"https://example.com/foo","width":15,"height":25}}`,
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
                tagKey: 'kind',
            },
        );
        type SchemaA = a.infer<typeof SchemaA>;
        const SchemaB = a.union(
            'Message',
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
            { tagKey: 'kind' },
        );
        type SchemaB = a.infer<typeof SchemaB>;
        const input: SchemaA = {
            kind: 'TEXT',
            userId: '1',
            content: '',
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
                a.union(
                    'Message',
                    {
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
                    },
                    { tagKey: 'kind', valueKey: 'content' },
                ),
            ),
        );
        expect(result).toStrictEqual({
            tagKey: 'kind',
            valueKey: 'content',
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
});

test('overloaded functions produce the same result', () => {
    const SchemaA = a.union(
        {
            FOO: a.string(),
            BAR: a.array(a.string()),
            BAZ: a.object({ foo: a.string() }),
        },
        { id: 'Union', tagKey: 'type', valueKey: 'data' },
    );
    type SchemaA = a.infer<typeof SchemaA>;
    const SchemaB = a.union(
        'Union',
        {
            FOO: a.string(),
            BAR: a.array(a.string()),
            BAZ: a.object({ foo: a.string() }),
        },
        { tagKey: 'type', valueKey: 'data' },
    );
    type SchemaB = a.infer<typeof SchemaB>;
    const input: SchemaA = {
        type: 'FOO',
        data: 'hello world',
    };
    assertType<SchemaA>(input);
    assertType<SchemaB>(input);
    expect(JSON.stringify(SchemaA)).toBe(JSON.stringify(SchemaB));
    expect(a.validate(SchemaA, input)).toBe(a.validate(SchemaB, input));
    expect(a.serializeUnsafe(SchemaA, input)).toBe(
        a.serializeUnsafe(SchemaB, input),
    );
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
