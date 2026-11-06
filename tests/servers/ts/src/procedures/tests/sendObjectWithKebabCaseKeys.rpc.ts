import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const ObjectWithKebabCaseKeys = a.object('ObjectWithKebabCaseKeys', {
    'created-at': a.timestamp(),
    'display-name': a.string(),
    'email-address': a.optional(a.string()),
    'phone-number': a.nullable(a.string()),
    'is-admin': a.optional(a.boolean()),
    'external-event': a.nullable(
        a.union({
            'user-created': a.object({
                'user-id': a.string(),
            }),
            'user-updated': a.object({
                'user-id': a.string(),
            }),
            'user-deleted': a.object({
                'user-id': a.string(),
            }),
        }),
    ),
    'internal-event': a.union(
        {
            'user-created': a.object({
                'user-id': a.string(),
            }),
            'user-updated': a.object({
                'user-id': a.string(),
                'updated-at': a.optional(a.timestamp()),
            }),
        },
        { tagKey: 'event-type' },
    ),
    'adjacent-event': a.union(
        {
            'user-created': a.object({
                'user-id': a.string(),
            }),
            'user-updated': a.string(),
        },
        { tagKey: 'event-type', valueKey: 'event-data' },
    ),
});

export default defineRpc({
    params: ObjectWithKebabCaseKeys,
    response: ObjectWithKebabCaseKeys,
    handler({ params }) {
        return params;
    },
});
