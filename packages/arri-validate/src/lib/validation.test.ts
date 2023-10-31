import { isEqual } from "lodash";
import { a } from "../_index";
import { parsingTestSuites, validationTestSuites } from "../testSuites";

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key];
    test(key, () => {
        for (const input of suite.goodInputs) {
            expect(a.validate(suite.schema, input));
            const json = a.serialize(suite.schema, input);
            expect(isEqual(a.parse(suite.schema, json), input));
        }
        for (const input of suite.badInputs) {
            expect(!a.validate(suite.schema, input));
            expect(!a.safeParse(suite.schema, input).success);
        }
    });
}

describe("parsing test suites", () => {
    for (const key of Object.keys(parsingTestSuites)) {
        const suite = parsingTestSuites[key];
        test(key, () => {
            for (let i = 0; i < suite.goodInputs.length; i++) {
                const input = suite.goodInputs[i];
                const expectedResult = suite.expectedResults[i];
                expect(isEqual(a.parse(suite.schema, input), expectedResult));
            }
            for (const input of suite.badInputs) {
                expect(!a.safeParse(suite.schema, input).success);
            }
        });
    }
});
