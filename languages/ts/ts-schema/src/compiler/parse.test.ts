import { isEqual } from "lodash";

import { a } from "../_index";
import { compile } from "../compile";
import { parsingTestSuites, validationTestSuites } from "../testSuites";

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key]!;
    test(key, () => {
        const Compiled = compile(suite.schema);
        for (const input of suite.goodInputs) {
            expect(isEqual(Compiled.parse(input), input));
            if (typeof input === "object") {
                expect(
                    isEqual(Compiled.parse(Compiled.serialize(input)), input),
                );
            }
        }
        for (const input of suite.badInputs) {
            expect(Compiled.safeParse(input).success).toBe(false);
            expect(a.safeParse(suite.schema, input).success).toBe(false);
        }
    });
}

describe("parsing test suites", () => {
    for (const key of Object.keys(parsingTestSuites)) {
        const suite = parsingTestSuites[key]!;
        test(key, () => {
            const Compiled = compile(suite.schema);
            for (let i = 0; i < suite.goodInputs.length; i++) {
                const input = suite.goodInputs[i];
                const expectedResult = suite.expectedResults[i];
                const actualResult = Compiled.safeParse(input);
                if (!actualResult.success) {
                    console.log(Compiled.compiledCode.parse);
                    console.log(input, "Should parse");
                }
                expect(actualResult.success).toBe(true);
                if (actualResult.success) {
                    const serializedResult = Compiled.serialize(
                        actualResult.value,
                    );
                    expect(actualResult.value).toStrictEqual(expectedResult);
                    expect(Compiled.parse(serializedResult)).toStrictEqual(
                        expectedResult,
                    );
                    expect(actualResult.value).toStrictEqual(
                        a.parse(suite.schema, input),
                    );
                }
            }
            for (const input of suite.badInputs) {
                const result = Compiled.safeParse(input);
                if (result.success) {
                    console.log(Compiled.compiledCode.parse);
                    console.log(input, "Should NOT parse");
                }
                expect(result.success).toBe(false);
            }
        });
    }
});

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

it("respects the strict option", () => {
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
            { strict: true },
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

it("parses discriminated unions", () => {
    const Schema = a.discriminator("eventType", {
        POST_CREATED: a.object({
            id: a.string(),
            date: a.timestamp(),
        }),
        POST_UPDATED: a.object({
            id: a.string(),
            date: a.timestamp(),
            data: a.object({
                title: a.string(),
                description: a.string(),
            }),
        }),
        POST_DELETED: a.object({
            id: a.string(),
            date: a.timestamp(),
            deletionReason: a.string(),
        }),
    });
    type Schema = a.infer<typeof Schema>;
    const inputs: Schema[] = [
        {
            eventType: "POST_CREATED",
            id: "1",
            date: new Date(),
        },
        {
            eventType: "POST_UPDATED",
            id: "2",
            date: new Date(),
            data: {
                title: "Hello World",
                description: "Hello World!",
            },
        },
        {
            eventType: "POST_DELETED",
            id: "3",
            date: new Date(),
            deletionReason: "",
        },
    ];
    const CompiledValidator = a.compile(Schema);
    for (const input of inputs) {
        expect(CompiledValidator.parse(input)).toStrictEqual(input);
        expect(
            CompiledValidator.parse(CompiledValidator.serialize(input)),
        ).toStrictEqual(input);
    }
});
