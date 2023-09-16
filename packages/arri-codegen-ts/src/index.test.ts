import { existsSync, mkdirSync, readFileSync } from "fs";
import { normalizeWhitespace } from "arri-codegen-utils";
import { TestAppDefinition } from "arri-codegen-utils/dist/testModels";
import path from "pathe";
import prettier from "prettier";
import { createTypescriptClient } from "./index";

const tempDir = path.resolve(__dirname, "../.temp");

beforeAll(() => {
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }
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
    expect(normalizeWhitespace(result)).toEqual(
        normalizeWhitespace(
            await prettier.format(targetClient, {
                parser: "typescript",
                ...prettierOptions,
            }),
        ),
    );
});
