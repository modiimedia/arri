import { a } from "../_index";
import { compile } from "../compile";
import { testSuites } from "./testUtils";

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
    test(key, () => {
        const Compiled = compile(suite.schema);
        for (const input of suite.goodInputs) {
            expect(Compiled.parse(input)).toStrictEqual(
                a.parse(suite.schema, input),
            );
            expect(Compiled.safeParse(JSON.stringify(input)).success);
        }
        for (const input of suite.badInputs) {
            expect(!Compiled.safeParse(input).success);
            expect(!Compiled.safeParse(JSON.stringify(input)).success);
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
