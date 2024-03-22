import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { normalizeWhitespace } from "arri-codegen-utils";
import { a } from "arri-validate";
import path from "pathe";
import { refDir, tmpDir } from "./common";
import { rustTypeFromSchema } from ".";

beforeAll(() => {
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir);
    }
});

test("record codegen", () => {
    const User = a.object(
        {
            id: a.string(),
            name: a.string(),
        },
        {
            id: "User",
        },
    );
    const ObjectWithRecord = a.object(
        {
            stringRecord: a.record(a.string()),
            userRecord: a.record(User),
        },
        {
            id: "ObjectWithRecord",
        },
    );
    const result = rustTypeFromSchema(ObjectWithRecord, {
        clientName: "",
        generatedTypes: [],
        instancePath: "/ObjectWithRecord",
        schemaPath: "",
        parentIds: [],
    });
    const outputFilePath = path.resolve(tmpDir, "hashmap_output.rs");
    writeFileSync(outputFilePath, result.content);
    execSync(`rustfmt ${outputFilePath}`);
    const output = readFileSync(outputFilePath, { encoding: "utf8" });
    const expectedOutput =
        readFileSync(path.resolve(refDir, "ref_hashmap.rs"), {
            encoding: "utf8",
        })
            .split("// IGNORE BEFORE //")
            .pop() ?? "";
    expect(normalizeWhitespace(output)).toBe(
        normalizeWhitespace(expectedOutput),
    );
});
