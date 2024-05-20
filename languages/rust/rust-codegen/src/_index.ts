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
    pascalCase,
    type RpcDefinition,
    type Schema,
    type ServiceDefinition,
    unflattenProcedures,
} from "@arrirpc/codegen-utils";
import path from "pathe";

import { GeneratorContext, RustProperty } from "./_common";
import rustAnyFromSchema from "./any";

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
    return "";
}

export function rustTypeFromSchema(
    schema: Schema,
    context: GeneratorContext,
): RustProperty {
    if (isSchemaFormType(schema)) {
        // TODO
    }
    if (isSchemaFormProperties(schema)) {
        // TODO
    }
    if (isSchemaFormEnum(schema)) {
        // TODO
    }
    if (isSchemaFormElements(schema)) {
        // TODO
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

export function rustServiceFromDef(
    key: string,
    schema: ServiceDefinition,
    context: GeneratorContext,
): string {
    // const serviceId = pascalCase(`${context.parentId ?? ""}_${key}`);
    // context.parentId = serviceId;
    // const rpcsParts: string[] = [];
    // const subServiceParts: string[] = [];
    // for (const key of Object.keys(schema)) {
    //     const subSchema = schema[key];
    //     if (isServiceDefinition(subSchema)) {
    //         const subService = rustServiceFromDef(key, subSchema, context);
    //         subServiceParts.push(subService);
    //         continue;
    //     }
    //     if (isRpcDefinition(subSchema)) {
    //         const rpc = rustProcedureFromDef(key, subSchema, context);
    //         rpcsParts.push(rpc);
    //     }
    // }
    return "";
}

export function rustProcedureFromDef(
    key: string,
    schema: RpcDefinition,
    context: GeneratorContext,
): string {
    return "";
}
