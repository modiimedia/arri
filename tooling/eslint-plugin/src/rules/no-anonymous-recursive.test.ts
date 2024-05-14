import { RuleTester } from "eslint";
import noAnonymousRecursive from "./no-anonymous-recursive";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2022 } });

tester.run("no-anonymous-recursive", noAnonymousRecursive, {
    valid: [
        {
            code: `
const BinaryTree = a.recursive(
    (self) => a.object({
        left: a.nullable(self),
        right: a.nullable(self),
    }),
    {
        id: "BinaryTree"
    }
)
const NestedRecursive = a.recursive(
    (selfA) => a.object({
        typeA: a.nullable(selfA),
        typeB: a.recursive((selfB) =>
            a.object({
                data: a.nullable(selfB)
            }),
            {
                id: "RecursiveTypeB"
            }
        )
    }),
    {
        id: "RecursiveTypeA"
    }
)
`,
        },
        {
            code: `
const BinaryTree = a.recursive(
    "BinaryTree",
    (self) => a.object({
        left: a.nullable(self),
        right: a.nullable(self),
    }),
)`,
        },
    ],
    invalid: [
        {
            code: `
const BinaryTree = a.recursive((self) => a.object({
    left: a.nullable(self),
    right: a.nullable(self),
}))

const RecursiveTypeA = a.recursive(
    (selfA) =>
        a.object({
            typeA: a.nullable(selfA),
            typeB: a.recursive(
                (selfB) => a.object({ data: a.nullable(selfB) })
            )
        })
    )`,
            errors: [
                {
                    message: "recursive schemas must specify an id",
                },
                {
                    message: "recursive schemas must specify an id",
                },
                {
                    message: "recursive schemas must specify an id",
                },
            ],
        },
    ],
});
