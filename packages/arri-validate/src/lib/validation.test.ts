import { isEqual } from "lodash";
import { a } from "../_index";
import { testSuites } from "../testSuites";

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
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
