import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { camelCase, pascalCase } from "scule";
import { defineClientGeneratorPlugin } from "./plugin";
import {
    type ApplicationDef,
    type ServiceDef,
    isProcedureDef,
    type ProcedureDef,
    unflattenProcedures,
    isServiceDef,
} from "./utils";
import { SchemaFormProperties } from "packages/arri-codegen-utils/dist";

export interface DartClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const dartClientGenerator = defineClientGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            generator: async (def) => {
                if (!options.clientName) {
                    throw new Error(
                        'Missing "clientName" cannot generate dart client',
                    );
                }
                if (!options.outputFile) {
                    throw new Error(
                        'Missing "outputFile" cannot generate dart client',
                    );
                }
                const numProcedures = Object.keys(def.procedures).length;
                if (numProcedures <= 0) {
                    console.warn(
                        "No procedures found in definition file. Dart client will not be generated",
                    );
                    return;
                }
                // const result = createDartClient(def, {
                //     clientName: options.clientName,
                // });
                // writeFileSync(options.outputFile, result);
                // try {
                //     execSync(`dart format ${options.outputFile}`);
                // } catch (err) {
                //     console.error("Error formatting dart client", err);
                // }
            },
            options,
        };
    },
);
