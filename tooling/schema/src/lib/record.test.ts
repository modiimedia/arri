import * as a from "./_namespace";

const NumberRecordSchema = a.record(a.int32());
type NumberRecordSchema = a.infer<typeof NumberRecordSchema>;
const StringRecordSchema = a.record(a.string());
type StringRecordSchema = a.infer<typeof StringRecordSchema>;
const ObjectRecordSchema = a.record(
    a.object({
        id: a.string(),
        type: a.stringEnum(["notification", "alert"]),
    }),
);
type ObjectRecordSchema = a.infer<typeof ObjectRecordSchema>;
test("Type Inference", () => {
    assertType<NumberRecordSchema>({ "1": 1, "2": 2 });
    assertType<StringRecordSchema>({ a: "a", b: "b" });
    assertType<ObjectRecordSchema>({
        a: {
            id: "12345",
            type: "notification",
        },
        b: {
            id: "123456",
            type: "alert",
        },
    });
});

describe("Parsing", () => {
    it("accepts good input", () => {
        expect(a.safeParse(NumberRecordSchema, { "1": 1, "2": 2 }).success);
        expect(a.safeParse(StringRecordSchema, { "1": "1", "2": "2" }).success);
        expect(
            a.safeParse(ObjectRecordSchema, {
                a: { id: "12345", type: "notification" },
                b: { id: "12345", type: "alert" },
            }).success,
        );
        expect(
            a.safeParse(
                ObjectRecordSchema,
                JSON.stringify({
                    a: { id: "12345", type: "notification" },
                }),
            ).success,
        );
    });
    it("rejects bad input", () => {
        expect(
            a.safeParse(NumberRecordSchema, { "1": "1", "2": "2" }).success,
        ).toBe(false);
        expect(
            a.safeParse(StringRecordSchema, { "1": null, "2": "2" }).success,
        ).toBe(false);
        expect(
            a.safeParse(ObjectRecordSchema, {
                a: { id: "12345", type: "blahasdlfkj" },
                b: { id: "12345", type: "alert" },
            }).success,
        ).toBe(false);
    });
});
