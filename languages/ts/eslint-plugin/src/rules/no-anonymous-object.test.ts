import { RuleTester } from 'eslint';

import noAnonymousObject from './no-anonymous-object';

const tester = new RuleTester();

tester.run('no-anonymous-object', noAnonymousObject, {
    valid: [
        {
            code: `
const MyObject = a.object(
    { id: a.string(), name: a.string() },
    { id: "MyObject" },
);
const BinaryTree = a.recursive(
    (self) => a.object({
        left: a.nullable(self),
        right: a.nullable(self),
    })
);`,
        },
        {
            code: `
const MyObject = a.object("MyObject", { id: a.string(), name: a.string() });`,
        },
        {
            code: `
const PartialObject = a.partial(
    a.object({ id: a.string(), }),
    { id: "PartialObject" }
);
const ExtendedObject = a.extend(
    a.object({ id: a.string() }),
    a.object({ name: a.string() }),
    { id: "ExtendedObject" }
);
const PickedObject = a.pick(
    a.object({ id: a.string(), name: a.string() }),
    ["id"],
    { id: "PickedObject" }
);`,
        },
    ],
    invalid: [
        {
            code: `
const MyObject = a.object({ id: a.string(), name: a.string() });
const PartialObject = a.partial(a.object({ id: a.string(), name: a.string() }));
const ExtendedObject = a.extend(
    a.object({ id: a.string() }),
    a.object({ name: a.string() })
);
const PickedObject = a.pick(
    a.object({ id: a.string(), name: a.string() }),
    ["id"]
);
`,
            errors: [
                {
                    message: 'root object schemas should specify an id',
                },
                {
                    message: 'root object schemas should specify an id',
                },
                {
                    message: 'root object schemas should specify an id',
                },
                {
                    message: 'root object schemas should specify an id',
                },
            ],
        },
    ],
});
