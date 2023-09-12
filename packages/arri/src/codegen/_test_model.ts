import { type AppDefinition } from "packages/arri-codegen-utils/dist";
import { a } from "packages/arri-validate/dist";
import { ErrorResponse } from "../errors";

const UserSettings = a.object(
    {
        notificationsEnabled: a.boolean(),
        preferredTheme: a.stringEnum(["dark-mode", "light-mode", "system"]),
    },
    {
        id: "UserSettings",
    },
);

const User = a.object(
    {
        id: a.string(),
        role: a.stringEnum(["standard", "admin"]),
        photo: a.nullable(
            a.object({
                url: a.string(),
                width: a.number(),
                height: a.number(),
            }),
        ),
        createdAt: a.timestamp(),
        numFollowers: a.int32(),
        settings: UserSettings,
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
    },
    { id: "User" },
);

const UserParams = a.object(
    {
        userId: a.string(),
    },
    { id: "UserParams" },
);

const UpdateUserParams = a.pick(User, ["id", "bio"], {
    id: "UpdateUserParams",
});

export const TestService: AppDefinition = {
    arriSchemaVersion: "0.0.2",
    procedures: {
        getStatus: {
            path: "/status",
            method: "get",
            params: undefined,
            response: "GetStatusResponse",
        },
        "users.getUser": {
            path: "/users/get-user",
            method: "get",
            params: "UserParams",
            response: "User",
        },
        "users.updateUser": {
            path: "/users/update-user",
            method: "post",
            params: "UpdateUserParams",
            response: "User",
        },
    },
    models: {
        GetStatusResponse: a.object({
            message: a.string(),
        }),
        User,
        UserParams,
        UpdateUserParams,
    },
    errors: ErrorResponse,
};
