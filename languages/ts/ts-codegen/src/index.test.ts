import {
    normalizeWhitespace,
    type Schema,
    type ServiceDefinition,
} from "@arrirpc/codegen-utils";
import { TestAppDefinition } from "@arrirpc/codegen-utils/dist/testModels";
import { a } from "@arrirpc/schema";
import { existsSync, mkdirSync } from "fs";
import path from "pathe";
import prettier from "prettier";

import {
    createTypescriptClient,
    tsServiceFromDefinition,
    tsTypeFromJtdSchema,
} from "./index";

const tempDir = path.resolve(__dirname, "../.temp");

beforeAll(() => {
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }
});

describe("Service Creation", () => {
    test("Basic Service", async () => {
        const Service: ServiceDefinition = {
            getUser: {
                transport: "http",
                description: "Fetch a user by id",
                path: "/get-user",
                method: "get",
                params: "GetUserParams",
                response: "User",
                isDeprecated: true,
            },
            updateUser: {
                transport: "http",
                description: "Update a user",
                path: "/update-user",
                method: "post",
                params: "UpdateUserParams",
                response: "User",
            },
            watchUser: {
                transport: "http",
                description: "Watch a user",
                path: "/watch-user",
                method: "get",
                params: "GetUserParams",
                response: "User",
                isEventStream: true,
            },
            createConnection: {
                transport: "ws",
                description: "Create a ws connection to send messages",
                path: "/create-connection",
                params: "User",
                response: "User",
            },
        };

        const result = await prettier.format(
            tsServiceFromDefinition("User", Service, {
                clientName: "Client",
                outputFile: "",
                typesNeedingParser: [],
                versionNumber: "1",
                hasSseProcedures: true,
                hasWsProcedures: true,
            }),
            { parser: "typescript" },
        );
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(
                await prettier.format(
                    `export class UserService {
            private readonly baseUrl: string;
            private readonly headers: Record<string, string> | (() => Record<string, string>);
            private readonly clientVersion = '1';
            constructor(options: ClientOptions = {}) {
                this.baseUrl = options.baseUrl ?? "";
                this.headers = options.headers ?? {};
            }
            /**
             * Fetch a user by id
             * @deprecated
             */
            getUser(params: GetUserParams) {
                return arriRequest<User, GetUserParams>({
                    url: \`\${this.baseUrl}/get-user\`,
                    method: "get",
                    headers: this.headers,
                    params,
                    parser: $$User.parse,
                    serializer: $$GetUserParams.serialize,
                    clientVersion: this.clientVersion,
                });
            }
            /**
             * Update a user
             */
            updateUser(params: UpdateUserParams) {
                return arriRequest<User, UpdateUserParams>({
                    url: \`\${this.baseUrl}/update-user\`,
                    method: "post",
                    headers: this.headers,
                    params,
                    parser: $$User.parse,
                    serializer: $$UpdateUserParams.serialize,
                    clientVersion: this.clientVersion,
                });
            }
            /**
             * Watch a user
             */
            watchUser(params: GetUserParams, options: SseOptions<User>) {
                return arriSseRequest<User, GetUserParams>({
                    url: \`\${this.baseUrl}/watch-user\`,
                    method: "get",
                    headers: this.headers,
                    params,
                    parser: $$User.parse,
                    serializer: $$GetUserParams.serialize,
                    clientVersion: this.clientVersion,
                }, options);
            }
            /**
             * Create a ws connection to send messages
             */
            createConnection(options: WsOptions<User> = {}) {
                return arriWsRequest<User, User>({
                    url: \`\${this.baseUrl}/create-connection\`,
                    headers: this.headers,
                    parser: $$User.parse,
                    serializer: $$User.serialize,
                    onOpen: options.onOpen,
                    onClose: options.onClose,
                    onError: options.onError,
                    onConnectionError: options.onConnectionError,
                    onMessage: options.onMessage,
                    clientVersion: this.clientVersion,
                });
            }
        }`,
                    { parser: "typescript" },
                ),
            ),
        );
    });
});

describe("Model Creation", () => {
    test("Basic Object", () => {
        const User = a.object(
            {
                id: a.string(),
                name: a.string(),
                createdAt: a.timestamp(),
                bio: a.optional(a.string()),
                numFollowers: a.uint32(),
                followedUsers: a.array(a.string(), {
                    isDeprecated: true,
                }),
            },
            { id: "User" },
        );
        const result = tsTypeFromJtdSchema(
            "",
            JSON.parse(JSON.stringify(User)) as Schema,
            {
                clientName: "TestClient",
                outputFile: "",
                versionNumber: "",
                typesNeedingParser: ["User", "user"],
                hasSseProcedures: false,
                hasWsProcedures: false,
            },
            { existingTypeNames: [], isOptional: false },
        );
        const CompiledValidator = a.compile(User);
        expect(normalizeWhitespace(result.content)).toBe(
            normalizeWhitespace(`export interface User {
            id: string;
            name: string;
            createdAt: Date;
            numFollowers: number;
            /**
             * @deprecated
             */
            followedUsers: Array<string>;
            bio?: string;
        }
        export const $$User = {
            parse(input: Record<any, any>): User {
                ${CompiledValidator.compiledCode.parse}
            },
            serialize(input: User): string {
                ${CompiledValidator.compiledCode.serialize}
            }
        }`),
        );
    });
    test("Partial Object", () => {
        const User = a.object(
            {
                id: a.string(),
                name: a.string(),
                createdAt: a.timestamp(),
            },
            { id: "User" },
        );
        const PartialUser = a.partial(User, { id: "PartialUser" });
        const UserValidator = a.compile(PartialUser);
        const result = tsTypeFromJtdSchema(
            "",
            PartialUser,
            {
                clientName: "TestClient",
                outputFile: "",
                versionNumber: "",
                typesNeedingParser: ["User", "PartialUser"],
                hasSseProcedures: false,
                hasWsProcedures: false,
            },
            {
                existingTypeNames: [],
                isOptional: false,
            },
        );
        expect(normalizeWhitespace(result.content)).toBe(
            normalizeWhitespace(`export interface PartialUser {
            id?: string;
            name?: string;
            createdAt?: Date;
        }
        export const $$PartialUser = {
            parse(input: Record<any, any>): PartialUser {
                ${UserValidator.compiledCode.parse}
            },
            serialize(input: PartialUser): string {
                ${UserValidator.compiledCode.serialize}
            }
        }`),
        );
    });
});

it("creates a client with valid ts syntax without throwing error", async () => {
    await createTypescriptClient(TestAppDefinition, {
        clientName: "TestClient",
        outputFile: "testClient.rpc.ts",
    });
});
