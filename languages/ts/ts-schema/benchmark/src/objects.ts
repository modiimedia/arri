import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Check, Value } from '@sinclair/typebox/value';
import Ajv from 'ajv';
import AjvJtd from 'ajv/dist/jtd';
import benny from 'benny';
import * as v from 'valibot';
import { z } from 'zod';

import { a } from '../../src/_index';

const ArriUser = a.object({
    id: a.int32(),
    role: a.stringEnum(['standard', 'admin', 'moderator']),
    name: a.string(),
    email: a.nullable(a.string()),
    createdAt: a.int32(),
    updatedAt: a.int32(),
    settings: a.optional(
        a.object({
            preferredTheme: a.stringEnum(['light', 'dark', 'system']),
            allowNotifications: a.boolean(),
        }),
    ),
    recentNotifications: a.array(
        a.discriminator('type', {
            POST_LIKE: a.object({
                userId: a.string(),
                postId: a.string(),
            }),
            POST_COMMENT: a.object({
                userId: a.string(),
                postId: a.string(),
                commentText: a.string(),
            }),
        }),
    ),
});
const $$ArriUser = a.compile(ArriUser);
type ArriUser = a.infer<typeof ArriUser>;

const input: ArriUser = {
    id: 12345,
    role: 'moderator',
    name: 'John Doe',
    email: null,
    createdAt: 0,
    updatedAt: 0,
    settings: {
        preferredTheme: 'system',
        allowNotifications: true,
    },
    recentNotifications: [
        {
            type: 'POST_LIKE',
            postId: '1',
            userId: '2',
        },
        {
            type: 'POST_COMMENT',
            postId: '1',
            userId: '1',
            commentText: '',
        },
    ],
};
const inputJson = JSON.stringify(input);

const badInput: ArriUser = {
    id: 12345,
    role: 'moderator',
    name: 'John Doe',
    email: null,
    createdAt: 0,
    updatedAt: 0,
    settings: {
        preferredTheme: 'system',
        allowNotifications: true,
    },
    recentNotifications: [
        {
            type: 'POST_LIKE',
            postId: '1',
            userId: '2',
        },
        {
            type: 'POST_BOOKMARK',
            postId: '1',
            userId: '2',
        } as any,
    ],
};
const badInputJson = JSON.stringify(badInput);

if (a.parse(ArriUser, badInput).success) {
    throw new Error('ArriUser should fail at badInputJson');
}
if ($$ArriUser.parse(badInputJson).success) {
    throw new Error('$$ArriUser should failed at badInputJson');
}

const inputWithStringKeys = {
    id: '12345',
    role: 'moderator',
    name: 'John Doe',
    email: 'null',
    createdAt: '12135151',
    updatedAt: '13141343',
    settings: {
        preferredTheme: 'system',
        allowNotifications: 'true',
    },
    recentNotifications: [
        {
            type: 'POST_LIKE',
            postId: '1',
            userId: '2',
        },
        {
            type: 'POST_COMMENT',
            postId: '1',
            userId: '1',
            commentText: '',
        },
    ],
};

const ZodUser = z.object({
    id: z.number(),
    role: z.enum(['standard', 'admin', 'moderator']),
    name: z.string(),
    email: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
    settings: z
        .object({
            preferredTheme: z.enum(['light', 'dark', 'system']),
            allowNotifications: z.boolean(),
        })
        .optional(),
    recentNotifications: z.array(
        z.discriminatedUnion('type', [
            z.object({
                type: z.literal('POST_LIKE'),
                userId: z.string(),
                postId: z.string(),
            }),
            z.object({
                type: z.literal('POST_COMMENT'),
                userId: z.string(),
                postId: z.string(),
            }),
        ]),
    ),
});
const ZodCoercedUser = z.object({
    id: z.coerce.number(),
    role: z.enum(['standard', 'admin', 'moderator']),
    name: z.coerce.string(),
    email: z.coerce.string().nullable(),
    createdAt: z.coerce.number(),
    updatedAt: z.coerce.number(),
    settings: z
        .object({
            preferredTheme: z.enum(['light', 'dark', 'system']),
            allowNotifications: z.coerce.boolean(),
        })
        .optional(),
    recentNotifications: z.array(
        z.discriminatedUnion('type', [
            z.object({
                type: z.literal('POST_LIKE'),
                userId: z.coerce.string(),
                postId: z.coerce.string(),
            }),
            z.object({
                type: z.literal('POST_COMMENT'),
                userId: z.coerce.string(),
                postId: z.coerce.string(),
                commentText: z.coerce.string(),
            }),
        ]),
    ),
});
if (!ZodUser.safeParse(input).success) {
    throw new Error(`Zod should parse input`);
}
if (ZodUser.safeParse(badInput).success) {
    throw new Error(`Zod should not parse badInput`);
}

