import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import Ajv from "ajv";
import AjvJtd from "ajv/dist/jtd";
import benny from "benny";
import { z } from "zod";
import { a } from "../../src/_index";

const IntSchema = a.int32();
const IntSchemaValidator = a.compile(IntSchema);
const TypeBoxIntSchema = Type.Integer();
const TypeBoxIntValidator = TypeCompiler.Compile(TypeBoxIntSchema);
const ajv = new Ajv({ strict: false });
const ajvIntValidator = ajv.compile(TypeBoxIntSchema);
const ajvCoerce = new Ajv({ strict: false, coerceTypes: true });
const ajvJtd = new AjvJtd({ strictSchema: false });
const ajvJtdValidator = ajvJtd.compile(IntSchema);
const ajvJtdParser = ajvJtd.compileParser(IntSchema);
const ajvJtdSerializer = ajvJtd.compileSerializer(IntSchema);
const ZodIntSchema = z
    .number()
    .refine((val) => Number.isInteger(val), { message: "Must be an integer" });
const ZodIntSchemaCoerced = z.coerce
    .number()
    .refine((val) => Number.isInteger(val), { message: "Must be an integer" });
const intInput = 1245;
const intStringInput = `${intInput}`;

void benny.suite(
    "Validation",
    benny.add("Arri", () => {
        a.validate(IntSchema, intInput);
    }),
    benny.add("Arri (Compiled)", () => {
        IntSchemaValidator.validate(intInput);
    }),
    benny.add("Ajv - JSON Schema", () => {
        ajv.validate(TypeBoxIntSchema, intInput);
    }),
    benny.add("Ajv - JSON Schema (Compiled)", () => {
        ajvIntValidator(intInput);
    }),
    benny.add("Ajv - JTD", () => {
        ajvJtd.validate(IntSchema, intInput);
    }),
    benny.add("Ajv - JTD (Compiled)", () => {
        ajvJtdValidator(intInput);
    }),
    benny.add("TypeBox", () => {
        Value.Check(TypeBoxIntSchema, intInput);
    }),
    benny.add("TypeBox (Compiled)", () => {
        TypeBoxIntValidator.Check(intInput);
    }),
    benny.add("Zod", () => {
        ZodIntSchema.parse(intInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "int-validation",
        folder: "benchmark/dist",
        format: "chart.html",
    }),
);

void benny.suite(
    "Parsing",
    benny.add("Arri", () => {
        a.parse(IntSchema, intStringInput);
    }),
    benny.add("Arri (Compiled)", () => {
        IntSchemaValidator.parse(intStringInput);
    }),
    benny.add("Ajv - JTD (Compiled)", () => {
        ajvJtdParser(intStringInput);
    }),
    benny.add("JSON.parse()", () => {
        JSON.parse(intStringInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "int-parsing",
        folder: "benchmark/dist",
        format: "chart.html",
    }),
);

void benny.suite(
    "Coercion",
    benny.add("Arri", () => {
        a.coerce(IntSchema, intStringInput);
    }),
    benny.add("Ajv - JSON Schema", () => {
        ajvCoerce.validate(TypeBoxIntSchema, intStringInput);
    }),
    benny.add("TypeBox", () => {
        Value.Convert(TypeBoxIntSchema, intStringInput);
    }),
    benny.add("Zod", () => {
        ZodIntSchemaCoerced.parse(intStringInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "int-coercion",
        folder: "benchmark/dist",
        format: "chart.html",
    }),
);

void benny.suite(
    "Serialization",
    benny.add("Arri", () => {
        a.serialize(IntSchema, intInput);
    }),
    benny.add("Arri (Compiled)", () => {
        IntSchemaValidator.serialize(intInput);
    }),
    benny.add("Ajv - JTD (Compiled)", () => {
        ajvJtdSerializer(intInput);
    }),
    benny.add("JSON.stringify", () => {
        JSON.stringify(intInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "int-serialization",
        folder: "benchmark/dist",
        format: "chart.html",
    }),
);
