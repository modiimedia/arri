import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import Ajv from "ajv";
import AjvJtd from "ajv/dist/jtd";
import benny from "benny";
import { z } from "zod";

import { a } from "../../src/_index";

const ArriUser = a.object({
    id: a.int32(),
    role: a.stringEnum(["standard", "admin", "moderator"]),
    name: a.string(),
    email: a.nullable(a.string()),
    createdAt: a.int32(),
    updatedAt: a.int32(),
    settings: a.optional(
        a.object({
            preferredTheme: a.stringEnum(["light", "dark", "system"]),
            allowNotifications: a.boolean(),
        }),
    ),
    recentNotifications: a.array(
        a.discriminator("type", {
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
const ArriUserValidator = a.compile(ArriUser);
type ArriUser = a.infer<typeof ArriUser>;

const input: ArriUser = {
    id: 12345,
    role: "moderator",
    name: "John Doe",
    email: null,
    createdAt: 0,
    updatedAt: 0,
    settings: {
        preferredTheme: "system",
        allowNotifications: true,
    },
    recentNotifications: [
        {
            type: "POST_LIKE",
            postId: "1",
            userId: "2",
        },
        {
            type: "POST_COMMENT",
            postId: "1",
            userId: "1",
            commentText: "",
        },
    ],
};
const inputJson = JSON.stringify(input);
const inputWithStringKeys = {
    id: "12345",
    role: "moderator",
    name: "John Doe",
    email: "null",
    createdAt: "12135151",
    updatedAt: "13141343",
    settings: {
        preferredTheme: "system",
        allowNotifications: "true",
    },
    recentNotifications: [
        {
            type: "POST_LIKE",
            postId: "1",
            userId: "2",
        },
        {
            type: "POST_COMMENT",
            postId: "1",
            userId: "1",
            commentText: "",
        },
    ],
};

const ZodUser = z.object({
    id: z.number(),
    role: z.enum(["standard", "admin", "moderator"]),
    name: z.string(),
    email: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
    settings: z
        .object({
            preferredTheme: z.enum(["light", "dark", "system"]),
            allowNotifications: z.boolean(),
        })
        .optional(),
    recentNotifications: z.array(
        z.discriminatedUnion("type", [
            z.object({
                type: z.literal("POST_LIKE"),
                userId: z.string(),
                postId: z.string(),
            }),
            z.object({
                type: z.literal("POST_COMMENT"),
                userId: z.string(),
                postId: z.string(),
            }),
        ]),
    ),
});
const ZodCoercedUser = z.object({
    id: z.coerce.number(),
    role: z.enum(["standard", "admin", "moderator"]),
    name: z.coerce.string(),
    email: z.coerce.string().nullable(),
    createdAt: z.coerce.number(),
    updatedAt: z.coerce.number(),
    settings: z
        .object({
            preferredTheme: z.enum(["light", "dark", "system"]),
            allowNotifications: z.coerce.boolean(),
        })
        .optional(),
    recentNotifications: z.array(
        z.discriminatedUnion("type", [
            z.object({
                type: z.literal("POST_LIKE"),
                userId: z.coerce.string(),
                postId: z.coerce.string(),
            }),
            z.object({
                type: z.literal("POST_COMMENT"),
                userId: z.coerce.string(),
                postId: z.coerce.string(),
                commentText: z.coerce.string(),
            }),
        ]),
    ),
});

const TypeBoxUser = Type.Object({
    id: Type.Integer(),
    role: Type.Union([
        Type.Literal("standard"),
        Type.Literal("admin"),
        Type.Literal("moderator"),
    ]),
    name: Type.String(),
    email: Type.Union([Type.Null(), Type.String()]),
    createdAt: Type.Integer(),
    updatedAt: Type.Integer(),
    settings: Type.Optional(
        Type.Object({
            preferredTheme: Type.Optional(
                Type.Union([
                    Type.Literal("light"),
                    Type.Literal("dark"),
                    Type.Literal("system"),
                ]),
            ),
            allowNotifications: Type.Boolean(),
        }),
    ),
    recentNotifications: Type.Array(
        Type.Union([
            Type.Object({
                type: Type.Literal("POST_LIKE"),
                userId: Type.String(),
                postId: Type.String(),
            }),
            Type.Object({
                type: Type.Literal("POST_COMMENT"),
                userId: Type.String(),
                postId: Type.String(),
                commentText: Type.String(),
            }),
        ]),
    ),
});
const TypeBoxUserValidator = TypeCompiler.Compile(TypeBoxUser);

const ajv = new Ajv({ strict: false });
const AjvUserValidator = ajv.compile<ArriUser>(TypeBoxUser);
const ajvJtd = new AjvJtd({ strictSchema: false });
const AjvInput = {
    properties: {
        id: { type: "int32", metadata: {} },
        role: { enum: ["standard", "admin", "moderator"], metadata: {} },
        name: { type: "string", metadata: {} },
        email: { type: "string", metadata: {}, nullable: true },
        createdAt: { type: "int32", metadata: {} },
        updatedAt: { type: "int32", metadata: {} },
        recentNotifications: {
            elements: {
                discriminator: "type",
                mapping: {
                    POST_LIKE: {
                        properties: {
                            userId: { type: "string", metadata: {} },
                            postId: { type: "string", metadata: {} },
                        },
                        metadata: {},
                        additionalProperties: true,
                    },
                    POST_COMMENT: {
                        properties: {
                            userId: { type: "string", metadata: {} },
                            postId: { type: "string", metadata: {} },
                            commentText: { type: "string", metadata: {} },
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
                    enum: ["light", "dark", "system"],
                    metadata: {},
                },
                allowNotifications: { type: "boolean", metadata: {} },
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

void benny.suite(
    "Object Validation",
    benny.add("Arri", () => {
        a.validate(ArriUser, input);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.validate(input);
    }),
    benny.add("Ajv - JTD", () => {
        ajvJtd.validate(ArriUser, input);
    }),
    benny.add("Ajv - JTD (Compiled)", () => {
        AjvJtdUserValidator(input);
    }),
    benny.add("Ajv - JSON Schema", () => {
        ajv.validate(TypeBoxUser, input);
    }),
    benny.add("Ajv - JSON Schema (Compiled)", () => {
        AjvUserValidator(input);
    }),
    benny.add("TypeBox", () => {
        Value.Check(TypeBoxUser, input);
    }),
    benny.add("TypeBox (Compiled)", () => {
        TypeBoxUserValidator.Check(input);
    }),
    benny.add("Zod", () => {
        ZodUser.parse(input);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-validation",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
    benny.save({
        file: "objects-validation",
        format: "json",
        folder: "benchmark/dist",
    }),
);

void benny.suite(
    "Object Parsing",
    benny.add("Arri", () => {
        a.parse(ArriUser, inputJson);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.parse(inputJson);
    }),
    benny.add("Ajv - JTD (Compiled)", () => {
        AjvJtdUserParser(inputJson);
    }),
    benny.add("JSON.parse", () => {
        JSON.parse(inputJson);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-parsing",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
    benny.save({
        file: "objects-parsing",
        format: "json",
        folder: "benchmark/dist",
    }),
);

void benny.suite(
    "Object Coercion",
    benny.add("Arri", () => {
        a.coerce(ArriUser, inputWithStringKeys);
    }),
    benny.add("TypeBox", () => {
        Value.Convert(TypeBoxUser, inputWithStringKeys);
    }),
    benny.add("Zod", () => {
        ZodCoercedUser.parse(inputWithStringKeys);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-coercion",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
    benny.save({
        file: "objects-coercion",
        format: "json",
        folder: "benchmark/dist",
    }),
);

void benny.suite(
    "Object Serialization",
    benny.add("Arri", () => {
        a.serialize(ArriUser, input);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.serialize(input);
    }),
    benny.add("Arri (Compiled) Validate and Serialize", () => {
        if (ArriUserValidator.validate(input)) {
            ArriUserValidator.serialize(input);
        }
    }),
    benny.add("Ajv - JTD (Compiled)", () => {
        AjvJtdUserSerializer(input);
    }),
    benny.add("JSON.stringify", () => {
        JSON.stringify(input);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-serialization",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
    benny.save({
        file: "objects-serialization",
        format: "json",
        folder: "benchmark/dist",
    }),
);
