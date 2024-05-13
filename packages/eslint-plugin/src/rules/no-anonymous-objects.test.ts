import { RuleTester } from "eslint";
import noAnonymousObjects from "./no-anonymous-objects";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

tester.run("no-anonymous-objects", noAnonymousObjects, {
    valid: [
        {
            code: `
const MyObject = a.object({ id: a.string(), name: a.string() }, { id: "MyObject" });
const MyEnum = a.enumerator(["A", "B", "C"], { id: "MyEnum" });
const Shape = a.discriminator(
    "type",
    {
        SQUARE: a.object(
            {
                width: a.float64(),
                height: a.float64(),
            },
            {
                id: "Square"
            }
        ),
        CIRCLE: a.object(
            {
                radius: a.float64(),
            },
            {
                id: "Circle",
            }
        )
    },
    {
        id: "Shape",
    }
);
`,
        },
        {
            code: `const MyObject = a.object("MyObject", { id: a.string(), name: a.string() })`,
        },
    ],
    invalid: [
        {
            code: `
const MyObject = a.object({ id: a.string(), name: a.string() });
const MyEnum = a.enumerator(["A", "B", "C"]);
const Shape = a.discriminator(
    "type",
    {
        SQUARE: a.object({
                width: a.float64(),
                height: a.float64(),
        }),
        CIRCLE: a.object(
            {
                radius: a.float64(),
            }
        )
    }
);
`,
            errors: [
                {
                    message: "a.object() should specify an id",
                },
                {
                    message: "a.enumerator() should specify an id",
                },
                {
                    message: "a.discriminator() should specify an id",
                },
                {
                    message: "a.object() should specify an id",
                },
                {
                    message: "a.object() should specify an id",
                },
            ],
        },
    ],
});
