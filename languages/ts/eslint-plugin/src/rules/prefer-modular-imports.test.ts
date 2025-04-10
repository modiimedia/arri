import { RuleTester } from 'eslint';

import preferModularImports from './prefer-modular-imports';

const tester = new RuleTester();

tester.run('prefer-modular-imports', preferModularImports, {
    valid: [
        {
            code: `
import * as a from '@arrirpc/schema';
import { string, boolean, object } from '@arrirpc/schema';

const User = a.object({
    foo: a.string(),
    bar: a.boolean(),
});

const User2 = object({
    foo: string(),
    bar: boolean(),
});`,
        },
    ],
    invalid: [
        {
            code: `import { a } from '@arrirpc/schema';

const User = a.object({
    foo: a.string(),
});`,
            output: `import * as a from '@arrirpc/schema';

const User = a.object({
    foo: a.string(),
});`,
            errors: [
                {
                    message: "use Arri's modular import syntax instead",
                },
            ],
        },
        {
            code: `import fs from 'node:fs';
import { a, object, string, boolean } from '@arrirpc/schema';

const User = a.object({
    foo: a.string(),
    bar: a.boolean(),
});
const User2 = object({
    foo: string(),
    bar: boolean(),
});`,
            output: `import fs from 'node:fs';
import * as a from '@arrirpc/schema';
import { object, string, boolean } from '@arrirpc/schema';

const User = a.object({
    foo: a.string(),
    bar: a.boolean(),
});
const User2 = object({
    foo: string(),
    bar: boolean(),
});`,
            errors: [
                {
                    message: "use Arri's modular import syntax instead",
                },
            ],
        },
    ],
});
