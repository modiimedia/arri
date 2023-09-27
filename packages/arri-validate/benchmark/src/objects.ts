import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
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

const arriInput: ArriUser = {
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
const arriInputJson = JSON.stringify(arriInput);
const arriInputStringKeys = {
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
const TypeBoxValidator = TypeCompiler.Compile(TypeBoxUser);

void benny.suite(
    "Object Validation",
    benny.add("Arri", () => {
        a.validate(ArriUser, arriInput);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.validate(arriInput);
    }),
    benny.add("TypeBox", () => {
        Value.Check(TypeBoxUser, arriInput);
    }),
    benny.add("TypeBox (Compiled)", () => {
        TypeBoxValidator.Check(arriInput);
    }),
    benny.add("Zod", () => {
        ZodUser.parse(arriInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-validation",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

void benny.suite(
    "Object Parsing",
    benny.add("Arri", () => {
        a.parse(ArriUser, arriInputJson);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.parse(arriInputJson);
    }),
    benny.add("TypeBox", () => {
        Value.Decode(TypeBoxUser, JSON.parse(arriInputJson));
    }),
    benny.add("TypeBox (Compiled)", () => {
        TypeBoxValidator.Decode(JSON.parse(arriInputJson));
    }),
    benny.add("Zod", () => {
        ZodUser.parse(JSON.parse(arriInputJson));
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-parsing",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

void benny.suite(
    "Object Coercion",
    benny.add("Arri", () => {
        a.coerce(ArriUser, arriInputStringKeys);
    }),
    benny.add("TypeBox", () => {
        Value.Convert(TypeBoxUser, arriInputStringKeys);
    }),
    benny.add("Zod", () => {
        ZodCoercedUser.parse(arriInputStringKeys);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-coercion",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

void benny.suite(
    "Object Serialization",
    benny.add("Arri", () => {
        a.serialize(ArriUser, arriInput);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.serialize(arriInput);
    }),
    benny.add("JSON.stringify", () => {
        JSON.stringify(arriInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-serialization",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);
