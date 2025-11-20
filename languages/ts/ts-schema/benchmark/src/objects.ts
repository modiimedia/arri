import assert from 'node:assert';

import { Static, Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Check, Decode, Value } from '@sinclair/typebox/value';
import Ajv from 'ajv';
// import AjvJtd from 'ajv/dist/jtd';
import { type as arktype } from 'arktype';
import benny from 'benny';
// import typia from 'typia';
import * as v from 'valibot';
import { assertType } from 'vitest';
import { z } from 'zod';
import { z as zV4 } from 'zod/v4';

import { a } from '../../src/_index';
import {
    badInput,
    badJsonInput,
    goodInput,
    goodInputWithStringValues,
    goodJsonInput,
} from './_common';

export const ArriUser = a.object({
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
export const $$ArriUser = a.compile(ArriUser);
export type ArriUser = a.infer<typeof ArriUser>;
assertType<ArriUser>(goodInput);
assert(a.validate(ArriUser, goodInput) === true);
assert(a.validate(ArriUser, badInput) == false);
assert(a.parse(ArriUser, goodInput).success === true);
assert(a.parse(ArriUser, badInput).success === false);
assert($$ArriUser.validate(goodInput) === true);
assert($$ArriUser.validate(badInput) === false);

const ZodV4User = zV4.object({
    id: zV4.number(),
    role: zV4.enum(['standard', 'admin', 'moderator']),
    name: zV4.string(),
    email: zV4.string().nullable(),
    createdAt: zV4.number(),
    updatedAt: zV4.number(),
    settings: zV4
        .object({
            preferredTheme: zV4.enum(['light', 'dark', 'system']),
            allowNotifications: zV4.boolean(),
        })
        .optional(),
    recentNotifications: zV4.array(
        zV4.discriminatedUnion('type', [
            zV4.object({
                type: zV4.literal('POST_LIKE'),
                userId: zV4.string(),
                postId: zV4.string(),
            }),
            zV4.object({
                type: zV4.literal('POST_COMMENT'),
                userId: zV4.string(),
                postId: zV4.string(),
            }),
        ]),
    ),
});
type ZodV4User = zV4.infer<typeof ZodV4User>;
const ZodV4CoercedUser = zV4.object({
    id: zV4.coerce.number(),
    role: zV4.enum(['standard', 'admin', 'moderator']),
    name: zV4.coerce.string(),
    email: zV4.coerce.string().nullable(),
    createdAt: zV4.coerce.number(),
    updatedAt: zV4.coerce.number(),
    settings: zV4
        .object({
            preferredTheme: zV4.enum(['light', 'dark', 'system']),
            allowNotifications: zV4.coerce.boolean(),
        })
        .optional(),
    recentNotifications: zV4.array(
        zV4.discriminatedUnion('type', [
            zV4.object({
                type: zV4.literal('POST_LIKE'),
                userId: zV4.coerce.string(),
                postId: zV4.coerce.string(),
            }),
            zV4.object({
                type: zV4.literal('POST_COMMENT'),
                userId: zV4.coerce.string(),
                postId: zV4.coerce.string(),
                commentText: zV4.coerce.string(),
            }),
        ]),
    ),
});
assertType<ZodV4User>(goodInput);
assert(ZodV4User.safeParse(goodInput).success === true);
assert(ZodV4User.safeParse(badInput).success === false);

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
assertType<ZodUser>(goodInput);
assert(ZodUser.safeParse(goodInput).success === true);
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
assertType<TypeboxUser>(goodInput);
assert(Check(TypeboxUser, goodInput) === true);
assert(Check(TypeboxUser, badInput) === false);
assert($$TypeboxUser.Check(goodInput) === true);
assert($$TypeboxUser.Check(badInput) === false);

const ajv = new Ajv({ strict: false });
const AjvUserValidator = ajv.compile<ArriUser>(TypeboxUser);
// const ajvJtd = new AjvJtd({ strictSchema: false });
// const AjvInput = {
//     properties: {
//         id: { type: 'int32', metadata: {} },
//         role: { enum: ['standard', 'admin', 'moderator'], metadata: {} },
//         name: { type: 'string', metadata: {} },
//         email: { type: 'string', metadata: {}, nullable: true },
//         createdAt: { type: 'int32', metadata: {} },
//         updatedAt: { type: 'int32', metadata: {} },
//         recentNotifications: {
//             elements: {
//                 discriminator: 'type',
//                 mapping: {
//                     POST_LIKE: {
//                         properties: {
//                             userId: { type: 'string', metadata: {} },
//                             postId: { type: 'string', metadata: {} },
//                         },
//                         metadata: {},
//                         additionalProperties: true,
//                     },
//                     POST_COMMENT: {
//                         properties: {
//                             userId: { type: 'string', metadata: {} },
//                             postId: { type: 'string', metadata: {} },
//                             commentText: { type: 'string', metadata: {} },
//                         },
//                         metadata: {},
//                         additionalProperties: true,
//                     },
//                 },
//                 metadata: {},
//             },
//             metadata: {},
//         },
//     },
//     optionalProperties: {
//         settings: {
//             properties: {
//                 preferredTheme: {
//                     enum: ['light', 'dark', 'system'],
//                     metadata: {},
//                 },
//                 allowNotifications: { type: 'boolean', metadata: {} },
//             },
//             metadata: {},
//             additionalProperties: true,
//         },
//     },
//     metadata: {},
//     additionalProperties: true,
// };
// const AjvJtdUserValidator = ajvJtd.compile<ArriUser>(AjvInput);
// const AjvJtdUserParser = ajvJtd.compileParser<ArriUser>(AjvInput);
// const AjvJtdUserSerializer = ajvJtd.compileSerializer<ArriUser>(AjvInput);
assert(AjvUserValidator(goodInput) === true);
assert(AjvUserValidator(badInput) === false);
// assert(AjvJtdUserValidator(goodInput) === true);
// assert(AjvJtdUserValidator(badInput) === false);

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
assertType<ValibotUser>(goodInput);
assert(v.is(ValibotUser, goodInput) === true);
assert(v.is(ValibotUser, badInput) === false);
assert(v.safeParse(ValibotUser, goodInput).success === true);
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
assertType<ArkTypeUser>(goodInput);
assert(!(ArktypeUser(goodInput) instanceof arktype.errors));
assert(ArktypeUser(badInput) instanceof arktype.errors);

// type TypiaInt32 = number & typia.tags.Type<'int32'>;
// type TypiaUser = {
//     id: TypiaInt32;
//     role: 'standard' | 'admin' | 'moderator';
//     name: string;
//     email: string | null;
//     createdAt: TypiaInt32;
//     updatedAt: TypiaInt32;
//     settings?: {
//         preferredTheme: 'light' | 'dark' | 'system';
//         allowNotifications: boolean;
//     };
//     recentNotifications: Array<
//         | {
//               type: 'POST_LIKE';
//               userId: string;
//               postId: string;
//           }
//         | {
//               type: 'POST_COMMENT';
//               userId: string;
//               postId: string;
//               commentText: string;
//           }
//     >;
// };
// const TypiaValidate = typia.createIs<TypiaUser>();
// const TypiaJsonParse = typia.json.createValidateParse<TypiaUser>();
// const TypiaJsonStringify = typia.json.createStringify<TypiaUser>();
// const TypiaValidateAndJsonStringify =
//     typia.json.createValidateStringify<TypiaUser>();

// assertType<TypiaUser>(goodInput);
// assert(TypiaValidate(goodInput) === true);
// assert(TypiaValidate(badInput) === false);
// assert(TypiaJsonParse(goodJsonInput).success === true);
// assert(TypiaJsonParse(badJsonInput).success === false);
// assert(typeof TypiaJsonStringify(goodInput) === 'string');
// assert(TypiaValidateAndJsonStringify(goodInput).success === true);

void benny.suite(
    'Object Validation - Good Input',
    benny.add('Arri', () => {
        a.validate(ArriUser, goodInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.validate(goodInput);
    }),
    benny.add('Arri - Standard Schema', () => {
        ArriUser['~standard'].validate(goodInput);
    }),
    benny.add('Arri (Compiled) - Standard Schema', () => {
        $$ArriUser['~standard'].validate(goodInput);
    }),
    // benny.add('Ajv - JTD', () => {
    //     ajvJtd.validate(ArriUser, goodInput);
    // }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     AjvJtdUserValidator(goodInput);
    // }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeboxUser, goodInput);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        AjvUserValidator(goodInput);
    }),
    benny.add('TypeBox', () => {
        Value.Check(TypeboxUser, goodInput);
    }),
    benny.add('TypeBox (Compiled)', () => {
        $$TypeboxUser.Check(goodInput);
    }),
    benny.add('Zod', () => {
        ZodUser.parse(goodInput);
    }),
    benny.add('Zod/v4', () => {
        ZodV4User.parse(goodInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotUser, goodInput);
    }),
    benny.add('Arktype', () => {
        ArktypeUser(goodInput);
    }),
    // benny.add('Typia', () => {
    //     TypiaValidate(goodInput);
    // }),
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
    benny.add('Arri - Standard-Schema', () => {
        ArriUser['~standard'].validate(badInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.validate(badInput);
    }),
    benny.add('Arri (Compiled) - Standard Schema', () => {
        $$ArriUser['~standard'].validate(badInput);
    }),
    // benny.add('Ajv - JTD', () => {
    //     ajvJtd.validate(ArriUser, badInput);
    // }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     AjvJtdUserValidator(badInput);
    // }),
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
    benny.add('Zod/v4', () => {
        ZodV4User.safeParse(badInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotUser, badInput);
    }),
    benny.add('Arktype', () => {
        ArktypeUser(badInput);
    }),
    // benny.add('Typia', () => {
    //     TypiaValidate(badInput);
    // }),
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
        a.parse(ArriUser, goodJsonInput);
    }),
    benny.add('Arri - Standard Schema', () => {
        ArriUser['~standard'].validate(goodJsonInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.parse(goodJsonInput);
    }),
    benny.add('Arri (Compiled) - Standard Schema', () => {
        $$ArriUser['~standard'].validate(goodJsonInput);
    }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     AjvJtdUserParser(goodJsonInput);
    // }),
    benny.add('JSON.parse', () => {
        JSON.parse(goodJsonInput);
    }),
    benny.add('JSON.parse + Typebox', () => {
        Decode(TypeboxUser, JSON.parse(goodJsonInput));
    }),
    benny.add('JSON.parse + Typebox (Compiled)', () => {
        $$TypeboxUser.Decode(JSON.parse(goodJsonInput));
    }),
    benny.add('JSON.parse + Valibot', () => {
        v.safeParse(ValibotUser, JSON.parse(goodJsonInput));
    }),
    benny.add('JSON.parse + Zod', () => {
        ZodUser.parse(JSON.parse(goodJsonInput));
    }),
    benny.add('JSON.parse + Zod/v4', () => {
        ZodV4User.parse(JSON.parse(goodJsonInput));
    }),
    benny.add('JSON.parse + Arktype', () => {
        ArktypeUser(JSON.parse(goodJsonInput));
    }),
    // benny.add('Typia (json.createValidateParse)', () => {
    //     TypiaJsonParse(goodJsonInput);
    // }),
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
        a.parse(ArriUser, badJsonInput);
    }),
    benny.add('Arri (StandardSchema)', () => {
        ArriUser['~standard'].validate(badJsonInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.parse(badJsonInput);
    }),
    benny.add('Arri (Compiled) - Standard Schema', () => {
        $$ArriUser['~standard'].validate(badJsonInput);
    }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     AjvJtdUserParser(badJsonInput);
    // }),
    benny.add('JSON.parse', () => {
        JSON.parse(badJsonInput);
    }),
    benny.add('JSON.parse + Typebox', () => {
        TypeBoxDecodeSafe(JSON.parse(badJsonInput));
    }),
    benny.add('JSON.parse + Typebox (Compiled)', () => {
        TypeboxDecodeSafeCompiled(badInput);
    }),
    benny.add('JSON.parse + Valibot', () => {
        v.safeParse(ValibotUser, JSON.parse(badJsonInput));
    }),
    benny.add('JSON.parse + Zod', () => {
        ZodUser.safeParse(JSON.parse(badJsonInput));
    }),
    benny.add('JSON.parse + Zod/v4', () => {
        ZodV4User.safeParse(JSON.parse(badJsonInput));
    }),
    benny.add('JSON.parse + Arktype', () => {
        ArktypeUser(JSON.parse(badJsonInput));
    }),
    // benny.add('Typia (json.createValidateParse)', () => {
    //     TypiaJsonParse(badJsonInput);
    // }),
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
        a.coerce(ArriUser, goodInputWithStringValues);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.coerce(goodInputWithStringValues);
    }),
    benny.add('TypeBox', () => {
        Value.Convert(TypeboxUser, goodInputWithStringValues);
    }),
    benny.add('Zod', () => {
        ZodCoercedUser.parse(goodInputWithStringValues);
    }),
    benny.add('Zod/v4', () => {
        ZodV4CoercedUser.parse(goodInputWithStringValues);
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
        a.serialize(ArriUser, goodInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriUser.serialize(goodInput);
    }),
    benny.add('Arri (Compiled) - Validate and Serialize', () => {
        if ($$ArriUser.validate(goodInput)) {
            $$ArriUser.serialize(goodInput);
        }
    }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     AjvJtdUserSerializer(goodInput);
    // }),
    // benny.add('Typia', () => {
    //     TypiaJsonStringify(goodInput);
    // }),
    // benny.add('Typia - Validate and Serialize', () => {
    //     TypiaValidateAndJsonStringify(goodInput);
    // }),
    benny.add('JSON.stringify', () => {
        JSON.stringify(goodInput);
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
