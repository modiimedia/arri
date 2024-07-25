import {
    HttpRpcDefinition,
    isRpcDefinition,
    isServiceDefinition,
    RpcDefinition,
    ServiceDefinition,
    WsRpcDefinition,
} from "@arrirpc/codegen-utils";
import assert from "assert";

import {
    formatDescriptionComment,
    GeneratorContext,
    validRustIdentifier,
    validRustName,
} from "./_common";

export function rustRpcFromSchema(
    schema: RpcDefinition,
    context: GeneratorContext,
): string {
    switch (schema.transport) {
        case "http":
            return rustHttpRpcFromSchema(schema, context);
        case "ws":
            return rustWsRpcFromSchema(schema, context);
        default:
            console.warn(
                `[rust-codegen] Unknown transport type "${schema.transport}". Skipping ${context.instancePath}.`,
            );
            return "";
    }
}

export function rustHttpRpcFromSchema(
    schema: HttpRpcDefinition,
    context: GeneratorContext,
): string {
    const functionName = getFunctionName(context.instancePath);
    let leading = "";
    if (schema.description) {
        leading += formatDescriptionComment(schema.description);
        leading += "\n";
    }
    if (schema.isDeprecated) {
        leading += "#[deprecated]\n";
    }
    const params = schema.params ? validRustName(schema.params) : undefined;
    const response = schema.response
        ? validRustName(schema.response)
        : undefined;
    if (schema.isEventStream) {
        return `${leading}pub async fn ${functionName}<OnEvent>(
            &self,
            ${params ? `params: ${context.typeNamePrefix}${params},` : ""}
            on_event: &mut OnEvent,
            max_retry_count: Option<u64>,
            max_retry_interval: Option<u64>,
        ) where
            OnEvent: FnMut(SseEvent<${response ? `${context.typeNamePrefix}${response}` : "EmptyArriModel"}>, &mut SseController) + std::marker::Send + std::marker::Sync,
        {
            parsed_arri_sse_request(
                ArriParsedSseRequestOptions {
                    client: &self._config.http_client,
                    url: format!("{}${schema.path}", &self._config.base_url),
                    method: reqwest::Method::${schema.method.toUpperCase()},
                    headers: self._config.headers.clone(),
                    client_version: "${context.clientVersion}".to_string(),
                    max_retry_count,
                    max_retry_interval,
                },
                ${params ? `Some(params)` : "None::<EmptyArriModel>"},
                on_event,
            )
            .await;
        }`;
    }
    return `${leading}pub async fn ${functionName}(
        &self,
        ${params ? `params: ${context.typeNamePrefix}${params},` : ""}
    ) -> Result<${context.typeNamePrefix}${response ?? "()"}, ArriServerError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}${schema.path}", &self._config.base_url),
                method: reqwest::Method::${schema.method.toUpperCase()},
                headers: self._config.headers.clone(),
                client_version: "${context.clientVersion}".to_string(),
            },
            ${params ? `Some(params)` : "None::<EmptyArriModel>"},
            |body| ${response ? `return ${context.typeNamePrefix}${response}::from_json_string(body)` : "{}"},
        )
        .await
    }`;
}

export function rustWsRpcFromSchema(
    schema: WsRpcDefinition,
    context: GeneratorContext,
): string {
    console.warn(
        `[rust-codegen] WS RPCs are not supported at this time. Skipping ${context.instancePath}.`,
    );
    return "";
}

export function getFunctionName(instancePath: string): string {
    assert(instancePath.length > 0);
    const name = instancePath.split(".").pop() ?? "";
    return validRustIdentifier(name);
}

export function getServiceName(
    instancePath: string,
    context: GeneratorContext,
): string {
    assert(instancePath.length > 0);
    const name = instancePath.split(".").join("_");
    return validRustName(`${context.clientName}_${name}_Service`);
}

export function rustServiceFromSchema(
    schema: ServiceDefinition,
    context: GeneratorContext,
): { name: string; content: string } {
    const serviceName = getServiceName(context.instancePath, context);
    const subServices: { key: string; name: string }[] = [];
    const subServiceContent: string[] = [];
    const rpcParts: string[] = [];
    for (const key of Object.keys(schema)) {
        const subSchema = schema[key]!;
        if (isServiceDefinition(subSchema)) {
            const subService = rustServiceFromSchema(subSchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                generatedTypes: context.generatedTypes,
            });
            if (subService.content) {
                subServices.push({
                    key: validRustIdentifier(key),
                    name: subService.name,
                });
            }
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const rpc = rustRpcFromSchema(subSchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                generatedTypes: context.generatedTypes,
            });
            if (rpc) {
                rpcParts.push(rpc);
            }
            continue;
        }
        throw new Error(
            `[rust-codegen] Invalid schema at /procedures/${context.instancePath}.`,
        );
    }
    const paramSuffix = subServices.length > 0 ? ".clone()" : "";
    return {
        name: serviceName,
        content: `#[derive(Clone)]
pub struct ${serviceName} {
    _config: InternalArriClientConfig,
${subServices.map((service) => `    pub ${service.key}: ${service.name},`).join("\n")}
}

impl ArriClientService for ${serviceName} {
    fn create(config: ArriClientConfig) -> Self {
        Self {
            _config: InternalArriClientConfig::from(config${paramSuffix}),
${subServices.map((service, index) => `            ${service.key}: ${service.name}::create(config${index === subServices.length - 1 ? "" : ".clone()"}),`).join("\n")}
        }
    }
    fn update_headers(&self, headers: HashMap<&'static str, String>) {
        let mut unwrapped_headers = self._config.headers.write().unwrap();
        *unwrapped_headers = headers.clone();
${subServices.map((service, index) => `        self.${service.key}.update_headers(headers${index === subServices.length - 1 ? "" : ".clone()"});`).join("\n")}
    }
}

impl ${serviceName} {
${rpcParts.join("\n")}
}

${subServiceContent.join("\n\n")}
`,
    };
}
