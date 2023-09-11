import { writeFileSync } from "fs";
import {
    createTypescriptClient,
    tsModelFromDefinition,
    tsServiceFromServiceDefinition,
} from "./typescript";
import {
    type ServiceDef,
    normalizeWhitespace,
    type ApplicationDef,
} from "./utils";
import { a } from "packages/arri-validate/dist";

describe("generateService", () => {
    test("Basic Service", () => {
        const input: ServiceDef = {
            getUser: {
                description: "Fetches the user by id",
                path: "/users/get-user",
                method: "get",
                params: undefined,
                response: undefined,
            },
            updateUser: {
                description: "Updates the user by id",
                path: "/users/update-user",
                method: "post",
                params: "User",
                response: "User",
            },
            comments: {
                getUserComments: {
                    path: "/users/comments/get-user-comments",
                    method: "get",
                    params: "UsersCommentsGetUserCommentsParams",
                    response: "UsersCommentsGetUserCommentsResponse",
                },
            },
        };
        const result = tsServiceFromServiceDefinition("UsersService", input);
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`
        export class UsersService {
            private baseUrl: string;
            private headers: Record<string, string>;
            comments: UsersCommentsService;
            constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
                this.baseUrl = opts.baseUrl ?? "";
                this.headers = opts.headers ?? {};
                this.comments = new UsersCommentsService(opts);
            }
            async getUser() {
                return arriRequest<undefined>({
                    url: \`\${this.baseUrl}/users/get-user\`,
                    method: 'get',
                    headers: this.headers,
                });
            }
            async updateUser(params: User) {
                return arriRequest<User>({
                    url: \`\${this.baseUrl}/users/update-user\`,
                    method: 'post',
                    params,
                    headers: this.headers,
                });
            }
        }
        export class UsersCommentsService {
            private baseUrl: string;
            private headers: Record<string, string>;
            constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
                this.baseUrl = opts.baseUrl ?? "";
                this.headers = opts.headers ?? {};
            }
            async getUserComments(params: UsersCommentsGetUserCommentsParams) {
                return arriRequest<UsersCommentsGetUserCommentsResponse>({
                    url: \`\${this.baseUrl}/users/comments/get-user-comments\`,
                    method: 'get',
                    params,
                    headers: this.headers,
                });
            }
        }`),
        );
    });
});

describe("Generate Models", () => {
    test("basicModel", () => {
        const input = a.object({
            id: a.string(),
            email: a.optional(a.string()),
            createdAt: a.timestamp(),
            updatedAt: a.number(),
            avgSessionTime: a.int32(),
            role: a.stringEnum(["standard", "admin"]),
            isPrivate: a.boolean(),
            recentFollows: a.array(a.string()),
            preferences: a.object({
                darkMode: a.boolean(),
                colorScheme: a.stringEnum(["red", "blue", "green"]),
            }),
            favoriteFoods: a.array(
                a.object({
                    id: a.string(),
                    name: a.string(),
                }),
            ),
            miscData: a.record(a.any()),
        });
        const result = tsModelFromDefinition("User", input as any);
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`
        export interface User {
            id: string;
            email?: string;
            createdAt: Date;
            updatedAt: number;
            /**
             * must be an integer
             */
            avgSessionTime: number;
            role: 'standard' | 'admin';
            isPrivate: boolean;
            recentFollows: string[];
            preferences: UserPreferences;
            favoriteFoods: UserFavoriteFoodsItem[];
            miscData: any;
        }
        export interface UserPreferences {
            darkMode: boolean;
            colorScheme: 'red' | 'blue' | 'green';
        }
        export interface UserFavoriteFoodsItem {
            id: string;
            name: string;
        }
        `),
        );
    });
});

test("Client generation", async () => {
    const UserSchema = a.object({
        id: a.string(),
        name: a.string(),
        email: a.string(),
        createdAt: a.timestamp(),
    });
    const input: ApplicationDef = {
        arriSchemaVersion: "0.0.1",
        procedures: {
            sayHello: {
                path: "/say-hello",
                method: "get",
                params: undefined,
                response: "SayHelloResponse",
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
                params: "UsersUpdateUserParams",
                response: "User",
            },
            "posts.getPost": {
                path: "/posts/get-post",
                method: "get",
                params: "PostParams",
                response: "Post",
            },
            "posts.comments.getComment": {
                path: "/posts/comments/get-comment",
                method: "get",
                params: "PostCommentParams",
                response: undefined,
            },
        },
        models: {
            SayHelloResponse: a.object({
                message: a.string(),
            }),
            User: UserSchema as any,
            UserParams: a.object({
                userId: a.string(),
            }),
            UsersUpdateUserParams: a.object({
                userId: a.string(),
                data: UserSchema,
            }),
            PostParams: a.object({
                postId: a.string(),
            }),
            Post: a.object({
                id: a.string(),
                title: a.string(),
                createdAt: a.int32(),
            }),
            PostCommentParams: a.object({
                postId: a.string(),
                commentId: a.string(),
            }),
        },
        errors: a.object({}),
    };
    const client = await createTypescriptClient(input, `TypescriptClient`);
    writeFileSync("./example-client.ts", client);
});
