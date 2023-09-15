import { arriRequest } from "arri-client";
import { createRawJtdValidator } from "arri-validate";
import { type Serialize } from "nitropack";

interface ClientOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
}

async function main() {
    const blah = new Client();
    const user = await blah.users.getUser(new UserParams({ userId: "" }));
}

export class Client {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    users: ClientUsersService;

    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        this.users = new ClientUsersService(options);
    }

    getStatus() {
        return arriRequest<Serialize<GetStatusResponse>>({
            url: `${this.baseUrl}/status`,
            method: "get",
            headers: this.headers,
            params: undefined,
        });
    }
}

export class ClientUsersService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    settings: ClientUsersSettingsService;

    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        this.settings = new ClientUsersSettingsService(options);
    }

    getUser(params: UserParams) {
        return arriRequest<User>({
            url: `${this.baseUrl}/users/get-user`,
            method: "get",
            headers: this.headers,
            params,
        });
    }

    updateUser(params: UpdateUserParams) {
        return arriRequest<Serialize<User>>({
            url: `${this.baseUrl}/users/update-user`,
            method: "post",
            headers: this.headers,
            params,
        });
    }
}

export class ClientUsersSettingsService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
    }

    getUserSettings() {
        return arriRequest<undefined>({
            url: `${this.baseUrl}/users/settings/get-user-settings`,
            method: "get",
            headers: this.headers,
            params: undefined,
        });
    }
}

export interface GetStatusResponse {
    message: string;
}

class User {
    id: string;
    role: UserRole;
    photo: UserPhoto | null;
    createdAt: Date;
    numFollowers: number;
    settings: UserSettings;
    recentNotifications: Array<UserSettingsRecentNotificationsItem>;
    bookmarks: Record<string, UserBookmarksValue>;
    bio?: string;

    constructor(opts: {
        id: string;
        role: UserRole;
        photo: UserPhoto | null;
        createdAt: Date;
        numFollowers: number;
        settings: UserSettings;
        recentNotifications: Array<UserSettingsRecentNotificationsItem>;
        bookmarks: Record<string, UserBookmarksValue>;
        bio?: string;
    }) {
        this.id = opts.id;
        this.role = opts.role;
        this.photo = opts.photo;
        this.createdAt = opts.createdAt;
        this.numFollowers = opts.numFollowers;
        this.settings = opts.settings;
        this.recentNotifications = opts.recentNotifications;
        this.bookmarks = opts.bookmarks;
        this.bio = opts.bio;
    }

    toJson() {
        return _$UserValidator.serialize(this);
    }

    static fromJson(json: string) {
        return _$UserValidator.parse(json);
    }
}

const _$UserValidator = createRawJtdValidator<User>({
    properties: {
        id: {
            type: "string",
            metadata: {},
        },
        role: {
            enum: ["standard", "admin"],
            metadata: {},
        },
        photo: {
            properties: {
                url: {
                    type: "string",
                    metadata: {},
                },
                width: {
                    type: "float64",
                    metadata: {},
                },
                height: {
                    type: "float64",
                    metadata: {},
                },
            },
            nullable: true,
            metadata: {
                id: "UserPhoto",
            },
        },
        createdAt: {
            type: "timestamp",
            metadata: {},
        },
        numFollowers: {
            type: "int32",
            metadata: {},
        },
        settings: {
            properties: {
                notificationsEnabled: {
                    type: "boolean",
                    metadata: {},
                },
                preferredTheme: {
                    enum: ["dart-mode", "light-mode", "system"],
                    metadata: {},
                },
            },
            metadata: {
                id: "UserSettings",
            },
        },
        recentNotifications: {
            elements: {
                discriminator: "notificationType",
                mapping: {
                    POST_LIKE: {
                        properties: {
                            postId: {
                                type: "string",
                            },
                            userId: {
                                type: "string",
                            },
                        },
                    },
                    POST_COMMENT: {
                        properties: {
                            postId: {
                                type: "string",
                            },
                            userId: {
                                type: "string",
                            },
                            commentText: {
                                type: "string",
                            },
                        },
                    },
                },
                metadata: {},
            },
            metadata: {},
        },
        bookmarks: {
            values: {
                properties: {
                    postId: {
                        type: "string",
                    },
                    userId: {
                        type: "string",
                    },
                },
            },
            metadata: {},
        },
    },
    optionalProperties: {
        bio: {
            type: "string",
        },
    },
});

export type UserRole = "standard" | "admin";

export interface UserPhoto {
    url: string;
    width: number;
    height: number;
}
const _$UserPhotoValidator = createRawJtdValidator<UserPhoto>({
    properties: {
        url: {
            type: "string",
        },
        width: {
            type: "float64",
        },
        height: {
            type: "float64",
        },
    },
});

export interface UserSettings {
    notificationsEnabled: boolean;
    preferredTheme: UserSettingsPreferredTheme;
}
const _$UserSettingsValidator = createRawJtdValidator<UserSettings>({
    properties: {
        notificationsEnabled: {
            type: "boolean",
        },
        preferredTheme: {
            enum: ["dark-mode", "light-mode", "system"],
        },
    },
    metadata: {
        id: "UserSettings",
    },
});

export type UserSettingsPreferredTheme = "dark-mode" | "light-mode" | "system";

export type UserSettingsRecentNotificationsItem =
    | {
          notificationType: "POST_LIKE";
          postId: string;
          userId: string;
      }
    | {
          notificationType: "POST_COMMENT";
          postId: string;
          userId: string;
          commentText: string;
      };
const _$UserSettingsRecentNotificationsItemValidator = createRawJtdValidator({
    discriminator: "notificationType",
    mapping: {
        POST_LIKE: {
            properties: {
                postId: {
                    type: "string",
                },
                userId: {
                    type: "string",
                },
            },
        },
        POST_COMMENT: {
            properties: {
                postId: {
                    type: "string",
                },
                userId: {
                    type: "string",
                },
                commentText: {
                    type: "string",
                },
            },
        },
    },
});

export interface UserBookmarksValue {
    postId: string;
    userId: string;
}
const _$UserBookmarksValueValidator = createRawJtdValidator<UserBookmarksValue>(
    {
        properties: {
            postId: {
                type: "string",
            },
            userId: {
                type: "string",
            },
        },
    },
);

export class UserParams {
    userId: string;
    constructor(input: { userId: string }) {
        this.userId = input.userId;
    }

    toJson() {
        return _$UserParamsValidator.serialize(this);
    }

    static fromJson(json: string) {
        return _$UserParamsValidator.parse(json);
    }
}
const _$UserParamsValidator = createRawJtdValidator<UserParams>({
    properties: {
        userId: {
            type: "string",
        },
    },
});

export interface UpdateUserParams {
    id: string;
    photo: UserPhoto | null;
    bio?: string;
}
const _$UpdateUserParams = createRawJtdValidator<UpdateUserParams>({
    properties: {
        id: {
            type: "string",
        },
        photo: {
            properties: {
                url: {
                    type: "string",
                },
                width: {
                    type: "float64",
                },
                height: {
                    type: "float64",
                },
            },
            nullable: true,
        },
    },
    optionalProperties: {
        bio: {
            type: "string",
        },
    },
});

export interface ClientError {
    statusCode: number;
    statusMessage: string;
    data: any;
    stack: string | null;
}
const _$ClientErrorValidator = createRawJtdValidator<ClientError>({
    properties: {
        statusCode: {
            type: "float64",
        },
        statusMessage: {
            type: "string",
        },
        data: {},
        stack: {
            type: "string",
            nullable: true,
        },
    },
});
