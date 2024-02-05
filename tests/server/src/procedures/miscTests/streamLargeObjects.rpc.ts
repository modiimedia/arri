import { randomInt, randomUUID } from "node:crypto";
import { faker } from "@faker-js/faker";
import { defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

const StreamLargeObjectsResponse = a.object(
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
    { id: "StreamLargeObjectsResponse" },
);

type StreamLargeObjectResponse = a.infer<typeof StreamLargeObjectsResponse>;

export default defineEventStreamRpc({
    params: undefined,
    response: StreamLargeObjectsResponse,
    async handler({ params, connection }) {
        function randomResponse(): StreamLargeObjectResponse {
            const result: StreamLargeObjectResponse = {
                numbers: [],
                objects: [],
            };
            for (let i = 0; i < 10000; i++) {
                result.numbers.push(randomInt(100000));
                result.objects.push({
                    id: randomUUID(),
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                });
            }
            return result;
        }
        connection.start();
        await connection.push(randomResponse());
        const interval = setInterval(async () => {
            await connection.push(randomResponse());
        }, 500);
        connection.on("disconnect", () => {
            clearInterval(interval);
        });
    },
});
