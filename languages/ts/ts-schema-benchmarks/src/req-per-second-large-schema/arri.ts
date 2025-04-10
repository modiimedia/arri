import { a } from '@arrirpc/schema';

import { createServer } from './_server';

const SmallUserSchema = a.object({
    id: a.string(),
    name: a.string(),
    email: a.nullable(a.string()),
    array: a.array(a.number()),
    object: a.object({
        foo: a.boolean(),
        bar: a.nullable(a.string()),
    }),
});

const $$SmallUserSchema = a.compile(SmallUserSchema);

export default createServer($$SmallUserSchema.parseUnsafe);
