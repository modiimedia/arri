import fs from 'node:fs';

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
} from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    kotlinClassName,
    kotlinIdentifier,
} from './_common';
import { kotlinAnyFromSchema } from './any';
import { kotlinArrayFromSchema } from './array';
import { kotlinDiscriminatorFromSchema } from './discriminator';
import { kotlinEnumFromSchema } from './enum';
import { kotlinMapFromSchema } from './map';
import { kotlinObjectFromSchema } from './object';
import {
    kotlinBooleanFromSchema,
    kotlinFloat32FromSchema,
    kotlinFloat64FromSchema,
    kotlinInt8FromSchema,
    kotlinInt16FromSchema,
    kotlinInt32FromSchema,
    kotlinInt64FromSchema,
    kotlinStringFromSchema,
    kotlinTimestampFromSchema,
    kotlinUint8FromSchema as kotlinUInt8FromSchema,
    kotlinUint16FromSchema as kotlinUInt16FromSchema,
    kotlinUint32FromSchema as kotlinUInt32FromSchema,
    kotlinUint64FromSchema as kotlinUInt64FromSchema,
} from './primitives';
import {
    kotlinProcedureFromSchema,
    kotlinServiceFromSchema,
} from './procedures';
import { kotlinRefFromSchema } from './ref';

export interface ServiceContext {
    clientName: string;
    typePrefix?: string;
    modelJsonInstances: Record<string, string>;
}

export interface KotlinClientOptions {
    clientName?: string;
    typePrefix?: string;
    outputFile: string;
    rootService?: string;
}

export const kotlinClientGenerator = defineGeneratorPlugin(
    (options: KotlinClientOptions) => {
        return {
            options,
            run(def) {
                const client = kotlinClientFromAppDefinition(def, options);
                fs.writeFileSync(options.outputFile, client);
            },
        };
    },
);

export function kotlinClientFromAppDefinition(
    def: AppDefinition,
    options: KotlinClientOptions,
): string {
    const clientName = kotlinClassName(options.clientName ?? 'Client');
    const context: CodegenContext = {
        typePrefix: options.typePrefix ?? '',
        clientName,
        clientVersion: def.info?.version ?? '',
        instancePath: '',
        schemaPath: '',
        existingTypeIds: [],
    };
    const modelParts: string[] = [];
    for (const key of Object.keys(def.definitions)) {
        const subSchema = def.definitions[key]!;
        const model = kotlinTypeFromSchema(subSchema, {
            typePrefix: context.typePrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: `/${key}`,
            schemaPath: `/definitions`,
            existingTypeIds: context.existingTypeIds,
        });
        if (model.content) {
            modelParts.push(model.content);
        }
    }
    const procedureParts: string[] = [];
    const subServiceParts: string[] = [];
    const services = unflattenProcedures(def.procedures, options.rootService);
    for (const key of Object.keys(services)) {
        const subSchema = services[key];
        if (isServiceDefinition(subSchema)) {
            const kotlinKey = kotlinIdentifier(key);
            const subService = kotlinServiceFromSchema(subSchema, {
                ...context,
                instancePath: `${key}`,
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
                instancePath: key,
            });
            if (procedure.length) {
                procedureParts.push(procedure);
            }
            continue;
        }
    }
    if (procedureParts.length === 0) {
        return `${getHeader({ clientName, clientVersion: context.clientVersion, packageName: '' })}
${getUtilityClasses(clientName)}

${modelParts.join('\n\n')}

${getUtilityFunctions(clientName)}`;
    }
    return `${getHeader({ clientName, clientVersion: context.clientVersion, packageName: '' })}

class ${clientName}(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __${clientName}HeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    ${procedureParts.join('\n\n    ')}
}

${subServiceParts.join('\n\n')}

${getUtilityClasses(clientName)}

${modelParts.join('\n\n')}

${getUtilityFunctions(clientName)}`;
}

