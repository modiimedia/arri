import { SchemaFormDiscriminator } from '../dist';
import { isSchemaFormUnion, SchemaFormUnion } from './typeDef';

test('isSchemaFormUnion()', () => {
    const goodSchema: SchemaFormUnion = {
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
    };
    expect(isSchemaFormUnion(goodSchema)).toBe(true);
    const badSchema: SchemaFormDiscriminator = {
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
    };
    expect(isSchemaFormUnion(badSchema)).toBe(false);

    const typeCheck: any = '';
    if (isSchemaFormUnion(typeCheck)) assertType<SchemaFormUnion>(typeCheck);
});
