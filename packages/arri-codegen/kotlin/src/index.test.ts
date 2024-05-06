import fs from "node:fs";
import { normalizeWhitespace } from "arri-codegen-utils";
import path from "pathe";
import { kotlinClientFromDef } from ".";

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
            "../reference/src/main/kotlin/ExampleClient.kt",
        ),
        {
            encoding: "utf8",
        },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = kotlinClientFromDef(JSON.parse(referenceSchema), {
        clientName: "ExampleClient",
        outputFile: "",
    });
    expect(normalizeWhitespace(result)).toBe(
        normalizeWhitespace(referenceClient),
    );
});
