import { a, isAScalarSchema, isAStringEnumSchema } from "../_index";
import { compile } from "../compile";
import { testSuites } from "../testSuites";

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
    for (const input of suite.goodInputs) {
        test(key, () => {
            const Compiled = compile(suite.schema);
            const result = Compiled.serialize(input);
            if (
                !isAScalarSchema(suite.schema) &&
                !isAStringEnumSchema(suite.schema)
            ) {
                JSON.parse(result);
            }
            expect(a.safeParse(suite.schema, result).success);
        });
    }
}

it("serializes strings", () => {
    const Compiled = compile(a.string());
    expect(Compiled.serialize("Hello World")).toBe("Hello World");
});
it("serializes timestamp", () => {
    const Compiled = compile(a.timestamp());
    const input = new Date();
    expect(Compiled.serialize(input)).toBe(input.toISOString());
});
it("serializes boolean", () => {
    const Compiled = compile(a.boolean());
    expect(Compiled.serialize(true)).toBe("true");
});
it("serializes enum", () => {
    const Compiled = compile(a.stringEnum(["ADMIN", "STANDARD", "MODERATOR"]));
    expect(Compiled.serialize("ADMIN")).toBe("ADMIN");
});
it("serializes objects", () => {
    const Compiled = compile(
        a.object({
            a: a.string(),
            b: a.stringEnum(["A", "B", "C"]),
            c: a.number(),
            d: a.boolean(),
            e: a.timestamp(),
        }),
    );
    const inputDate = new Date();
    expect(
        Compiled.serialize({
            a: "hello world",
            b: "B",
            c: 10,
            d: false,
            e: inputDate,
        }),
    ).toBe(
        `{"a":"hello world","b":"B","c":10,"d":false,"e":"${inputDate.toISOString()}"}`,
    );
});

it("serializes objects will nullable fields", () => {
    const Compiled = compile(
        a.object(
            {
                a: a.nullable(a.string()),
                b: a.nullable(a.stringEnum(["B"])),
                c: a.nullable(a.number()),
                d: a.nullable(a.boolean()),
                e: a.nullable(a.timestamp()),
            },
            { id: "NullableObject" },
        ),
    );
    const inputDate = new Date();
    expect(
        Compiled.serialize({
            a: "hello world",
            b: "B",
            c: 10,
            d: false,
            e: inputDate,
        }),
    ).toBe(
        `{"a":"hello world","b":"B","c":10,"d":false,"e":"${inputDate.toISOString()}"}`,
    );
    expect(
        Compiled.serialize({ a: null, b: null, c: null, d: null, e: null }),
    ).toBe(`{"a":null,"b":null,"c":null,"d":null,"e":null}`);
});
