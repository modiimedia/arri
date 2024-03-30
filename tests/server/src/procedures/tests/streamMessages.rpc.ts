import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";
import { defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

export const ChatMessageParams = a.object(
    {
        channelId: a.string(),
    },
    { id: "ChatMessageParams" },
);

const ChatMessageBase = a.object({
    id: a.string(),
    channelId: a.string(),
    userId: a.string(),
    date: a.timestamp(),
});

export const ChatMessage = a.discriminator(
    "messageType",
    {
        TEXT: a.extend(
            ChatMessageBase,
            a.object({
                text: a.string(),
            }),
        ),
        IMAGE: a.extend(
            ChatMessageBase,
            a.object({
                image: a.string(),
            }),
        ),
        URL: a.extend(
            ChatMessageBase,
            a.object({
                url: a.string(),
            }),
        ),
    },
    { id: "ChatMessage" },
);

export type ChatMessage = a.infer<typeof ChatMessage>;

export default defineEventStreamRpc({
    params: ChatMessageParams,
    response: ChatMessage,
    handler({ params, stream }) {
        const randomItem = (): ChatMessage => {
            const userId = randomUUID();
            const now = new Date();
            const type = faker.helpers.arrayElement([
                "TEXT",
                "IMAGE",
                "URL",
            ] as const);
            switch (type) {
                case "TEXT":
                    return {
                        id: randomUUID(),
                        messageType: "TEXT",
                        userId,
                        channelId: params.channelId,
                        date: now,
                        text: faker.lorem.words(),
                    };
                case "IMAGE":
                    return {
                        id: randomUUID(),
                        messageType: "IMAGE",
                        channelId: params.channelId,
                        userId,
                        date: now,
                        image: faker.image.url(),
                    };
                case "URL":
                    return {
                        id: randomUUID(),
                        messageType: "URL",
                        channelId: params.channelId,
                        userId,
                        date: now,
                        url: faker.internet.url(),
                    };
            }
        };
        const interval = setInterval(async () => {
            await stream.push(randomItem());
        });

        stream.onClose(async () => {
            clearInterval(interval);
        });
        stream.send();
    },
});
