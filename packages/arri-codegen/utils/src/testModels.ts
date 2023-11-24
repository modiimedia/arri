import { a } from "arri-validate";
import { type AppDefinition } from "./index";

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

export const TestUserSchema = a.object(
    {
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
        bookmarks: a.record(
            a.object({ postId: a.string(), userId: a.string() }),
        ),
        bio: a.optional(a.string()),
        metadata: a.record(a.any()),
        randomList: a.array(a.any()),
    },
    { id: "User" },
);

export const TestUserParams = a.object(
    {
        userId: a.string(),
    },
    { id: "UserParams" },
);

export const TestUpdateUserParams = a.pick(
    TestUserSchema,
    ["id", "bio", "photo"],
    {
        id: "UpdateUserParams",
    },
);

export const TestErrorResponse = a.object({
    statusCode: a.int8(),
    statusMessage: a.string(),
    data: a.any(),
    stack: a.nullable(a.string()),
});

export const TestUserNotification = a.discriminator(
    "type",
    {
        USER_CREATED: a.object({
            userId: a.string(),
            createdAt: a.timestamp(),
        }),
        USER_DELETED: a.object({
            userId: a.string(),
            createdAt: a.timestamp(),
            deletedAt: a.timestamp(),
            deletionReason: a.string(),
        }),
        USER_UPDATED: a.object({
            userId: a.string(),
            createdAt: a.timestamp(),
            updatedAt: a.timestamp(),
        }),
    },
    { id: "UserNotification" },
);

export const TestAppDefinition: AppDefinition = {
    arriSchemaVersion: "0.0.2",
    info: {
        title: "Test App Client",
        description: "This is a example app definition",
        version: "11",
    },
    procedures: {
        getStatus: {
            type: "http",
            path: "/status",
            method: "get",
            params: undefined,
            response: "GetStatusResponse",
        },
        "users.getUser": {
            type: "http",
            description: "Get a user by id",
            path: "/users/get-user",
            method: "get",
            params: "UserParams",
            response: "User",
        },
        "users.updateUser": {
            type: "http",
            description: "Update a user",
            path: "/users/update-user",
            method: "post",
            params: "UpdateUserParams",
            response: "User",
        },
        "users.settings.getUserSettings": {
            type: "http",
            path: "/users/settings/get-user-settings",
            method: "get",
            params: undefined,
            response: undefined,
        },
        "users.subscribeToNotifications": {
            type: "sse",
            path: "/notifications/subscribe-to-notifications",
            method: "get",
            params: undefined,
            response: "UserNotification",
        },
    },
    models: {
        GetStatusResponse: a.object({
            message: a.string(),
        }),
        User: TestUserSchema,
        UserParams: TestUserParams,
        UpdateUserParams: TestUpdateUserParams,
        UserNotification: TestUserNotification,
    },
};
