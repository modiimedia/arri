import {
    HttpRpcDefinition,
    isRpcDefinition,
    isServiceDefinition,
    RpcDefinition,
    ServiceDefinition,
    WsRpcDefinition,
} from "@arrirpc/codegen-utils";

import {
    codeComments,
    GeneratorContext,
    validSwiftKey,
    validTypeName,
} from "./_common";

export function swiftProcedureFromSchema(
    schema: RpcDefinition,
    context: GeneratorContext,
): string {
    switch (schema.transport) {
        case "http":
            return swiftHttpProcedureFromSchema(schema, context);
        case "ws":
            return swiftWsProcedureFromSchema(schema, context);
        default:
            console.warn(
                `[swift-codegen] Unsupported transport type at ${context.instancePath}`,
            );
            return "";
    }
}

export function swiftHttpProcedureFromSchema(
    schema: HttpRpcDefinition,
    context: GeneratorContext,
): string {
    const rpcName = getRpcName(context.instancePath);
    const comments = codeComments({
        metadata: {
            description: schema.description,
            isDeprecated: schema.isDeprecated,
        },
    });
    const params = schema.params
        ? `${context.typePrefix}${validTypeName(schema.params)}`
        : undefined;
    const response = schema.response
        ? `${context.typePrefix}${validTypeName(schema.response)}`
        : undefined;
    if (schema.isEventStream) {
        // TODO
        return "";
    }
    return `${comments}public func ${rpcName}(${params ? `_ params: ${params}` : ""}) async throws -> ${response ?? "()"} {
        ${response ? `let result: ${response} = ` : ""}try await parsedArriHttpRequest(
            http: self.HTTPClient,
            url: "\\(self.baseURL)${schema.path}",
            method: HTTPRequest.Method.${schema.method},
            headers: self.headers,
            clientVersion: "${context.clientVersion}"${params ? "," : ""}
            ${params ? `params: params` : ""}
        )
        ${response ? `return result` : ""}
    }`;
}

export function getRpcName(instancePath: string) {
    const part = instancePath.split(".").pop();
    if (!part) {
        throw new Error(`Error determining procedure name at ${instancePath}`);
    }
    return validSwiftKey(part);
}

export function swiftWsProcedureFromSchema(
    schema: WsRpcDefinition,
    context: GeneratorContext,
): string {
    console.warn(
        "[swift-codegen] Websocket procedures are not supported at this time.",
    );
    const name = getRpcName(context.instancePath);
    const params = schema.params
        ? `${context.typePrefix}${validTypeName(schema.params)}`
        : undefined;
    const response = schema.response
        ? `${context.typePrefix}${validTypeName(schema.response)}`
        : undefined;
    const comments = codeComments(
        {
            metadata: {
                description: schema.description,
                isDeprecated: schema.isDeprecated,
            },
        },
        `    `,
    );
    return `${comments}    public func ${name}(${params ? `_ params: ${params}` : ""}) async throws -> ${response ?? "()"} {
        throw ArriRequestError.notImplementedError
    }`;
}

export function swiftServiceFromSchema(
    schema: ServiceDefinition,
    context: GeneratorContext,
): string {
    const serviceName = getServiceName(
        context.instancePath,
        context.clientName,
    );
    const services: { key: string; typeName: string }[] = [];
    const procedureParts: string[] = [];
    const subContent: string[] = [];
    for (const key of Object.keys(schema)) {
        const subSchema = schema[key];
        if (isServiceDefinition(subSchema)) {
            const subService = swiftServiceFromSchema(subSchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typePrefix: context.typePrefix,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                generatedTypes: context.generatedTypes,
            });
            if (subService) {
                const subServiceKey = validSwiftKey(key);
                const subServiceName = getServiceName(
                    `${context.instancePath}.${key}`,
                    context.clientName,
                );
                services.push({
                    key: subServiceKey,
                    typeName: subServiceName,
                });
                subContent.push(subService);
            }
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const rpc = swiftProcedureFromSchema(subSchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typePrefix: context.typePrefix,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                generatedTypes: context.generatedTypes,
            });
            if (rpc) {
                procedureParts.push(rpc);
            }
            continue;
        }
    }
    return `public class ${serviceName} {
    var baseURL: String
    var HTTPClient: ArriHTTPClient
    var headers: () -> Dictionary<String, String>
${services.map((service) => `   var ${service.key}: ${service.typeName}`).join("\n")}
    public init(
        baseURL: String,
        HTTPClient: ArriHTTPClient,
        headers: @escaping () -> Dictionary<String, String>
    ) {
        self.baseURL = baseURL
        self.HTTPClient = HTTPClient
        self.headers = headers
${services
    .map(
        (service) => `       self.${service.key} = ${service.typeName}(
            baseURL: baseURL,
            HTTPClient: HTTPClient,
            headers: headers
        )`,
    )
    .join("\n")}    
    }
${procedureParts.join("\n")}
        
}

${subContent.join("\n")}`;
}

export function getServiceName(instancePath: string, clientName: string) {
    if (instancePath.length === 0) {
        return clientName;
    }
    const name = `${clientName}${validTypeName(instancePath.split(".").join("_"))}Service`;
    return name;
}
