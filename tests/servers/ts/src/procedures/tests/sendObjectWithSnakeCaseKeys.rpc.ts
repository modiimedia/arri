import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

const ObjectWithSnakeCaseKeys = a.object('ObjectWithSnakeCaseKeys', {
    created_at: a.timestamp(),
    display_name: a.string(),
    email_address: a.optional(a.string()),
    phone_number: a.nullable(a.string()),
    is_admin: a.optional(a.boolean()),
    last_event: a.nullable(
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
});

export default defineRpc({
    params: ObjectWithSnakeCaseKeys,
    response: ObjectWithSnakeCaseKeys,
    handler({ params }) {
        return params;
    },
});
