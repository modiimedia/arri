import { RuleTester } from "eslint";
import noAnonymousEnumerator from "./no-anonymous-enumerator";

const tester = new RuleTester();

tester.run("no-anonymous-enumerator", noAnonymousEnumerator, {
    valid: [
        {
            code: `
const MyEnum = a.enumerator(
    ["A", "B", "C"],
    { id: "MyEnum" }
);
const MyStringEnum = a.stringEnum(
    ["A", "B", "C"],
    { id: "MyStringEnum" }
);`,
        },
        {
            code: `
const MyEnum = a.enumerator("MyEnum", ["A", "B", "C"]);
const MyStringEnum = a.stringEnum("MyStringEnum", ["A", "B", "C"])`,
        },
    ],
    invalid: [
        {
            code: `
const MyEnum = a.enumerator(["A", "B", "C"]);
const MyStringEnum = a.stringEnum(["A", "B", "C"]);`,
            errors: [
                {
                    message: "enum schemas must specify an id",
                },
                {
                    message: "enum schemas must specify an id",
                },
            ],
        },
    ],
});
