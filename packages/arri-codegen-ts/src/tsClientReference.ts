import { arriRequest } from "arri-client";
import { createRawJtdValidator } from "arri-validate";

interface ClientOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
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
        return arriRequest<GetStatusResponse, undefined>({
            url: `${this.baseUrl}/status`,
            method: "get",
            headers: this.headers,
            params: undefined,
            parser: _$GetStatusResponseValidator.parse,
            serializer: (_) => {},
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
        return arriRequest<User, UserParams>({
            url: `${this.baseUrl}/users/get-user`,
            method: "get",
            headers: this.headers,
            params,
            parser: _$UserValidator.parse,
            serializer: _$UserParamsValidator.serialize,
        });
    }

    updateUser(params: UpdateUserParams) {
        return arriRequest<User, UpdateUserParams>({
            url: `${this.baseUrl}/users/update-user`,
            method: "post",
            headers: this.headers,
            params,
            parser: _$UserValidator.parse,
            serializer: _$UpdateUserParamsValidator.serialize,
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
        return arriRequest<undefined, undefined>({
            url: `${this.baseUrl}/users/settings/get-user-settings`,
            method: "get",
            headers: this.headers,
            params: undefined,
            parser: (_) => {},
            serializer: (_) => {},
        });
    }
}

export interface GetStatusResponse {
    message: string;
}
const _$GetStatusResponseValidator = createRawJtdValidator<GetStatusResponse>({
    properties: {
        message: {
            type: "string",
        },
    },
});

interface User {
    id: string;
    role: UserRole;
    photo: UserPhoto | null;
    createdAt: Date;
    numFollowers: number;
    settings: UserSettings;
    recentNotifications: Array<UserSettingsRecentNotificationsItem>;
    bookmarks: Record<string, UserBookmarksValue>;
    bio?: string;
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

export interface UserSettings {
    notificationsEnabled: boolean;
    preferredTheme: UserSettingsPreferredTheme;
}

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

export interface UserBookmarksValue {
    postId: string;
    userId: string;
}

export interface UserParams {
    userId: string;
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
const _$UpdateUserParamsValidator = createRawJtdValidator<UpdateUserParams>({
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
