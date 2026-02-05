import { a } from '@arrirpc/schema';
import { defineOutputStreamRpc } from '@arrirpc/server';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';

export const ChatMessageParams = a.object('ChatMessageParams', {
    channelId: a.string(),
});

const ChatMessageBase = a.object({
    id: a.string(),
    channelId: a.string(),
    userId: a.string(),
    date: a.timestamp(),
});

export const ChatMessage = a.discriminator('ChatMessage', 'messageType', {
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
});

export type ChatMessage = a.infer<typeof ChatMessage>;

export default defineOutputStreamRpc({
    input: ChatMessageParams,
    output: ChatMessage,
    handler({ input, stream }) {
        const randomItem = (): ChatMessage => {
            const userId = randomUUID();
            const now = new Date();
            const type = faker.helpers.arrayElement([
                'TEXT',
                'IMAGE',
                'URL',
            ] as const);
            switch (type) {
                case 'TEXT':
                    return {
                        id: randomUUID(),
                        messageType: 'TEXT',
                        userId,
                        channelId: input.channelId,
                        date: now,
                        text: faker.lorem.words(),
                    };
                case 'IMAGE':
                    return {
                        id: randomUUID(),
                        messageType: 'IMAGE',
                        channelId: input.channelId,
                        userId,
                        date: now,
                        image: faker.image.url(),
                    };
                case 'URL':
                    return {
                        id: randomUUID(),
                        messageType: 'URL',
                        channelId: input.channelId,
                        userId,
                        date: now,
                        url: faker.internet.url(),
                    };
            }
        };
        const interval = setInterval(async () => {
            await stream.push(randomItem());
        });

        stream.onClosed(async () => {
            clearInterval(interval);
        });
        stream.start();
    },
});
