import fs from "node:fs";
import {
    type AppDefinition,
    defineClientGeneratorPlugin,
} from "arri-codegen-utils";
import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
} from "jtd-utils";
import { type CodegenContext, kotlinClassName } from "./_common";
import { kotlinAnyFromSchema } from "./any";
import { kotlinArrayFromSchema } from "./array";
import { kotlinDiscriminatorFromSchema } from "./discriminator";
import { kotlinEnumFromSchema } from "./enum";
import { kotlinMapFromSchema } from "./map";
import { kotlinObjectFromSchema } from "./object";
import {
    kotlinBooleanFromSchema,
    kotlinFloat32FromSchema,
    kotlinFloat64FromSchema,
    kotlinInt16FromSchema,
    kotlinInt32FromSchema,
    kotlinInt64FromSchema,
    kotlinInt8FromSchema,
    kotlinStringFromSchema,
    kotlinTimestampFromSchema,
    kotlinUint16FromSchema as kotlinUInt16FromSchema,
    kotlinUint32FromSchema as kotlinUInt32FromSchema,
    kotlinUint64FromSchema as kotlinUInt64FromSchema,
    kotlinUint8FromSchema as kotlinUInt8FromSchema,
} from "./primitives";
import { kotlinRefFromSchema } from "./ref";

export interface ServiceContext {
    clientName: string;
    modelPrefix?: string;
    modelJsonInstances: Record<string, string>;
}

export interface KotlinClientOptions {
    clientName?: string;
    modelPrefix?: string;
    outputFile: string;
}

export const kotlinClientGenerator = defineClientGeneratorPlugin(
    (options: KotlinClientOptions) => {
        return {
            generator(def) {
                const client = kotlinClientFromDef(def, options);
                fs.writeFileSync(options.outputFile, client);
            },
            options,
        };
    },
);

// CLIENT GENERATION
export function kotlinClientFromDef(
    def: AppDefinition,
    options: KotlinClientOptions,
): string {
    const clientName = kotlinClassName(options.clientName ?? "Client");
    const context: CodegenContext = {
        modelPrefix: options.modelPrefix ?? "",
        clientName,
        clientVersion: def.info?.version ?? "",
        instancePath: "",
        schemaPath: "",
        existingTypeIds: [],
    };
    const modelParts: string[] = [];
    for (const key of Object.keys(def.models)) {
        const subSchema = def.models[key]!;
        const type = kotlinTypeFromSchema(subSchema, {
            modelPrefix: context.modelPrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: `/${key}`,
            schemaPath: `/models`,
            existingTypeIds: context.existingTypeIds,
        });
        if (type.content) {
            modelParts.push(type.content);
        }
    }
    return `
${getUtilityClasses(clientName)}

${modelParts.join("\n\n")}

${getUtilityFunctions(clientName)}`;
}

