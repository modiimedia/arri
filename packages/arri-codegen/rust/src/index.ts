import { execSync } from "node:child_process";
import fs from "node:fs";
import {
    type AppDefinition,
    type Schema,
    defineClientGeneratorPlugin,
    isSchemaFormType,
    unflattenProcedures,
    isSchemaFormProperties,
    isSchemaFormEnum,
    isSchemaFormElements,
    isSchemaFormValues,
    isSchemaFormRef,
    isSchemaFormDiscriminator,
    isServiceDefinition,
    type ServiceDefinition,
    type RpcDefinition,
    isRpcDefinition,
    pascalCase,
} from "arri-codegen-utils";
import path from "pathe";
import { rustAnyFromSchema } from "./any";
import { rustVecFromSchema } from "./array";
import { rustBoolFromSchema } from "./boolean";
import { type GeneratorContext, type RustProperty } from "./common";
import { rustTaggedUnionFromSchema } from "./discriminator";
import { rustEnumFromSchema } from "./enum";
import { rustFloatFromSchema, rustIntFromSchema } from "./numbers";
import { rustStructFromSchema } from "./object";
import { rustHashMapFromSchema } from "./record";
import { rustRefFromSchema } from "./ref";
import { rustStringFromSchema } from "./string";
import { rustDateTimeFromSchema } from "./timestamp";

interface RustClientGeneratorOptions {
    clientName: string;
    outputFile: string;
    format?: boolean;
}

export const rustClientGenerator = defineClientGeneratorPlugin(
    (options: RustClientGeneratorOptions) => {
        return {
            generator(def) {
                const context: GeneratorContext = {
                    clientName: options.clientName,
                    generatedTypes: [],
                    instancePath: "",
                    schemaPath: "",
                    parentIds: [],
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
            const service = rustServiceFromDef(key, def, context);
            serviceParts.push(service);
            continue;
        }
        if (isRpcDefinition(def)) {
            const procedure = rustProcedureFromDef(key, def, context);
            rpcsParts.push(procedure);
            continue;
        }
    }
    const modelParts: string[] = [];
    for (const key of Object.keys(def.models)) {
        const result = rustTypeFromSchema(def.models[key], {
            ...context,
            instancePath: key,
            schemaPath: "",
        });
        if (result.content) {
            modelParts.push(result.content);
        }
    }
    const heading = `#![allow(dead_code)]
use arri_client::{
    async_trait::async_trait,
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::Method,
    serde_json::{self},
    ArriClientConfig, ArriModel, ArriParsedRequestOptions, ArriRequestError, ArriService,
    EmptyArriModel,
};
use std::{collections::HashMap, str::FromStr};`;
    if (Object.keys(def.procedures).length === 0) {
        return `${heading}

${modelParts.join("\n")}`;
    }
    return `${heading}

${modelParts.join("\n\n")}`;
}

export function rustTypeFromSchema(
    schema: Schema,
    context: GeneratorContext,
): RustProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "boolean":
                return rustBoolFromSchema(schema, context);
            case "string":
                return rustStringFromSchema(schema, context);
            case "timestamp":
                return rustDateTimeFromSchema(schema, context);
            case "float32":
            case "float64":
                return rustFloatFromSchema(schema, context);
            case "int8":
            case "uint8":
            case "int16":
            case "uint16":
            case "int32":
            case "uint32":
            case "int64":
            case "uint64":
                return rustIntFromSchema(schema, context);
        }
    }
    if (isSchemaFormProperties(schema)) {
        return rustStructFromSchema(schema, context);
    }
    if (isSchemaFormEnum(schema)) {
        return rustEnumFromSchema(schema, context);
    }
    if (isSchemaFormElements(schema)) {
        return rustVecFromSchema(schema, context);
    }
    if (isSchemaFormValues(schema)) {
        return rustHashMapFromSchema(schema, context);
    }
    if (isSchemaFormDiscriminator(schema)) {
        return rustTaggedUnionFromSchema(schema, context);
    }
    if (isSchemaFormRef(schema)) {
        return rustRefFromSchema(schema, context);
    }
    return rustAnyFromSchema(schema, context);
}

export function rustServiceFromDef(
    key: string,
    schema: ServiceDefinition,
    context: GeneratorContext,
): string {
    const serviceId = pascalCase(`${context.parentId ?? ""}_${key}`);
    context.parentId = serviceId;
    const rpcsParts: string[] = [];
    const subServiceParts: string[] = [];
    for (const key of Object.keys(schema)) {
        const subSchema = schema[key];
        if (isServiceDefinition(subSchema)) {
            const subService = rustServiceFromDef(key, subSchema, context);
            subServiceParts.push(subService);
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const rpc = rustProcedureFromDef(key, subSchema, context);
            rpcsParts.push(rpc);
        }
    }
}

export function rustProcedureFromDef(
    key: string,
    schema: RpcDefinition,
    context: GeneratorContext,
): string {}
