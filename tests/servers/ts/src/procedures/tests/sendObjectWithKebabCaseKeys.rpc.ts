import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const ObjectWithSnakeCaseKeys = a.object('ObjectWithKebabCaseKeys', {
    'created-at': a.timestamp(),
    'display-name': a.string(),
    'email-address': a.optional(a.string()),
    'phone-number': a.nullable(a.string()),
    'is-admin': a.optional(a.boolean()),
    'last-event': a.nullable(
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
});

export default defineRpc({
    params: ObjectWithSnakeCaseKeys,
    response: ObjectWithSnakeCaseKeys,
    handler({ params }) {
        return params;
    },
});