const TypeBoxUser = Type.Object({
    id: Type.Integer(),
    role: Type.Union([
        Type.Literal('standard'),
        Type.Literal('admin'),
        Type.Literal('moderator'),
    ]),
    name: Type.String(),
    email: Type.Union([Type.Null(), Type.String()]),
    createdAt: Type.Integer(),
    updatedAt: Type.Integer(),
    settings: Type.Optional(
        Type.Object({
            preferredTheme: Type.Optional(
                Type.Union([
                    Type.Literal('light'),
                    Type.Literal('dark'),
                    Type.Literal('system'),
                ]),
            ),
            allowNotifications: Type.Boolean(),
        }),
    ),
    recentNotifications: Type.Array(
        Type.Union([
            Type.Object({
                type: Type.Literal('POST_LIKE'),
                userId: Type.String(),
                postId: Type.String(),
            }),
            Type.Object({
                type: Type.Literal('POST_COMMENT'),
                userId: Type.String(),
                postId: Type.String(),
                commentText: Type.String(),
            }),
        ]),
    ),
});
const TypeBoxUserValidator = TypeCompiler.Compile(TypeBoxUser);
if (!Check(TypeBoxUser, input)) {
    throw new Error(`Typebox should pass input`);
}
if (Check(TypeBoxUser, badInput)) {
    throw new Error(`Typebox should not pass bad input`);
}

const ajv = new Ajv({ strict: false });
const AjvUserValidator = ajv.compile<ArriUser>(TypeBoxUser);
const ajvJtd = new AjvJtd({ strictSchema: false });
const AjvInput = {
    properties: {
        id: { type: 'int32', metadata: {} },
        role: { enum: ['standard', 'admin', 'moderator'], metadata: {} },
        name: { type: 'string', metadata: {} },
        email: { type: 'string', metadata: {}, nullable: true },
        createdAt: { type: 'int32', metadata: {} },
        updatedAt: { type: 'int32', metadata: {} },
        recentNotifications: {
            elements: {
                discriminator: 'type',
                mapping: {
                    POST_LIKE: {
                        properties: {
                            userId: { type: 'string', metadata: {} },
                            postId: { type: 'string', metadata: {} },
                        },
                        metadata: {},
                        additionalProperties: true,
                    },
                    POST_COMMENT: {
                        properties: {
                            userId: { type: 'string', metadata: {} },
                            postId: { type: 'string', metadata: {} },
                            commentText: { type: 'string', metadata: {} },
                        },
                        metadata: {},
                        additionalProperties: true,
                    },
                },
                metadata: {},
            },
            metadata: {},
        },
    },
    optionalProperties: {
        settings: {
            properties: {
                preferredTheme: {
                    enum: ['light', 'dark', 'system'],
                    metadata: {},
                },
                allowNotifications: { type: 'boolean', metadata: {} },
            },
            metadata: {},
            additionalProperties: true,
        },
    },
    metadata: {},
    additionalProperties: true,
};
const AjvJtdUserValidator = ajvJtd.compile<ArriUser>(AjvInput);
const AjvJtdUserParser = ajvJtd.compileParser<ArriUser>(AjvInput);
const AjvJtdUserSerializer = ajvJtd.compileSerializer<ArriUser>(AjvInput);
if (!AjvUserValidator(input)) {
    throw new Error('Ajv should pass input');
}
if (AjvUserValidator(badInput)) {
    throw new Error('Ajv should fail bad input');
}

