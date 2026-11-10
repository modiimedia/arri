import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const ObjectWithSnakeCaseKeys = a.object('ObjectWithSnakeCaseKeys', {
    created_at: a.timestamp(),
    display_name: a.string(),
    email_address: a.optional(a.string()),
    phone_number: a.nullable(a.string()),
    is_admin: a.optional(a.boolean()),
    external_event: a.nullable(
        a.union({
            user_created: a.object({
                user_id: a.string(),
            }),
            user_updated: a.object({
                user_id: a.string(),
            }),
            user_deleted: a.object({
                user_id: a.string(),
            }),
        }),
    ),
    internal_event: a.union(
        {
            user_created: a.object({
                user_id: a.string(),
            }),
            user_updated: a.object({
                user_id: a.string(),
                updated_at: a.optional(a.timestamp()),
            }),
        },
        { tagKey: 'event_type' },
    ),
    adjacent_event: a.union(
        {
            user_created: a.object({
                user_id: a.string(),
            }),
            user_updated: a.string(),
        },
        { tagKey: 'event_type', valueKey: 'event_data' },
    ),
});

export default defineRpc({
    params: ObjectWithSnakeCaseKeys,
    response: ObjectWithSnakeCaseKeys,
    handler({ params }) {
        return params;
    },
});
