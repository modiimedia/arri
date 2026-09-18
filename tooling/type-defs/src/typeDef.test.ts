import { isSchemaFormUnion, SchemaFormUnion } from './typeDef';

describe('isSchemaFormUnion()', () => {
    const goodSchemas: SchemaFormUnion[] = [
        {
            union: {
                foo: {
                    type: 'string',
                },
                bar: {
                    properties: {
                        width: {
                            type: 'float32',
                        },
                        height: {
                            type: 'float32',
                        },
                    },
                },
                baz: {},
            },
        },
        {
            tagKey: 'type',
            union: {
                rectangle: {
                    properties: {
                        width: {
                            type: 'float64',
                        },
                        height: {
                            type: 'float64',
                        },
                    },
                },
                circle: {
                    properties: {
                        radius: {
                            type: 'float64',
                        },
                    },
                },
            },
        },
        {
            tagKey: 'type',
            valueKey: 'value',
            union: {
                rectangle: {
                    properties: {
                        width: {
                            type: 'float64',
                        },
                        height: {
                            type: 'float64',
                        },
                    },
                },
                circle: {
                    properties: {
                        radius: {
                            type: 'float64',
                        },
                    },
                },
            },
        },
    ];
    for (let i = 0; i < goodSchemas.length; i++) {
        test(`good schema -> ${i}`, () => {
            expect(isSchemaFormUnion(goodSchemas[i])).toBe(true);
        });
    }

    const badSchemas = [
        {
            discriminator: 'type',
            mapping: {
                foo: {
                    properties: {
                        radius: {
                            type: 'float32',
                        },
                    },
                },
                bar: {
                    properties: {
                        width: {
                            type: 'float32',
                        },
                        height: {
                            type: 'float32',
                        },
                    },
                },
            },
        },
        {},
        {
            tagKey: 15,
            union: {
                foo: {},
            },
        },
    ];
    for (let i = 0; i < badSchemas.length; i++) {
        test(`bad schema -> ${i}`, () => {
            expect(isSchemaFormUnion(badSchemas)).toBe(false);
        });
    }

    test('type inference', () => {
        const typeCheck: any = '';
        if (isSchemaFormUnion(typeCheck)) {
            assertType<SchemaFormUnion>(typeCheck);
        }
    });
});
