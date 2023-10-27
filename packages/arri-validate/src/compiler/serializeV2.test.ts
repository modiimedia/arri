import { a, isAScalarSchema, isAStringEnumSchema } from "../_index";
import { compile } from "../compile";
import { testSuites } from "../testSuites";

for (const key of Object.keys(testSuites)) {
    const suite = testSuites[key];
    const Compiled = compile(suite.schema);
    for (const input of suite.goodInputs) {
        test(key, () => {
            const result = Compiled.serializeV2(input);
            expect(typeof result === "string");
            if (
                !isAScalarSchema(suite.schema) &&
                !isAStringEnumSchema(suite.schema)
            ) {
                try {
                    JSON.parse(result);
                } catch (err) {
                    console.log(result);
                    throw err;
                }
            }
            expect(a.safeParse(suite.schema, result).success);
        });
    }
}