const ValibotUser = v.object({
    id: v.pipe(v.number(), v.integer()),
    role: v.picklist(['standard', 'admin', 'moderator']),
    name: v.string(),
    email: v.nullable(v.string()),
    createdAt: v.pipe(v.number(), v.integer()),
    updatedAt: v.pipe(v.number(), v.integer()),
    settings: v.optional(
        v.object({
            preferredTheme: v.picklist(['system', 'light', 'dark']),
            allowNotifications: v.boolean(),
        }),
    ),
    recentNotifications: v.array(
        v.variant('type', [
            v.object({
                type: v.literal('POST_LIKE'),
                userId: v.string(),
                postId: v.string(),
            }),
            v.object({
                type: v.literal('POST_COMMENT'),
                userId: v.string(),
                postId: v.string(),
                commentText: v.string(),
            }),
        ]),
    ),
});
type ValibotUser = v.InferOutput<typeof ValibotUser>;
if (!v.is(ValibotUser, input)) {
    throw new Error('Valibot should pass input');
}
if (!v.safeParse(ValibotUser, input).success) {
    throw new Error('Validbot should parse input');
}
if (v.is(ValibotUser, badInput)) {
    throw new Error('Valibot should fail badInput');
}
if (v.safeParse(ValibotUser, badInput).success) {
    throw new Error('Valibot should not parse badInput');
}

void benny.suite(
    'Object Validation - Good Input',
    benny.add('Arri', () => {
        a.validate(ArriUser, input);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.validate(input);
    }),
    benny.add('Arri (Standard-Schema)', () => {
        const result = ArriUser['~standard'].validate(input);
        if (result instanceof Promise) {
            throw new Error('Should not return a promise');
        }
    }),
    benny.add('Arri (Compiled + Standard Schema)', () => {
        const result = $$ArriUser['~standard'].validate(input);
        if (result instanceof Promise) {
            throw new Error('Should not return a promise');
        }
    }),
    benny.add('Ajv - JTD', () => {
        ajvJtd.validate(ArriUser, input);
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        AjvJtdUserValidator(input);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeBoxUser, input);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        AjvUserValidator(input);
    }),
    benny.add('TypeBox', () => {
        Value.Check(TypeBoxUser, input);
    }),
    benny.add('TypeBox (Compiled)', () => {
        TypeBoxUserValidator.Check(input);
    }),
    benny.add('Zod', () => {
        ZodUser.parse(input);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotUser, input);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-validation-good-input',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-validation-good-input',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);

