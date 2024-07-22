// TODO

import { AppDefinition, normalizeWhitespace } from "@arrirpc/codegen-utils";
import fs from "fs";
import path from "path";

import { createTypescriptClient } from "./index";

const testDir = path.resolve(__dirname, "../../../../tests/test-files");
const appDef = JSON.parse(
    fs.readFileSync(path.resolve(testDir, "AppDefinition.json"), "utf8"),
) as AppDefinition;
const referenceFile = fs.readFileSync(
    path.resolve(
        __dirname,
        "../../ts-codegen-reference/src/referenceClient.ts",
    ),
    "utf8",
);
test("Output matches reference file", async () => {
    const result = await createTypescriptClient(appDef, {
        clientName: "ExampleClient",
        outputFile: "",
    });
    fs.writeFileSync("blah.ts", result);
    expect(normalizeWhitespace(result)).toEqual(
        normalizeWhitespace(referenceFile),
    );
});
