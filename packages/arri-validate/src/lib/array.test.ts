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
        const ArraySchema = a.array(a.array(a.array(a.values(["YES", "NO"]))));
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

test("Validation Tests", () => {});
