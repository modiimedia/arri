import fs from "node:fs";
import path from "node:path";

import { AppDefinition, normalizeWhitespace } from "@arrirpc/codegen-utils";

import { createSwiftClient } from "./_index";

test("Swift Codegen Matches SwiftCodegenReference.swift", () => {
    const appDef = JSON.parse(
        fs.readFileSync(
            path.resolve(
                __dirname,
                "../../../../tests/test-files/AppDefinition.json",
            ),
            "utf8",
        ),
    ) as AppDefinition;
    const reference = fs.readFileSync(
        path.resolve(
            __dirname,
            "../../swift-codegen-reference/Sources/SwiftCodegenReference/SwiftCodegenReference.swift",
        ),
        "utf8",
    );
    const result = createSwiftClient(appDef, {
        clientName: "ExampleClient",
        outputFile: "",
    });
    expect(normalizeWhitespace(result)).toEqual(normalizeWhitespace(reference));
});
