import b from "benny";
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
};
const arriInputJson = JSON.stringify(arriInput);
const arriInputStringKeys = {
    id: "12345",
    role: "moderator",
    name: "John Doe",
    email: "null",
    createdAt: "121351514134131",
    updatedAt: "131413431413431",
    settings: {
        preferredTheme: "system",
        allowNotifications: "true",
    },
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
});
type ZodUser = z.infer<typeof ZodUser>;
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
});

void b.suite(
    "Object Validation",
    b.add("Arri Validate", () => {
        a.validate(ArriUser, arriInput);
    }),
    b.add("Arri Validate (Compiled)", () => {
        ArriUserValidator.validate(arriInput);
    }),
    b.add("Zod Validate", () => {
        ZodUser.parse(arriInput);
    }),
    b.cycle(),
    b.complete(),
    b.save({
        file: "objects-validation",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

void b.suite(
    "Object Parsing",
    b.add("Arri Parse", () => {
        a.parse(ArriUser, arriInputJson);
    }),
    b.add("Arri Parse (compiled)", () => {
        ArriUserValidator.parse(arriInputJson);
    }),
    b.add("Zod Parse", () => {
        ZodUser.parse(JSON.parse(arriInputJson));
    }),
    b.cycle(),
    b.complete(),
    b.save({
        file: "objects-parsing",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

void b.suite(
    "Object Coercion",
    b.add("Arri Coerce", () => {
        a.safeCoerce(ArriUser, arriInputStringKeys);
    }),
    b.add("Zod Coerce", () => {
        ZodCoercedUser.safeParse(arriInputStringKeys);
    }),
    b.cycle(),
    b.complete(),
    b.save({
        file: "objects-coercion",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);

void b.suite(
    "Object Serialization",
    b.add("Arri Serialize", () => {
        a.serialize(ArriUser, arriInput);
    }),
    b.add("Arri Serialize (Compiled)", () => {
        ArriUserValidator.serialize(arriInput);
    }),
    b.add("JSON.stringify", () => {
        JSON.stringify(arriInput);
    }),
    b.cycle(),
    b.complete(),
    b.save({
        file: "objects-serialization",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);