export function kotlinTypeFromSchema(schema: Schema, context: CodegenContext) {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case 'string':
                return kotlinStringFromSchema(schema, context);
            case 'boolean':
                return kotlinBooleanFromSchema(schema, context);
            case 'timestamp':
                return kotlinTimestampFromSchema(schema, context);
            case 'float32':
                return kotlinFloat32FromSchema(schema, context);
            case 'float64':
                return kotlinFloat64FromSchema(schema, context);
            case 'int8':
                return kotlinInt8FromSchema(schema, context);
            case 'int16':
                return kotlinInt16FromSchema(schema, context);
            case 'int32':
                return kotlinInt32FromSchema(schema, context);
            case 'int64':
                return kotlinInt64FromSchema(schema, context);
            case 'uint8':
                return kotlinUInt8FromSchema(schema, context);
            case 'uint16':
                return kotlinUInt16FromSchema(schema, context);
            case 'uint32':
                return kotlinUInt32FromSchema(schema, context);
            case 'uint64':
                return kotlinUInt64FromSchema(schema, context);
            default:
                schema.type satisfies never;
                throw new Error(`Unhandled schema.type case`);
        }
    }
    if (isSchemaFormEnum(schema)) {
        return kotlinEnumFromSchema(schema, context);
    }
    if (isSchemaFormProperties(schema)) {
        return kotlinObjectFromSchema(schema, context);
    }
    if (isSchemaFormElements(schema)) {
        return kotlinArrayFromSchema(schema, context);
    }
    if (isSchemaFormValues(schema)) {
        return kotlinMapFromSchema(schema, context);
    }
    if (isSchemaFormDiscriminator(schema)) {
        return kotlinDiscriminatorFromSchema(schema, context);
    }
    if (isSchemaFormRef(schema)) {
        return kotlinRefFromSchema(schema, context);
    }
    return kotlinAnyFromSchema(schema, context);
}

function getUtilityClasses(clientName: string): string {
    return `interface ${clientName}Model {
    fun toJson(): String
    fun toUrlQueryParams(): String
}

interface ${clientName}ModelFactory<T> {
    fun new(): T
    fun fromJson(input: String): T
    fun fromJsonElement(
        __input: JsonElement,
        instancePath: String = "",
    ): T
}

data class ${clientName}Error(
    val code: Int,
    val errorMessage: String,
    val data: JsonElement?,
    val stack: List<String>?,
) : Exception(errorMessage), ${clientName}Model {
    override fun toJson(): String {
        var output = "{"
        output += "\\"code\\":"
        output += "$code"
        output += ",\\"message\\":"
        output += buildString { printQuoted(errorMessage) }
        if (data != null) {
            output += ",\\"data\\":"
            output += JsonInstance.encodeToString(data)
        }
        if (stack != null) {
            output += ",\\"stack\\":"
            output += "["
            for ((__index, __element) in stack.withIndex()) {
                if (__index > 0) {
                    output += ","
                }
                output += buildString { printQuoted(__element) }
            }
            output += "]"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("code=\${code}")
        queryParts.add("message=\${errorMessage}")
        return queryParts.joinToString("&")
    }

    companion object Factory : ${clientName}ModelFactory<${clientName}Error> {
        override fun new(): ${clientName}Error {
            return ${clientName}Error(
                code = 0,
                errorMessage = "",
                data = null,
                stack = null
            )
        }

        override fun fromJson(input: String): ${clientName}Error {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        override fun fromJsonElement(__input: JsonElement, instancePath: String): ${clientName}Error {
            if (__input !is JsonObject) {
                __logError("[WARNING] ${clientName}Error.fromJsonElement() expected JsonObject at $instancePath. Got \${__input.javaClass}. Initializing empty ${clientName}Error.")
            }
            val code = when (__input.jsonObject["code"]) {
                is JsonPrimitive -> __input.jsonObject["code"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
            val errorMessage = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val data = when (__input.jsonObject["data"]) {
                is JsonNull -> null
                is JsonElement -> __input.jsonObject["data"]!!
                else -> null
            }
            val stack = when (__input.jsonObject["stack"]) {
                is JsonArray -> {
                    val stackVal = mutableListOf<String>()
                    for (item in __input.jsonObject["stack"]!!.jsonArray) {
                        stackVal.add(
                            when (item) {
                                is JsonPrimitive -> item.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    stackVal
                }

                else -> null

            }
            return ${clientName}Error(
                code,
                errorMessage,
                data,
                stack,
            )
        }

    }
}`;
}

