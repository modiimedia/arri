import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const ObjectWithPascalCaseKeys = a.object('ObjectWithPascalCaseKeys', {
    CreatedAt: a.timestamp(),
    DisplayName: a.string(),
    EmailAddress: a.optional(a.string()),
    PhoneNumber: a.nullable(a.string()),
    IsAdmin: a.optional(a.boolean()),
});

export default defineRpc({
    input: ObjectWithPascalCaseKeys,
    output: ObjectWithPascalCaseKeys,
    handler({ input }) {
        return input;
    },
});
