import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { normalizeWhitespace } from "arri-codegen-utils";
import { TestAppDefinition } from "arri-codegen-utils/dist/testModels";
import { a } from "arri-validate";
import path from "pathe";
import prettier from "prettier";
import { createTypescriptClient, tsTypeFromJtdSchema } from "./index";

const tempDir = path.resolve(__dirname, "../.temp");

beforeAll(() => {
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }
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
                followedUsers: a.array(a.string()),
            },
            { id: "User" },
        );
        const result = tsTypeFromJtdSchema(
            "user",
            JSON.parse(JSON.stringify(User)),
            {
                clientName: "TestClient",
                outputFile: "",
                versionNumber: "",
                typesNeedingParser: ["user"],
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
            followedUsers: Array<string>;
            bio?: string;
        }
        export const $$User = {
            parse(input: Record<any, any>): User {
                return {
                    id: typeof input.id === 'string' ? input.id : '',
                    name: typeof input.name === 'string' ? input.name : '',
                    createdAt: typeof input.createdAt === 'string' ? new Date(input.createdAt) : new Date(0),
                    numFollowers: typeof input.numFollowers === 'number' ? input.numFollowers : 0,
                    followedUsers: Array.isArray(input.followedUsers) ? input.followedUsers.map((item) => typeof item === 'string' ? item : '') : [],
                    bio: typeof input.bio === 'string' ? input.bio : undefined,
                };
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
            "user",
            PartialUser,
            {
                clientName: "TestClient",
                outputFile: "",
                versionNumber: "",
                typesNeedingParser: ["user"],
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
                return {
                    id: typeof input.id === 'string' ? input.id : undefined,
                    name: typeof input.name === 'string' ? input.name : undefined,
                    createdAt: typeof input.createdAt === 'string' ? new Date(input.createdAt) : undefined,
                };
            },
            serialize(input: PartialUser): string {
                ${UserValidator.compiledCode.serialize}
            }
        }`),
        );
    });
});

test("Client Creation", async () => {
    const prettierOptions: Omit<prettier.Config, "parser"> = {
        tabWidth: 4,
        useTabs: false,
        trailingComma: "all",
        endOfLine: "lf",
        semi: true,
        singleQuote: true,
        printWidth: 80,
    };
    const targetClient = readFileSync(
        path.resolve(__dirname, "__testTargetClient.ts"),
        {
            encoding: "utf-8",
        },
    );
    const result = await createTypescriptClient(TestAppDefinition, {
        clientName: "Client",
        outputFile: "",
        prettierOptions,
    });
    writeFileSync(path.resolve(tempDir, "example_client.test.ts"), result);
    expect(normalizeWhitespace(result)).toEqual(
        normalizeWhitespace(
            await prettier.format(targetClient, {
                parser: "typescript",
                ...prettierOptions,
            }),
        ),
    );
});
