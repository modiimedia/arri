import { object, omit, pick } from "./object";
import { boolean, string, timestamp } from "./scalar";
import { type InferType } from "./typedefs";
import { safeParse } from "./validation";

const UserSchema = object(
    {
        id: string(),
        name: string(),
        email: string({ nullable: true }),
        createdAt: timestamp(),
        isAdmin: boolean({ default: true }),
    },
    { additionalProperties: true, optionalProperties: ["createdAt"] },
);

type UserSchema = InferType<typeof UserSchema>;

const PostSchema = object({
    id: string(),
    title: string(),
    createdAt: timestamp(),
    userId: string(),
    user: UserSchema,
});

type PostSchema = InferType<typeof PostSchema>;

test("Type Inference", () => {
    const ObjWithOptionalProps = object(
        {
            id: string(),
            email: string(),
        },
        { optionalProperties: ["email"] },
    );
    type ObjWithOptionalProps = InferType<typeof ObjWithOptionalProps>;
    assertType<ObjWithOptionalProps>({ id: "12345", email: "12345" });
    assertType<ObjWithOptionalProps>({ id: "12345", email: undefined });
});

test("Parsing", () => {
    const badInput = {
        blah: "123513",
        name: "john doe",
    };
    const badJsonInput = JSON.stringify(badInput);
    expect(safeParse(UserSchema, badInput).success).toBe(false);
    expect(safeParse(UserSchema, badJsonInput).success).toBe(false);
    const goodInput = {
        id: "12345",
        name: "john doe",
        email: null,
        createdAt: new Date(),
        isAdmin: false,
    };
    const goodJsonInput = JSON.stringify(goodInput);
    expect(safeParse(UserSchema, goodInput).success).toBe(true);
    expect(safeParse(UserSchema, goodJsonInput).success).toBe(true);
});

test("Nested Object", () => {
    const badInput = {
        id: "12345",
        title: "Some Title",
        createdAt: new Date(),
        userId: "12345",
        user: {
            id: "12345",
            name: "John Doe",
            email: null,
            createdAt: 123456,
            isAdmin: true,
        },
    };
    const badJsonInput = JSON.stringify(badInput);
    expect(safeParse(PostSchema, badInput).success).toBe(false);
    expect(safeParse(PostSchema, badJsonInput).success).toBe(false);
    const goodInput: PostSchema = {
        id: "1234456",
        title: "Hello World",
        createdAt: new Date(),
        userId: "123456",
        user: {
            id: "123456",
            name: "John Doe",
            email: null,
            createdAt: new Date(),
            isAdmin: false,
        },
    };
    const goodJsonInput = JSON.stringify(goodInput);
    expect(safeParse(PostSchema, goodInput).success).toBe(true);
    expect(safeParse(PostSchema, goodJsonInput).success).toBe(true);
});

describe("Pick", () => {
    test("User Subset", () => {
        const UserSubsetSchema = pick(UserSchema, ["name", "email"]);
        type UserSubsetSchema = InferType<typeof UserSubsetSchema>;
        assertType<UserSubsetSchema>({ name: "John Doe", email: null });
        const originalInput: UserSchema = {
            id: "123115",
            name: "John Doe",
            email: "johndoe@gmail.com",
            isAdmin: false,
            createdAt: undefined,
        };
        expect(safeParse(UserSubsetSchema, originalInput).success).toBe(false);
        const subSetInput: UserSubsetSchema = {
            name: "john doe",
            email: "johndoe@gmail.com",
        };
        expect(safeParse(UserSubsetSchema, subSetInput).success).toBe(true);
    });
});

describe("Omit", () => {
    test("User Omission", () => {
        const UserSubsetSchema = omit(UserSchema, ["id"]);
        type UserSubsetSchema = InferType<typeof UserSubsetSchema>;
        assertType<UserSubsetSchema>({
            name: "john doe",
            email: null,
            isAdmin: false,
            createdAt: new Date(),
        });
        const originalInput: UserSchema = {
            id: "234142",
            name: "John Doe",
            isAdmin: false,
            email: null,
            createdAt: new Date(),
        };
        expect(safeParse(UserSubsetSchema, originalInput).success).toBe(false);
        const subsetInput: UserSubsetSchema = {
            name: "John Doe",
            email: null,
            isAdmin: false,
            createdAt: new Date(),
        };
        expect(safeParse(UserSubsetSchema, subsetInput).success).toBe(true);
    });
});
