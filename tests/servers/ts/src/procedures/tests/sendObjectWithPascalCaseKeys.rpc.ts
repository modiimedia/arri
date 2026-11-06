import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const ObjectWithPascalCaseKeys = a.object('ObjectWithPascalCaseKeys', {
    CreatedAt: a.timestamp(),
    DisplayName: a.string(),
    EmailAddress: a.optional(a.string()),
    PhoneNumber: a.nullable(a.string()),
    IsAdmin: a.optional(a.boolean()),
    ExternalEvent: a.nullable(
        a.union({
            UserCreated: a.object({
                UserId: a.string(),
            }),
            UserUpdated: a.object({
                UserId: a.string(),
            }),
            UserDeleted: a.object({
                UserId: a.string(),
            }),
        }),
    ),
    InternalEvent: a.union(
        {
            UserCreated: a.object({
                UserId: a.string(),
            }),
            UserUpdated: a.object({
                UserId: a.string(),
                UpdatedAt: a.optional(a.timestamp()),
            }),
        },
        { tagKey: 'EventType' },
    ),
    AdjacentEvent: a.union(
        {
            UserCreated: a.object({
                UserId: a.string(),
            }),
            UserUpdated: a.string(),
        },
        { tagKey: 'EventType', valueKey: 'EventData' },
    ),
});

export default defineRpc({
    params: ObjectWithPascalCaseKeys,
    response: ObjectWithPascalCaseKeys,
    handler({ params }) {
        return params;
    },
});
