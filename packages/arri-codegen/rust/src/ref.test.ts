import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { normalizeWhitespace } from "packages/arri-codegen/utils/dist";
import { a } from "packages/arri-validate/dist";
import { type GeneratorContext, tmpDir, refDir } from "./common";
import { rustTypeFromSchema } from ".";

beforeAll(() => {
    if (!existsSync(path.resolve(tmpDir))) {
        mkdirSync(path.resolve(tmpDir));
    }
});

test("rustRefFromSchema()", () => {
    interface BinaryTree {
        left: BinaryTree | null;
        right: BinaryTree | null;
    }
    const BinaryTree = a.recursive<BinaryTree>(
        (self) =>
            a.object({
                left: a.nullable(self),
                right: a.nullable(self),
            }),
        {
            id: "BinaryTree",
        },
    );
    const context: GeneratorContext = {
        schemaPath: "",
        instancePath: "",
        generatedTypes: [],
        clientName: "",
    };
    const outputStr = rustTypeFromSchema(BinaryTree, context);
    const tmpFilePath = path.resolve(tmpDir, "output_recursive_object.rs");
    writeFileSync(tmpFilePath, outputStr.content);
    execSync(`rustfmt ${tmpFilePath}`);
    const output = readFileSync(tmpFilePath, "utf8");
    const expectedOutput = readFileSync(
        path.resolve(refDir, "ref_recursive_object.rs"),
        "utf8",
    )
        .split("// IGNORE BEFORE //")
        .pop();
    expect(normalizeWhitespace(output)).toBe(
        normalizeWhitespace(expectedOutput ?? ""),
    );
});
