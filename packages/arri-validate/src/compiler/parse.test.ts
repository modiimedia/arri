import { isEqual } from "lodash";
import { a } from "../_index";
import { compile } from "../compile";
import { testSuites } from "../testSuites";

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
    test(key, () => {
        const Compiled = compile(suite.schema);
        for (const input of suite.goodInputs) {
            try {
                expect(isEqual(Compiled.parse(input), input));
                if (typeof input === "object") {
                    expect(
                        isEqual(
                            Compiled.parse(Compiled.serialize(input)),
                            input,
                        ),
                    );
                }
            } catch (err) {
                console.log(Compiled.compiledCode.serialize);
                throw err;
            }
        }
        for (const input of suite.badInputs) {
            expect(!Compiled.safeParse(input).success);
            expect(!a.safeParse(suite.schema, input).success);
        }
    });
}

it("parses floats", () => {
    const Compiled = a.compile(a.number());
    expect(Compiled.parse("1")).toBe(1);
    expect(Compiled.parse(1)).toBe(1);
    expect(Compiled.parse("1500.5")).toBe(1500.5);
    expect(!Compiled.safeParse("hello world").success);
    expect(!Compiled.safeParse(true).success);
});

it("parses ints", () => {
    const Compiled = a.compile(a.uint32());
    expect(Compiled.parse("1")).toBe(1);
    expect(Compiled.parse(1)).toBe(1);
    expect(!Compiled.safeParse("1500.5").success);
    expect(!Compiled.safeParse(-100).success);
    expect(!Compiled.safeParse(true).success);
});

it("parses timestamps", () => {
    const val = new Date();
    const Compiled = a.compile(a.timestamp());
    expect(Compiled.parse(val).getTime()).toBe(val.getTime());
    expect(Compiled.parse(val.toISOString()).getTime()).toBe(val.getTime());
});

it("parses arrays", () => {
    const CompiledSimple = a.compile(a.array(a.int8()));
    expect(CompiledSimple.parse([1, 2, 3, 4, 5])).toStrictEqual([
        1, 2, 3, 4, 5,
    ]);
});

it("respects the additionalProperties option", () => {
    const LooseSchema = a.compile(
        a.object({
            id: a.string(),
            name: a.string(),
        }),
    );
    const StrictSchema = a.compile(
        a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { additionalProperties: false },
        ),
    );
    const input = {
        id: "",
        name: "",
    };
    const inputWithAdditionalFields = {
        id: "",
        name: "",
        description: "",
    };
    expect(LooseSchema.safeParse(input).success);
    expect(LooseSchema.safeParse(inputWithAdditionalFields).success);
    expect(StrictSchema.safeParse(input).success);
    expect(!StrictSchema.safeParse(inputWithAdditionalFields).success);
});
