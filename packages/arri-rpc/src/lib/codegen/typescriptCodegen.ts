import { pascalCase } from "scule";
import { format } from "prettier";
import {
    type ApplicationDefinition,
    type ServiceDefinition,
    unflattenObject,
    isProcedureDefinition,
    type ProcedureDefinition,
    isJsonSchemaScalarType,
    isJsonSchemaNullType,
    isJsonSchemaObject,
    type JsonSchemaObject,
    isJsonSchemaEnum,
    isJsonSchemaArray,
    type JsonSchemaScalarType,
} from "./utils";

let createdModels: string[] = [];

export function createTypescriptClient(
    def: ApplicationDefinition,
    prefix = "Client"
) {
    createdModels = [];
    const services = unflattenObject(def.procedures) as Record<
        string,
        ServiceDefinition
    >;
    const serviceParts: Array<{ name: string; key: string; content: string }> =
        [];
    const modelParts: string[] = [];
    Object.keys(services).forEach((key) => {
        const serviceName = pascalCase(`${prefix}_${key}_service`);
        serviceParts.push({
            name: serviceName,
            key,
            content: tsServiceFromServiceDefinition(serviceName, services[key]),
        });
    });
    Object.keys(def.models).forEach((key) => {
        const modelName = pascalCase(`${key}`);
        if (!createdModels.includes(modelName)) {
            modelParts.push(tsModelFromDefinition(modelName, def.models[key]));
            createdModels.push(modelName);
        }
    });
    return format(
        `/* eslint-disable */
    import { arriRequest, ArriRequestError } from 'arri-client';
    
    export class ${prefix} {
        ${serviceParts
            .map((service) => `${service.key}: ${service.name}`)
            .join("\n")}
        constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
            ${serviceParts
                .map(
                    (service) =>
                        `this.${service.key} = new ${service.name}(opts);`
                )
                .join("\n")}
        }
    }

    ${serviceParts.map((service) => service.content).join("\n")}
    ${modelParts.join("\n")}`,
        {
            parser: "typescript",
        }
    );
}

export function tsServiceFromServiceDefinition(
    name: string,
    def: ServiceDefinition
) {
    const rpcParts: string[] = [];
    const subServiceParts: Array<{
        name: string;
        key: string;
        content: string;
    }> = [];
    Object.keys(def).forEach((key) => {
        const val = def[key];
        if (isProcedureDefinition(val)) {
            rpcParts.push(tsRpcFromProcedureDefinition(key, val));
            return;
        }

        const subServiceName = pascalCase(
            `${name.split("Service").join("")}_${key}_service`
        );
        subServiceParts.push({
            name: subServiceName,
            key,
            content: tsServiceFromServiceDefinition(subServiceName, val),
        });
    });
    return `export class ${name} {
        baseUrl: string;
        headers: Record<string, string>;
        ${subServiceParts
            .map((service) => `${service.key}: ${service.name};`)
            .join("\n")}
        constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
            this.baseUrl = opts.baseUrl ?? "";
            this.headers = opts.headers ?? {};
            ${subServiceParts
                .map(
                    (service) =>
                        `this.${service.key} = new ${service.name}(opts);`
                )
                .join("\n")}
        }
        ${rpcParts.join("\n")}
    }
    ${subServiceParts.map((service) => service.content).join("\n")}`;
}

export function tsRpcFromProcedureDefinition(
    name: string,
    def: ProcedureDefinition
): string {
    let paramStr = "";
    let responseName = "";
    if (def.params) {
        paramStr = `params: ${def.params}`;
    }
    if (def.response) {
        responseName = def.response;
    }
    return `async ${name}(${paramStr}) {
        return arriRequest<${responseName || "undefined"}>({
            url: \`\${this.baseUrl}${def.path}\`,
            method: '${def.method}',
            ${paramStr.length ? `params,` : ""}
            headers: this.headers,
        });
    }`;
}

export function tsModelFromDefinition(name: string, def: JsonSchemaObject) {
    const fieldParts: string[] = [];
    const subModelParts: string[] = [];
    Object.keys(def.properties ?? {}).forEach((key) => {
        const isOptional = !def.required?.includes(key);
        const prop = def.properties?.[key];
        const keyPart = isOptional ? `${key}?` : key;
        if (isJsonSchemaScalarType(prop)) {
            fieldParts.push(
                tsInterfaceScalarField(key, prop, isOptional) ?? ""
            );
            return;
        }
        if (isJsonSchemaNullType(prop)) {
            switch (prop.type) {
                case "null":
                    fieldParts.push(`${keyPart}: null;`);
                    break;
                case "undefined":
                    fieldParts.push(`${keyPart}: undefined`);
                    break;
            }
            return;
        }
        if (isJsonSchemaObject(prop)) {
            const subModelName =
                prop.$id ?? (pascalCase(`${name}_${key}`) as string);
            if (!createdModels.includes(subModelName)) {
                const content = tsModelFromDefinition(
                    subModelName,
                    prop as any
                );
                subModelParts.push(content);
            }
            fieldParts.push(`${keyPart}: ${subModelName};`);
            return;
        }

        if (isJsonSchemaEnum(prop)) {
            const vals = prop.anyOf.map((opt) =>
                opt.type === "string" ? `'${opt.const}'` : `${opt.const}`
            );
            fieldParts.push(`${keyPart}: ${vals.join(" | ")};`);
            return;
        }
        if (isJsonSchemaArray(prop)) {
            if (isJsonSchemaScalarType(prop.items)) {
                const part = tsInterfaceScalarField(
                    key,
                    prop.items,
                    isOptional
                ).replace(";", "[];");
                fieldParts.push(part);
                return;
            }
            if (isJsonSchemaNullType(prop.items)) {
                if (prop.items.type === "null") {
                    fieldParts.push(`${keyPart}: null[]`);
                    return;
                }
                fieldParts.push(`${keyPart}: undefined[]`);
                return;
            }
            if (isJsonSchemaObject(prop.items)) {
                const subModelName =
                    prop.items.$id ?? pascalCase(`${name}_${key}_item`);
                if (!createdModels.includes(subModelName)) {
                    subModelParts.push(
                        tsModelFromDefinition(subModelName, prop.items)
                    );
                }
                fieldParts.push(`${keyPart}: ${subModelName}[];`);
            }
        }
    });
    return `export interface ${name} {
        ${fieldParts.join("\n")}
    }
    ${subModelParts.join("\n")}`;
}

function tsInterfaceScalarField(
    key: string,
    prop: JsonSchemaScalarType,
    isOptional = false
): string {
    const keyPart = isOptional ? `${key}?` : key;
    switch (prop.type) {
        case "string":
            return `${keyPart}: string;`;
        case "bigint":
            return `${keyPart}: bigint;`;
        case "Date":
            return `${keyPart}: Date;`;
        case "boolean":
            return `${keyPart}: boolean;`;
        case "integer":
            return `/**
                    * must be an integer
                    */
                    ${keyPart}: number;`;
        case "number":
            return `${keyPart}: number;`;
    }
}
