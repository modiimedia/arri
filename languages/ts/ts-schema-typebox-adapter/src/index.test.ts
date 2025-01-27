import { a } from '@arrirpc/schema';
import { defineEventStreamRpc, defineRpc } from '@arrirpc/server';
import { type Static, Type } from '@sinclair/typebox';

import { typeboxAdapter } from './index';

it('infers types correctly', () => {
    const Schema = typeboxAdapter(
        Type.Object({
            id: Type.String(),
            email: Type.String(),
            createdAt: Type.Integer(),
        }),
    );
    type Schema = a.infer<typeof Schema>;
    assertType<Schema>({
        id: 'string',
        email: 'string',
        createdAt: 0,
    });
    const SchemaWithOptionals = typeboxAdapter(
        Type.Object({
            id: Type.String(),
            email: Type.Optional(Type.String()),
            role: Type.Enum({
                standard: 'standard',
                admin: 'admin',
            }),
            posts: Type.Array(
                Type.Object({
                    id: Type.String(),
                    title: Type.String(),
                    numComments: Type.Optional(Type.Integer()),
                    numLikes: Type.Optional(Type.Integer()),
                }),
            ),
        }),
    );
    type SchemaWithOptionals = a.infer<typeof SchemaWithOptionals>;
    assertType<SchemaWithOptionals>({
        id: '12345',
        email: undefined,
        role: 'admin',
        posts: [
            {
                id: '123455',
                title: '',
                numComments: 2,
                numLikes: 5,
            },
            {
                id: '123j5',
                title: '1324lk14j',
            },
        ],
    });

    const RecordSchema = typeboxAdapter(
        Type.Record(Type.String(), Type.Boolean()),
    );
    type RecordSchema = a.infer<typeof RecordSchema>;
    assertType<RecordSchema>({
        A: true,
        B: false,
        C: true,
    });
});

it('creates matching jtd schemas', () => {
    const ObjectSchema = Type.Object({
        id: Type.String(),
        role: Type.Enum({
            standard: 'STANDARD',
            admin: 'ADMIN',
        }),
        created: Type.Integer(),
        bio: Type.Optional(Type.String()),
    });
    const ConvertedSchema = typeboxAdapter(ObjectSchema);
    const ExpectedSchema = a.object({
        id: a.string(),
        role: a.stringEnum(['STANDARD', 'ADMIN']),
        created: a.int32(),
        bio: a.optional(a.string()),
    });
    expect(JSON.parse(JSON.stringify(ConvertedSchema))).toStrictEqual(
        JSON.parse(JSON.stringify(ExpectedSchema)),
    );
});

it('parses objects in the expected way', () => {
    const UserSchema = Type.Object({
        id: Type.String(),
        name: Type.String(),
        isAdmin: Type.Optional(Type.Boolean()),
        posts: Type.Array(
            Type.Object({
                id: Type.Optional(Type.String()),
                date: Type.Integer(),
            }),
        ),
    });
    const TargetUserSchema = a.object({
        id: a.string(),
        name: a.string(),
        isAdmin: a.optional(a.boolean()),
        posts: a.array(
            a.object({ id: a.optional(a.string()), date: a.int32() }),
        ),
    });
    const ConvertedUserSchema = typeboxAdapter(UserSchema);
    const goodInput = {
        id: '12345',
        name: 'john doe',
        isAdmin: false,
        posts: [
            {
                id: '12345',
                date: 0,
            },
            {
                date: 0,
            },
        ],
    };
    expect(a.parse(TargetUserSchema, goodInput).success);
    expect(a.parse(TargetUserSchema, JSON.stringify(goodInput)).success);
    expect(a.parse(ConvertedUserSchema, goodInput).success);
    expect(a.parse(ConvertedUserSchema, JSON.stringify(goodInput)).success);
    const badInput = {
        id: '12345',
        name: 12345131,
        isAdmin: true,
        posts: [],
    };
    expect(!a.parse(TargetUserSchema, badInput).success);
    expect(!a.parse(TargetUserSchema, JSON.stringify(badInput)).success);
    expect(!a.parse(ConvertedUserSchema, badInput).success);
    expect(!a.parse(ConvertedUserSchema, JSON.stringify(badInput)).success);
});

describe('arri inference', () => {
    test('object parameters', () => {
        const Schema = Type.Object({
            id: Type.String(),
            name: Type.String(),
        });
        type Schema = Static<typeof Schema>;
        defineRpc({
            params: typeboxAdapter(Schema),
            response: typeboxAdapter(Schema),
            handler({ params }) {
                assertType<Schema>(params);
                return { id: '', name: '' };
            },
        });
        defineEventStreamRpc({
            params: typeboxAdapter(Schema),
            response: typeboxAdapter(Schema),
            handler({ params, stream }) {
                assertType<Schema>(params);
                stream.send();
                void stream.push({ id: '', name: '' });
            },
        });
    });
});
