import {
    type WsRpcDefinition,
    type HttpRpcDefinition,
    type RpcDefinition,
    type ServiceDefinition,
    pascalCase,
    isServiceDefinition,
    isRpcDefinition,
} from "@arrirpc/codegen-utils";
import {
    kotlinClassName,
    kotlinIdentifier,
    type CodegenContext,
} from "./_common";

export function kotlinProcedureFromSchema(
    schema: RpcDefinition,
    context: CodegenContext,
): string {
    switch (schema.transport) {
        case "http":
            return kotlinHttpRpcFromSchema(schema, context);
        case "ws":
            return kotlinWsRpcFromSchema(schema, context);
        default:
            console.warn(
                `[codegen-kotlin] Unknown transport type "${schema.transport}". Skipping "${context.instancePath}".`,
            );
            return "";
    }
}

export function kotlinHttpRpcFromSchema(
    schema: HttpRpcDefinition,
    context: CodegenContext,
): string {
    const name = getProcedureName(context);
    const params = schema.params
        ? kotlinClassName(`${context.modelPrefix}_${schema.params}`)
        : undefined;
    const response = schema.response
        ? kotlinClassName(`${context.modelPrefix}_${schema.response}`)
        : undefined;

    if (schema.isEventStream) {
        return `fun ${name}(
            scope: CoroutineScope,
            ${params ? `params: ${params},` : ""}
            lastEventId: String? = null,
            bufferCapacity: Int = 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onError: ((error: ${context.clientName}Error) -> Unit) = {},
            onConnectionError: ((error: ${context.clientName}Error) -> Unit) = {},
            onData: ((${response ? `data: ${response}` : ""}) -> Unit) = {},
        ): Job {
            val job = scope.launch {
                __handleSseRequest(
                    scope = scope,
                    httpClient = httpClient,
                    url = "$baseUrl${schema.path}",
                    method = HttpMethod.${pascalCase(schema.method, { normalize: true })},
                    params = ${params ? "params" : "null"},
                    headers = headers,
                    backoffTime = 0,
                    maxBackoffTime = 30000L,
                    lastEventId = lastEventId,
                    bufferCapacity = bufferCapacity,
                    onOpen = onOpen,
                    onClose = onClose,
                    onError = onError,
                    onConnectionError = onConnectionError,
                    onData = { str ->
                        ${response ? `val data = ${response}.fromJson(str)` : ""}
                        onData(${response ? "data" : ""})
                    }
                )
            }
            return job
        }`;
    }
    const headingCheck = `if (response.headers["Content-Type"] != "application/json") {
            throw ${context.clientName}Error(
                code = 0,
                errorMessage = "Expected server to return Content-Type \\"application/json\\". Got \\"\${response.headers["Content-Type"]}\\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }`;
    return `suspend fun ${name}(${params ? `params: ${params}` : ""}): ${response ?? "Unit"} {
        val response = __prepareRequest(
            client = httpClient,
            url = "$baseUrl${schema.path}",
            method = HttpMethod.${pascalCase(schema.method, { normalize: true })},
            params = ${params ? "params" : null},
            headers = headers?.invoke(),
        ).execute()
        ${response ? headingCheck : ""}
        if (response.status.value in 200..299) {
            return ${response ? `${response}.fromJson(response.bodyAsText())` : ""}
        }
        throw ${context.clientName}Error.fromJson(response.bodyAsText())
    }`;
}

export function kotlinWsRpcFromSchema(
    schema: WsRpcDefinition,
    context: CodegenContext,
): string {
    return "";
}

export interface KotlinService {
    name: string;
    content: string;
}

export function kotlinServiceFromSchema(
    schema: ServiceDefinition,
    context: CodegenContext,
): KotlinService {
    const name = getServiceName(context);
    const procedureParts: string[] = [];
    const subServiceParts: string[] = [];
    for (const key of Object.keys(schema)) {
        const kotlinKey = kotlinIdentifier(key);
        const subSchema = schema[key];
        if (isServiceDefinition(subSchema)) {
            const subService = kotlinServiceFromSchema(subSchema, {
                ...context,
                instancePath: `${context.instancePath}.${key}`,
            });
            procedureParts.push(`val ${kotlinKey}: ${subService.name} = ${subService.name}(
                httpClient = httpClient,
                baseUrl = baseUrl,
                headers = headers,
            )`);
            if (subService.content) {
                subServiceParts.push(subService.content);
            }
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const procedure = kotlinProcedureFromSchema(subSchema, {
                ...context,
                instancePath: `${context.instancePath}.${key}`,
            });
            if (procedure.length > 0) {
                procedureParts.push(procedure);
            }
            continue;
        }
    }
    return {
        name,
        content: `class ${name}(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: headersFn,
) {
    ${procedureParts.join("\n\n    ")}
}

${subServiceParts.join("\n\n")}`,
    };
}

export function getProcedureName(context: CodegenContext): string {
    const name = context.instancePath.split(".").pop() ?? "";
    return kotlinIdentifier(name);
}

export function getServiceName(context: CodegenContext): string {
    const name = pascalCase(context.instancePath.split(".").join("_"));
    return `${context.clientName}${name}Service`;
}
