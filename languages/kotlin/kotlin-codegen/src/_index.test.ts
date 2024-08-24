import fs from "node:fs";

import { normalizeWhitespace } from "@arrirpc/codegen-utils";
import path from "pathe";

import { kotlinClientFromAppDefinition } from "./_index";

test("output matches the reference client", () => {
    const referenceSchema = fs.readFileSync(
        path.resolve(
            __dirname,
            "../../../../tests/test-files/AppDefinition.json",
        ),
        {
            encoding: "utf8",
        },
    );
    const referenceClient = fs.readFileSync(
        path.resolve(
            __dirname,
            "../../kotlin-codegen-reference/src/main/kotlin/ExampleClient.kt",
        ),
        {
            encoding: "utf8",
        },
    );

    const result = kotlinClientFromAppDefinition(JSON.parse(referenceSchema), {
        clientName: "ExampleClient",
        outputFile: "",
    });
    expect(normalizeWhitespace(result)).toBe(
        normalizeWhitespace(referenceClient),
    );
});

test("kotlin reference has correct sse functionality", () => {
    const referenceClient = fs.readFileSync(
        path.resolve(
            __dirname,
            "../../kotlin-codegen-reference/src/main/kotlin/ExampleClient.kt",
        ),
        {
            encoding: "utf8",
        },
    );
    const testFile = fs.readFileSync(
        path.resolve(
            __dirname,
            "../../kotlin-codegen-reference/src/test/kotlin/SseEventTests.kt",
        ),
        {
            encoding: "utf8",
        },
    );
    const lines: string[] = [];
    let startAdding = false;
    for (const line of testFile.split("\n")) {
        if (startAdding) {
            lines.push(line);
        }
        if (line.includes("// SSE_FN_START")) {
            startAdding = true;
        }
        if (line.includes("// SSE_FN_END")) {
            break;
        }
    }
    expect(referenceClient.includes(lines.join("\n"))).toBe(true);
});
