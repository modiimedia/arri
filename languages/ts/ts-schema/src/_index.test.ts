import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEmpty,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
} from '@arrirpc/type-defs';

import { a } from './_index';

test('isSchemaFormType', () => {
    const Schemas = [
        a.string(),
        a.float64(),
        a.float32(),
        a.int64(),
        a.uint64(),
        a.int32(),
        a.uint32(),
        a.int16(),
        a.uint16(),
        a.int8(),
        a.uint8(),
        a.boolean(),
        a.timestamp(),
    ];
    for (const schema of Schemas) {
        expect(isSchemaFormType(schema));
        expect(isSchemaFormType(JSON.parse(JSON.stringify(schema))));
    }
});
test('isSchemaFormEnum', () => {
    const Schema = a.stringEnum(['A', 'B', 'C']);
    expect(isSchemaFormEnum(Schema));
    expect(isSchemaFormEnum(JSON.parse(JSON.stringify(Schema))));
});

test('isSchemaFormElements', () => {
    const Schema = a.array(
        a.object({
            id: a.string(),
            name: a.string(),
        }),
    );
    expect(isSchemaFormElements(Schema));
    expect(isSchemaFormElements(JSON.parse(JSON.stringify(Schema))));
});

test('isSchemaFormProperties', () => {
    const User = a.object(
        {
            id: a.string(),
            name: a.string(),
            date: a.timestamp(),
            description: a.string(),
        },
        { id: 'User' },
    );
    const Schemas = [
        User,
        a.partial(User),
        a.pick(User, ['id', 'name']),
        a.extend(
            User,
            a.object({
                other: a.any(),
            }),
        ),
    ];
    for (const schema of Schemas) {
        expect(isSchemaFormProperties(schema));
        expect(isSchemaFormProperties(JSON.parse(JSON.stringify(schema))));
    }
});

test('isSchemaFormDiscriminator', () => {
    const Schema = a.discriminator('type', {
        A: a.object({
            id: a.string(),
        }),
        B: a.object({
            id: a.string(),
            name: a.string(),
        }),
    });
    expect(isSchemaFormDiscriminator(Schema));
    expect(isSchemaFormDiscriminator(JSON.parse(JSON.stringify(Schema))));
});

test('isSchemaFormValues', () => {
    const Schema = a.record(
        a.object({
            id: a.string(),
            name: a.string(),
        }),
    );
    expect(isSchemaFormValues(Schema));
    expect(isSchemaFormValues(JSON.parse(JSON.stringify(Schema))));
});

test('isSchemaFormEmpty', () => {
    const Schema = a.any();
    expect(isSchemaFormEmpty(Schema));
    expect(isSchemaFormEmpty(JSON.parse(JSON.stringify(Schema))));
});

test('isSchemaFormRef', () => {
    const Schema = {
        ref: 'A',
    };
    expect(isSchemaFormRef(Schema));
});
