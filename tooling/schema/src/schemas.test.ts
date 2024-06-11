import { a, type InferSubType, type InferType } from "./_index";

describe("InferSubType", () => {
    test("Basic Discriminator", () => {
        const Schema = a.discriminator("type", {
            A: a.object({
                id: a.string(),
            }),
            B: a.object({
                id: a.string(),
                name: a.string(),
            }),
        });
        type Schema = InferType<typeof Schema>;
        type SchemaTypeA = InferSubType<Schema, "type", "A">;
        type SchemaTypeB = InferSubType<Schema, "type", "B">;
        assertType<SchemaTypeA>({ id: "", type: "A" });
        assertType<SchemaTypeB>({ id: "", type: "B", name: "" });
    });
});
