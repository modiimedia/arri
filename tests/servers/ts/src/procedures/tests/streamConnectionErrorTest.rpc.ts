import { a } from '@arrirpc/schema';
import { defineError, defineEventStreamRpc } from '@arrirpc/server-next';

export default defineEventStreamRpc({
    description:
        'This route will always return an error. The client should automatically retry with exponential backoff.',
    params: a.object('StreamConnectionErrorTestParams', {
        statusCode: a.int32(),
        statusMessage: a.string(),
    }),
    response: a.object('StreamConnectionErrorTestResponse', {
        message: a.string(),
    }),
    async handler({ params }) {
        throw defineError(params.statusCode, {
            message: params.statusMessage,
        });
    },
});
