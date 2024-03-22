import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { normalizeWhitespace } from "packages/arri-codegen/utils/dist";
import { a } from "packages/arri-validate/dist";
import path from "pathe";
import { tmpDir, type GeneratorContext, refDir } from "./common";
import { rustTypeFromSchema } from ".";

beforeAll(() => {
    if (!existsSync(path.resolve(tmpDir))) {
        mkdirSync(path.resolve(tmpDir));
    }
});

test("Recursive Union", () => {
    type RecursiveUnion =
        | {
              type: "TEXT";
              data: string;
          }
        | {
              type: "SHAPE";
              data: {
                  width: number;
                  height: number;
                  color: string;
              };
          }
        | {
              type: "CHILD";
              data: RecursiveUnion;
          }
        | {
              type: "CHILDREN";
              data: RecursiveUnion[];
          };
    const RecursiveUnion = a.recursive<RecursiveUnion>(
        (self) =>
            a.discriminator("type", {
                TEXT: a.object({
                    data: a.string(),
                }),
                SHAPE: a.object({
                    data: a.object({
                        width: a.float64(),
                        height: a.float64(),
                        color: a.string(),
                    }),
                }),
                CHILD: a.object({
                    data: self,
                }),
                CHILDREN: a.object({
                    data: a.array(self),
                }),
            }),
        {
            id: "RecursiveUnion",
        },
    );
    const context: GeneratorContext = {
        schemaPath: "",
        instancePath: "",
        generatedTypes: [],
        clientName: "",
    };
    const outputStr = rustTypeFromSchema(RecursiveUnion, context);
    const outputFilePath = path.resolve(
        tmpDir,
        "output_recursive_discriminator.rs",
    );
    writeFileSync(outputFilePath, outputStr.content);
    execSync(`rustfmt ${outputFilePath}`);
    const result = readFileSync(outputFilePath, "utf8");
    const expectedResult =
        readFileSync(
            path.resolve(refDir, "ref_recursive_discriminator.rs"),
            "utf8",
        )
            .split("// IGNORE BEFORE //")
            .pop() ?? "";
    expect(normalizeWhitespace(result)).toBe(
        normalizeWhitespace(expectedResult),
    );
});
