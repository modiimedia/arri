import { a } from "../_index";
import { compileV2 } from "../compile";
import { testSuites } from "./testUtils";

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
    test(() => {
        const Compiled = compileV2(suite.schema);
        for (const input of suite.goodInputs) {
            const result = Compiled.safeParse(input);
            expect(result.success);
            expect(Compiled.safeParse(JSON.stringify(input)).success);
            if (result.success) {
                expect(result.value).toStrictEqual(
                    a.parse(suite.schema, result.value),
                );
            }
        }
        for (const input of suite.badInputs) {
            expect(!Compiled.safeParse(input).success);
            expect(!Compiled.safeParse(JSON.stringify(input)).success);
            expect(!a.safeParse(suite.schema, input).success);
        }
    });
}
