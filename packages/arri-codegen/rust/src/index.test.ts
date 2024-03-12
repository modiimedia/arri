import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { normalizeWhitespace, type SchemaFormType } from "arri-codegen-utils";
import { a } from "arri-validate";
import path from "pathe";
import { rustBoolFromSchema } from "./boolean";
import { type GeneratorContext } from "./common";
import { rustTypeFromSchema } from "./index";

const defaultContext: GeneratorContext = {
    schemaPath: "",
    instancePath: "",
    generatedTypes: [],
    clientName: "",
};

const tmpDir = path.resolve(__dirname, "../.tmp");
const refDir = path.resolve(__dirname, "../../rust-reference/src");

beforeAll(() => {
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir);
    }
});

describe("Scalar Types", () => {
    test("bool", () => {
        const schema: SchemaFormType = {
            type: "boolean",
        };
        const schemaResult = rustBoolFromSchema(schema, defaultContext);
        expect(schemaResult.fieldTemplate).toBe(`bool`);

        const nullableSchema: SchemaFormType = {
            type: "boolean",
            nullable: true,
        };
        const nullableSchemaResult = rustBoolFromSchema(
            nullableSchema,
            defaultContext,
        );
        expect(nullableSchemaResult.fieldTemplate).toBe("Option<bool>");
    });
});

describe("objects", () => {
    const CompleteObject = a.object(
        {
            any: a.any(),
            string: a.string(),
            boolean: a.boolean(),
            float32: a.float32(),
            float64: a.float64(),
            int8: a.int8(),
            uint8: a.uint8(),
            int16: a.int16(),
            uint16: a.uint16(),
            int32: a.int32(),
            uint32: a.uint32(),
            int64: a.int64(),
            uint64: a.uint64(),
            timestamp: a.timestamp(),
            enum: a.enumerator(["A", "B"]),
            stringArray: a.array(a.string()),
        },
        { id: "CompleteObject" },
    );
    const NullableObject = a.object(
        {
            any: a.nullable(a.any()),
            string: a.nullable(a.string()),
            boolean: a.nullable(a.boolean()),
            float32: a.nullable(a.float32()),
            float64: a.nullable(a.float64()),
            int8: a.nullable(a.int8()),
            uint8: a.nullable(a.uint8()),
            int16: a.nullable(a.int16()),
            uint16: a.nullable(a.uint16()),
            int32: a.nullable(a.int32()),
            uint32: a.nullable(a.uint32()),
            int64: a.nullable(a.int64()),
            uint64: a.nullable(a.uint64()),
            timestamp: a.nullable(a.timestamp()),
            enum: a.nullable(a.enumerator(["A", "B"])),
            stringArray: a.nullable(a.array(a.string())),
        },
        {
            id: "NullableObject",
        },
    );
    test("complete object", () => {
        const result = rustTypeFromSchema(CompleteObject, {
            clientName: "",
            generatedTypes: [],
            instancePath: "/schema",
            schemaPath: "",
        });
        const outputFilePath = path.resolve(
            tmpDir,
            "complete_object_output.rs",
        );
        writeFileSync(
            path.resolve(tmpDir, "complete_object_output.rs"),
            result.content,
        );
        execSync(`rustfmt ${outputFilePath}`);
        const outputFile = readFileSync(outputFilePath, { encoding: "utf8" });
        const referenceFile = readFileSync(
            path.resolve(refDir, "ref_complete_object.rs"),
            { encoding: "utf8" },
        );
        const parts = referenceFile.split("// IGNORE BEFORE //");
        parts.shift();
        const expectedResult = parts.join("\n");

        expect(normalizeWhitespace(outputFile)).toBe(
            normalizeWhitespace(expectedResult),
        );
    });
    test("partial object", () => {
        const PartialObject = a.partial(CompleteObject, {
            id: "PartialObject",
        });
        const result = rustTypeFromSchema(PartialObject, {
            clientName: "",
            generatedTypes: [],
            instancePath: "",
            schemaPath: "",
        });
        const outputFilePath = path.resolve(tmpDir, "partial_object_output.rs");
        writeFileSync(outputFilePath, result.content);
        execSync(`rustfmt ${outputFilePath}`);
        const outputFile = readFileSync(outputFilePath, { encoding: "utf8" });
        const expectedResult =
            readFileSync(path.resolve(refDir, "ref_partial_object.rs"), {
                encoding: "utf8",
            })
                .split("// IGNORE BEFORE //")
                .pop() ?? "";
        expect(normalizeWhitespace(outputFile)).toBe(
            normalizeWhitespace(expectedResult),
        );
    });
    test("nullable object", () => {
        const result = rustTypeFromSchema(NullableObject, {
            clientName: "",
            generatedTypes: [],
            instancePath: "",
            schemaPath: "",
        });
        const outputFilePath = path.resolve(
            tmpDir,
            "nullable_object_output.rs",
        );
        writeFileSync(outputFilePath, result.content);
        execSync(`rustfmt ${outputFilePath}`);
        const outputFile = readFileSync(outputFilePath, { encoding: "utf8" });
        const expectedResult =
            readFileSync(path.resolve(refDir, "ref_nullable_object.rs"), {
                encoding: "utf8",
            })
                .split("// IGNORE BEFORE //")
                .pop() ?? "";
        expect(normalizeWhitespace(outputFile)).toBe(
            normalizeWhitespace(expectedResult),
        );
    });
});

// test("Test App Def", async () => {
//     const outputFile = path.resolve(__dirname, "../.tmp/test_client.rpc.rs");
//     if (!fs.existsSync(outputFile)) {
//         fs.mkdirSync(path.resolve(__dirname, "../.tmp"));
//     }
//     await rustClientGenerator({
//         clientName: "Test Client",
//         outputFile,
//     }).generator(TestAppDefinition);
//     const client = fs.readFileSync(outputFile, { encoding: "utf8" });
//     const referenceClient = fs
//         .readFileSync(
//             path.resolve(__dirname, "../../rust-reference/src/test_client.rs"),
//             { encoding: "utf8" },
//         )
//         .split("// TESTS //")[0];
//     expect(normalizeWhitespace(client)).toBe(
//         normalizeWhitespace(referenceClient),
//     );
// });
