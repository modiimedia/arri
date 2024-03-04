import { randomInt, randomUUID } from "crypto";
import { faker } from "@faker-js/faker";
import { defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

export const StreamLargeObjectsResponse = a.object(
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
    {
        id: "StreamLargeObjectsResponse",
    },
);

export type StreamLargeObjectsResponse = a.infer<
    typeof StreamLargeObjectsResponse
>;

export default defineEventStreamRpc({
    params: undefined,
    response: StreamLargeObjectsResponse,
    async handler({ stream }) {
        function randomResponse(): StreamLargeObjectsResponse {
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
        stream.send();
        await stream.push(randomResponse());

        const interval = setInterval(async () => {
            await stream.push(randomResponse());
        });
        stream.onClose(() => {
            clearInterval(interval);
        });
    },
});
