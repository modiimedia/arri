import * as a from "./_index";

describe("Type Inference", () => {
    it("infers basic array types", () => {
        const IntArraySchema = a.array(a.int16());
        type IntArraySchema = a.infer<typeof IntArraySchema>;
        assertType<IntArraySchema>([1, 2, 3]);
        const StringArraySchema = a.array(a.string());
        type StringArraySchema = a.infer<typeof StringArraySchema>;
        assertType<StringArraySchema>(["1", "2", "3"]);
    });
    it("infers arrays of objects", () => {
        const ObjectSchema = a.object({
            id: a.string(),
            category: a.object({
                id: a.string(),
            }),
        });
        const ArraySchema = a.array(ObjectSchema);
        type ArraySchema = a.infer<typeof ArraySchema>;
        assertType<ArraySchema>([{ id: "", category: { id: "" } }]);
        const ObjectSchemaWithOptionals = a.object({
            id: a.string(),
            category: a.optional(a.object({ id: a.nullable(a.string()) })),
            createdAt: a.optional(a.timestamp()),
        });
        const ArrayWithOptionalsSchema = a.array(ObjectSchemaWithOptionals);
        type ArrayWithOptionalsSchema = a.infer<
            typeof ArrayWithOptionalsSchema
        >;
        assertType<ArrayWithOptionalsSchema>([
            {
                id: "",
                createdAt: new Date(),
                category: {
                    id: "",
                },
            },
            {
                id: "",
                createdAt: undefined,
                category: {
                    id: null,
                },
            },
            {
                id: "",
                createdAt: new Date(),
                category: undefined,
            },
        ]);
    });
    it("infers nested arrays", () => {
        const ArraySchema = a.array(
            a.array(a.array(a.stringEnum(["YES", "NO"]))),
        );
        type ArraySchema = a.infer<typeof ArraySchema>;
        assertType<ArraySchema>([
            [
                ["YES", "YES"],
                ["NO", "YES"],
                ["YES", "YES"],
            ],
            [["YES"]],
            [],
        ]);
    });
});

test("Parsing", () => {
    const SimpleArray = a.array(a.number());
    const ComplexArray = a.array(
        a.object({
            id: a.string(),
            date: a.timestamp(),
        }),
    );
    it("accepts good input", () => {
        const numberArr = [1, 2, 3, 4, 5];
        expect(a.safeParse(SimpleArray, numberArr).success).toBe(true);
        expect(
            a.safeParse(SimpleArray, JSON.stringify(numberArr)).success,
        ).toBe(true);
        const objectArr = [
            { id: "123111", date: new Date() },
            { id: "alsdkfja", date: new Date() },
        ];
        expect(a.safeParse(ComplexArray, objectArr).success).toBe(true);
        expect(
            a.safeParse(ComplexArray, JSON.stringify(objectArr)).success,
        ).toBe(true);
    });

    it("rejects bad input", () => {
        const numberArr = [1, "1", 4];
        expect(a.safeParse(SimpleArray, numberArr).success).toBe(false);
        expect(
            a.safeParse(SimpleArray, JSON.stringify(numberArr)).success,
        ).toBe(false);
        const objectArr = [
            { id: "123124", date: 0 },
            { id: "1l3kj431lkj", date: 0 },
        ];
        expect(a.safeParse(ComplexArray, objectArr).success).toBe(false);
        expect(
            a.safeParse(ComplexArray, JSON.stringify(objectArr)).success,
        ).toBe(false);
    });
});

describe("Serialization", () => {
    it("serializes to valid json", () => {
        const SimpleSchema = a.array(a.number());
        type SimpleSchema = a.infer<typeof SimpleSchema>;
        const input: SimpleSchema = [1, 10, 25];
        expect(a.serialize(SimpleSchema, input)).toBe("[1,10,25]");
        const ComplexSchema = a.array(
            a.object({
                id: a.string(),
                role: a.stringEnum(["HOST", "CUSTOMER"]),
            }),
        );
        type ComplexSchema = a.infer<typeof ComplexSchema>;
        const input2: ComplexSchema = [
            { id: "1", role: "CUSTOMER" },
            { id: "2", role: "HOST" },
        ];
        expect(a.serialize(ComplexSchema, input2)).toBe(
            `[{"id":"1","role":"CUSTOMER"},{"id":"2","role":"HOST"}]`,
        );
    });
});
