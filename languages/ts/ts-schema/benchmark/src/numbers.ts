import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import Ajv from 'ajv';
import AjvJtd from 'ajv/dist/jtd';
import { type as arktype } from 'arktype';
import benny from 'benny';
import * as v from 'valibot';
import { z } from 'zod';

import { a } from '../../src/_index';

function shouldFail() {
    throw new Error('should fail');
}
function shouldPass() {
    throw new Error('should pass');
}

const intGoodInput = 1245;
const intGoodStringInput = `${intGoodInput}`;
const intBadInput = 1245.5;
const intBadStringInput = `${intBadInput}`;

const ArriIntSchema = a.int32();
const $$ArriIntSchema = a.compile(ArriIntSchema);
if (!a.validate(ArriIntSchema, intGoodInput)) shouldPass();
if (a.validate(ArriIntSchema, intBadInput)) shouldFail();
if (!$$ArriIntSchema.validate(intGoodInput)) shouldPass();
if ($$ArriIntSchema.validate(intBadInput)) shouldFail();

const TypeBoxIntSchema = Type.Integer();
const TypeBoxIntValidator = TypeCompiler.Compile(TypeBoxIntSchema);
if (!Value.Check(TypeBoxIntSchema, intGoodInput)) shouldPass();
if (Value.Check(TypeBoxIntSchema, intBadInput)) shouldFail();
if (!TypeBoxIntValidator.Check(intGoodInput)) throw new Error('Should pass');
if (TypeBoxIntValidator.Check(intBadInput)) throw new Error('Should fail');

const arktypeIntSchema = arktype('number.integer');
if (arktypeIntSchema(intGoodInput) instanceof arktype.errors) shouldPass();
if (!(arktypeIntSchema(intBadInput) instanceof arktype.errors)) shouldFail();

const ajv = new Ajv({ strict: false });
const ajvIntValidator = ajv.compile(TypeBoxIntSchema);
const ajvCoerce = new Ajv({ strict: false, coerceTypes: true });
const ajvJtd = new AjvJtd({ strictSchema: false });
const ajvJtdIntValidator = ajvJtd.compile(ArriIntSchema);
const ajvJtdIntParser = ajvJtd.compileParser(ArriIntSchema);
const ajvJtdSerializer = ajvJtd.compileSerializer(ArriIntSchema);
if (!ajvIntValidator(intGoodInput)) shouldPass();
if (ajvIntValidator(intBadInput)) shouldFail();
if (!ajvJtdIntValidator(intGoodInput)) shouldPass();
if (ajvJtdIntValidator(intBadInput)) shouldFail();

const ZodIntSchema = z
    .number()
    .refine((val) => Number.isInteger(val), { message: 'Must be an integer' });
const ZodIntSchemaCoerced = z.coerce
    .number()
    .refine((val) => Number.isInteger(val), { message: 'Must be an integer' });
if (!ZodIntSchema.safeParse(intGoodInput).success) shouldPass();
if (ZodIntSchema.safeParse(intBadInput).success) shouldFail();

const ValibotIntSchema = v.pipe(v.number(), v.integer());
if (!v.is(ValibotIntSchema, intGoodInput)) shouldPass();
if (v.is(ValibotIntSchema, intBadInput)) shouldFail();

void benny.suite(
    'Int Validation',
    benny.add('Arri', () => {
        a.validate(ArriIntSchema, intGoodInput);
    }),
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.validate(intGoodInput);
    }),
    benny.add('Arri (Standard Schema)', () => {
        ArriIntSchema['~standard'].validate(intGoodInput);
    }),
    benny.add('Arri (Compiled + Standard Schema', () => {
        $$ArriIntSchema['~standard'].validate(intGoodInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeBoxIntSchema, intGoodInput);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        ajvIntValidator(intGoodInput);
    }),
    benny.add('Ajv - JTD', () => {
        ajvJtd.validate(ArriIntSchema, intGoodInput);
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        ajvJtdIntValidator(intGoodInput);
    }),
    benny.add('TypeBox', () => {
        Value.Check(TypeBoxIntSchema, intGoodInput);
    }),
    benny.add('TypeBox (Compiled)', () => {
        TypeBoxIntValidator.Check(intGoodInput);
    }),
    benny.add('Zod', () => {
        ZodIntSchema.parse(intGoodInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotIntSchema, intGoodInput);
    }),
    benny.add('Arktype', () => {
        arktypeIntSchema(intGoodInput);
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
    benny.add('Arri (Compiled)', () => {
        $$ArriIntSchema.validate(intBadInput);
    }),
    benny.add('Arri (Standard Schema)', () => {
        ArriIntSchema['~standard'].validate(intBadInput);
    }),
    benny.add('Arri (Compiled + Standard Schema', () => {
        $$ArriIntSchema['~standard'].validate(intBadInput);
    }),
    benny.add('Ajv - JSON Schema', () => {
        ajv.validate(TypeBoxIntSchema, intBadInput);
    }),
    benny.add('Ajv - JSON Schema (Compiled)', () => {
        ajvIntValidator(intBadInput);
    }),
    benny.add('Ajv - JTD', () => {
        ajvJtd.validate(ArriIntSchema, intBadInput);
    }),
    benny.add('Ajv - JTD (Compiled)', () => {
        ajvJtdIntValidator(intBadInput);
    }),
    benny.add('TypeBox', () => {
        Value.Check(TypeBoxIntSchema, intBadInput);
    }),
    benny.add('TypeBox (Compiled)', () => {
        TypeBoxIntValidator.Check(intBadInput);
    }),
    benny.add('Zod', () => {
        ZodIntSchema.parse(intBadInput);
    }),
    benny.add('Valibot', () => {
        v.is(ValibotIntSchema, intBadInput);
    }),
    benny.add('Arktype', () => {
        arktypeIntSchema(intBadInput);
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
    benny.add('Ajv - JTD (Compiled)', () => {
        ajvJtdIntParser(intGoodStringInput);
    }),
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
    benny.add('Ajv - JTD (Compiled)', () => {
        ajvJtdIntParser(intBadStringInput);
    }),
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
        ZodIntSchemaCoerced.parse(intBadStringInput);
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
    benny.add('Ajv - JTD (Compiled)', () => {
        ajvJtdSerializer(intGoodInput);
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