void benny.suite(
    'Object Validation - Bad Input',
    benny.add('Arri', () => {
        if (a.validate(ArriUser, badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Arri (Compiled)', () => {
        if ($$ArriUser.validate(badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Arri (Standard-Schema)', () => {
        const result = ArriUser['~standard'].validate(badInput);
        if (result instanceof Promise) {
            throw new Error('Expected not to be a promise');
        }
        if (typeof result.issues === 'undefined') {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Arri (Compiled + Standard Schema)', () => {
        const result = $$ArriUser['~standard'].validate(badInput);
        if (result instanceof Promise) {
            throw new Error('Expected not to be a promise');
        }
        if (typeof result.issues === 'undefined') {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Ajv - JTD', () => {
        if (ajvJtd.validate(ArriUser, badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        if (AjvJtdUserValidator(badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Ajv - JSON Schema', () => {
        if (ajv.validate(TypeBoxUser, badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        if (AjvUserValidator(badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('TypeBox', () => {
        if (Value.Check(TypeBoxUser, badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('TypeBox (Compiled)', () => {
        if (TypeBoxUserValidator.Check(badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.add('Zod', () => {
        try {
            ZodUser.parse(badInput);
            throw new Error('Expected to fail');
        } catch (_) {
            // do nothing
        }
    }),
    benny.add('Valibot', () => {
        if (v.is(ValibotUser, badInput)) {
            throw new Error('Expected to fail');
        }
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-validation-bad-input',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-validation-bad-input',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);

void benny.suite(
    'Object Parsing',
    benny.add('Arri', () => {
        a.parse(ArriUser, inputJson);
    }),
    benny.add('Arri Unsafe', () => {
        a.parseUnsafe(ArriUser, inputJson);
    }),
    benny.add('Arri (StandardSchema)', () => {
        ArriUser['~standard'].validate(inputJson);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.parse(inputJson);
    }),
    benny.add('Arri (Compiled) Unsafe', () => {
        $$ArriUser.parseUnsafe(inputJson);
    }),
    benny.add('Arri (Compiled Standard Schema)', () => {
        $$ArriUser['~standard'].validate(inputJson);
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        AjvJtdUserParser(inputJson);
    }),
    benny.add('JSON.parse', () => {
        JSON.parse(inputJson);
    }),
    benny.add('JSON.parse + Valibot', () => {
        v.safeParse(ValibotUser, JSON.parse(inputJson));
    }),
    benny.add('JSON.parse + Zod', () => {
        ZodUser.parse(JSON.parse(inputJson));
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-parsing',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-parsing',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);

void benny.suite(
    'Object Parsing - Bad Input',
    benny.add('Arri', () => {
        a.parse(ArriUser, badInputJson);
    }),
    benny.add('Arri Unsafe', () => {
        try {
            a.parseUnsafe(ArriUser, badInputJson);
        } catch (_) {
            // do nothing
        }
    }),
    benny.add('Arri (StandardSchema)', () => {
        ArriUser['~standard'].validate(badInputJson);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.parse(badInputJson);
    }),
    benny.add('Arri (Compiled) Unsafe', () => {
        try {
            $$ArriUser.parseUnsafe(badInputJson);
        } catch (_) {
            // do nothing
        }
    }),
    benny.add('Arri (Compiled Standard Schema)', () => {
        $$ArriUser['~standard'].validate(badInputJson);
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        AjvJtdUserParser(badInputJson);
    }),
    benny.add('JSON.parse', () => {
        JSON.parse(badInputJson);
    }),
    benny.add('JSON.parse + Valibot', () => {
        v.safeParse(ValibotUser, JSON.parse(badInputJson));
    }),
    benny.add('JSON.parse + Zod', () => {
        try {
            ZodUser.parse(JSON.parse(badInputJson));
        } catch (_) {
            // do nothing
        }
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-parsing-bad-input',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-parsing-bad-input',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);

void benny.suite(
    'Object Coercion',
    benny.add('Arri', () => {
        a.coerce(ArriUser, inputWithStringKeys);
    }),
    benny.add('TypeBox', () => {
        Value.Convert(TypeBoxUser, inputWithStringKeys);
    }),
    benny.add('Zod', () => {
        ZodCoercedUser.parse(inputWithStringKeys);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-coercion',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-coercion',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);

void benny.suite(
    'Object Serialization',
    benny.add('Arri', () => {
        a.serialize(ArriUser, input);
    }),
    benny.add('Arri (Unsafe)', () => {
        a.serializeUnsafe(ArriUser, input);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.serialize(input);
    }),
    benny.add('Arri (Compiled Unsafe)', () => {
        $$ArriUser.serializeUnsafe(input);
    }),
    benny.add('Arri (Compiled) Validate and Serialize', () => {
        if ($$ArriUser.validate(input)) {
            $$ArriUser.serialize(input);
        }
    }),
    benny.add('Arri (Compiled) Validate and Serialize Unsafe', () => {
        if ($$ArriUser.validate(input)) {
            $$ArriUser.serializeUnsafe(input);
        }
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        AjvJtdUserSerializer(input);
    }),
    benny.add('JSON.stringify', () => {
        JSON.stringify(input);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-serialization',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-serialization',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);
