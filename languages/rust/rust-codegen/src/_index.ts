import { execSync } from "node:child_process";
import fs from "node:fs";

import {
    type AppDefinition,
    defineGeneratorPlugin,
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

import {
    GeneratorContext,
    RustProperty,
    validRustIdentifier,
    validRustName,
} from "./_common";
import rustAnyFromSchema from "./any";
import rustArrayFromSchema from "./array";
import { rustTaggedUnionFromSchema } from "./discriminator";
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
import { rustRpcFromSchema, rustServiceFromSchema } from "./procedures";
import rustRecordFromSchema from "./record";
import rustRefFromSchema from "./ref";

export interface RustClientGeneratorOptions {
    clientName?: string;
    outputFile: string;
    format?: boolean;
    typePrefix?: string;
}

export const rustClientGenerator = defineGeneratorPlugin(
    (options: RustClientGeneratorOptions) => {
        return {
            generator(def) {
                const context: GeneratorContext = {
                    clientVersion: def.info?.version ?? "",
                    clientName: options.clientName ?? "Client",
                    typeNamePrefix: options.typePrefix ?? "",
                    instancePath: "",
                    schemaPath: "",
                    generatedTypes: [],
                };
                const client = createRustClient(def, {
                    ...context,
                });
                const outputFile = path.resolve(options.outputFile);
                fs.writeFileSync(outputFile, client);
                const shouldFormat = options.format ?? true;
                if (shouldFormat) {
                    try {
                        execSync(`rustfmt ${outputFile} --edition 2021`, {
                            stdio: "inherit",
                        });
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
    context: Omit<GeneratorContext, "clientVersion">,
): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const services = unflattenProcedures(def.procedures);
    const rpcParts: string[] = [];
    const subServices: { name: string; key: string }[] = [];
    const subServiceContent: string[] = [];
    for (const key of Object.keys(services)) {
        const subDef = services[key];
        if (isServiceDefinition(subDef)) {
            const service = rustServiceFromSchema(subDef, {
                clientVersion: def.info?.version ?? "",
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: key,
                schemaPath: key,
                generatedTypes: context.generatedTypes,
            });
            if (service.content) {
                subServices.push({
                    key: validRustIdentifier(key),
                    name: service.name,
                });
                subServiceContent.push(service.content);
            }
            continue;
        }
        if (isRpcDefinition(subDef)) {
            const rpc = rustRpcFromSchema(subDef, {
                clientVersion: def.info?.version ?? "",
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: key,
                schemaPath: key,
                generatedTypes: context.generatedTypes,
            });
            if (rpc) {
                rpcParts.push(rpc);
            }
            continue;
        }
    }
    const modelParts: string[] = [];
    for (const key of Object.keys(def.definitions)) {
        const result = rustTypeFromSchema(def.definitions[key]!, {
            ...context,
            clientVersion: def.info?.version ?? "",
            instancePath: key,
            schemaPath: "",
        });
        if (result.content) {
            modelParts.push(result.content);
        }
    }
    if (rpcParts.length === 0 && subServiceContent.length === 0) {
        return `#![allow(dead_code, unused_imports, unused_variables, unconditional_recursion, deprecated)]
use arri_client::{
    chrono::{DateTime, FixedOffset},
    serde_json::{self},
    utils::{serialize_date_time, serialize_string},
    ArriEnum, ArriModel,
};
use std::collections::BTreeMap;
${modelParts.join("\n\n")}`;
    }
    const clientName = validRustName(context.clientName);
    return `#![allow(dead_code, unused_imports, unused_variables, unconditional_recursion, deprecated)]
use arri_client::{
    chrono::{DateTime, FixedOffset},
    parsed_arri_request, reqwest, serde_json,
    utils::{serialize_date_time, serialize_string},
    ArriClientConfig, ArriClientService, ArriEnum, ArriModel, ArriParsedRequestOptions,
    ArriServerError, EmptyArriModel,
};
use std::collections::BTreeMap;

pub struct ${clientName}<'a> {
    config: &'a ArriClientConfig,
${subServices.map((service) => `    pub ${service.key}: ${service.name}<'a>,`).join("\n")}
}

impl<'a> ArriClientService<'a> for ${clientName}<'a> {
    fn create(config: &'a ArriClientConfig) -> Self {
        Self {
            config: &config,
${subServices.map((service) => `            ${service.key}: ${service.name}::create(config),`).join("\n")}
        }
    }
}

impl ${clientName}<'_> {
${rpcParts.join("\n")}
}

${subServiceContent.join("\n\n")}

${modelParts.join("\n\n")}`;
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
        return rustRecordFromSchema(schema, context);
    }
    if (isSchemaFormDiscriminator(schema)) {
        return rustTaggedUnionFromSchema(schema, context);
    }
    if (isSchemaFormRef(schema)) {
        return rustRefFromSchema(schema, context);
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
