import { writeFileSync } from "fs";
import { format } from "prettier";
import { pascalCase } from "scule";
import { defineClientGeneratorPlugin } from "./plugin";
import {
    type ApplicationDef,
    type ServiceDef,
    unflattenObject,
    isProcedureDef,
    type ProcedureDef,
    isServiceDef,
} from "./utils";
import {
    JsonSchemaObject,
    JsonSchemaScalarType,
    isJsonSchemaArray,
    isJsonSchemaEnum,
    isJsonSchemaNullType,
    isJsonSchemaObject,
    isJsonSchemaRecord,
    isJsonSchemaScalarType,
} from "json-schema-to-jtd";

let generatedModels: string[] = [];

interface TypescriptClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const typescriptClientGenerator = defineClientGeneratorPlugin(
    (options: TypescriptClientGeneratorOptions) => ({
        generator: async (def) => {
            if (!options.clientName) {
                throw new Error("Name is requires");
            }
            if (!options.outputFile) {
                throw new Error("No output file specified");
            }
            if (Object.keys(def.procedures).length <= 0) {
                throw new Error(
                    "No procedures found in definition file. Typescript client will not be generated.",
                );
            }
            // const result = await createTypescriptClient(
            //     def,
            //     options.clientName,
            // );
            // writeFileSync(options.outputFile, result);
        },
        options,
    }),
);