export function kotlinTypeFromSchema(schema: Schema, context: CodegenContext) {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "string":
                return kotlinStringFromSchema(schema, context);
            case "boolean":
                return kotlinBooleanFromSchema(schema, context);
            case "timestamp":
                return kotlinTimestampFromSchema(schema, context);
            case "float32":
                return kotlinFloat32FromSchema(schema, context);
            case "float64":
                return kotlinFloat64FromSchema(schema, context);
            case "int8":
                return kotlinInt8FromSchema(schema, context);
            case "int16":
                return kotlinInt16FromSchema(schema, context);
            case "int32":
                return kotlinInt32FromSchema(schema, context);
            case "int64":
                return kotlinInt64FromSchema(schema, context);
            case "uint8":
                return kotlinUInt8FromSchema(schema, context);
            case "uint16":
                return kotlinUInt16FromSchema(schema, context);
            case "uint32":
                return kotlinUInt32FromSchema(schema, context);
            case "uint64":
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

@Suppress("LocalVariableName")
interface ${clientName}ModelFactory<T> {
    fun new(): T
    fun fromJson(input: String): T
    fun fromJsonElement(
        __input: JsonElement,
        instancePath: String = "",
    ): T
}

@Suppress("LocalVariableName")
data class ${clientName}Error(
    val code: Int,
    val errorMessage: String,
    val data: JsonElement?,
    val stack: List<String>?,
) : Exception(message = errorMessage), ${clientName}Model {
    override fun toJson(): String {
        var output = "{"
        output += "\\"code\\":"
        output += "$code"
        output += ",\\"message\\":"
        output += buildString { printQuoted(message ?: "") }
        if (data != null) {
            output += ",\\"data\\":"
            output += JsonInstance.encodeToString(data)
        }
        if (stack != null) {
            output += ",\\"stack\\":"
            output += "["
            for ((index, item) in stack.withIndex()) {
                if (index > 0) {
                    output += ","
                }
                output += buildString { printQuoted(item) }
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
                System.err.println("[WARNING] ${clientName}Error.fromJsonElement() expected JsonObject at \${instancePath}. Got \${__input.javaClass}. Initializing empty ${clientName}Error.")
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
internal const val STRING = '"'

private fun toHexChar(i: Int): Char {
    val d = i and 0xf
    return if (d < 10) (d + '0'.code).toChar()
    else (d - 10 + 'a'.code).toChar()
}

internal val ESCAPE_STRINGS: Array<String?> = arrayOfNulls<String>(93).apply {
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

internal val ESCAPE_MARKERS: ByteArray = ByteArray(93).apply {
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

internal fun StringBuilder.printQuoted(value: String) {
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

private suspend fun prepareRequest(
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
            finalBody = params?.toString() ?: ""
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

private fun parseSseEvent(input: String): SseEvent {
    val lines = input.split("\\n")
    var id: String? = null
    var event: String? = null
    var data: String = ""
    for (line in lines) {
        if (line.startsWith("id: ")) {
            id = line.substring(3).trim()
            continue
        }
        if (line.startsWith("event: ")) {
            event = line.substring(6).trim()
            continue
        }
        if (line.startsWith("data: ")) {
            data = line.substring(5).trim()
            continue
        }
    }
    return SseEvent(id, event, data)
}

private class SseEvent(val id: String? = null, val event: String? = null, val data: String)

private fun parseSseEvents(input: String): List<SseEvent> {
    val inputs = input.split("\\n\\n")
    val events = mutableListOf<SseEvent>()
    for (item in inputs) {
        if (item.contains("data: ")) {
            events.add(parseSseEvent(item))
        }
    }
    return events
}


private suspend fun handleSseRequest(
    scope: CoroutineScope,
    httpClient: HttpClient,
    url: String,
    method: HttpMethod,
    params: ${clientName}Model?,
    headers: headersFn,
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onError: ((error: ${clientName}Error) -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onConnectionError: ((error: ${clientName}Error) -> Unit) = {},
    bufferCapacity: Int,
) {
    val finalHeaders = headers?.invoke() ?: mutableMapOf<String, String>();
    var lastId = lastEventId
    // exponential backoff maxing out at 32 seconds
    if (backoffTime > 0) {
        withContext(scope.coroutineContext) {
            Thread.sleep(backoffTime)
        }
    }
    val newBackoffTime =
        if (backoffTime == 0L) 2L else if (backoffTime * 2L >= maxBackoffTime) maxBackoffTime else backoffTime * 2L
    if (lastId != null) {
        finalHeaders["Last-Event-ID"] = lastId.toString()
    }
    val request = prepareRequest(
        client = httpClient,
        url = url,
        method = HttpMethod.Get,
        params = params,
        headers = finalHeaders,
    )
    try {
        request.execute { httpResponse ->

            onOpen(httpResponse)
            if (httpResponse.status.value != 200) {

                onConnectionError(
                    ${clientName}Error(
                        code = httpResponse.status.value,
                        errorMessage = "Error fetching stream from $url",
                        data = JsonInstance.encodeToJsonElement(httpResponse.toString()),
                        stack = null,
                    )
                )
                handleSseRequest(
                    scope = scope,
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
                    onError = onError,
                    onData = onData,
                    onConnectionError = onConnectionError,
                )
                return@execute
            }
            val channel: ByteReadChannel = httpResponse.bodyAsChannel()
            while (!channel.isClosedForRead) {
                val buffer = ByteBuffer.allocateDirect(bufferCapacity)
                val read = channel.readAvailable(buffer)
                if (read == -1) break;
                buffer.flip()
                val input = Charsets.UTF_8.decode(buffer).toString()
                val events = parseSseEvents(input)
                for (event in events) {
                    if (event.id != null) {
                        lastId = event.id
                    }
                    when (event.event) {
                        "message" -> {
                            onData(event.data)
                        }

                        "done" -> {
                            onClose()
                            return@execute
                        }

                        "error" -> {
                            val error = JsonInstance.decodeFromString<${clientName}Error>(event.data)
                            onError(error)
                        }

                        else -> {}
                    }
                }
            }
        }
    } catch (e: java.net.ConnectException) {
        onConnectionError(
            ${clientName}Error(
                code = 503,
                errorMessage = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonInstance.encodeToJsonElement(e.toString()),
                stack = e.stackTraceToString().split("\\n"),
            )
        )
        handleSseRequest(
            scope = scope,
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
            onError = onError,
            onData = onData,
            onConnectionError = onConnectionError,
        )
        return
    } catch (e: Exception) {
        onConnectionError(
            ${clientName}Error(
                code = 503,
                errorMessage = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonInstance.encodeToJsonElement(e.toString()),
                stack = e.stackTraceToString().split("\\n"),
            )
        )
        handleSseRequest(
            scope = scope,
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
            onError = onError,
            onData = onData,
            onConnectionError = onConnectionError,
        )
    }
}


//// THis is a work in progress
//private suspend fun handleWebsocketRequest(
//    client: HttpClient,
//    url: String,
//    headers: headersFn,
//) {
//    val finalHeaders = headers?.invoke() ?: mutableMapOf()
//    finalHeaders["client-version"] = generatedClientVersion
//    var finalUrl = url.replace("https://", "wss://").replace("http://", "ws://")
//    val queryParts = mutableListOf<String>()
//    for (entry in finalHeaders) {
//        queryParts.add("\${entry.key}=\${entry.value}")
//    }
//    finalUrl += "?\${queryParts.joinToString("&")}"
//    client.webSocket(
//        urlString = finalUrl
//    ) { }
//
//}`;
}
