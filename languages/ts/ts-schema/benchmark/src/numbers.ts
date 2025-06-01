import assert from 'node:assert';

import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import Ajv from 'ajv';
// import AjvJtd from 'ajv/dist/jtd';
import { type as arktype } from 'arktype';
import benny from 'benny';
import typia from 'typia';
import * as v from 'valibot';
import { z } from 'zod';
import { z as zV4 } from 'zod/v4';

import { a } from '../../src/_index';

const intGoodInput = 1245;
const intGoodStringInput = `${intGoodInput}`;
const intBadInput = 1245.5;
const intBadStringInput = `${intBadInput}`;

const ArriIntSchema = a.int32();
const $$ArriIntSchema = a.compile(ArriIntSchema);
assert(a.validate(ArriIntSchema, intGoodInput) === true);
assert(a.validate(ArriIntSchema, intBadInput) === false);
assert($$ArriIntSchema.validate(intGoodInput) === true);
assert($$ArriIntSchema.validate(intBadInput) === false);

const TypeBoxIntSchema = Type.Integer();
const TypeBoxIntValidator = TypeCompiler.Compile(TypeBoxIntSchema);
assert(Value.Check(TypeBoxIntSchema, intGoodInput) === true);
assert(Value.Check(TypeBoxIntSchema, intBadInput) === false);
assert(TypeBoxIntValidator.Check(intGoodInput) === true);
assert(TypeBoxIntValidator.Check(intBadInput) === false);

const ArktypeIntSchema = arktype('number.integer');
assert(typeof ArktypeIntSchema(intGoodInput) === 'number');
assert(ArktypeIntSchema(intBadInput) instanceof arktype.errors);

const ajv = new Ajv({ strict: false });
const ajvIntValidator = ajv.compile(TypeBoxIntSchema);
const ajvCoerce = new Ajv({ strict: false, coerceTypes: true });
// const ajvJtd = new AjvJtd({ strictSchema: false });
// const ajvSchema = JSON.parse(JSON.stringify(ArriIntSchema));
// const ajvJtdIntValidator = ajvJtd.compile(ajvSchema);
// const ajvJtdIntParser = ajvJtd.compileParser(ajvSchema);
// const ajvJtdSerializer = ajvJtd.compileSerializer(ajvSchema);
assert(ajvIntValidator(intGoodInput) === true);
assert(ajvIntValidator(intBadInput) === false);
// assert(ajvJtdIntValidator(intGoodInput) === true);
// assert(ajvJtdIntValidator(intBadInput) === false);

const ZodIntSchema = z
    .number()
    .refine((val) => Number.isInteger(val), { message: 'Must be an integer' });
const ZodIntSchemaCoerced = z.coerce
    .number()
    .refine((val) => Number.isInteger(val), { message: 'Must be an integer' });
assert(ZodIntSchema.safeParse(intGoodInput).success === true);
assert(ZodIntSchema.safeParse(intBadInput).success === false);

const ZodV4IntSchema = zV4
    .number()
    .refine((val) => Number.isInteger(val), { message: 'Must be an integer' });
const ZodV4IntSchemaCoerced = zV4.coerce
    .number()
    .refine((val) => Number.isInteger(val), { message: 'Must be an integer' });
assert(ZodV4IntSchema.safeParse(intGoodInput).success === true);
assert(ZodV4IntSchema.safeParse(intBadInput).success === false);

const ValibotIntSchema = v.pipe(v.number(), v.integer());
assert(v.is(ValibotIntSchema, intGoodInput) === true);
assert(v.is(ValibotIntSchema, intBadInput) === false);

type TypiaInt32 = number & typia.tags.Type<'int32'>;

const TypiaIntValidator = typia.createIs<TypiaInt32>();
const TypiaIntSerializer = typia.json.createStringify<TypiaInt32>();
const TypiaIntValidateAndSerialize =
    typia.json.createValidateStringify<TypiaInt32>();
assert(TypiaIntValidator(intGoodInput) === true);
assert(TypiaIntValidator(intBadInput) === false);

