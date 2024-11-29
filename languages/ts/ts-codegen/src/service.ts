import {
    isRpcDefinition,
    isServiceDefinition,
    pascalCase,
    ServiceDefinition,
} from "@arrirpc/codegen-utils";

import { CodegenContext, validVarName } from "./common";
import { tsRpcFromDefinition } from "./rpc";

export function tsServiceFromDefinition(
    def: ServiceDefinition,
    context: CodegenContext,
): { key: string; name: string; content: string } {
    const key = getServiceKey(context);
    const serviceName = getServiceName(context);
    const rpcParts: string[] = [];
    const subServices: { key: string; name: string; content: string }[] = [];
    for (const key of Object.keys(def)) {
        const subDef = def[key];
        if (isServiceDefinition(subDef)) {
            const subService = tsServiceFromDefinition(subDef, {
                clientName: context.clientName,
                typePrefix: context.typePrefix,
                generatedTypes: context.generatedTypes,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.instancePath}.${key}`,
                discriminatorParent: "",
                discriminatorKey: "",
                discriminatorValue: "",
                versionNumber: context.versionNumber,
                usedFeatures: context.usedFeatures,
                rpcGenerators: context.rpcGenerators,
            });
            if (subService.content) {
                subServices.push(subService);
            }
            continue;
        }
        if (isRpcDefinition(subDef)) {
            const rpc = tsRpcFromDefinition(subDef, {
                clientName: context.clientName,
                typePrefix: context.typePrefix,
                generatedTypes: context.generatedTypes,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                discriminatorParent: "",
                discriminatorKey: "",
                discriminatorValue: "",
                versionNumber: context.versionNumber,
                usedFeatures: context.usedFeatures,
                rpcGenerators: context.rpcGenerators,
            });
            if (rpc) {
                rpcParts.push(rpc);
            }
            continue;
        }
        console.warn(
            `Invalid definition found at procedures.${context.schemaPath}`,
        );
    }
    if (subServices.length === 0 && rpcParts.length === 0) {
        return {
            key,
            name: serviceName,
            content: "",
        };
    }
    return {
        key,
        name: serviceName,
        content: `export class ${serviceName} {
    private readonly _baseUrl: string;
    private readonly _headers: HeaderMap | (() => HeaderMap | Promise<HeaderMap>);
    private readonly _onError?: (err: unknown) => void; 
${subServices.map((service) => `    ${service.key}: ${service.name};`).join("\n")}
    constructor(
        options: {
            baseUrl?: string;
            headers?: HeaderMap | (() => HeaderMap | Promise<HeaderMap>);
            onError?: (err: unknown) => void;
        } = {},
    ) {
        this._baseUrl = options.baseUrl ?? "";
        this._headers = options.headers ?? {};
        this._onError = options.onError;
${subServices.map((service) => `        this.${service.key} = new ${service.name}(options);`).join("\n")}
    }
${rpcParts.map((rpc) => `    ${rpc}`).join("\n")}
}

${subServices.map((service) => service.content).join("\n")}`,
    };
}

export function getServiceKey(context: CodegenContext): string {
    const name = context.instancePath.split(".").pop() ?? "";
    return validVarName(name);
}

export function getServiceName(context: CodegenContext): string {
    if (context.instancePath.length === 0) {
        return context.clientName;
    }
    const serviceName = pascalCase(context.instancePath.split(".").join("_"), {
        normalize: true,
    });
    return `${context.clientName}${serviceName}Service`;
}
