import { a } from '@arrirpc/schema';
import { defineError, defineRpc } from '@arrirpc/server';

export default defineRpc({
    input: a.object('SendErrorParams', {
        code: a.uint16(),
        message: a.string(),
    }),
    output: undefined,
    handler({ input }) {
        throw defineError(input.code, { message: input.message });
    },
});
