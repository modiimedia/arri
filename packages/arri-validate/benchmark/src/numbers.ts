import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import benny from "benny";
import { z } from "zod";
import { a } from "../../src/_index";

const IntSchema = a.int32();
const IntSchemaValidator = a.compile(IntSchema);
const TypeBoxIntSchema = Type.Integer();
const TypeBoxIntValidator = TypeCompiler.Compile(TypeBoxIntSchema);
const ZodIntSchema = z
    .number()
    .refine((val) => Number.isInteger(val), { message: "Must be an integer" });

const intInput = 1245;

void benny.suite(
    "Validation",
    benny.add("Arri", () => {
        a.validate(IntSchema, intInput);
    }),
    benny.add("Arri (Compiled)", () => {
        IntSchemaValidator.validate(intInput);
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
    "Serialization",
    benny.add("Arri", () => {
        a.serialize(IntSchema, intInput);
    }),
    benny.add("Arri (Compiled)", () => {
        IntSchemaValidator.serialize(intInput);
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

console.log(TypeBoxIntValidator.Code());
