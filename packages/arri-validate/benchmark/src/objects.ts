import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import AJV from "ajv";
import benny from "benny";
import { z } from "zod";
import { a } from "../../src/_index";
import { compileV2 } from "../../src/compile";

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
const ArriUserValidatorV2 = compileV2(ArriUser);
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

const ajv = new AJV({ strict: false });
const AjvUserValidator = ajv.compile<ArriUser>(TypeBoxUser);
void benny.suite(
    "Object Validation",
    benny.add("Arri", () => {
        a.validate(ArriUser, input);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.validate(input);
    }),
    benny.add("Arri (Compiled V2)", () => {
        ArriUserValidatorV2.validate(input);
    }),
    benny.add("Ajv (JSON Schema)", () => {
        ajv.validate(TypeBoxUser, input);
    }),
    benny.add("Ajv (JSON Schema - Compiled)", () => {
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
);

void benny.suite(
    "Object Parsing",
    benny.add("Arri", () => {
        a.parse(ArriUser, inputJson);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.parse(inputJson);
    }),
    benny.add("TypeBox", () => {
        Value.Decode(TypeBoxUser, JSON.parse(inputJson));
    }),
    benny.add("TypeBox (Compiled)", () => {
        TypeBoxUserValidator.Decode(JSON.parse(inputJson));
    }),
    benny.add("Zod", () => {
        ZodUser.parse(JSON.parse(inputJson));
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
);

void benny.suite(
    "Object Serialization",
    benny.add("Arri", () => {
        a.serialize(ArriUser, input);
    }),
    benny.add("Arri (Compiled)", () => {
        ArriUserValidator.serialize(input);
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
);

const SimpleObject = a.object({
    id: a.string(),
    isAdmin: a.optional(a.boolean()),
    createdAt: a.timestamp(),
    updatedAt: a.nullable(a.string()),
    type: a.stringEnum(["media", "text"]),
});
type SimpleObject = a.infer<typeof SimpleObject>;
const SimpleObjectValidator = a.compile(SimpleObject);
const SimpleObjectValidatorV2 = compileV2(SimpleObject);
const SimpleObjectInput: SimpleObject = {
    id: "1",
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: null,
    type: "media",
};

void benny.suite(
    "Object Serialization 2.0 (Simple)",
    benny.add("Arri", () => {
        a.serialize(SimpleObject, SimpleObjectInput);
    }),
    benny.add("Arri (Compiled)", () => {
        SimpleObjectValidator.serialize(SimpleObjectInput);
    }),
    benny.add("Arri (Compiled V2)", () => {
        SimpleObjectValidatorV2.serialize(SimpleObjectInput);
    }),
    benny.add("JSON.stringify()", () => {
        JSON.stringify(SimpleObjectInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-serialization-v2-simple",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

const ComplexObject = a.object({
    id: a.string(),
    type: a.stringEnum(["a", "b", "c"]),
    userId: a.string(),
    user: ArriUser,
    createdAt: a.timestamp(),
    updatedAt: a.timestamp(),
    events: a.array(
        a.discriminator("eventType", {
            ACCOUNT_UPGRADE: a.object({
                message: a.string(),
            }),
            ACCOUNT_RESET: a.object({
                message: a.string(),
                reason: a.string(),
            }),
            ACCOUNT_DELETED: a.object({
                message: a.string(),
                reason: a.string(),
                time: a.timestamp(),
            }),
        }),
    ),
    metadata: a.nullable(
        a.record(
            a.object({
                key: a.string(),
                isActive: a.boolean(),
            }),
        ),
    ),
});

type ComplexObject = a.infer<typeof ComplexObject>;
const ComplexObjectValidator = a.compile(ComplexObject);
const ComplexObjectValidatorV2 = compileV2(ComplexObject);

const ComplexObjectInput: ComplexObject = {
    id: "1234",
    type: "a",
    userId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
        id: 0,
        role: "standard",
        name: "",
        email: null,
        createdAt: 0,
        updatedAt: 0,
        settings: {
            allowNotifications: true,
            preferredTheme: "system",
        },
        recentNotifications: [
            {
                type: "POST_COMMENT",
                userId: "2",
                postId: "1",
                commentText: "YOU SUCK",
            },
            {
                type: "POST_COMMENT",
                userId: "2",
                postId: "1",
                commentText: "YOU SUCK",
            },
            {
                type: "POST_LIKE",
                userId: "1",
                postId: "2",
            },
            {
                type: "POST_LIKE",
                userId: "1",
                postId: "2",
            },
        ],
    },
    events: [
        {
            eventType: "ACCOUNT_UPGRADE",
            message: "",
        },
        {
            eventType: "ACCOUNT_DELETED",
            message: "",
            reason: "",
            time: new Date(),
        },
        {
            eventType: "ACCOUNT_RESET",
            message: "",
            reason: "",
        },
    ],
    metadata: {
        hello: {
            key: "world",
            isActive: true,
        },
        goodbye: {
            key: "world",
            isActive: false,
        },
    },
};

void benny.suite(
    "Object Serialization 2.0 (Complex)",
    benny.add("Arri", () => {
        a.serialize(ComplexObject, ComplexObjectInput);
    }),
    benny.add("Arri (Compiled)", () => {
        ComplexObjectValidator.serialize(ComplexObjectInput);
    }),
    benny.add("Arri (Compiled V2)", () => {
        ComplexObjectValidatorV2.serialize(ComplexObjectInput);
    }),
    benny.add("JSON.stringify()", () => {
        JSON.stringify(ComplexObjectInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "objects-serialization-v2-complex",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);
