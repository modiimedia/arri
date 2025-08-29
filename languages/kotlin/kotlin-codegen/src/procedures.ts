import {
    isRpcDefinition,
    isServiceDefinition,
    pascalCase,
    type RpcDefinition,
    type ServiceDefinition,
} from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    getCodeComment,
    kotlinClassName,
    kotlinIdentifier,
} from './_common';

export function kotlinProcedureFromSchema(
    schema: RpcDefinition,
    context: CodegenContext,
): string {
    switch (schema.transport) {
        case 'http':
            return kotlinHttpRpcFromSchema(schema, context);
        case 'ws':
            return kotlinWsRpcFromSchema(schema, context);
        default:
            console.warn(
                `[codegen-kotlin] Unknown transport type "${schema.transport}". Skipping "${context.instancePath}".`,
            );
            return '';
    }
}

export function kotlinHttpRpcFromSchema(
    schema: RpcDefinition,
    context: CodegenContext,
): string {
    const name = getProcedureName(context);
    const params = schema.params
        ? kotlinClassName(`${context.typePrefix}_${schema.params}`)
        : undefined;
    const response = schema.response
        ? kotlinClassName(`${context.typePrefix}_${schema.response}`)
        : undefined;
    const codeComment = getCodeComment(
        {
            description: schema.description,
            isDeprecated: schema.isDeprecated,
        },
        '',
        'method',
    );

    if (schema.isEventStream) {
        return `${codeComment}suspend fun ${name}(
            ${params ? `params: ${params},` : ''}
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: ${context.clientName}Error) -> Unit) = {},
            onData: ((${response ? `data: ${response}` : ''}) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl${schema.path}",
                method = HttpMethod.${pascalCase(schema.method ?? 'post', { normalize: true })},
                params = ${params ? 'params' : 'null'},
                headers = headers,
                backoffTime = 0,
                maxBackoffTime = maxBackoffTime ?: 30000L,
                lastEventId = lastEventId,
                bufferCapacity = bufferCapacity,
                onOpen = onOpen,
                onClose = onClose,
                onError = onError,
                onRequestError = onRequestError,
                onResponseError = onResponseError,
                onData = { str ->
                    ${response ? `val data = ${response}.fromJson(str)` : ''}
                    onData(${response ? 'data' : ''})
                }
            )
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
    return `${codeComment}suspend fun ${name}(${params ? `params: ${params}` : ''}): ${response ?? 'Unit'} {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl${schema.path}",
                method = HttpMethod.${pascalCase(schema.method ?? 'post', { normalize: true })},
                params = ${params ? 'params' : null},
                headers = headers?.invoke(),
            ).execute()
            ${response ? headingCheck : ''}
            if (response.status.value in 200..299) {
                return ${response ? `${response}.fromJson(response.bodyAsText())` : ''}
            }
            throw ${context.clientName}Error.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }`;
}

export function kotlinWsRpcFromSchema(
    _schema: RpcDefinition,
    _context: CodegenContext,
): string {
    return '';
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
                onError = onError,
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
    private val headers: __${context.clientName}HeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    ${procedureParts.join('\n\n    ')}
}

${subServiceParts.join('\n\n')}`,
    };
}

export function getProcedureName(context: CodegenContext): string {
    const name = context.instancePath.split('.').pop() ?? '';
    return kotlinIdentifier(name);
}

export function getServiceName(context: CodegenContext): string {
    const name = pascalCase(context.instancePath.split('.').join('_'));
    return `${context.clientName}${name}Service`;
}
