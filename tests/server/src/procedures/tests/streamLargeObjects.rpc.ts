import { randomInt, randomUUID } from "crypto";
import { faker } from "@faker-js/faker";
import { defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

export const StreamLargeObjectsResponse = a.object(
    "StreamLargeObjectsResponse",
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

export default defineEventStreamRpc({
    description:
        "Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message",
    params: undefined,
    response: StreamLargeObjectsResponse,
    async handler({ stream }) {
        stream.send();
        await stream.push(randomLargeObjectResponse());

        const interval = setInterval(async () => {
            await stream.push(randomLargeObjectResponse());
        });
        stream.onClose(() => {
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
