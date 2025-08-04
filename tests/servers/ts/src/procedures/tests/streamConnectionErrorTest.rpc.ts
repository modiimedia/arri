import { a } from '@arrirpc/schema';
import { defineError, defineOutputStreamRpc } from '@arrirpc/server';

export default defineOutputStreamRpc({
    description:
        'This route will always return an error. The client should automatically retry with exponential backoff.',
    input: a.object('StreamConnectionErrorTestParams', {
        statusCode: a.int32(),
        statusMessage: a.string(),
    }),
    output: a.object('StreamConnectionErrorTestResponse', {
        message: a.string(),
    }),
    async handler({ input }) {
        throw defineError(input.statusCode, {
            message: input.statusMessage,
        });
    },
});
