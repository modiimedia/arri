import 'node:fs';

// eslint-disable-next-line arri/prefer-modular-imports
import { a, boolean, string } from '@arrirpc/schema';

// eslint-disable-next-line arri/no-anonymous-object
const ObjectSchema = a.object({
    a: a.string(),
    b: a.string(),
    c: a.object({
        id: a.string(),
        name: a.string(),
    }),
});

// eslint-disable-next-line arri/no-anonymous-object
a.pick(ObjectSchema, ['a', 'c']);

// eslint-disable-next-line arri/no-anonymous-object
a.extend(ObjectSchema, a.object({ d: a.number() }));

// eslint-disable-next-line arri/no-anonymous-discriminator
a.discriminator('type', {
    A: a.object({
        a: a.string(),
    }),
    B: a.object({
        a: a.string(),
        b: a.string(),
    }),
});

console.log('blah', boolean, string);

// eslint-disable-next-line arri/no-anonymous-recursive
a.recursive((self) =>
    a.object({
        left: a.nullable(self),
        right: a.nullable(self),
    }),
);

// eslint-disable-next-line arri/no-anonymous-recursive
a.recursive((self) =>
    a.discriminator('type', {
        TEXT: a.object({
            data: a.string(),
        }),
        CHILD: a.object({
            data: self,
        }),
        CHILDREN: a.object({
            data: a.array(self),
        }),
    }),
);

// eslint-disable-next-line arri/no-anonymous-enumerator
a.enumerator(['A', 'B', 'C']);
