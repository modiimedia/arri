import {
    isSchemaFormElements,
    isSchemaFormEmpty,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormUnion,
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
        expect(isSchemaFormType(schema)).toBe(true);
        expect(isSchemaFormType(JSON.parse(JSON.stringify(schema)))).toBe(true);
    }
});
test('isSchemaFormEnum', () => {
    const Schema = a.stringEnum(['A', 'B', 'C']);
    expect(isSchemaFormEnum(Schema)).toBe(true);
    expect(isSchemaFormEnum(JSON.parse(JSON.stringify(Schema)))).toBe(true);
});

test('isSchemaFormElements', () => {
    const Schema = a.array(
        a.object({
            id: a.string(),
            name: a.string(),
        }),
    );
    expect(isSchemaFormElements(Schema)).toBe(true);
    expect(isSchemaFormElements(JSON.parse(JSON.stringify(Schema)))).toBe(true);
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
        expect(isSchemaFormProperties(schema)).toBe(true);
        expect(isSchemaFormProperties(JSON.parse(JSON.stringify(schema)))).toBe(
            true,
        );
    }
});

// a.discriminator() produces an internally tagged union
test('isSchemaFormUnion (discriminator)', () => {
    const Schema = a.discriminator('type', {
        A: a.object({
            id: a.string(),
        }),
        B: a.object({
            id: a.string(),
            name: a.string(),
        }),
    });
    expect(isSchemaFormUnion(Schema)).toBe(true);
    expect(isSchemaFormUnion(JSON.parse(JSON.stringify(Schema)))).toBe(true);
    expect(Schema.tagKey).toBe('type');
});

test('isSchemaFormValues', () => {
    const Schema = a.record(
        a.object({
            id: a.string(),
            name: a.string(),
        }),
    );
    expect(isSchemaFormValues(Schema)).toBe(true);
    expect(isSchemaFormValues(JSON.parse(JSON.stringify(Schema)))).toBe(true);
});

test('isSchemaFormEmpty', () => {
    const Schema = a.any();
    expect(isSchemaFormEmpty(Schema)).toBe(true);
    expect(isSchemaFormEmpty(JSON.parse(JSON.stringify(Schema)))).toBe(true);
});

test('isSchemaFormRef', () => {
    const Schema = {
        ref: 'A',
    };
    expect(isSchemaFormRef(Schema)).toBe(true);
});