function getUtilityFunctions(clientName: string): string {
    return `// Implementation copied from https://github.com/Kotlin/kotlinx.serialization/blob/d0ae697b9394103879e6c7f836d0f7cf128f4b1e/formats/json/commonMain/src/kotlinx/serialization/json/internal/StringOps.kt#L45
private const val STRING = '"'

private fun toHexChar(i: Int): Char {
    val d = i and 0xf
    return if (d < 10) (d + '0'.code).toChar()
    else (d - 10 + 'a'.code).toChar()
}

private val ESCAPE_STRINGS: Array<String?> = arrayOfNulls<String>(93).apply {
    for (c in 0..0x1f) {
        val c1 = toHexChar(c shr 12)
        val c2 = toHexChar(c shr 8)
        val c3 = toHexChar(c shr 4)
        val c4 = toHexChar(c)
        this[c] = "\\\\u$c1$c2$c3$c4"
    }
    this['"'.code] = "\\\\\\""
    this['\\\\'.code] = "\\\\\\\\"
    this['\\t'.code] = "\\\\t"
    this['\\b'.code] = "\\\\b"
    this['\\n'.code] = "\\\\n"
    this['\\r'.code] = "\\\\r"
    this[0x0c] = "\\\\f"
}

private val ESCAPE_MARKERS: ByteArray = ByteArray(93).apply {
    for (c in 0..0x1f) {
        this[c] = 1.toByte()
    }
    this['"'.code] = '"'.code.toByte()
    this['\\\\'.code] = '\\\\'.code.toByte()
    this['\\t'.code] = 't'.code.toByte()
    this['\\b'.code] = 'b'.code.toByte()
    this['\\n'.code] = 'n'.code.toByte()
    this['\\r'.code] = 'r'.code.toByte()
    this[0x0c] = 'f'.code.toByte()
}

private fun StringBuilder.printQuoted(value: String) {
    append(STRING)
    var lastPos = 0
    for (i in value.indices) {
        val c = value[i].code
        if (c < ESCAPE_STRINGS.size && ESCAPE_STRINGS[c] != null) {
            append(value, lastPos, i) // flush prev
            append(ESCAPE_STRINGS[c])
            lastPos = i + 1
        }
    }

    if (lastPos != 0) append(value, lastPos, value.length)
    else append(value)
    append(STRING)
}

private fun __logError(string: String) {
    System.err.println(string)
}

private suspend fun __prepareRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: ${clientName}Model?,
    headers: MutableMap<String, String>?,
): HttpStatement {
    var finalUrl = url
    var finalBody = ""
    when (method) {
        HttpMethod.Get, HttpMethod.Head -> {
            finalUrl = "$finalUrl?\${params?.toUrlQueryParams() ?: ""}"
        }

        HttpMethod.Post, HttpMethod.Put, HttpMethod.Patch, HttpMethod.Delete -> {
            finalBody = params?.toJson() ?: ""
        }
    }
    val builder = HttpRequestBuilder()
    builder.method = method
    builder.url(finalUrl)
    builder.timeout {
        requestTimeoutMillis = 10 * 60 * 1000
    }
    if (headers != null) {
        for (entry in headers.entries) {
            builder.headers[entry.key] = entry.value
        }
    }
    builder.headers["client-version"] = generatedClientVersion
    if (method != HttpMethod.Get && method != HttpMethod.Head) {
        builder.setBody(finalBody)
    }
    return client.prepareRequest(builder)
}

// SSE_FN_START
private enum class __${clientName}SseEventLineType {
    Id,
    Event,
    Data,
    Retry,
    None,
}

private fun __parseSseEventLine(line: String): Pair<__${clientName}SseEventLineType, String> {
    if (line.startsWith("id:")) {
        return Pair(__${clientName}SseEventLineType.Id, line.substring(3).trim())
    }
    if (line.startsWith("event:")) {
        return Pair(__${clientName}SseEventLineType.Event, line.substring(6).trim())
    }
    if (line.startsWith("data:")) {
        return Pair(__${clientName}SseEventLineType.Data, line.substring(5).trim())
    }
    if (line.startsWith("retry:")) {
        return Pair(__${clientName}SseEventLineType.Retry, line.substring(6).trim())
    }
    return Pair(__${clientName}SseEventLineType.None, "")
}

private data class __${clientName}SseEvent(
    val id: String? = null,
    val event: String,
    val data: String,
    val retry: Int? = null
)

private class __${clientName}SseEventParsingResult(val events: List<__${clientName}SseEvent>, val leftover: String)

private fun __parseSseEvents(input: String): __${clientName}SseEventParsingResult {
    val events = mutableListOf<__${clientName}SseEvent>()
    val lines = input.lines()
    if (lines.isEmpty()) {
        return __${clientName}SseEventParsingResult(events = listOf(), leftover = "")
    }
    var id: String? = null
    var event: String? = null
    var data: String? = null
    var retry: Int? = null
    var lastIndex: Int? = 0
    lines.forEachIndexed { index, line ->
        if (line.isNotEmpty()) {
            val (type, value) = __parseSseEventLine(line)
            when (type) {
                __${clientName}SseEventLineType.Id -> id = value
                __${clientName}SseEventLineType.Event -> event = value
                __${clientName}SseEventLineType.Data -> data = value
                __${clientName}SseEventLineType.Retry -> retry = value.toInt()
                __${clientName}SseEventLineType.None -> {}
            }
        }
        val isEnd = line == ""
        if (isEnd) {
            if (data != null) {
                events.add(
                    __${clientName}SseEvent(
                        id = id,
                        event = event ?: "message",
                        data = data!!,
                        retry = retry,
                    )
                )
            }
            id = null
            event = null
            data = null
            retry = null
            lastIndex = if (index + 1 < lines.size) index + 1 else null
        }
    }
    return __${clientName}SseEventParsingResult(
        events = events,
        leftover = if (lastIndex != null) lines.subList(lastIndex!!, lines.size).joinToString(separator = "\\n") else ""
    )
}
// SSE_FN_END

private suspend fun __handleSseRequest(
    httpClient: HttpClient,
    url: String,
    method: HttpMethod,
    params: ${clientName}Model?,
    headers: __${clientName}HeadersFn,
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onError: ((err: Exception) -> Unit) = {},
    onRequestError: ((err: Exception) -> Unit) = {},
    onResponseError: ((err: ${clientName}Error) -> Unit) = {},
    bufferCapacity: Int,
) {
    val finalHeaders = headers?.invoke() ?: mutableMapOf()
    var lastId = lastEventId
    // exponential backoff maxing out at 32 seconds
    if (backoffTime > 0) {
        withContext(currentCoroutineContext()) {
            Thread.sleep(backoffTime)
        }
    }
    var newBackoffTime =
        if (backoffTime == 0L) 2L else if (backoffTime * 2L >= maxBackoffTime) maxBackoffTime else backoffTime * 2L
    if (lastId != null) {
        finalHeaders["Last-Event-ID"] = lastId.toString()
    }
    val request = __prepareRequest(
        client = httpClient,
        url = url,
        method = method,
        params = params,
        headers = finalHeaders,
    )
    try {
        request.execute { httpResponse ->
            try {
                onOpen(httpResponse)
            } catch (e: CancellationException) {
                onClose()
                httpResponse.cancel()
                return@execute
            }
            if (httpResponse.status.value !in 200..299) {
                try {
                    if (httpResponse.headers["Content-Type"] == "application/json") {
                        val err = ${clientName}Error.fromJson(httpResponse.bodyAsText()) 
                        onError(err)
                        onResponseError(err)
                    } else {
                        val err = ${clientName}Error(
                            code = httpResponse.status.value,
                            errorMessage = httpResponse.status.description,
                            data = JsonPrimitive(httpResponse.bodyAsText()),
                            stack = null,
                        )
                        onError(err)
                        onResponseError(err)
                    }
                } catch (e: CancellationException) {
                    onClose()
                    httpResponse.cancel()
                    return@execute
                }
                return@execute __handleSseRequest(
                    httpClient = httpClient,
                    url = url,
                    method = method,
                    params = params,
                    headers = headers,
                    backoffTime = newBackoffTime,
                    maxBackoffTime = maxBackoffTime,
                    lastEventId = lastId,
                    bufferCapacity = bufferCapacity,
                    onOpen = onOpen,
                    onClose = onClose,
                    onData = onData,
                    onError = onError,
                    onRequestError = onRequestError,
                    onResponseError = onResponseError,
                )
            }
            if (httpResponse.headers["Content-Type"] != "text/event-stream") {
                try {
                    val err = ${clientName}Error(
                        code = 0,
                        errorMessage = "Expected server to return Content-Type \\"text/event-stream\\". Got \\"\${httpResponse.headers["Content-Type"]}\\"",
                        data = JsonPrimitive(httpResponse.bodyAsText()),
                        stack = null,
                    )
                    onError(err)
                    onResponseError(err)
                } catch (e: CancellationException) {
                    httpResponse.cancel()
                    return@execute
                }
                return@execute __handleSseRequest(
                    httpClient = httpClient,
                    url = url,
                    method = method,
                    params = params,
                    headers = headers,
                    backoffTime = newBackoffTime,
                    maxBackoffTime = maxBackoffTime,
                    lastEventId = lastId,
                    bufferCapacity = bufferCapacity,
                    onOpen = onOpen,
                    onClose = onClose,
                    onData = onData,
                    onError = onError,
                    onRequestError = onRequestError,
                    onResponseError = onResponseError,
                )
            }
            newBackoffTime = 0
            val channel: ByteReadChannel = httpResponse.body()
            var pendingData = ""
            while (!channel.isClosedForRead) {
                val buffer = ByteBuffer.allocateDirect(bufferCapacity)
                val read = channel.readAvailable(buffer)
                if (read == -1) break
                buffer.flip()
                val input = Charsets.UTF_8.decode(buffer).toString()
                val parsedResult = __parseSseEvents("\${pendingData}\${input}")
                pendingData = parsedResult.leftover
                for (event in parsedResult.events) {
                    if (event.id != null) {
                        lastId = event.id
                    }
                    when (event.event) {
                        "message" -> {
                            try {
                                onData(event.data)
                            } catch (e: CancellationException) {
                                onClose()
                                httpResponse.cancel()
                                return@execute
                            }
                        }

                        "done" -> {
                            onClose()
                            return@execute
                        }

                        else -> {}
                    }
                }
            }
            return@execute __handleSseRequest(
                httpClient = httpClient,
                url = url,
                method = method,
                params = params,
                headers = headers,
                backoffTime = newBackoffTime,
                maxBackoffTime = maxBackoffTime,
                lastEventId = lastId,
                bufferCapacity = bufferCapacity,
                onOpen = onOpen,
                onClose = onClose,
                onData = onData,
                onError = onError,
                onRequestError = onRequestError,
                onResponseError = onResponseError,
            )
        }
    } catch (e: java.net.ConnectException) {
        onError(e)
        onRequestError(e)
        return __handleSseRequest(
            httpClient = httpClient,
            url = url,
            method = method,
            params = params,
            headers = headers,
            backoffTime = newBackoffTime,
            maxBackoffTime = maxBackoffTime,
            lastEventId = lastId,
            bufferCapacity = bufferCapacity,
            onOpen = onOpen,
            onClose = onClose,
            onData = onData,
            onError = onError,
            onRequestError = onRequestError,
            onResponseError = onResponseError,
        )
    } catch (e: Exception) {
        onError(e)
        onRequestError(e)
        return __handleSseRequest(
            httpClient = httpClient,
            url = url,
            method = method,
            params = params,
            headers = headers,
            backoffTime = newBackoffTime,
            maxBackoffTime = maxBackoffTime,
            lastEventId = lastId,
            bufferCapacity = bufferCapacity,
            onOpen = onOpen,
            onClose = onClose,
            onData = onData,
            onError = onError,
            onRequestError = onRequestError,
            onResponseError = onResponseError,
        )
    }
}`;
}

function getHeader(options: {
    packageName: string;
    clientName: string;
    clientVersion: string;
}): string {
    return `@file:Suppress(
    "FunctionName", "LocalVariableName", "UNNECESSARY_NOT_NULL_ASSERTION", "ClassName", "NAME_SHADOWING",
    "USELESS_IS_CHECK", "unused", "RemoveRedundantQualifierName", "CanBeParameter", "RedundantUnitReturnType",
    "RedundantExplicitType"
)

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.cancel
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import java.nio.ByteBuffer
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

private const val generatedClientVersion = "${options.clientVersion}"
private val timestampFormatter =
    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .withZone(ZoneId.ofOffset("GMT", ZoneOffset.UTC))
private val JsonInstance = Json {
    encodeDefaults = true
    ignoreUnknownKeys = true
}
private typealias __${options.clientName}HeadersFn = (() -> MutableMap<String, String>?)?`;
}
