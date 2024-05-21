import { isAppDefinition, normalizeWhitespace } from "@arrirpc/codegen-utils";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "pathe";

import { tmpDir } from "./_common";
import { createRustClient } from "./_index";

beforeAll(() => {
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir);
    }
});

test("Generated code matches codegen reference", async () => {
    const appDef = JSON.parse(
        readFileSync(
            path.resolve(
                __dirname,
                "../../../../tests/test-files/AppDefinition.json",
            ),
            { encoding: "utf8" },
        ),
    ) as unknown;
    const referenceClient = readFileSync(
        path.resolve(
            __dirname,
            "../../rust-codegen-reference/src/example_client.rs",
        ),
        "utf8",
    );
    if (!isAppDefinition(appDef)) {
        throw new Error("Error loading test AppDefinition.json");
    }
    const result = createRustClient(appDef, {
        clientName: "ExampleClient",
        typeNamePrefix: "",
        instancePath: "",
        schemaPath: "",
        generatedTypes: [],
    });
    expect(normalizeWhitespace(result)).toBe(
        normalizeWhitespace(referenceClient),
    );
});
