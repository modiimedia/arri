import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { a } from "arri-validate";
import { typeboxAdapter } from "./index";

test("infers types correctly", () => {
    const Schema = typeboxAdapter(
        Type.Object({
            id: Type.String(),
            email: Type.String(),
            createdAt: Type.Integer(),
        }),
    );
    type Schema = a.infer<typeof Schema>;
    assertType<Schema>({
        id: "string",
        email: "string",
        createdAt: 0,
    });
    const SchemaWithOptionals = typeboxAdapter(
        Type.Object({
            id: Type.String(),
            email: Type.Optional(Type.String()),
            role: Type.Enum({
                standard: "standard",
                admin: "admin",
            }),
            posts: Type.Array(
                Type.Object({
                    id: Type.String(),
                    title: Type.String(),
                    numComments: Type.Optional(Type.Integer()),
                    numLikes: Type.Optional(Type.Integer()),
                }),
            ),
        }),
    );
    type SchemaWithOptionals = a.infer<typeof SchemaWithOptionals>;
    assertType<SchemaWithOptionals>({
        id: "12345",
        email: undefined,
        role: "admin",
        posts: [
            {
                id: "123455",
                title: "",
                numComments: 2,
                numLikes: 5,
            },
            {
                id: "123j5",
                title: "1324lk14j",
            },
        ],
    });
});

it("creates matching jtd schemas", () => {
    const ObjectSchema = Type.Object({
        id: Type.String(),
        role: Type.Enum({
            standard: "STANDARD",
            admin: "ADMIN",
        }),
        created: Type.Integer(),
        bio: Type.Optional(Type.String()),
    });
    const ConvertedSchema = typeboxAdapter(ObjectSchema);
    const ExpectedSchema = a.object({
        id: a.string(),
        role: a.stringEnum(["STANDARD", "ADMIN"]),
        created: a.int32(),
        bio: a.optional(a.string()),
    });
    expect(JSON.parse(JSON.stringify(ConvertedSchema))).toStrictEqual(
        JSON.parse(JSON.stringify(ExpectedSchema)),
    );
});

it("parses objects in the expected way", () => {
    const UserSchema = Type.Object({
        id: Type.String(),
        name: Type.String(),
        isAdmin: Type.Optional(Type.Boolean()),
        posts: Type.Array(
            Type.Object({
                id: Type.Optional(Type.String()),
                date: Type.Integer(),
            }),
        ),
    });
    const TargetUserSchema = a.object({
        id: a.string(),
        name: a.string(),
        isAdmin: a.optional(a.boolean()),
        posts: a.array(
            a.object({ id: a.optional(a.string()), date: a.int32() }),
        ),
    });
    const ConvertedUserSchema = typeboxAdapter(UserSchema);
    const goodInput = {
        id: "12345",
        name: "john doe",
        isAdmin: false,
        posts: [
            {
                id: "12345",
                date: 0,
            },
            {
                date: 0,
            },
        ],
    };
    expect(a.safeParse(TargetUserSchema, goodInput).success);
    expect(a.safeParse(TargetUserSchema, JSON.stringify(goodInput)).success);
    expect(a.safeParse(ConvertedUserSchema, goodInput).success);
    expect(a.safeParse(ConvertedUserSchema, JSON.stringify(goodInput)).success);
    const badInput = {
        id: "12345",
        name: 12345131,
        isAdmin: true,
        posts: [],
    };
    expect(!a.safeParse(TargetUserSchema, badInput).success);
    expect(!a.safeParse(TargetUserSchema, JSON.stringify(badInput)).success);
    expect(!a.safeParse(ConvertedUserSchema, badInput).success);
    expect(!a.safeParse(ConvertedUserSchema, JSON.stringify(badInput)).success);
});

it("Compiler Test", () => {
    const UserReview = Type.Object({
        id: Type.String(),
        userId: Type.String(),
        rating: Type.Integer(),
        content: Type.String(),
    });
    const User = Type.Object({
        id: Type.String(),
        type: Type.Enum({
            standard: "STANDARD",
            admin: "ADMIN",
        }),
        reviews: Type.Array(UserReview),
        settings: Type.Object({
            theme: Type.Union([
                Type.Literal("dark-mode"),
                Type.Literal("light-mode"),
                Type.Literal("system"),
            ]),
        }),
    });
    console.log("COMPILE()", TypeCompiler.Compile(User));
    console.log(TypeCompiler.Code(User));
});
