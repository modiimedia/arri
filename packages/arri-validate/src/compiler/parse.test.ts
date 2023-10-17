import { isEqual } from "lodash";
import { a } from "../_index";
import { compile } from "../compile";
import { testSuites } from "../testSuites";

function rawParser(input: unknown) {
    class $ValidationError2 extends Error {
        /**
         * @type {string}
         */
        instancePath;
        /**
         * @type {string}
         */
        schemaPath;
        /**
         *
         * @param instancePath {string}
         * @param schemaPath {string}
         * @param message {string}
         */
        constructor(instancePath, schemaPath, message) {
            super(message);
            this.instancePath = instancePath;
            this.schemaPath = schemaPath;
        }
    }
    /**
     * @param instancePath {string}
     * @param schemaPath {string}
     * @param message {string}
     */
    function $fallback(instancePath, schemaPath, message) {
        throw new $ValidationError2(instancePath, schemaPath, message);
    }

    if (typeof input === "string") {
        const json = JSON.parse(input);
        return typeof json === "object" && json !== null
            ? {
                  id:
                      typeof json === "undefined"
                          ? undefined
                          : typeof json.id === "string"
                          ? json.id
                          : $fallback(
                                "/id",
                                "/optionalProperties/id",
                                "Expected string at json.id.",
                            ),
                  createdAt:
                      typeof json === "undefined"
                          ? undefined
                          : typeof json.createdAt === "object" &&
                            json.createdAt instanceof Date
                          ? json.createdAt
                          : typeof json.createdAt === "string"
                          ? new Date(json.createdAt)
                          : $fallback(
                                "/createdAt",
                                "/optionalProperties/createdAt",
                                "Expected instance of Date or ISO Date string at /createdAt",
                            ),
                  type:
                      typeof json === "undefined"
                          ? undefined
                          : typeof json.type === "string" &&
                            (json.type === "a" || json.type === "b")
                          ? json.type
                          : $fallback(
                                "/type",
                                "/optionalProperties/type",
                                "Expected one of the following values: [a, b] at /type.",
                            ),
              }
            : $fallback("", "", "Expected object.");
    }
    return typeof input === "object" && input !== null
        ? {
              id:
                  typeof input === "undefined"
                      ? undefined
                      : typeof input.id === "string"
                      ? input.id
                      : $fallback(
                            "/id",
                            "/optionalProperties/id",
                            "Expected string at input.id.",
                        ),
              createdAt:
                  typeof input === "undefined"
                      ? undefined
                      : typeof input.createdAt === "object" &&
                        input.createdAt instanceof Date
                      ? input.createdAt
                      : typeof input.createdAt === "string"
                      ? new Date(input.createdAt)
                      : $fallback(
                            "/createdAt",
                            "/optionalProperties/createdAt",
                            "Expected instance of Date or ISO Date string at /createdAt",
                        ),
              type:
                  typeof input === "undefined"
                      ? undefined
                      : typeof input.type === "string" &&
                        (input.type === "a" || input.type === "b")
                      ? input.type
                      : $fallback(
                            "/type",
                            "/optionalProperties/type",
                            "Expected one of the following values: [a, b] at /type.",
                        ),
          }
        : $fallback("", "", "Expected object.");
}

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
    test(key, () => {
        const Compiled = compile(suite.schema);

        for (const input of suite.goodInputs) {
            try {
                expect(isEqual(Compiled.parse(input), input));
                expect(isEqual(Compiled.parse(JSON.stringify(input)), input));
            } catch (err) {
                if (key === "object with optional fields") {
                    console.log("INPUT", input);
                    console.log(rawParser(input));
                }
                throw err;
            }
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
