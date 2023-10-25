import * as a from "./_namespace";

const UserSchema = a.object({
    id: a.string(),
    name: a.string(),
    email: a.nullable(a.string()),
    createdAt: a.optional(a.timestamp()),
    isAdmin: a.boolean(),
});

type UserSchema = a.infer<typeof UserSchema>;

const PostSchema = a.object({
    id: a.string(),
    title: a.string(),
    createdAt: a.timestamp(),
    userId: a.string(),
    user: UserSchema,
    tags: a.array(a.string()),
});

type PostSchema = a.infer<typeof PostSchema>;

describe("a.object()", () => {
    describe("type inference", () => {
        it("infers basic objects", () => {
            const SomeObject = a.object({
                id: a.string(),
                email: a.string(),
                type: a.stringEnum(["a", "b", "c"]),
                _metadata: a.object({
                    createdAt: a.timestamp(),
                    updatedAt: a.timestamp(),
                }),
            });

            type SomeObject = a.infer<typeof SomeObject>;
            assertType<SomeObject>({
                id: "12345",
                email: "johndoe@gmail",
                type: "b",
                _metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        });
        it("infers objects with optional and null properties", () => {
            const SomeObject = a.object({
                id: a.string(),
                email: a.optional(a.string()),
                type: a.stringEnum(["a", "b", "c"]),
                _metadata: a.optional(
                    a.object({
                        createdAt: a.timestamp(),
                        updatedAt: a.timestamp(),
                        lastSignedIn: a.nullable(a.timestamp()),
                    }),
                ),
            });
            type SomeObject = a.infer<typeof SomeObject>;
            assertType<SomeObject>({
                id: "12345",
                type: "b",
                email: undefined,
                _metadata: undefined,
            });
            assertType<SomeObject>({
                id: "12345",
                email: "1231351",
                type: "a",
                _metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastSignedIn: null,
                },
            });
        });
        it("accounts for the additional properties parameter when inferring types", () => {
            const SomeObject = a.object(
                {
                    id: a.string(),
                    email: a.string(),
                },
                { additionalProperties: true },
            );
            type SomeObject = a.infer<typeof SomeObject>;
            assertType<SomeObject>({
                id: "12355",
                email: "johndoe@gmail.com",
            });
            assertType<SomeObject>({
                id: "12345",
                email: "johndoe@gmail.com",
                isAdmin: false,
                someOtherProp: [{ id: 1, date: new Date() }],
            });
        });
        it("infers extended objects", () => {
            const SomeObject = a.object({
                id: a.string(),
                email: a.string(),
            });
            const SomeOtherObject = a.object({
                name: a.string(),
                createdAt: a.timestamp(),
            });
            const CombinedObject = a.extend(SomeObject, SomeOtherObject);
            type CombinedObject = a.infer<typeof CombinedObject>;
            assertType<CombinedObject>({
                id: "13245",
                email: "johndoe@gmail.com",
                name: "John Doe",
                createdAt: new Date(),
            });
        });
    });
    test("parses good input", () => {
        const goodInput = {
            id: "12345",
            name: "john doe",
            email: null,
            createdAt: new Date(),
            isAdmin: false,
        };
        const goodJsonInput = JSON.stringify(goodInput);
        const goodInputResult = a.safeParse(UserSchema, goodInput);
        expect(goodInputResult.success);
        if (goodInputResult.success) {
            expect(goodInputResult.value).toStrictEqual(goodInput);
        }
        const goodJsonResult = a.safeParse(UserSchema, goodJsonInput);
        expect(goodJsonResult.success);
        if (goodJsonResult.success) {
            expect(goodJsonResult.value).toStrictEqual(goodInput);
        }
    });
    test("doesn't parse bad input", () => {
        const badInput = {
            blah: "123513",
            name: "john doe",
        };
        const badJsonInput = JSON.stringify(badInput);
        expect(a.safeParse(UserSchema, badInput).success).toBe(false);
        expect(a.safeParse(UserSchema, badJsonInput).success).toBe(false);
    });
    test("parses nested objects", () => {
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
        const badInputResult = a.safeParse(PostSchema, badInput);
        if (badInputResult.success) {
            console.error(badInputResult.value);
        }
        expect(badInputResult.success).toBe(false);
        expect(a.safeParse(PostSchema, badJsonInput).success).toBe(false);
        const goodInput: PostSchema = {
            id: "1234456",
            title: "Hello World",
            createdAt: new Date(),
            userId: "123456",
            tags: ["A", "B", "C"],
            user: {
                id: "123456",
                name: "John Doe",
                email: null,
                createdAt: new Date(),
                isAdmin: false,
            },
        };
        const goodJsonInput = JSON.stringify(goodInput);
        const result = a.safeParse(PostSchema, goodInput);
        expect(result.success);
        if (result.success) {
            expect(result.value).toStrictEqual(goodInput);
        }
        const jsonResult = a.safeParse(PostSchema, goodJsonInput);
        expect(jsonResult.success);
        if (jsonResult.success) {
            expect(jsonResult.value).toStrictEqual(goodInput);
        }
    });
    it("produces valid jtd schema", () => {
        const result = JSON.stringify(
            a.object({
                id: a.string(),
                name: a.nullable(a.string()),
                createdAt: a.timestamp(),
                favorites: a.optional(a.array(a.string())),
            }),
        );
        expect(JSON.parse(result)).toStrictEqual({
            properties: {
                id: {
                    type: "string",
                    metadata: {},
                },
                name: {
                    type: "string",
                    metadata: {},
                    nullable: true,
                },
                createdAt: {
                    type: "timestamp",
                    metadata: {},
                },
            },
            optionalProperties: {
                favorites: {
                    elements: {
                        type: "string",
                        metadata: {},
                    },
                    metadata: {},
                },
            },
            additionalProperties: true,
            metadata: {},
        });
    });
    it("serializes a simple object", () => {
        const SimpleObject = a.object({
            limit: a.number(),
            isActive: a.boolean(),
            createdAt: a.timestamp(),
            name: a.string(),
        });
        type SimpleObject = a.infer<typeof SimpleObject>;
        const input: SimpleObject = {
            limit: 1,
            isActive: true,
            createdAt: new Date(),
            name: "John Doe",
        };
        const result = a.serialize(SimpleObject, input);
        expect(a.parse(SimpleObject, result)).toStrictEqual(input);
        JSON.parse(result);
    });
    it("serializes nested object", () => {
        const NestedObject = a.object({
            limit: a.number(),
            isActive: a.boolean(),
            date: a.timestamp(),
            nestedObject: a.object({
                name: a.string(),
                enum: a.stringEnum(["A", "B"]),
                date: a.timestamp(),
            }),
        });
        type NestedObject = a.infer<typeof NestedObject>;
        const input: NestedObject = {
            limit: 0,
            isActive: false,
            date: new Date(),
            nestedObject: {
                name: "",
                enum: "A",
                date: new Date(),
            },
        };
        const result = a.serialize(NestedObject, input);
        JSON.parse(result);
        expect(a.parse(NestedObject, result)).toStrictEqual(input);
    });
});

describe("a.object() -> Coersion", () => {
    const SimpleObject = a.object({
        limit: a.number(),
        isActive: a.boolean(),
        createdAt: a.timestamp(),
    });
    const ComplexObject = a.extend(
        SimpleObject,
        a.object({
            data: a.object({
                id: a.optional(a.number()),
                type: a.stringEnum(["event", "notification"]),
                date: a.timestamp(),
                items: a.array(a.int32()),
            }),
        }),
    );
    const coerceSimple = (input: unknown) => a.safeCoerce(SimpleObject, input);
    const coerceComplex = (input: unknown) =>
        a.safeCoerce(ComplexObject, input);
    it("coerces good input", () => {
        const simpleInput = {
            limit: "100.5",
            isActive: 0,
            createdAt: "01/01/2001",
        };
        const simpleResult = coerceSimple(simpleInput);
        if (!simpleResult.success) {
            console.error(simpleResult.error);
        }
        expect(simpleResult.success);
        if (simpleResult.success) {
            expect(simpleResult.value).toStrictEqual({
                limit: 100.5,
                isActive: false,
                createdAt: new Date("01/01/2001"),
            });
        }
        const complexInput = {
            limit: "100.5",
            isActive: 0,
            createdAt: "01/01/2001",
            data: {
                id: "1",
                type: "event",
                date: 0,
                items: ["1", "2", "3"],
            },
        };
        const complexResult = coerceComplex(complexInput);
        if (!complexResult.success) {
            console.error(complexResult.error);
        }
        expect(complexResult.success);
        if (complexResult.success) {
            expect(complexResult.value).toStrictEqual({
                limit: 100.5,
                isActive: false,
                createdAt: new Date("01/01/2001"),
                data: {
                    id: 1,
                    type: "event",
                    date: new Date(0),
                    items: [1, 2, 3],
                },
            });
        }
    });
});

describe("a.pick()", () => {
    const UserSubsetSchema = a.pick(UserSchema, ["name", "email"]);
    type UserSubsetSchema = a.infer<typeof UserSubsetSchema>;

    it("infers specified subset of properties", () => {
        assertType<UserSubsetSchema>({ name: "John Doe", email: null });
    });
    it("parses good input", () => {
        const input: UserSubsetSchema = {
            name: "john doe",
            email: "johndoe@gmail.com",
        };
        const result = a.safeParse(UserSubsetSchema, input);
        expect(result.success);
        if (result.success) {
            expect(result.value).toStrictEqual({
                name: "john doe",
                email: "johndoe@gmail.com",
            });
        }
    });
    it("doesn't parse bad input", () => {
        const input: UserSchema = {
            id: "123115",
            name: "John Doe",
            email: "johndoe@gmail.com",
            isAdmin: false,
            createdAt: undefined,
        };
        const result = a.safeParse(UserSubsetSchema, input);
        expect(!result.success);
    });
    it("produces jtd object schema with picked properties", () => {
        expect(JSON.parse(JSON.stringify(UserSubsetSchema))).toStrictEqual({
            properties: {
                name: {
                    type: "string",
                    metadata: {},
                },
                email: {
                    type: "string",
                    metadata: {},
                    nullable: true,
                },
            },
            optionalProperties: {},
            additionalProperties: true,
            metadata: {},
        });
    });
});

describe("a.omit()", () => {
    const UserSubsetSchema = a.omit(UserSchema, ["id", "isAdmin"], {
        additionalProperties: false,
    });
    type UserSubsetSchema = a.infer<typeof UserSubsetSchema>;
    const parse = (input: unknown) => a.safeParse(UserSubsetSchema, input);
    it("infers object with omitted fields", () => {
        assertType<UserSubsetSchema>({
            name: "john doe",
            email: null,
            createdAt: new Date(),
        });
    });
    it("parses good input", () => {
        const subsetInput: UserSubsetSchema = {
            name: "John Doe",
            email: null,
            createdAt: new Date(),
        };
        const goodResult = parse(subsetInput);
        if (!goodResult.success) {
            console.error(goodResult.error);
        }
        expect(goodResult.success);
    });
    it("doesn't parse bad input", () => {
        const unomittedInput: UserSchema = {
            id: "234142",
            name: "John Doe",
            isAdmin: false,
            email: null,
            createdAt: new Date(),
        };
        const badResult = parse(unomittedInput);
        if (badResult.success) {
            console.error(badResult);
        }
        expect(badResult.success).toBe(false);
    });
    it("produces jtd schema without omitted properties", () => {
        expect(JSON.parse(JSON.stringify(UserSubsetSchema))).toStrictEqual({
            properties: {
                name: {
                    type: "string",
                    metadata: {},
                },
                email: {
                    type: "string",
                    metadata: {},
                    nullable: true,
                },
            },
            optionalProperties: {
                createdAt: {
                    type: "timestamp",
                    metadata: {},
                },
            },
            additionalProperties: false,
            metadata: {},
        });
    });
});

describe("a.partial()", () => {
    const RootObject = a.object({
        string: a.string(),
        date: a.timestamp(),
        count: a.nullable(a.number()),
        stringArray: a.array(a.string()),
        stringEnum: a.stringEnum(["a", "b"]),
    });
    const PartialObject = a.partial(RootObject);
    type PartialObject = a.infer<typeof PartialObject>;

    it("infers partial types", () => {
        assertType<PartialObject>({});
        assertType<PartialObject>({
            string: "12341",
        });
        assertType<PartialObject>({
            stringEnum: "a",
        });
    });

    it("validates good input", () => {
        const input1: PartialObject = {};
        const result1 = a.validate(PartialObject, input1);
        expect(result1);
        const input2: PartialObject = {
            date: new Date(),
            stringEnum: "a",
        };
        const result2 = a.validate(PartialObject, input2);
        expect(result2);
    });

    it("parses good input", () => {
        const input1: PartialObject = {};
        const result1 = a.safeParse(PartialObject, input1);
        expect(result1.success);
        if (result1.success) {
            expect(result1.value).toStrictEqual(input1);
        }
        const input2: PartialObject = {
            date: new Date(),
            stringEnum: "b",
        };
        const result2 = a.safeParse(PartialObject, input2);
        if (result2.success) {
            expect(result2.value).toStrictEqual(input2);
        }
        const input3: PartialObject = {
            string: "",
            date: new Date(),
            count: null,
            stringArray: ["1", "2"],
            stringEnum: "b",
        };
        const result3 = a.safeParse(PartialObject, input3);
        if (result3.success) {
            expect(result3.value).toStrictEqual(input3);
        }
    });

    it("doesn't parse bad input", () => {
        const input1 = {
            stringEnum: "1",
        };
        const result1 = a.safeParse(PartialObject, input1);
        expect(!result1.success);

        const input2 = {
            foo: "",
        };
        const result2 = a.safeParse(PartialObject, input2);
        expect(!result2.success);
    });

    it("produces jdt object schema will all optional properties", () => {
        const result = JSON.stringify(
            a.partial(
                a.object({
                    id: a.string(),
                    name: a.nullable(a.string()),
                    createdAt: a.timestamp(),
                    favorites: a.optional(a.array(a.string())),
                }),
            ),
        );
        expect(JSON.parse(result)).toStrictEqual({
            properties: {},
            optionalProperties: {
                id: {
                    type: "string",
                    metadata: {},
                },
                name: {
                    type: "string",
                    metadata: {},
                    nullable: true,
                },
                createdAt: {
                    type: "timestamp",
                    metadata: {},
                },
                favorites: {
                    elements: {
                        type: "string",
                        metadata: {},
                    },
                    metadata: {},
                },
            },
            additionalProperties: true,
            metadata: {},
        });
    });
});
