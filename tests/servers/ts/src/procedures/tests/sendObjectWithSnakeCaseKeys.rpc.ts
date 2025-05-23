import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server-next';

const ObjectWithSnakeCaseKeys = a.object('ObjectWithSnakeCaseKeys', {
    created_at: a.timestamp(),
    display_name: a.string(),
    email_address: a.optional(a.string()),
    phone_number: a.nullable(a.string()),
    is_admin: a.optional(a.boolean()),
});

export default defineRpc({
    params: ObjectWithSnakeCaseKeys,
    response: ObjectWithSnakeCaseKeys,
    handler({ params }) {
        return params;
    },
});
