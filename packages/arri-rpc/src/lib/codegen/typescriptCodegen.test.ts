import { Type } from "@sinclair/typebox";
import {
    tsModelFromDefinition,
    tsServiceFromServiceDefinition,
} from "./typescriptCodegen";
import { type ServiceDefinition, normalizeWhitespace } from "./utils";

describe("generateService", () => {
    test("Basic Service", () => {
        const input: ServiceDefinition = {
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
            baseUrl: string;
            headers: Record<string, string>;
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
            baseUrl: string;
            headers: Record<string, string>;
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
        }`)
        );
    });
});

describe("Generate Models", () => {
    test("basicModel", () => {
        const input = Type.Object({
            id: Type.String(),
            email: Type.Optional(Type.String()),
            createdAt: Type.Date(),
            updatedAt: Type.Number(),
            avgSessionTime: Type.Integer(),
            role: Type.Enum({
                standard: "standard",
                admin: "admin",
            }),
            isPrivate: Type.Boolean(),
        });
        const result = tsModelFromDefinition("User", input);
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
        }
        `)
        );
    });
});
