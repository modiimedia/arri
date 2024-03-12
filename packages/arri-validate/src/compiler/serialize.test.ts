import { a, isAScalarSchema, isAStringEnumSchema } from "../_index";
import { compile } from "../compile";
import { validationTestSuites } from "../testSuites";

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key];
    const Compiled = compile(suite.schema);
    for (const input of suite.goodInputs) {
        test(key, () => {
            const result = Compiled.serialize(input);
            if (key === "object with characters needing escaping") {
                console.log(result);
            }
            expect(typeof result === "string");
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
it("doesn't serialize NaN", () => {
    const Schema = a.object({ num: a.number(), int: a.int32() });
    const Compiled = compile(Schema);
    const input = { num: NaN, int: NaN };
    try {
        expect(Compiled.serialize(input));
        expect(a.serialize(Schema, input));
    } catch (err) {
        expect(true).toBe(true);
    }
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

it("serializes any object", () => {
    const Schema = a.object({
        any: a.any(),
        string: a.string(),
    });
    type Schema = a.infer<typeof Schema>;
    const Compiled = a.compile(Schema);
    const input: Schema = {
        any: {
            a: "",
            b: "",
            c: false,
        },
        string: "",
    };
    const result = Compiled.serialize(input);
    expect(Compiled.parse(result)).toStrictEqual(input);
});
