import { a } from "arri-validate";
import { type AppDefinition } from "./index";

export const TestUserSettingsSchema = a.object("UserSettings", {
    notificationsEnabled: a.boolean(),
    preferredTheme: a.stringEnum(["dark-mode", "light-mode", "system"], {
        isDeprecated: true,
    }),
});

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

export const TestUserNotificationSchema = a.discriminator(
    "UserNotification",
    "notificationType",
    {
        POST_LIKE: a.object({
            postId: a.string(),
            userId: a.string(),
        }),
        POST_COMMENT: a.object({
            postId: a.string(),
            userId: a.string(),
            commentText: a.string(),
        }),
    },
);

interface BinaryTree {
    left: BinaryTree | null;
    right: BinaryTree | null;
}

export const TestUserSchema = a.object("User", {
    id: a.string(),
    role: a.stringEnum(["standard", "admin"]),
    photo: a.nullable(TestUserPhotoSchema),
    createdAt: a.timestamp(),
    numFollowers: a.int32(),
    settings: TestUserSettingsSchema,
    lastNotification: a.nullable(TestUserNotificationSchema),
    recentNotifications: a.array(TestUserNotificationSchema),
    bookmarks: a.record(a.object({ postId: a.string(), userId: a.string() })),
    bio: a.optional(a.string()),
    metadata: a.record(a.any()),
    randomList: a.array(a.any()),
    binaryTree: a.recursive<BinaryTree>(
        (self) =>
            a.object({
                left: a.nullable(self),
                right: a.nullable(self),
            }),
        { id: "BinaryTree" },
    ),
});

export const TestUserParams = a.object("UserParams", {
    userId: a.string(),
});

export const TestUpdateUserParams = a.pick(
    TestUserSchema,
    ["id", "bio", "photo"],
    {
        id: "UpdateUserParams",
    },
);

export const TestAppDefinition: AppDefinition = {
    arriSchemaVersion: "0.0.4",
    info: {
        title: "Test App Client",
        description: "This is a example app definition",
        version: "11",
    },
    procedures: {
        getStatus: {
            transport: "http",
            path: "/status",
            method: "get",
            params: undefined,
            response: "GetStatusResponse",
        },
        "users.getUser": {
            transport: "http",
            path: "/users/get-user",
            method: "get",
            params: "UserParams",
            response: "User",
            description: "Get a user by id",
        },
        "users.updateUser": {
            transport: "http",
            path: "/users/update-user",
            method: "post",
            params: "UpdateUserParams",
            response: "User",
            description: "Update a user",
        },
        "users.watchUser": {
            transport: "http",
            path: "/users/watch-user",
            method: "get",
            params: "UserParams",
            response: "User",
            isEventStream: true,
            description: "Watch a user",
        },
        "users.createConnection": {
            transport: "ws",
            path: "/users/create-connection",
            params: "UserParams",
            response: "User",
        },
        "users.settings.getUserSettings": {
            transport: "http",
            path: "/users/settings/get-user-settings",
            method: "get",
            params: undefined,
            response: undefined,
            isDeprecated: true,
        },
    },
    models: {
        GetStatusResponse: a.object({
            message: a.string(),
        }),
        User: TestUserSchema,
        UserParams: TestUserParams,
        UpdateUserParams: TestUpdateUserParams,
    },
};
