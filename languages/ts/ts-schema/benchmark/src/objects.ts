import assert from 'node:assert';

import { Static, Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Check, Decode, Value } from '@sinclair/typebox/value';
import Ajv from 'ajv';
import AjvJtd from 'ajv/dist/jtd';
import { type as arktype } from 'arktype';
import benny from 'benny';
import typia from 'typia';
import * as v from 'valibot';
import { assertType } from 'vitest';
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
const inputWithStringValues = {
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

assert(a.validate(ArriUser, input) === true);
assert(a.validate(ArriUser, badInput) == false);
assert(a.parse(ArriUser, input).success === true);
assert(a.parse(ArriUser, badInput).success === false);
assert($$ArriUser.validate(input) === true);
assert($$ArriUser.validate(badInput) === false);

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
type ZodUser = z.infer<typeof ZodUser>;
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
assertType<ZodUser>(input);
assert(ZodUser.safeParse(input).success === true);
assert(ZodUser.safeParse(badInput).success === false);

const TypeboxUser = Type.Object({
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
type TypeboxUser = Static<typeof TypeboxUser>;
const $$TypeboxUser = TypeCompiler.Compile(TypeboxUser);
assertType<TypeboxUser>(input);
assert(Check(TypeboxUser, input) === true);
assert(Check(TypeboxUser, badInput) === false);
assert($$TypeboxUser.Check(input) === true);
assert($$TypeboxUser.Check(badInput) === false);

const ajv = new Ajv({ strict: false });
const AjvUserValidator = ajv.compile<ArriUser>(TypeboxUser);
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
assert(AjvUserValidator(input) === true);
assert(AjvUserValidator(badInput) === false);
assert(AjvJtdUserValidator(input) === true);
assert(AjvJtdUserValidator(badInput) === false);

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
assertType<ValibotUser>(input);
assert(v.is(ValibotUser, input) === true);
assert(v.is(ValibotUser, badInput) === false);
assert(v.safeParse(ValibotUser, input).success === true);
assert(v.safeParse(ValibotUser, badInput).success === false);

const ArktypeUser = arktype({
    id: 'number.integer',
    role: "'standard' | 'admin' | 'moderator'",
    name: 'string',
    email: 'string | null',
    createdAt: 'number.integer',
    updatedAt: 'number.integer',
    'settings?': {
        preferredTheme: "'light' | 'dark' | 'system'",
        allowNotifications: 'boolean',
    },
    recentNotifications: arktype({
        type: "'POST_LIKE'",
        userId: 'string',
        postId: 'string',
    })
        .or({
            type: "'POST_COMMENT'",
            userId: 'string',
            postId: 'string',
            commentText: 'string',
        })
        .array(),
});
type ArkTypeUser = arktype.infer<typeof ArktypeUser>;
assertType<ArkTypeUser>(input);
assert(!(ArktypeUser(input) instanceof arktype.errors));
assert(ArktypeUser(badInput) instanceof arktype.errors);

type TypiaInt32 = number & typia.tags.Type<'int32'>;
type TypiaUser = {
    id: TypiaInt32;
    role: 'standard' | 'admin' | 'moderator';
    name: string;
    email: string | null;
    createdAt: TypiaInt32;
    updatedAt: TypiaInt32;
    settings?: {
        preferredTheme: 'light' | 'dark' | 'system';
        allowNotifications: boolean;
    };
    recentNotifications: Array<
        | {
              type: 'POST_LIKE';
              userId: string;
              postId: string;
          }
        | {
              type: 'POST_COMMENT';
              userId: string;
              postId: string;
              commentText: string;
          }
    >;
};
const TypiaValidate = typia.createIs<TypiaUser>();
const TypiaJsonParse = typia.json.createValidateParse<TypiaUser>();
const TypiaJsonStringify = typia.json.createStringify<TypiaUser>();
const TypiaValidateAndJsonStringify =
    typia.json.createValidateStringify<TypiaUser>();

assertType<TypiaUser>(input);
assert(TypiaValidate(input) === true);
assert(TypiaValidate(badInput) === false);
assert(TypiaJsonParse(inputJson).success === true);
assert(TypiaJsonParse(badInputJson).success === false);
assert(typeof TypiaJsonStringify(input) === 'string');
assert(TypiaValidateAndJsonStringify(input).success === true);

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
        ajv.validate(TypeboxUser, input);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        AjvUserValidator(input);
    }),
    benny.add('TypeBox', () => {
        Value.Check(TypeboxUser, input);
    }),
    benny.add('TypeBox (Compiled)', () => {
        $$TypeboxUser.Check(input);
    }),
    benny.add('Zod', () => {
        ZodUser.parse(input);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotUser, input);
    }),
    benny.add('Arktype', () => {
        ArktypeUser(input);
    }),
    benny.add('Typia', () => {
        TypiaValidate(input);
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
        a.validate(ArriUser, badInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.validate(badInput);
    }),
    benny.add('Arri (Standard-Schema)', () => {
        ArriUser['~standard'].validate(badInput);
    }),
    benny.add('Arri (Compiled + Standard Schema)', () => {
        $$ArriUser['~standard'].validate(badInput);
    }),
    benny.add('Ajv - JTD', () => {
        ajvJtd.validate(ArriUser, badInput);
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        AjvJtdUserValidator(badInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeboxUser, badInput);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        AjvUserValidator(badInput);
    }),
    benny.add('TypeBox', () => {
        Value.Check(TypeboxUser, badInput);
    }),
    benny.add('TypeBox (Compiled)', () => {
        $$TypeboxUser.Check(badInput);
    }),
    benny.add('Zod', () => {
        ZodUser.safeParse(badInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotUser, badInput);
    }),
    benny.add('Arktype', () => {
        ArktypeUser(badInput);
    }),
    benny.add('Typia', () => {
        TypiaValidate(badInput);
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
    'Object Parsing - Good Input',
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
    benny.add('JSON.parse + Typebox', () => {
        Decode(TypeboxUser, JSON.parse(inputJson));
    }),
    benny.add('JSON.parse + Typebox (Compiled)', () => {
        $$TypeboxUser.Decode(JSON.parse(inputJson));
    }),
    benny.add('JSON.parse + Valibot', () => {
        v.safeParse(ValibotUser, JSON.parse(inputJson));
    }),
    benny.add('JSON.parse + Zod', () => {
        ZodUser.parse(JSON.parse(inputJson));
    }),
    benny.add('JSON.parse + Arktype', () => {
        ArktypeUser(JSON.parse(inputJson));
    }),
    benny.add('Typia (json.createValidateParse)', () => {
        TypiaJsonParse(inputJson);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'objects-parsing-good-input',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
    benny.save({
        file: 'objects-parsing-good-input',
        format: 'json',
        folder: 'benchmark/dist',
    }),
);

function TypeBoxDecodeSafe(input: unknown) {
    try {
        const val = Decode(TypeboxUser, input);
        return {
            success: true,
            value: val,
        };
    } catch (err) {
        return {
            success: false,
            error: err,
        };
    }
}

function TypeboxDecodeSafeCompiled(input: unknown) {
    try {
        const val = $$TypeboxUser.Decode(input);
        return {
            success: true,
            value: val,
        };
    } catch (err) {
        return {
            success: false,
            error: err,
        };
    }
}

void benny.suite(
    'Object Parsing - Bad Input',
    benny.add('Arri', () => {
        a.parse(ArriUser, badInputJson);
    }),
    benny.add('Arri (StandardSchema)', () => {
        ArriUser['~standard'].validate(badInputJson);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.parse(badInputJson);
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
    benny.add('JSON.parse + Typebox', () => {
        TypeBoxDecodeSafe(JSON.parse(badInputJson));
    }),
    benny.add('JSON.parse + Typebox (Compiled)', () => {
        TypeboxDecodeSafeCompiled(badInput);
    }),
    benny.add('JSON.parse + Valibot', () => {
        v.safeParse(ValibotUser, JSON.parse(badInputJson));
    }),
    benny.add('JSON.parse + Zod', () => {
        ZodUser.safeParse(JSON.parse(badInputJson));
    }),
    benny.add('JSON.parse + Arktype', () => {
        ArktypeUser(JSON.parse(badInputJson));
    }),
    benny.add('Typia (json.createValidateParse)', () => {
        TypiaJsonParse(badInputJson);
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
        a.coerce(ArriUser, inputWithStringValues);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.coerce(inputWithStringValues);
    }),
    benny.add('TypeBox', () => {
        Value.Convert(TypeboxUser, inputWithStringValues);
    }),
    benny.add('Zod', () => {
        ZodCoercedUser.parse(inputWithStringValues);
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
    benny.add('Typia', () => {
        TypiaJsonStringify(input);
    }),
    benny.add('Typia - Validate and Serialize', () => {
        TypiaValidateAndJsonStringify(input);
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
