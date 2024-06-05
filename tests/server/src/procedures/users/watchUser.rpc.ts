import { a } from "@arrirpc/schema";
import { defineEventStreamRpc } from "@arrirpc/server";
import { randomUUID } from "crypto";

export const TestUserSettingsSchema = a.object(
    {
        notificationsEnabled: a.boolean(),
        preferredTheme: a.stringEnum(["dark-mode", "light-mode", "system"]),
    },
    {
        id: "UserSettings",
    },
);

export const TestUserPhotoSchema = a.object(
    {
        url: a.string(),
        width: a.number(),
        height: a.number(),
        bytes: a.int64(),
        nanoseconds: a.uint64({
            description: "When the photo was last updated in nanoseconds",
        }),
    },
    { id: "UserPhoto", description: "A profile picture" },
);

const TestUser = a.object({
    id: a.string(),
    role: a.stringEnum(["standard", "admin"]),
    photo: a.nullable(TestUserPhotoSchema),
    createdAt: a.timestamp(),
    numFollowers: a.int32(),
    settings: TestUserSettingsSchema,
    recentNotifications: a.array(
        a.discriminator("notificationType", {
            POST_LIKE: a.object({
                postId: a.string(),
                userId: a.string(),
            }),
            POST_COMMENT: a.object({
                postId: a.string(),
                userId: a.string(),
                commentText: a.string(),
            }),
        }),
    ),
    bookmarks: a.record(a.object({ postId: a.string(), userId: a.string() })),
    bio: a.optional(a.string()),
    metadata: a.record(a.any()),
    randomList: a.array(a.any()),
});

export type TestUser = a.infer<typeof TestUser>;

export default defineEventStreamRpc({
    params: a.object({
        userId: a.string(),
    }),
    response: TestUser,
    async handler({ params, connection }) {
        connection.start();
        const user: TestUser = {
            id: params.userId,
            role: "standard",
            photo: null,
            createdAt: new Date(),
            numFollowers: 0,
            settings: {
                notificationsEnabled: false,
                preferredTheme: "dark-mode",
            },
            recentNotifications: [],
            bookmarks: {},
            bio: "Hello world",
            metadata: {},
            randomList: [],
        };
        await connection.push(user, randomUUID());
        let count = 1;

        const interval = setInterval(async () => {
            await connection.push(user, randomUUID());
            count++;
            if (count >= 10) {
                await connection.end();
            }
        }, 500);
        connection.on("disconnect", () => {
            clearInterval(interval);
        });
    },
});
