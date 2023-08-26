import { pascalCase } from "scule";
import {
    type ApplicationDefinition,
    type ServiceDefinition,
    unflattenObject,
    isProcedureDefinition,
    type ProcedureDefinition,
    type JsonSchemaTypeValue,
} from "./utils";
import { type TObject } from "@sinclair/typebox";

export function createTypescriptClient(
    def: ApplicationDefinition,
    prefix = "Client"
) {
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
        modelParts.push(
            tsModelFromDefinition(`${prefix}${key}`, def.models[key] as TObject)
        );
    });
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

export function tsModelFromDefinition(name: string, def: TObject) {
    const fieldParts: string[] = [];
    const subModelParts: string[] = [];
    Object.keys(def.properties).forEach((key) => {
        const isOptional = !def.required?.includes(key);
        const prop = def.properties[key];
        const keyPart = isOptional ? `${key}?` : key;
        if ("anyOf" in prop) {
            // todo
        }
        if ("type" in prop) {
            switch (prop.type as JsonSchemaTypeValue) {
                case "string":
                    fieldParts.push(`${keyPart}: string;`);
                    break;
                case "number":
                    fieldParts.push(`${keyPart}: number;`);
                    break;
                case "integer":
                    fieldParts.push(`/**
                    * must be an integer
                    */
                    ${keyPart}: number;`);
                    break;
                case "null":
                    fieldParts.push(`${keyPart}: null;`);
                    break;
                case "Date":
                    fieldParts.push(`${keyPart}: Date;`);
                    break;
                case "boolean":
                    fieldParts.push(`${keyPart}: boolean;`);
                    break;
                case "list":
                    console.log(prop);
                    break;
                case "object":
                    console.log(prop);
                    break;
            }
        }
        console.log(def.properties[key]);
    });
    return `export interface ${name} {
        ${fieldParts.join("\n")}
    }
    ${subModelParts.join("\n")}`;
}
