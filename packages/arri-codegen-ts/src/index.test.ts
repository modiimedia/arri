import { existsSync, mkdirSync } from "fs";
import { normalizeWhitespace } from "arri-codegen-utils";
import { TestAppDefinition } from "arri-codegen-utils/dist/testModels";
import { a } from "arri-validate";
import path from "pathe";
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
            "",
            JSON.parse(JSON.stringify(User)),
            {
                clientName: "TestClient",
                outputFile: "",
                versionNumber: "",
                typesNeedingParser: ["User", "user"],
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
        const $$User = {
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
        const $$PartialUser = {
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
