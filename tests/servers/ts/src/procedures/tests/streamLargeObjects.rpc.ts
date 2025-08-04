import { a } from '@arrirpc/schema';
import { defineOutputStreamRpc } from '@arrirpc/server';
import { faker } from '@faker-js/faker';
import { randomInt, randomUUID } from 'crypto';

export const StreamLargeObjectsResponse = a.object(
    'StreamLargeObjectsResponse',
    {
        numbers: a.array(a.number()),
        objects: a.array(
            a.object({
                id: a.string(),
                name: a.string(),
                email: a.string(),
            }),
        ),
    },
);

export type StreamLargeObjectsResponse = a.infer<
    typeof StreamLargeObjectsResponse
>;

export default defineOutputStreamRpc({
    description:
        'Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message',
    input: undefined,
    output: StreamLargeObjectsResponse,
    async handler({ stream }) {
        stream.send();
        await stream.push(randomLargeObjectResponse());
        const interval = setInterval(async () => {
            await stream.push(randomLargeObjectResponse());
        });
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});

export function randomLargeObjectResponse(): StreamLargeObjectsResponse {
    const result: StreamLargeObjectsResponse = {
        numbers: [],
        objects: [],
    };
    for (let i = 0; i < 10000; i++) {
        result.numbers.push(randomInt(10000));
        result.objects.push({
            id: randomUUID(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
        });
    }
    return result;
}
