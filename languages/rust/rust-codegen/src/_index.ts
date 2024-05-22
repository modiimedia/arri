import { execSync } from "node:child_process";
import fs from "node:fs";

import {
    type AppDefinition,
    defineClientGeneratorPlugin,
    isRpcDefinition,
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    isServiceDefinition,
    type Schema,
    unflattenProcedures,
} from "@arrirpc/codegen-utils";
import path from "pathe";

import { GeneratorContext, RustProperty } from "./_common";
import rustAnyFromSchema from "./any";
import rustArrayFromSchema from "./array";
import rustEnumFromSchema from "./enum";
import rustObjectFromSchema from "./object";
import {
    rustBooleanFromSchema,
    rustF32FromSchema,
    rustF64FromSchema,
    rustI8FromSchema,
    rustI16FromSchema,
    rustI32FromSchema,
    rustI64FromSchema,
    rustStringFromSchema,
    rustTimestampFromSchema,
    rustU8FromSchema,
    rustU16FromSchema,
    rustU32FromSchema,
    rustU64FromSchema,
} from "./primitives";

interface RustClientGeneratorOptions {
    clientName: string;
    outputFile: string;
    format?: boolean;
    typePrefix?: string;
}

export const rustClientGenerator = defineClientGeneratorPlugin(
    (options: RustClientGeneratorOptions) => {
        return {
            generator(def) {
                const context: GeneratorContext = {
                    clientName: options.clientName,
                    typeNamePrefix: options.typePrefix ?? "",
                    instancePath: "",
                    schemaPath: "",
                    generatedTypes: [],
                };
                const client = createRustClient(def, context);
                const outputFile = path.resolve(options.outputFile);
                fs.writeFileSync(outputFile, client);
                const shouldFormat = options.format ?? true;
                if (shouldFormat) {
                    try {
                        execSync(`rustfmt ${outputFile}`);
                    } catch (err) {
                        console.error(`Error formatting`, err);
                    }
                }
            },
            options,
        };
    },
);

export function createRustClient(
    def: AppDefinition,
    context: GeneratorContext,
): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const services = unflattenProcedures(def.procedures);
    const rpcsParts: string[] = [];
    const serviceParts: string[] = [];
    for (const key of Object.keys(services)) {
        const def = services[key];
        if (isServiceDefinition(def)) {
            //     const service = rustServiceFromDef(key, def, context);
            //     if (service) serviceParts.push(service);
            continue;
        }
        if (isRpcDefinition(def)) {
            // const procedure = rustProcedureFromDef(key, def, context);
            // if (procedure) rpcsParts.push(procedure);
            continue;
        }
    }
    const modelParts: string[] = [];
    for (const key of Object.keys(def.definitions)) {
        const result = rustTypeFromSchema(def.definitions[key]!, {
            ...context,
            instancePath: key,
            schemaPath: "",
        });
        if (result.content) {
            modelParts.push(result.content);
        }
    }
    let result: string;
    if (rpcsParts.length === 0 && serviceParts.length === 0) {
        result = `use arri_client::{
    chrono::{DateTime, FixedOffset},
    serde_json::{self},
    utils::{serialize_date_time, serialize_string},
    ArriEnum, ArriModel,
};
use std::collections::BTreeMap;
${modelParts.join("\n\n")}`;
    } else {
        throw new Error("Not yet implemented");
    }
    return result;
}

export function rustTypeFromSchema(
    schema: Schema,
    context: GeneratorContext,
): RustProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "string":
                return rustStringFromSchema(schema, context);
            case "boolean":
                return rustBooleanFromSchema(schema, context);
            case "timestamp":
                return rustTimestampFromSchema(schema, context);
            case "float32":
                return rustF32FromSchema(schema, context);
            case "float64":
                return rustF64FromSchema(schema, context);
            case "int8":
                return rustI8FromSchema(schema, context);
            case "uint8":
                return rustU8FromSchema(schema, context);
            case "int16":
                return rustI16FromSchema(schema, context);
            case "uint16":
                return rustU16FromSchema(schema, context);
            case "int32":
                return rustI32FromSchema(schema, context);
            case "uint32":
                return rustU32FromSchema(schema, context);
            case "int64":
                return rustI64FromSchema(schema, context);
            case "uint64":
                return rustU64FromSchema(schema, context);
            default:
                schema.type satisfies never;
                throw new Error(`Unhandled schema type: "${schema.type}"`);
        }
    }
    if (isSchemaFormProperties(schema)) {
        return rustObjectFromSchema(schema, context);
    }
    if (isSchemaFormEnum(schema)) {
        return rustEnumFromSchema(schema, context);
    }
    if (isSchemaFormElements(schema)) {
        return rustArrayFromSchema(schema, context);
    }
    if (isSchemaFormValues(schema)) {
        // TODO
    }
    if (isSchemaFormDiscriminator(schema)) {
        // TODO
    }
    if (isSchemaFormRef(schema)) {
        // TODO
    }
    return rustAnyFromSchema(schema, context);
}

// export function rustServiceFromDef(
//     key: string,
//     schema: ServiceDefinition,
//     context: GeneratorContext,
// ): string {
//     // const serviceId = pascalCase(`${context.parentId ?? ""}_${key}`);
//     // context.parentId = serviceId;
//     // const rpcsParts: string[] = [];
//     // const subServiceParts: string[] = [];
//     // for (const key of Object.keys(schema)) {
//     //     const subSchema = schema[key];
//     //     if (isServiceDefinition(subSchema)) {
//     //         const subService = rustServiceFromDef(key, subSchema, context);
//     //         subServiceParts.push(subService);
//     //         continue;
//     //     }
//     //     if (isRpcDefinition(subSchema)) {
//     //         const rpc = rustProcedureFromDef(key, subSchema, context);
//     //         rpcsParts.push(rpc);
//     //     }
//     // }
//     return "";
// }

// export function rustProcedureFromDef(
//     key: string,
//     schema: RpcDefinition,
//     context: GeneratorContext,
// ): string {
//     return "";
// }