void benny.suite(
    'Int Validation',
    benny.add('Arri', () => {
        a.validate(ArriIntSchema, intGoodInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.validate(intGoodInput);
    }),
    benny.add('Arri - Standard Schema', () => {
        ArriIntSchema['~standard'].validate(intGoodInput);
    }),
    benny.add('Arri (Compiled) - Standard Schema', () => {
        $$ArriIntSchema['~standard'].validate(intGoodInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeBoxIntSchema, intGoodInput);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        ajvIntValidator(intGoodInput);
    }),
    // benny.add('Ajv - JTD', () => {
    //     ajvJtd.validate(ArriIntSchema, intGoodInput);
    // }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     ajvJtdIntValidator(intGoodInput);
    // }),
    benny.add('TypeBox', () => {
        Value.Check(TypeBoxIntSchema, intGoodInput);
    }),
    benny.add('TypeBox (Compiled)', () => {
        TypeBoxIntValidator.Check(intGoodInput);
    }),
    benny.add('Zod', () => {
        ZodIntSchema.parse(intGoodInput);
    }),
    benny.add('Zod/v4', () => {
        ZodV4IntSchema.parse(intGoodInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotIntSchema, intGoodInput);
    }),
    benny.add('Arktype', () => {
        ArktypeIntSchema(intGoodInput);
    }),
    benny.add('Typia', () => {
        TypiaIntValidator(intGoodInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-validation-good-input',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-validation-good-input',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);

void benny.suite(
    'Int Validation (Bad Input)',
    benny.add('Arri', () => {
        a.validate(ArriIntSchema, intBadInput);
    }),
    benny.add('Arri - Standard Schema', () => {
        ArriIntSchema['~standard'].validate(intBadInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.validate(intBadInput);
    }),
    benny.add('Arri (Compiled) - Standard Schema', () => {
        $$ArriIntSchema['~standard'].validate(intBadInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeBoxIntSchema, intBadInput);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        ajvIntValidator(intBadInput);
    }),
    // benny.add('Ajv - JTD', () => {
    //     ajvJtd.validate(ArriIntSchema, intBadInput);
    // }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     ajvJtdIntValidator(intBadInput);
    // }),
    benny.add('TypeBox', () => {
        Value.Check(TypeBoxIntSchema, intBadInput);
    }),
    benny.add('TypeBox (Compiled)', () => {
        TypeBoxIntValidator.Check(intBadInput);
    }),
    benny.add('Zod', () => {
        ZodIntSchema.safeParse(intBadInput);
    }),
    benny.add('Zod/v4', () => {
        ZodV4IntSchema.safeParse(intBadInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotIntSchema, intBadInput);
    }),
    benny.add('Arktype', () => {
        ArktypeIntSchema(intBadInput);
    }),
    benny.add('Typia', () => {
        TypiaIntValidator(intBadInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-validation-bad-input',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-validation-bad-input',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);

void benny.suite(
    'Int Parsing (Good Input)',
    benny.add('Arri', () => {
        a.parse(ArriIntSchema, intGoodStringInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.parse(intGoodStringInput);
    }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     ajvJtdIntParser(intGoodStringInput);
    // }),
    benny.add('JSON.parse()', () => {
        JSON.parse(intGoodStringInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-parsing-good-input',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-parsing-good-input',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);

void benny.suite(
    'Int Parsing (Bad Input)',
    benny.add('Arri', () => {
        a.parse(ArriIntSchema, intBadStringInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.parse(intBadStringInput);
    }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     ajvJtdIntParser(intBadStringInput);
    // }),
    benny.add('JSON.parse()', () => {
        JSON.parse(intBadStringInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-parsing-bad-input',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-parsing-bad-input',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);

void benny.suite(
    'Int Coercion (Good Input)',
    benny.add('Arri', () => {
        a.coerce(ArriIntSchema, intGoodStringInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajvCoerce.validate(TypeBoxIntSchema, intGoodStringInput);
    }),
    benny.add('TypeBox', () => {
        Value.Convert(TypeBoxIntSchema, intGoodStringInput);
    }),
    benny.add('Zod', () => {
        ZodIntSchemaCoerced.parse(intGoodStringInput);
    }),
    benny.add('Zod/v4', () => {
        ZodV4IntSchemaCoerced.parse(intGoodStringInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-coercion-good-input',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-coercion-good-input',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);

void benny.suite(
    'Int Coercion (Bad Input)',
    benny.add('Arri', () => {
        a.coerce(ArriIntSchema, intBadStringInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajvCoerce.validate(TypeBoxIntSchema, intBadStringInput);
    }),
    benny.add('TypeBox', () => {
        Value.Convert(TypeBoxIntSchema, intBadStringInput);
    }),
    benny.add('Zod', () => {
        ZodIntSchemaCoerced.safeParse(intBadStringInput);
    }),
    benny.add('Zod/v4', () => {
        ZodV4IntSchemaCoerced.safeParse(intBadStringInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-coercion-bad-input',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-coercion-bad-input',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);

void benny.suite(
    'Int Serialization',
    benny.add('Arri', () => {
        a.serialize(ArriIntSchema, intGoodInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.serialize(intGoodInput);
    }),
    benny.add('Arri (Compiled) - Validate and Serialize', () => {
        if ($$ArriIntSchema.validate(intGoodInput)) {
            $$ArriIntSchema.serialize(intGoodInput);
        }
    }),
    // benny.add('Ajv - JTD (Compiled)', () => {
    //     ajvJtdSerializer(intGoodInput);
    // }),
    benny.add('Typia', () => {
        TypiaIntSerializer(intGoodInput);
    }),
    benny.add('Typia - Validate and Serialize', () => {
        TypiaIntValidateAndSerialize(intGoodInput);
    }),
    benny.add('JSON.stringify', () => {
        JSON.stringify(intGoodInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'int-serialization',
        folder: 'benchmark/dist',
        format: 'chart.html',
    }),
    benny.save({
        file: 'int-serialization',
        folder: 'benchmark/dist',
        format: 'json',
    }),
);
