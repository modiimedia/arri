@file:Suppress(
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

private const val generatedClientVersion = "10"
private val timestampFormatter =
    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .withZone(ZoneId.ofOffset("GMT", ZoneOffset.UTC))
private val JsonInstance = Json {
    encodeDefaults = true
    ignoreUnknownKeys = true
}
private typealias __TestClientPrefixedHeadersFn = (() -> MutableMap<String, String>?)?

class TestClientPrefixed(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __TestClientPrefixedHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    suspend fun emptyParamsGetRequest(): FooDefaultPayload {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/empty-params-get-request",
                method = HttpMethod.Get,
                params = null,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooDefaultPayload.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun emptyParamsPostRequest(): FooDefaultPayload {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/empty-params-post-request",
                method = HttpMethod.Post,
                params = null,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooDefaultPayload.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun emptyResponseGetRequest(params: FooDefaultPayload): Unit {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/empty-response-get-request",
                method = HttpMethod.Get,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            
            if (response.status.value in 200..299) {
                return 
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun emptyResponsePostRequest(params: FooDefaultPayload): Unit {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/empty-response-post-request",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            
            if (response.status.value in 200..299) {
                return 
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    /**
* If the target language supports it. Generated code should mark this procedure as deprecated.
*/
@Deprecated(message = "This method was marked as deprecated by the server")
suspend fun deprecatedRpc(params: FooDeprecatedRpcParams): Unit {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/deprecated-rpc",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            
            if (response.status.value in 200..299) {
                return 
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendDiscriminatorWithEmptyObject(params: FooDiscriminatorWithEmptyObject): FooDiscriminatorWithEmptyObject {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-discriminator-with-empty-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooDiscriminatorWithEmptyObject.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendError(params: FooSendErrorParams): Unit {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-error",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            
            if (response.status.value in 200..299) {
                return 
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObject(params: FooObjectWithEveryType): FooObjectWithEveryType {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooObjectWithEveryType.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithNullableFields(params: FooObjectWithEveryNullableType): FooObjectWithEveryNullableType {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-nullable-fields",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooObjectWithEveryNullableType.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithPascalCaseKeys(params: FooObjectWithPascalCaseKeys): FooObjectWithPascalCaseKeys {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-pascal-case-keys",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooObjectWithPascalCaseKeys.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithSnakeCaseKeys(params: FooObjectWithSnakeCaseKeys): FooObjectWithSnakeCaseKeys {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-snake-case-keys",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooObjectWithSnakeCaseKeys.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendPartialObject(params: FooObjectWithEveryOptionalType): FooObjectWithEveryOptionalType {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-partial-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooObjectWithEveryOptionalType.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveObject(params: FooRecursiveObject): FooRecursiveObject {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooRecursiveObject.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnion(params: FooRecursiveUnion): FooRecursiveUnion {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
            throw TestClientPrefixedError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
            if (response.status.value in 200..299) {
                return FooRecursiveUnion.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())    
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun streamAutoReconnect(
            params: FooAutoReconnectParams,
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooAutoReconnectResponse) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/tests/stream-auto-reconnect",
                method = HttpMethod.Get,
                params = params,
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
                    val data = FooAutoReconnectResponse.fromJson(str)
                    onData(data)
                }
            )
        }

    /**
* This route will always return an error. The client should automatically retry with exponential backoff.
*/
suspend fun streamConnectionErrorTest(
            params: FooStreamConnectionErrorTestParams,
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooStreamConnectionErrorTestResponse) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/tests/stream-connection-error-test",
                method = HttpMethod.Get,
                params = params,
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
                    val data = FooStreamConnectionErrorTestResponse.fromJson(str)
                    onData(data)
                }
            )
        }

    /**
* Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message
*/
suspend fun streamLargeObjects(
            
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooStreamLargeObjectsResponse) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/tests/stream-large-objects",
                method = HttpMethod.Get,
                params = null,
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
                    val data = FooStreamLargeObjectsResponse.fromJson(str)
                    onData(data)
                }
            )
        }

    suspend fun streamMessages(
            params: FooChatMessageParams,
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooChatMessage) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/tests/stream-messages",
                method = HttpMethod.Get,
                params = params,
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
                    val data = FooChatMessage.fromJson(str)
                    onData(data)
                }
            )
        }

    suspend fun streamRetryWithNewCredentials(
            
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooTestsStreamRetryWithNewCredentialsResponse) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/tests/stream-retry-with-new-credentials",
                method = HttpMethod.Get,
                params = null,
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
                    val data = FooTestsStreamRetryWithNewCredentialsResponse.fromJson(str)
                    onData(data)
                }
            )
        }

    /**
* When the client receives the 'done' event, it should close the connection and NOT reconnect
*/
suspend fun streamTenEventsThenEnd(
            
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooChatMessage) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/tests/stream-ten-events-then-end",
                method = HttpMethod.Get,
                params = null,
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
                    val data = FooChatMessage.fromJson(str)
                    onData(data)
                }
            )
        }
}



interface TestClientPrefixedModel {
    fun toJson(): String
    fun toUrlQueryParams(): String
}

interface TestClientPrefixedModelFactory<T> {
    fun new(): T
    fun fromJson(input: String): T
    fun fromJsonElement(
        __input: JsonElement,
        instancePath: String = "",
    ): T
}

data class TestClientPrefixedError(
    val code: Int,
    val errorMessage: String,
    val data: JsonElement?,
    val stack: List<String>?,
) : Exception(errorMessage), TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"code\":"
        output += "$code"
        output += ",\"message\":"
        output += buildString { printQuoted(errorMessage) }
        if (data != null) {
            output += ",\"data\":"
            output += JsonInstance.encodeToString(data)
        }
        if (stack != null) {
            output += ",\"stack\":"
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
        queryParts.add("code=${code}")
        queryParts.add("message=${errorMessage}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<TestClientPrefixedError> {
        override fun new(): TestClientPrefixedError {
            return TestClientPrefixedError(
                code = 0,
                errorMessage = "",
                data = null,
                stack = null
            )
        }

        override fun fromJson(input: String): TestClientPrefixedError {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        override fun fromJsonElement(__input: JsonElement, instancePath: String): TestClientPrefixedError {
            if (__input !is JsonObject) {
                __logError("[WARNING] TestClientPrefixedError.fromJsonElement() expected JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty TestClientPrefixedError.")
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
            return TestClientPrefixedError(
                code,
                errorMessage,
                data,
                stack,
            )
        }

    }
}

data class FooManuallyAddedModel(
    val hello: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"hello\":"
output += buildString { printQuoted(hello) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("hello=$hello")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooManuallyAddedModel> {
        @JvmStatic
        override fun new(): FooManuallyAddedModel {
            return FooManuallyAddedModel(
                hello = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooManuallyAddedModel {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooManuallyAddedModel {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooManuallyAddedModel.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooManuallyAddedModel.")
                return new()
            }
val hello: String = when (__input.jsonObject["hello"]) {
                is JsonPrimitive -> __input.jsonObject["hello"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooManuallyAddedModel(
                hello,
            )
        }
    }
}



data class FooDefaultPayload(
    val message: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"message\":"
output += buildString { printQuoted(message) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("message=$message")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooDefaultPayload> {
        @JvmStatic
        override fun new(): FooDefaultPayload {
            return FooDefaultPayload(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooDefaultPayload {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooDefaultPayload {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooDefaultPayload.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooDefaultPayload.")
                return new()
            }
val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooDefaultPayload(
                message,
            )
        }
    }
}



@Deprecated(message = "This class was marked as deprecated by the server")
data class FooDeprecatedRpcParams(
@Deprecated(message = "This field was marked as deprecated by the server")
    val deprecatedField: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"deprecatedField\":"
output += buildString { printQuoted(deprecatedField) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("deprecatedField=$deprecatedField")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooDeprecatedRpcParams> {
        @JvmStatic
        override fun new(): FooDeprecatedRpcParams {
            return FooDeprecatedRpcParams(
                deprecatedField = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooDeprecatedRpcParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooDeprecatedRpcParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooDeprecatedRpcParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooDeprecatedRpcParams.")
                return new()
            }
val deprecatedField: String = when (__input.jsonObject["deprecatedField"]) {
                is JsonPrimitive -> __input.jsonObject["deprecatedField"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooDeprecatedRpcParams(
                deprecatedField,
            )
        }
    }
}



sealed interface FooDiscriminatorWithEmptyObject : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooDiscriminatorWithEmptyObject> {
        @JvmStatic
        override fun new(): FooDiscriminatorWithEmptyObject {
            return FooDiscriminatorWithEmptyObjectEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooDiscriminatorWithEmptyObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooDiscriminatorWithEmptyObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooDiscriminatorWithEmptyObject.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "EMPTY" -> FooDiscriminatorWithEmptyObjectEmpty.fromJsonElement(__input, instancePath)
"NOT_EMPTY" -> FooDiscriminatorWithEmptyObjectNotEmpty.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooDiscriminatorWithEmptyObjectEmpty(
    private val placeholderKey: Short = 0
) : FooDiscriminatorWithEmptyObject {
    override val type get() = "EMPTY"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"EMPTY\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=EMPTY")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooDiscriminatorWithEmptyObjectEmpty> {
        @JvmStatic
        override fun new(): FooDiscriminatorWithEmptyObjectEmpty {
            return FooDiscriminatorWithEmptyObjectEmpty(

            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooDiscriminatorWithEmptyObjectEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooDiscriminatorWithEmptyObjectEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooDiscriminatorWithEmptyObjectEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooDiscriminatorWithEmptyObjectEmpty.")
                return new()
            }

            return FooDiscriminatorWithEmptyObjectEmpty(
                
            )
        }
    }
}



data class FooDiscriminatorWithEmptyObjectNotEmpty(
    val foo: String,
    val bar: Double,
    val baz: Boolean,
) : FooDiscriminatorWithEmptyObject {
    override val type get() = "NOT_EMPTY"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"NOT_EMPTY\""
output += ",\"foo\":"
output += buildString { printQuoted(foo) }
output += ",\"bar\":"
output += bar
output += ",\"baz\":"
output += baz
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=NOT_EMPTY")
queryParts.add("foo=$foo")
queryParts.add("bar=$bar")
queryParts.add("baz=$baz")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooDiscriminatorWithEmptyObjectNotEmpty> {
        @JvmStatic
        override fun new(): FooDiscriminatorWithEmptyObjectNotEmpty {
            return FooDiscriminatorWithEmptyObjectNotEmpty(
                foo = "",
                bar = 0.0,
                baz = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooDiscriminatorWithEmptyObjectNotEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooDiscriminatorWithEmptyObjectNotEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooDiscriminatorWithEmptyObjectNotEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooDiscriminatorWithEmptyObjectNotEmpty.")
                return new()
            }
val foo: String = when (__input.jsonObject["foo"]) {
                is JsonPrimitive -> __input.jsonObject["foo"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val bar: Double = when (__input.jsonObject["bar"]) {
                is JsonPrimitive -> __input.jsonObject["bar"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
val baz: Boolean = when (__input.jsonObject["baz"]) {
                is JsonPrimitive -> __input.jsonObject["baz"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooDiscriminatorWithEmptyObjectNotEmpty(
                foo,
                bar,
                baz,
            )
        }
    }
}



data class FooSendErrorParams(
    val code: UShort,
    val message: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"code\":"
output += code
output += ",\"message\":"
output += buildString { printQuoted(message) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("code=$code")
queryParts.add("message=$message")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooSendErrorParams> {
        @JvmStatic
        override fun new(): FooSendErrorParams {
            return FooSendErrorParams(
                code = 0u,
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooSendErrorParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooSendErrorParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooSendErrorParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooSendErrorParams.")
                return new()
            }
val code: UShort = when (__input.jsonObject["code"]) {
                is JsonPrimitive -> __input.jsonObject["code"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull() ?: 0u
                else -> 0u
            }
val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooSendErrorParams(
                code,
                message,
            )
        }
    }
}



data class FooObjectWithEveryType(
    val any: JsonElement,
    val boolean: Boolean,
    val string: String,
    val timestamp: Instant,
    val float32: Float,
    val float64: Double,
    val int8: Byte,
    val uint8: UByte,
    val int16: Short,
    val uint16: UShort,
    val int32: Int,
    val uint32: UInt,
    val int64: Long,
    val uint64: ULong,
    val enumerator: FooObjectWithEveryTypeEnumerator,
    val array: MutableList<Boolean>,
    val `object`: FooObjectWithEveryTypeObject,
    val record: MutableMap<String, ULong>,
    val discriminator: FooObjectWithEveryTypeDiscriminator,
    val nestedObject: FooObjectWithEveryTypeNestedObject,
    val nestedArray: MutableList<MutableList<FooObjectWithEveryTypeNestedArrayElementElement>>,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"any\":"
output += JsonInstance.encodeToString(any)
output += ",\"boolean\":"
output += boolean
output += ",\"string\":"
output += buildString { printQuoted(string) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += ",\"float32\":"
output += float32
output += ",\"float64\":"
output += float64
output += ",\"int8\":"
output += int8
output += ",\"uint8\":"
output += uint8
output += ",\"int16\":"
output += int16
output += ",\"uint16\":"
output += uint16
output += ",\"int32\":"
output += int32
output += ",\"uint32\":"
output += uint32
output += ",\"int64\":"
output += "\"${int64}\""
output += ",\"uint64\":"
output += "\"${uint64}\""
output += ",\"enumerator\":"
output += "\"${enumerator.serialValue}\""
output += ",\"array\":"
output += "["
                for ((__index, __element) in array.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element
                }
                output += "]"
output += ",\"object\":"
output += `object`.toJson()
output += ",\"record\":"
output += "{"
            for ((__index, __entry) in record.entries.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += "${buildString { printQuoted(__entry.key) }}:"
                output += "\"${__entry.value}\""
            }
            output += "}"
output += ",\"discriminator\":"
output += discriminator.toJson()
output += ",\"nestedObject\":"
output += nestedObject.toJson()
output += ",\"nestedArray\":"
output += "["
                for ((__index, __element) in nestedArray.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += "["
                for ((__index, __element) in __element.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element.toJson()
                }
                output += "]"
                }
                output += "]"
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
__logError("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryType/any.")
queryParts.add("boolean=$boolean")
queryParts.add("string=$string")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
queryParts.add("float32=$float32")
queryParts.add("float64=$float64")
queryParts.add("int8=$int8")
queryParts.add("uint8=$uint8")
queryParts.add("int16=$int16")
queryParts.add("uint16=$uint16")
queryParts.add("int32=$int32")
queryParts.add("uint32=$uint32")
queryParts.add("int64=$int64")
queryParts.add("uint64=$uint64")
queryParts.add("enumerator=${enumerator.serialValue}")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/discriminator.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedObject.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedArray.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryType> {
        @JvmStatic
        override fun new(): FooObjectWithEveryType {
            return FooObjectWithEveryType(
                any = JsonNull,
                boolean = false,
                string = "",
                timestamp = Instant.now(),
                float32 = 0.0F,
                float64 = 0.0,
                int8 = 0,
                uint8 = 0u,
                int16 = 0,
                uint16 = 0u,
                int32 = 0,
                uint32 = 0u,
                int64 = 0L,
                uint64 = 0UL,
                enumerator = FooObjectWithEveryTypeEnumerator.new(),
                array = mutableListOf(),
                `object` = FooObjectWithEveryTypeObject.new(),
                record = mutableMapOf(),
                discriminator = FooObjectWithEveryTypeDiscriminator.new(),
                nestedObject = FooObjectWithEveryTypeNestedObject.new(),
                nestedArray = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryType {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryType.")
                return new()
            }
val any: JsonElement = when (__input.jsonObject["any"]) {
                is JsonElement -> __input.jsonObject["any"]!!
                else -> JsonNull
            }
val boolean: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
val string: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val float32: Float = when (__input.jsonObject["float32"]) {
                is JsonPrimitive -> __input.jsonObject["float32"]!!.jsonPrimitive.floatOrNull ?: 0.0F
                else -> 0.0F
            }
val float64: Double = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
val int8: Byte = when (__input.jsonObject["int8"]) {
                is JsonPrimitive -> __input.jsonObject["int8"]!!.jsonPrimitive.contentOrNull?.toByteOrNull() ?: 0
                else -> 0
            }
val uint8: UByte = when (__input.jsonObject["uint8"]) {
                is JsonPrimitive -> __input.jsonObject["uint8"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull() ?: 0u
                else -> 0u
            }
val int16: Short = when (__input.jsonObject["int16"]) {
                is JsonPrimitive -> __input.jsonObject["int16"]!!.jsonPrimitive.contentOrNull?.toShortOrNull() ?: 0
                else -> 0
            }
val uint16: UShort = when (__input.jsonObject["uint16"]) {
                is JsonPrimitive -> __input.jsonObject["uint16"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull() ?: 0u
                else -> 0u
            }
val int32: Int = when (__input.jsonObject["int32"]) {
                is JsonPrimitive -> __input.jsonObject["int32"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
val uint32: UInt = when (__input.jsonObject["uint32"]) {
                is JsonPrimitive -> __input.jsonObject["uint32"]!!.jsonPrimitive.contentOrNull?.toUIntOrNull() ?: 0u
                else -> 0u
            }
val int64: Long = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
val uint64: ULong = when (__input.jsonObject["uint64"]) {
                is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
val enumerator: FooObjectWithEveryTypeEnumerator = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> FooObjectWithEveryTypeEnumerator.new()
                is JsonPrimitive -> FooObjectWithEveryTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                else -> FooObjectWithEveryTypeEnumerator.new()
            }
val array: MutableList<Boolean> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<Boolean> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonPrimitive -> __element!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
val `object`: FooObjectWithEveryTypeObject = when (__input.jsonObject["object"]) {
                is JsonObject -> FooObjectWithEveryTypeObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> FooObjectWithEveryTypeObject.new()
            }
val record: MutableMap<String, ULong> = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, ULong> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                is JsonPrimitive -> __entry.value!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
val discriminator: FooObjectWithEveryTypeDiscriminator = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> FooObjectWithEveryTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )
                else -> FooObjectWithEveryTypeDiscriminator.new()
            }
val nestedObject: FooObjectWithEveryTypeNestedObject = when (__input.jsonObject["nestedObject"]) {
                is JsonObject -> FooObjectWithEveryTypeNestedObject.fromJsonElement(
                    __input.jsonObject["nestedObject"]!!,
                    "$instancePath/nestedObject",
                )

                else -> FooObjectWithEveryTypeNestedObject.new()
            }
val nestedArray: MutableList<MutableList<FooObjectWithEveryTypeNestedArrayElementElement>> = when (__input.jsonObject["nestedArray"]) {
                is JsonArray -> {
                    val __value: MutableList<MutableList<FooObjectWithEveryTypeNestedArrayElementElement>> = mutableListOf()
                    for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonArray -> {
                    val __value: MutableList<FooObjectWithEveryTypeNestedArrayElementElement> = mutableListOf()
                    for (__element in __element!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooObjectWithEveryTypeNestedArrayElementElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )

                else -> FooObjectWithEveryTypeNestedArrayElementElement.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryType(
                any,
                boolean,
                string,
                timestamp,
                float32,
                float64,
                int8,
                uint8,
                int16,
                uint16,
                int32,
                uint32,
                int64,
                uint64,
                enumerator,
                array,
                `object`,
                record,
                discriminator,
                nestedObject,
                nestedArray,
            )
        }
    }
}

enum class FooObjectWithEveryTypeEnumerator {
    A,
    B,
    C;
    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeEnumerator> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooObjectWithEveryTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeEnumerator.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "A" -> A
                "B" -> B
                "C" -> C
                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryTypeObject(
    val string: String,
    val boolean: Boolean,
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"string\":"
output += buildString { printQuoted(string) }
output += ",\"boolean\":"
output += boolean
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("string=$string")
queryParts.add("boolean=$boolean")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeObject {
            return FooObjectWithEveryTypeObject(
                string = "",
                boolean = false,
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeObject.")
                return new()
            }
val string: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val boolean: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
            return FooObjectWithEveryTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}



sealed interface FooObjectWithEveryTypeDiscriminator : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeDiscriminator> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeDiscriminator {
            return FooObjectWithEveryTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> FooObjectWithEveryTypeDiscriminatorA.fromJsonElement(__input, instancePath)
"B" -> FooObjectWithEveryTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryTypeDiscriminatorA(
    val title: String,
) : FooObjectWithEveryTypeDiscriminator {
    override val type get() = "A"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"A\""
output += ",\"title\":"
output += buildString { printQuoted(title) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=A")
queryParts.add("title=$title")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeDiscriminatorA {
            return FooObjectWithEveryTypeDiscriminatorA(
                title = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeDiscriminatorA.")
                return new()
            }
val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryTypeDiscriminatorA(
                title,
            )
        }
    }
}



data class FooObjectWithEveryTypeDiscriminatorB(
    val title: String,
    val description: String,
) : FooObjectWithEveryTypeDiscriminator {
    override val type get() = "B"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"B\""
output += ",\"title\":"
output += buildString { printQuoted(title) }
output += ",\"description\":"
output += buildString { printQuoted(description) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=B")
queryParts.add("title=$title")
queryParts.add("description=$description")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeDiscriminatorB {
            return FooObjectWithEveryTypeDiscriminatorB(
                title = "",
                description = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeDiscriminatorB.")
                return new()
            }
val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val description: String = when (__input.jsonObject["description"]) {
                is JsonPrimitive -> __input.jsonObject["description"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryTypeDiscriminatorB(
                title,
                description,
            )
        }
    }
}



data class FooObjectWithEveryTypeNestedObject(
    val id: String,
    val timestamp: Instant,
    val data: FooObjectWithEveryTypeNestedObjectData,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += ",\"data\":"
output += data.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryTypeNestedObject/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeNestedObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeNestedObject {
            return FooObjectWithEveryTypeNestedObject(
                id = "",
                timestamp = Instant.now(),
                data = FooObjectWithEveryTypeNestedObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeNestedObject.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val data: FooObjectWithEveryTypeNestedObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryTypeNestedObjectData.new()
            }
            return FooObjectWithEveryTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooObjectWithEveryTypeNestedObjectData(
    val id: String,
    val timestamp: Instant,
    val data: FooObjectWithEveryTypeNestedObjectDataData,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += ",\"data\":"
output += data.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryTypeNestedObjectData/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeNestedObjectData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeNestedObjectData {
            return FooObjectWithEveryTypeNestedObjectData(
                id = "",
                timestamp = Instant.now(),
                data = FooObjectWithEveryTypeNestedObjectDataData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeNestedObjectData.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val data: FooObjectWithEveryTypeNestedObjectDataData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryTypeNestedObjectDataData.new()
            }
            return FooObjectWithEveryTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooObjectWithEveryTypeNestedObjectDataData(
    val id: String,
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeNestedObjectDataData {
            return FooObjectWithEveryTypeNestedObjectDataData(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeNestedObjectDataData.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
            return FooObjectWithEveryTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}



data class FooObjectWithEveryTypeNestedArrayElementElement(
    val id: String,
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeNestedArrayElementElement {
            return FooObjectWithEveryTypeNestedArrayElementElement(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeNestedArrayElementElement.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
            return FooObjectWithEveryTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}



data class FooObjectWithEveryNullableType(
    val any: JsonElement?,
    val boolean: Boolean?,
    val string: String?,
    val timestamp: Instant?,
    val float32: Float?,
    val float64: Double?,
    val int8: Byte?,
    val uint8: UByte?,
    val int16: Short?,
    val uint16: UShort?,
    val int32: Int?,
    val uint32: UInt?,
    val int64: Long?,
    val uint64: ULong?,
    val enumerator: FooObjectWithEveryNullableTypeEnumerator?,
    val array: MutableList<Boolean?>?,
    val `object`: FooObjectWithEveryNullableTypeObject?,
    val record: MutableMap<String, ULong?>?,
    val discriminator: FooObjectWithEveryNullableTypeDiscriminator?,
    val nestedObject: FooObjectWithEveryNullableTypeNestedObject?,
    val nestedArray: MutableList<MutableList<FooObjectWithEveryNullableTypeNestedArrayElementElement?>?>?,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"any\":"
output += when (any) {
                    null -> "null"
                    else -> JsonInstance.encodeToString(any)
                }
output += ",\"boolean\":"
output += boolean
output += ",\"string\":"
output += when (string) {
                    is String -> buildString { printQuoted(string) }
                    else -> "null"
                }
output += ",\"timestamp\":"
output += when (timestamp) {
                    is Instant -> "\"${timestampFormatter.format(timestamp)}\""
                    else -> "null"
                }
output += ",\"float32\":"
output += float32
output += ",\"float64\":"
output += float64
output += ",\"int8\":"
output += int8
output += ",\"uint8\":"
output += uint8
output += ",\"int16\":"
output += int16
output += ",\"uint16\":"
output += uint16
output += ",\"int32\":"
output += int32
output += ",\"uint32\":"
output += uint32
output += ",\"int64\":"
output += when (int64) {
                    is Long -> "\"${int64}\""
                    else -> "null"
                }
output += ",\"uint64\":"
output += when (uint64) {
                    is ULong -> "\"${uint64}\""
                    else -> "null"
                }
output += ",\"enumerator\":"
output += when (enumerator) {
                    is FooObjectWithEveryNullableTypeEnumerator -> "\"${enumerator.serialValue}\""
                    else -> "null"
                }
output += ",\"array\":"
if (array == null) {
                    output += "null"
                } else {
                    output += "["
                    for ((__index, __element) in array.withIndex()) {
                        if (__index != 0) {
                            output += ","
                        }
                        output += __element
                    }
                    output += "]"
                }
output += ",\"object\":"
output += `object`?.toJson()
output += ",\"record\":"
if (record == null) {
                    output += "null"
                } else {
                    output += "{"
                    for ((__index, __entry) in record.entries.withIndex()) {
                        if (__index != 0) {
                            output += ","
                        }
                        output += "${buildString { printQuoted(__entry.key) }}:"
                        output += when (__entry.value) {
                    is ULong -> "\"${__entry.value}\""
                    else -> "null"
                }
                    }
                    output += "}"
                }
output += ",\"discriminator\":"
output += discriminator?.toJson()
output += ",\"nestedObject\":"
output += nestedObject?.toJson()
output += ",\"nestedArray\":"
if (nestedArray == null) {
                    output += "null"
                } else {
                    output += "["
                    for ((__index, __element) in nestedArray.withIndex()) {
                        if (__index != 0) {
                            output += ","
                        }
                        if (__element == null) {
                    output += "null"
                } else {
                    output += "["
                    for ((__index, __element) in __element.withIndex()) {
                        if (__index != 0) {
                            output += ","
                        }
                        output += __element?.toJson()
                    }
                    output += "]"
                }
                    }
                    output += "]"
                }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
__logError("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/any.")
queryParts.add("boolean=$boolean")
queryParts.add("string=$string")
queryParts.add(
                    "timestamp=${
                        when (timestamp) {
                            is Instant -> timestampFormatter.format(timestamp)
                            else -> "null"
                        }
                    }"
        )
queryParts.add("float32=$float32")
queryParts.add("float64=$float64")
queryParts.add("int8=$int8")
queryParts.add("uint8=$uint8")
queryParts.add("int16=$int16")
queryParts.add("uint16=$uint16")
queryParts.add("int32=$int32")
queryParts.add("uint32=$uint32")
queryParts.add("int64=$int64")
queryParts.add("uint64=$uint64")
queryParts.add("enumerator=${enumerator?.serialValue}")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/array.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/object.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/record.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/discriminator.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/nestedObject.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/nestedArray.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableType> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableType {
            return FooObjectWithEveryNullableType(
                any = null,
                boolean = null,
                string = null,
                timestamp = null,
                float32 = null,
                float64 = null,
                int8 = null,
                uint8 = null,
                int16 = null,
                uint16 = null,
                int32 = null,
                uint32 = null,
                int64 = null,
                uint64 = null,
                enumerator = null,
                array = null,
                `object` = null,
                record = null,
                discriminator = null,
                nestedObject = null,
                nestedArray = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableType {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableType.")
                return new()
            }
val any: JsonElement? = when (__input.jsonObject["any"]) {
                    JsonNull -> null
                    null -> null
                    else -> __input.jsonObject["any"]
                }
val boolean: Boolean? = when (__input.jsonObject["boolean"]) {
                    is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull
                    else -> null
                }
val string: String? = when (__input.jsonObject["string"]) {
                    is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
val float32: Float? = when (__input.jsonObject["float32"]) {
                    is JsonPrimitive -> __input.jsonObject["float32"]!!.jsonPrimitive.floatOrNull
                    else -> null
                }
val float64: Double? = when (__input.jsonObject["float64"]) {
                    is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull
                    else -> null
                }
val int8: Byte? = when (__input.jsonObject["int8"]) {
                    is JsonPrimitive -> __input.jsonObject["int8"]!!.jsonPrimitive.contentOrNull?.toByteOrNull()
                    else -> null
                }
val uint8: UByte? = when (__input.jsonObject["uint8"]) {
                    is JsonPrimitive -> __input.jsonObject["uint8"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull()
                    else -> null
                }
val int16: Short? = when (__input.jsonObject["int16"]) {
                    is JsonPrimitive -> __input.jsonObject["int16"]!!.jsonPrimitive.contentOrNull?.toShortOrNull()
                    else -> null
                }
val uint16: UShort? = when (__input.jsonObject["uint16"]) {
                    is JsonPrimitive -> __input.jsonObject["uint16"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull()
                    else -> null
                }
val int32: Int? = when (__input.jsonObject["int32"]) {
                    is JsonPrimitive -> __input.jsonObject["int32"]!!.jsonPrimitive.intOrNull
                    else -> null
                }
val uint32: UInt? = when (__input.jsonObject["uint32"]) {
                    is JsonPrimitive -> __input.jsonObject["uint32"]!!.jsonPrimitive.contentOrNull?.toUIntOrNull()
                    else -> null
                }
val int64: Long? = when (__input.jsonObject["int64"]) {
                    is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull
                    else -> null
                }
val uint64: ULong? = when (__input.jsonObject["uint64"]) {
                    is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull()
                    else -> null
                }
val enumerator: FooObjectWithEveryNullableTypeEnumerator? = when (__input.jsonObject["enumerator"]) {
                    is JsonNull -> null
                    is JsonPrimitive -> FooObjectWithEveryNullableTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                    else -> null
                }
val array: MutableList<Boolean?>? = when (__input.jsonObject["array"]) {
                    is JsonArray -> {
                        val __value: MutableList<Boolean?> = mutableListOf()
                        for (__element in __input.jsonObject["array"]!!.jsonArray) {
                            __value.add(
                                when (__element) {
                    is JsonPrimitive -> __element!!.jsonPrimitive.booleanOrNull
                    else -> null
                }
                            )
                        }
                        __value
                    }

                    else -> null
                }
val `object`: FooObjectWithEveryNullableTypeObject? = when (__input.jsonObject["object"]) {
                    is JsonObject -> FooObjectWithEveryNullableTypeObject.fromJsonElement(
                        __input.jsonObject["object"]!!,
                        "$instancePath/object",
                    )
                    else -> null
                }
val record: MutableMap<String, ULong?>? = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, ULong?> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                    is JsonPrimitive -> __entry.value!!.jsonPrimitive.contentOrNull?.toULongOrNull()
                    else -> null
                }
                    }
                    __value
                }

                else -> null
            }
val discriminator: FooObjectWithEveryNullableTypeDiscriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> FooObjectWithEveryNullableTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )
                else -> null
            }
val nestedObject: FooObjectWithEveryNullableTypeNestedObject? = when (__input.jsonObject["nestedObject"]) {
                    is JsonObject -> FooObjectWithEveryNullableTypeNestedObject.fromJsonElement(
                        __input.jsonObject["nestedObject"]!!,
                        "$instancePath/nestedObject",
                    )
                    else -> null
                }
val nestedArray: MutableList<MutableList<FooObjectWithEveryNullableTypeNestedArrayElementElement?>?>? = when (__input.jsonObject["nestedArray"]) {
                    is JsonArray -> {
                        val __value: MutableList<MutableList<FooObjectWithEveryNullableTypeNestedArrayElementElement?>?> = mutableListOf()
                        for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                            __value.add(
                                when (__element) {
                    is JsonArray -> {
                        val __value: MutableList<FooObjectWithEveryNullableTypeNestedArrayElementElement?> = mutableListOf()
                        for (__element in __element!!.jsonArray) {
                            __value.add(
                                when (__element) {
                    is JsonObject -> FooObjectWithEveryNullableTypeNestedArrayElementElement.fromJsonElement(
                        __element!!,
                        "$instancePath/undefined",
                    )
                    else -> null
                }
                            )
                        }
                        __value
                    }

                    else -> null
                }
                            )
                        }
                        __value
                    }

                    else -> null
                }
            return FooObjectWithEveryNullableType(
                any,
                boolean,
                string,
                timestamp,
                float32,
                float64,
                int8,
                uint8,
                int16,
                uint16,
                int32,
                uint32,
                int64,
                uint64,
                enumerator,
                array,
                `object`,
                record,
                discriminator,
                nestedObject,
                nestedArray,
            )
        }
    }
}

enum class FooObjectWithEveryNullableTypeEnumerator {
    A,
    B,
    C;
    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeEnumerator> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeEnumerator.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "A" -> A
                "B" -> B
                "C" -> C
                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryNullableTypeObject(
    val string: String?,
    val boolean: Boolean?,
    val timestamp: Instant?,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"string\":"
output += when (string) {
                    is String -> buildString { printQuoted(string) }
                    else -> "null"
                }
output += ",\"boolean\":"
output += boolean
output += ",\"timestamp\":"
output += when (timestamp) {
                    is Instant -> "\"${timestampFormatter.format(timestamp)}\""
                    else -> "null"
                }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("string=$string")
queryParts.add("boolean=$boolean")
queryParts.add(
                    "timestamp=${
                        when (timestamp) {
                            is Instant -> timestampFormatter.format(timestamp)
                            else -> "null"
                        }
                    }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeObject {
            return FooObjectWithEveryNullableTypeObject(
                string = null,
                boolean = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeObject.")
                return new()
            }
val string: String? = when (__input.jsonObject["string"]) {
                    is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val boolean: Boolean? = when (__input.jsonObject["boolean"]) {
                    is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
            return FooObjectWithEveryNullableTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}



sealed interface FooObjectWithEveryNullableTypeDiscriminator : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeDiscriminator> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeDiscriminator {
            return FooObjectWithEveryNullableTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> FooObjectWithEveryNullableTypeDiscriminatorA.fromJsonElement(__input, instancePath)
"B" -> FooObjectWithEveryNullableTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryNullableTypeDiscriminatorA(
    val title: String?,
) : FooObjectWithEveryNullableTypeDiscriminator {
    override val type get() = "A"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"A\""
output += ",\"title\":"
output += when (title) {
                    is String -> buildString { printQuoted(title) }
                    else -> "null"
                }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=A")
queryParts.add("title=$title")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeDiscriminatorA {
            return FooObjectWithEveryNullableTypeDiscriminatorA(
                title = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeDiscriminatorA.")
                return new()
            }
val title: String? = when (__input.jsonObject["title"]) {
                    is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
            return FooObjectWithEveryNullableTypeDiscriminatorA(
                title,
            )
        }
    }
}



data class FooObjectWithEveryNullableTypeDiscriminatorB(
    val title: String?,
    val description: String?,
) : FooObjectWithEveryNullableTypeDiscriminator {
    override val type get() = "B"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"B\""
output += ",\"title\":"
output += when (title) {
                    is String -> buildString { printQuoted(title) }
                    else -> "null"
                }
output += ",\"description\":"
output += when (description) {
                    is String -> buildString { printQuoted(description) }
                    else -> "null"
                }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=B")
queryParts.add("title=$title")
queryParts.add("description=$description")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeDiscriminatorB {
            return FooObjectWithEveryNullableTypeDiscriminatorB(
                title = null,
                description = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeDiscriminatorB.")
                return new()
            }
val title: String? = when (__input.jsonObject["title"]) {
                    is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val description: String? = when (__input.jsonObject["description"]) {
                    is JsonPrimitive -> __input.jsonObject["description"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
            return FooObjectWithEveryNullableTypeDiscriminatorB(
                title,
                description,
            )
        }
    }
}



data class FooObjectWithEveryNullableTypeNestedObject(
    val id: String?,
    val timestamp: Instant?,
    val data: FooObjectWithEveryNullableTypeNestedObjectData?,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += when (id) {
                    is String -> buildString { printQuoted(id) }
                    else -> "null"
                }
output += ",\"timestamp\":"
output += when (timestamp) {
                    is Instant -> "\"${timestampFormatter.format(timestamp)}\""
                    else -> "null"
                }
output += ",\"data\":"
output += data?.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                    "timestamp=${
                        when (timestamp) {
                            is Instant -> timestampFormatter.format(timestamp)
                            else -> "null"
                        }
                    }"
        )
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableTypeNestedObject/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeNestedObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeNestedObject {
            return FooObjectWithEveryNullableTypeNestedObject(
                id = null,
                timestamp = null,
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeNestedObject.")
                return new()
            }
val id: String? = when (__input.jsonObject["id"]) {
                    is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
val data: FooObjectWithEveryNullableTypeNestedObjectData? = when (__input.jsonObject["data"]) {
                    is JsonObject -> FooObjectWithEveryNullableTypeNestedObjectData.fromJsonElement(
                        __input.jsonObject["data"]!!,
                        "$instancePath/data",
                    )
                    else -> null
                }
            return FooObjectWithEveryNullableTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeNestedObjectData(
    val id: String?,
    val timestamp: Instant?,
    val data: FooObjectWithEveryNullableTypeNestedObjectDataData?,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += when (id) {
                    is String -> buildString { printQuoted(id) }
                    else -> "null"
                }
output += ",\"timestamp\":"
output += when (timestamp) {
                    is Instant -> "\"${timestampFormatter.format(timestamp)}\""
                    else -> "null"
                }
output += ",\"data\":"
output += data?.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                    "timestamp=${
                        when (timestamp) {
                            is Instant -> timestampFormatter.format(timestamp)
                            else -> "null"
                        }
                    }"
        )
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableTypeNestedObjectData/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeNestedObjectData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeNestedObjectData {
            return FooObjectWithEveryNullableTypeNestedObjectData(
                id = null,
                timestamp = null,
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeNestedObjectData.")
                return new()
            }
val id: String? = when (__input.jsonObject["id"]) {
                    is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
val data: FooObjectWithEveryNullableTypeNestedObjectDataData? = when (__input.jsonObject["data"]) {
                    is JsonObject -> FooObjectWithEveryNullableTypeNestedObjectDataData.fromJsonElement(
                        __input.jsonObject["data"]!!,
                        "$instancePath/data",
                    )
                    else -> null
                }
            return FooObjectWithEveryNullableTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeNestedObjectDataData(
    val id: String?,
    val timestamp: Instant?,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += when (id) {
                    is String -> buildString { printQuoted(id) }
                    else -> "null"
                }
output += ",\"timestamp\":"
output += when (timestamp) {
                    is Instant -> "\"${timestampFormatter.format(timestamp)}\""
                    else -> "null"
                }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                    "timestamp=${
                        when (timestamp) {
                            is Instant -> timestampFormatter.format(timestamp)
                            else -> "null"
                        }
                    }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeNestedObjectDataData {
            return FooObjectWithEveryNullableTypeNestedObjectDataData(
                id = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeNestedObjectDataData.")
                return new()
            }
val id: String? = when (__input.jsonObject["id"]) {
                    is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
            return FooObjectWithEveryNullableTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}



data class FooObjectWithEveryNullableTypeNestedArrayElementElement(
    val id: String?,
    val timestamp: Instant?,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += when (id) {
                    is String -> buildString { printQuoted(id) }
                    else -> "null"
                }
output += ",\"timestamp\":"
output += when (timestamp) {
                    is Instant -> "\"${timestampFormatter.format(timestamp)}\""
                    else -> "null"
                }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                    "timestamp=${
                        when (timestamp) {
                            is Instant -> timestampFormatter.format(timestamp)
                            else -> "null"
                        }
                    }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeNestedArrayElementElement {
            return FooObjectWithEveryNullableTypeNestedArrayElementElement(
                id = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeNestedArrayElementElement.")
                return new()
            }
val id: String? = when (__input.jsonObject["id"]) {
                    is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
            return FooObjectWithEveryNullableTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}



data class FooObjectWithPascalCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val emailAddress: String? = null,
    val isAdmin: Boolean? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"CreatedAt\":"
output += "\"${timestampFormatter.format(createdAt)}\""
output += ",\"DisplayName\":"
output += buildString { printQuoted(displayName) }
output += ",\"PhoneNumber\":"
output += when (phoneNumber) {
                    is String -> buildString { printQuoted(phoneNumber) }
                    else -> "null"
                }
if (emailAddress != null) {
                output += ",\"EmailAddress\":"
                output += buildString { printQuoted(emailAddress) }
            }
if (isAdmin != null) {
                output += ",\"IsAdmin\":"
                output += isAdmin
            }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add(
                "CreatedAt=${
                    timestampFormatter.format(createdAt)
                }"
        )
queryParts.add("DisplayName=$displayName")
queryParts.add("PhoneNumber=$phoneNumber")
if (emailAddress != null) {
            queryParts.add("EmailAddress=$emailAddress")
        }
if (isAdmin != null) {
            queryParts.add("IsAdmin=$isAdmin")
        }
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeys> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeys {
            return FooObjectWithPascalCaseKeys(
                createdAt = Instant.now(),
                displayName = "",
                phoneNumber = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeys {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeys {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeys.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeys.")
                return new()
            }
val createdAt: Instant = when (__input.jsonObject["CreatedAt"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["CreatedAt"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["CreatedAt"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val displayName: String = when (__input.jsonObject["DisplayName"]) {
                is JsonPrimitive -> __input.jsonObject["DisplayName"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val phoneNumber: String? = when (__input.jsonObject["PhoneNumber"]) {
                    is JsonPrimitive -> __input.jsonObject["PhoneNumber"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val emailAddress: String? = when (__input.jsonObject["EmailAddress"]) {
                    is JsonPrimitive -> __input.jsonObject["EmailAddress"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val isAdmin: Boolean? = when (__input.jsonObject["IsAdmin"]) {
                    is JsonPrimitive -> __input.jsonObject["IsAdmin"]!!.jsonPrimitive.booleanOrNull
                    else -> null
                }
            return FooObjectWithPascalCaseKeys(
                createdAt,
                displayName,
                phoneNumber,
                emailAddress,
                isAdmin,
            )
        }
    }
}



data class FooObjectWithSnakeCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val emailAddress: String? = null,
    val isAdmin: Boolean? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"created_at\":"
output += "\"${timestampFormatter.format(createdAt)}\""
output += ",\"display_name\":"
output += buildString { printQuoted(displayName) }
output += ",\"phone_number\":"
output += when (phoneNumber) {
                    is String -> buildString { printQuoted(phoneNumber) }
                    else -> "null"
                }
if (emailAddress != null) {
                output += ",\"email_address\":"
                output += buildString { printQuoted(emailAddress) }
            }
if (isAdmin != null) {
                output += ",\"is_admin\":"
                output += isAdmin
            }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add(
                "created_at=${
                    timestampFormatter.format(createdAt)
                }"
        )
queryParts.add("display_name=$displayName")
queryParts.add("phone_number=$phoneNumber")
if (emailAddress != null) {
            queryParts.add("email_address=$emailAddress")
        }
if (isAdmin != null) {
            queryParts.add("is_admin=$isAdmin")
        }
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeys> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeys {
            return FooObjectWithSnakeCaseKeys(
                createdAt = Instant.now(),
                displayName = "",
                phoneNumber = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeys {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeys {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeys.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeys.")
                return new()
            }
val createdAt: Instant = when (__input.jsonObject["created_at"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["created_at"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["created_at"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val displayName: String = when (__input.jsonObject["display_name"]) {
                is JsonPrimitive -> __input.jsonObject["display_name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val phoneNumber: String? = when (__input.jsonObject["phone_number"]) {
                    is JsonPrimitive -> __input.jsonObject["phone_number"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val emailAddress: String? = when (__input.jsonObject["email_address"]) {
                    is JsonPrimitive -> __input.jsonObject["email_address"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val isAdmin: Boolean? = when (__input.jsonObject["is_admin"]) {
                    is JsonPrimitive -> __input.jsonObject["is_admin"]!!.jsonPrimitive.booleanOrNull
                    else -> null
                }
            return FooObjectWithSnakeCaseKeys(
                createdAt,
                displayName,
                phoneNumber,
                emailAddress,
                isAdmin,
            )
        }
    }
}



data class FooObjectWithEveryOptionalType(
    val any: JsonElement? = null,
    val boolean: Boolean? = null,
    val string: String? = null,
    val timestamp: Instant? = null,
    val float32: Float? = null,
    val float64: Double? = null,
    val int8: Byte? = null,
    val uint8: UByte? = null,
    val int16: Short? = null,
    val uint16: UShort? = null,
    val int32: Int? = null,
    val uint32: UInt? = null,
    val int64: Long? = null,
    val uint64: ULong? = null,
    val enumerator: FooObjectWithEveryOptionalTypeEnumerator? = null,
    val array: MutableList<Boolean>? = null,
    val `object`: FooObjectWithEveryOptionalTypeObject? = null,
    val record: MutableMap<String, ULong>? = null,
    val discriminator: FooObjectWithEveryOptionalTypeDiscriminator? = null,
    val nestedObject: FooObjectWithEveryOptionalTypeNestedObject? = null,
    val nestedArray: MutableList<MutableList<FooObjectWithEveryOptionalTypeNestedArrayElementElement>>? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
var hasProperties = false
if (any != null) {
    output += "\"any\":"
    output += JsonInstance.encodeToString(any)
    hasProperties = true
}
if (boolean != null) {
        if (hasProperties) output += ","

    output += "\"boolean\":"
    output += boolean
    hasProperties = true
}
if (string != null) {
        if (hasProperties) output += ","

    output += "\"string\":"
    output += buildString { printQuoted(string) }
    hasProperties = true
}
if (timestamp != null) {
        if (hasProperties) output += ","

    output += "\"timestamp\":"
    output += "\"${timestampFormatter.format(timestamp)}\""
    hasProperties = true
}
if (float32 != null) {
        if (hasProperties) output += ","

    output += "\"float32\":"
    output += float32
    hasProperties = true
}
if (float64 != null) {
        if (hasProperties) output += ","

    output += "\"float64\":"
    output += float64
    hasProperties = true
}
if (int8 != null) {
        if (hasProperties) output += ","

    output += "\"int8\":"
    output += int8
    hasProperties = true
}
if (uint8 != null) {
        if (hasProperties) output += ","

    output += "\"uint8\":"
    output += uint8
    hasProperties = true
}
if (int16 != null) {
        if (hasProperties) output += ","

    output += "\"int16\":"
    output += int16
    hasProperties = true
}
if (uint16 != null) {
        if (hasProperties) output += ","

    output += "\"uint16\":"
    output += uint16
    hasProperties = true
}
if (int32 != null) {
        if (hasProperties) output += ","

    output += "\"int32\":"
    output += int32
    hasProperties = true
}
if (uint32 != null) {
        if (hasProperties) output += ","

    output += "\"uint32\":"
    output += uint32
    hasProperties = true
}
if (int64 != null) {
        if (hasProperties) output += ","

    output += "\"int64\":"
    output += "\"${int64}\""
    hasProperties = true
}
if (uint64 != null) {
        if (hasProperties) output += ","

    output += "\"uint64\":"
    output += "\"${uint64}\""
    hasProperties = true
}
if (enumerator != null) {
        if (hasProperties) output += ","

    output += "\"enumerator\":"
    output += "\"${enumerator.serialValue}\""
    hasProperties = true
}
if (array != null) {
        if (hasProperties) output += ","

    output += "\"array\":"
    output += "["
                for ((__index, __element) in array.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element
                }
                output += "]"
    hasProperties = true
}
if (`object` != null) {
        if (hasProperties) output += ","

    output += "\"object\":"
    output += `object`.toJson()
    hasProperties = true
}
if (record != null) {
        if (hasProperties) output += ","

    output += "\"record\":"
    output += "{"
            for ((__index, __entry) in record.entries.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += "${buildString { printQuoted(__entry.key) }}:"
                output += "\"${__entry.value}\""
            }
            output += "}"
    hasProperties = true
}
if (discriminator != null) {
        if (hasProperties) output += ","

    output += "\"discriminator\":"
    output += discriminator.toJson()
    hasProperties = true
}
if (nestedObject != null) {
        if (hasProperties) output += ","

    output += "\"nestedObject\":"
    output += nestedObject.toJson()
    hasProperties = true
}
if (nestedArray != null) {
        if (hasProperties) output += ","

    output += "\"nestedArray\":"
    output += "["
                for ((__index, __element) in nestedArray.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += "["
                for ((__index, __element) in __element.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element.toJson()
                }
                output += "]"
                }
                output += "]"

}
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
__logError("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/any.")
if (boolean != null) {
            queryParts.add("boolean=$boolean")
        }
if (string != null) {
            queryParts.add("string=$string")
        }
if (timestamp != null) {
                    queryParts.add(
                        "timestamp=${
                            timestampFormatter.format(timestamp)
                        }"
                )
            }
if (float32 != null) {
            queryParts.add("float32=$float32")
        }
if (float64 != null) {
            queryParts.add("float64=$float64")
        }
if (int8 != null) {
            queryParts.add("int8=$int8")
        }
if (uint8 != null) {
            queryParts.add("uint8=$uint8")
        }
if (int16 != null) {
            queryParts.add("int16=$int16")
        }
if (uint16 != null) {
            queryParts.add("uint16=$uint16")
        }
if (int32 != null) {
            queryParts.add("int32=$int32")
        }
if (uint32 != null) {
            queryParts.add("uint32=$uint32")
        }
if (int64 != null) {
            queryParts.add("int64=$int64")
        }
if (uint64 != null) {
            queryParts.add("uint64=$uint64")
        }
if (enumerator != null) {
                    queryParts.add("enumerator=${enumerator.serialValue}")
                }
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/array.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/object.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/record.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/discriminator.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedObject.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedArray.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalType> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalType {
            return FooObjectWithEveryOptionalType(

            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalType {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalType.")
                return new()
            }
val any: JsonElement? = when (__input.jsonObject["any"]) {
                    null -> null
                    else -> __input.jsonObject["any"] 
                }
val boolean: Boolean? = when (__input.jsonObject["boolean"]) {
                    is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull
                    else -> null
                }
val string: String? = when (__input.jsonObject["string"]) {
                    is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null
                else -> null
            }
val float32: Float? = when (__input.jsonObject["float32"]) {
                    is JsonPrimitive -> __input.jsonObject["float32"]!!.jsonPrimitive.floatOrNull
                    else -> null
                }
val float64: Double? = when (__input.jsonObject["float64"]) {
                    is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull
                    else -> null
                }
val int8: Byte? = when (__input.jsonObject["int8"]) {
                    is JsonPrimitive -> __input.jsonObject["int8"]!!.jsonPrimitive.contentOrNull?.toByteOrNull()
                    else -> null
                }
val uint8: UByte? = when (__input.jsonObject["uint8"]) {
                    is JsonPrimitive -> __input.jsonObject["uint8"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull()
                    else -> null
                }
val int16: Short? = when (__input.jsonObject["int16"]) {
                    is JsonPrimitive -> __input.jsonObject["int16"]!!.jsonPrimitive.contentOrNull?.toShortOrNull()
                    else -> null
                }
val uint16: UShort? = when (__input.jsonObject["uint16"]) {
                    is JsonPrimitive -> __input.jsonObject["uint16"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull()
                    else -> null
                }
val int32: Int? = when (__input.jsonObject["int32"]) {
                    is JsonPrimitive -> __input.jsonObject["int32"]!!.jsonPrimitive.intOrNull
                    else -> null
                }
val uint32: UInt? = when (__input.jsonObject["uint32"]) {
                    is JsonPrimitive -> __input.jsonObject["uint32"]!!.jsonPrimitive.contentOrNull?.toUIntOrNull()
                    else -> null
                }
val int64: Long? = when (__input.jsonObject["int64"]) {
                    is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull
                    else -> null
                }
val uint64: ULong? = when (__input.jsonObject["uint64"]) {
                    is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull()
                    else -> null
                }
val enumerator: FooObjectWithEveryOptionalTypeEnumerator? = when (__input.jsonObject["enumerator"]) {
                    is JsonNull -> null
                    is JsonPrimitive -> FooObjectWithEveryOptionalTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                    else -> null
                }
val array: MutableList<Boolean>? = when (__input.jsonObject["array"]) {
                    is JsonArray -> {
                        val __value: MutableList<Boolean> = mutableListOf()
                        for (__element in __input.jsonObject["array"]!!.jsonArray) {
                            __value.add(
                                when (__element) {
                is JsonPrimitive -> __element!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
                            )
                        }
                        __value
                    }

                    else -> null
                }
val `object`: FooObjectWithEveryOptionalTypeObject? = when (__input.jsonObject["object"]) {
                    is JsonObject -> FooObjectWithEveryOptionalTypeObject.fromJsonElement(
                        __input.jsonObject["object"]!!,
                        "$instancePath/object",
                    )
                    else -> null
                }
val record: MutableMap<String, ULong>? = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, ULong> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                is JsonPrimitive -> __entry.value!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
                    }
                    __value
                }

                else -> null
            }
val discriminator: FooObjectWithEveryOptionalTypeDiscriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )
                else -> null
            }
val nestedObject: FooObjectWithEveryOptionalTypeNestedObject? = when (__input.jsonObject["nestedObject"]) {
                    is JsonObject -> FooObjectWithEveryOptionalTypeNestedObject.fromJsonElement(
                        __input.jsonObject["nestedObject"]!!,
                        "$instancePath/nestedObject",
                    )
                    else -> null
                }
val nestedArray: MutableList<MutableList<FooObjectWithEveryOptionalTypeNestedArrayElementElement>>? = when (__input.jsonObject["nestedArray"]) {
                    is JsonArray -> {
                        val __value: MutableList<MutableList<FooObjectWithEveryOptionalTypeNestedArrayElementElement>> = mutableListOf()
                        for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                            __value.add(
                                when (__element) {
                is JsonArray -> {
                    val __value: MutableList<FooObjectWithEveryOptionalTypeNestedArrayElementElement> = mutableListOf()
                    for (__element in __element!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooObjectWithEveryOptionalTypeNestedArrayElementElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )

                else -> FooObjectWithEveryOptionalTypeNestedArrayElementElement.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
                            )
                        }
                        __value
                    }

                    else -> null
                }
            return FooObjectWithEveryOptionalType(
                any,
                boolean,
                string,
                timestamp,
                float32,
                float64,
                int8,
                uint8,
                int16,
                uint16,
                int32,
                uint32,
                int64,
                uint64,
                enumerator,
                array,
                `object`,
                record,
                discriminator,
                nestedObject,
                nestedArray,
            )
        }
    }
}

enum class FooObjectWithEveryOptionalTypeEnumerator {
    A,
    B,
    C;
    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeEnumerator> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeEnumerator.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "A" -> A
                "B" -> B
                "C" -> C
                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryOptionalTypeObject(
    val string: String,
    val boolean: Boolean,
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"string\":"
output += buildString { printQuoted(string) }
output += ",\"boolean\":"
output += boolean
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("string=$string")
queryParts.add("boolean=$boolean")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeObject {
            return FooObjectWithEveryOptionalTypeObject(
                string = "",
                boolean = false,
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeObject.")
                return new()
            }
val string: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val boolean: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
            return FooObjectWithEveryOptionalTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}



sealed interface FooObjectWithEveryOptionalTypeDiscriminator : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeDiscriminator> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeDiscriminator {
            return FooObjectWithEveryOptionalTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> FooObjectWithEveryOptionalTypeDiscriminatorA.fromJsonElement(__input, instancePath)
"B" -> FooObjectWithEveryOptionalTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryOptionalTypeDiscriminatorA(
    val title: String,
) : FooObjectWithEveryOptionalTypeDiscriminator {
    override val type get() = "A"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"A\""
output += ",\"title\":"
output += buildString { printQuoted(title) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=A")
queryParts.add("title=$title")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeDiscriminatorA {
            return FooObjectWithEveryOptionalTypeDiscriminatorA(
                title = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeDiscriminatorA.")
                return new()
            }
val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryOptionalTypeDiscriminatorA(
                title,
            )
        }
    }
}



data class FooObjectWithEveryOptionalTypeDiscriminatorB(
    val title: String,
    val description: String,
) : FooObjectWithEveryOptionalTypeDiscriminator {
    override val type get() = "B"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"B\""
output += ",\"title\":"
output += buildString { printQuoted(title) }
output += ",\"description\":"
output += buildString { printQuoted(description) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=B")
queryParts.add("title=$title")
queryParts.add("description=$description")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeDiscriminatorB {
            return FooObjectWithEveryOptionalTypeDiscriminatorB(
                title = "",
                description = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeDiscriminatorB.")
                return new()
            }
val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val description: String = when (__input.jsonObject["description"]) {
                is JsonPrimitive -> __input.jsonObject["description"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryOptionalTypeDiscriminatorB(
                title,
                description,
            )
        }
    }
}



data class FooObjectWithEveryOptionalTypeNestedObject(
    val id: String,
    val timestamp: Instant,
    val data: FooObjectWithEveryOptionalTypeNestedObjectData,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += ",\"data\":"
output += data.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObject/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeNestedObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeNestedObject {
            return FooObjectWithEveryOptionalTypeNestedObject(
                id = "",
                timestamp = Instant.now(),
                data = FooObjectWithEveryOptionalTypeNestedObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeNestedObject.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val data: FooObjectWithEveryOptionalTypeNestedObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryOptionalTypeNestedObjectData.new()
            }
            return FooObjectWithEveryOptionalTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeNestedObjectData(
    val id: String,
    val timestamp: Instant,
    val data: FooObjectWithEveryOptionalTypeNestedObjectDataData,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += ",\"data\":"
output += data.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObjectData/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeNestedObjectData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeNestedObjectData {
            return FooObjectWithEveryOptionalTypeNestedObjectData(
                id = "",
                timestamp = Instant.now(),
                data = FooObjectWithEveryOptionalTypeNestedObjectDataData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeNestedObjectData.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val data: FooObjectWithEveryOptionalTypeNestedObjectDataData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryOptionalTypeNestedObjectDataData.new()
            }
            return FooObjectWithEveryOptionalTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeNestedObjectDataData(
    val id: String,
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeNestedObjectDataData {
            return FooObjectWithEveryOptionalTypeNestedObjectDataData(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeNestedObjectDataData.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
            return FooObjectWithEveryOptionalTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}



data class FooObjectWithEveryOptionalTypeNestedArrayElementElement(
    val id: String,
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"timestamp\":"
output += "\"${timestampFormatter.format(timestamp)}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
        )
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeNestedArrayElementElement {
            return FooObjectWithEveryOptionalTypeNestedArrayElementElement(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeNestedArrayElementElement.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
            return FooObjectWithEveryOptionalTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}



data class FooRecursiveObject(
    val left: FooRecursiveObject?,
    val right: FooRecursiveObject?,
    val value: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"left\":"
output += left?.toJson()
output += ",\"right\":"
output += right?.toJson()
output += ",\"value\":"
output += buildString { printQuoted(value) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/left.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/right.")
queryParts.add("value=$value")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveObject> {
        @JvmStatic
        override fun new(): FooRecursiveObject {
            return FooRecursiveObject(
                left = null,
                right = null,
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveObject.")
                return new()
            }
val left: FooRecursiveObject? = when (__input.jsonObject["left"]) {
                is JsonObject -> FooRecursiveObject.fromJsonElement(
                    __input.jsonObject["left"]!!,
                    "$instancePath/left",
                )
                else -> null
            }
val right: FooRecursiveObject? = when (__input.jsonObject["right"]) {
                is JsonObject -> FooRecursiveObject.fromJsonElement(
                    __input.jsonObject["right"]!!,
                    "$instancePath/right",
                )
                else -> null
            }
val value: String = when (__input.jsonObject["value"]) {
                is JsonPrimitive -> __input.jsonObject["value"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooRecursiveObject(
                left,
                right,
                value,
            )
        }
    }
}



sealed interface FooRecursiveUnion : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnion> {
        @JvmStatic
        override fun new(): FooRecursiveUnion {
            return FooRecursiveUnionChild.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnion.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "CHILD" -> FooRecursiveUnionChild.fromJsonElement(__input, instancePath)
"CHILDREN" -> FooRecursiveUnionChildren.fromJsonElement(__input, instancePath)
"TEXT" -> FooRecursiveUnionText.fromJsonElement(__input, instancePath)
"SHAPE" -> FooRecursiveUnionShape.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

/**
* Child node
*/
data class FooRecursiveUnionChild(
    val data: FooRecursiveUnion,
) : FooRecursiveUnion {
    override val type get() = "CHILD"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"CHILD\""
output += ",\"data\":"
output += data.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=CHILD")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionChild/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionChild> {
        @JvmStatic
        override fun new(): FooRecursiveUnionChild {
            return FooRecursiveUnionChild(
                data = FooRecursiveUnion.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionChild.")
                return new()
            }
val data: FooRecursiveUnion = when (__input.jsonObject["data"]) {
                is JsonObject -> FooRecursiveUnion.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )
                else -> FooRecursiveUnion.new()
            }
            return FooRecursiveUnionChild(
                data,
            )
        }
    }
}



/**
* List of children node
*/
data class FooRecursiveUnionChildren(
    val data: MutableList<FooRecursiveUnion>,
) : FooRecursiveUnion {
    override val type get() = "CHILDREN"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"CHILDREN\""
output += ",\"data\":"
output += "["
                for ((__index, __element) in data.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element.toJson()
                }
                output += "]"
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=CHILDREN")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /RecursiveUnionChildren/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionChildren> {
        @JvmStatic
        override fun new(): FooRecursiveUnionChildren {
            return FooRecursiveUnionChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionChildren.")
                return new()
            }
val data: MutableList<FooRecursiveUnion> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<FooRecursiveUnion> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooRecursiveUnion.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )
                else -> FooRecursiveUnion.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooRecursiveUnionChildren(
                data,
            )
        }
    }
}



/**
* Text node
*/
data class FooRecursiveUnionText(
    val data: String,
) : FooRecursiveUnion {
    override val type get() = "TEXT"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"TEXT\""
output += ",\"data\":"
output += buildString { printQuoted(data) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=TEXT")
queryParts.add("data=$data")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionText> {
        @JvmStatic
        override fun new(): FooRecursiveUnionText {
            return FooRecursiveUnionText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionText.")
                return new()
            }
val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooRecursiveUnionText(
                data,
            )
        }
    }
}



/**
* Shape node
*/
data class FooRecursiveUnionShape(
    val data: FooRecursiveUnionShapeData,
) : FooRecursiveUnion {
    override val type get() = "SHAPE"

    override fun toJson(): String {
var output = "{"
output += "\"type\":\"SHAPE\""
output += ",\"data\":"
output += data.toJson()
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("type=SHAPE")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionShape/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionShape> {
        @JvmStatic
        override fun new(): FooRecursiveUnionShape {
            return FooRecursiveUnionShape(
                data = FooRecursiveUnionShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionShape.")
                return new()
            }
val data: FooRecursiveUnionShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooRecursiveUnionShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooRecursiveUnionShapeData.new()
            }
            return FooRecursiveUnionShape(
                data,
            )
        }
    }
}

data class FooRecursiveUnionShapeData(
    val width: Double,
    val height: Double,
    val color: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"width\":"
output += width
output += ",\"height\":"
output += height
output += ",\"color\":"
output += buildString { printQuoted(color) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("width=$width")
queryParts.add("height=$height")
queryParts.add("color=$color")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionShapeData> {
        @JvmStatic
        override fun new(): FooRecursiveUnionShapeData {
            return FooRecursiveUnionShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionShapeData.")
                return new()
            }
val width: Double = when (__input.jsonObject["width"]) {
                is JsonPrimitive -> __input.jsonObject["width"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
val height: Double = when (__input.jsonObject["height"]) {
                is JsonPrimitive -> __input.jsonObject["height"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
val color: String = when (__input.jsonObject["color"]) {
                is JsonPrimitive -> __input.jsonObject["color"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooRecursiveUnionShapeData(
                width,
                height,
                color,
            )
        }
    }
}



data class FooAutoReconnectParams(
    val messageCount: UByte,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"messageCount\":"
output += messageCount
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("messageCount=$messageCount")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooAutoReconnectParams> {
        @JvmStatic
        override fun new(): FooAutoReconnectParams {
            return FooAutoReconnectParams(
                messageCount = 0u,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooAutoReconnectParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooAutoReconnectParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooAutoReconnectParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooAutoReconnectParams.")
                return new()
            }
val messageCount: UByte = when (__input.jsonObject["messageCount"]) {
                is JsonPrimitive -> __input.jsonObject["messageCount"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull() ?: 0u
                else -> 0u
            }
            return FooAutoReconnectParams(
                messageCount,
            )
        }
    }
}



data class FooAutoReconnectResponse(
    val count: UByte,
    val message: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"count\":"
output += count
output += ",\"message\":"
output += buildString { printQuoted(message) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("count=$count")
queryParts.add("message=$message")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooAutoReconnectResponse> {
        @JvmStatic
        override fun new(): FooAutoReconnectResponse {
            return FooAutoReconnectResponse(
                count = 0u,
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooAutoReconnectResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooAutoReconnectResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooAutoReconnectResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooAutoReconnectResponse.")
                return new()
            }
val count: UByte = when (__input.jsonObject["count"]) {
                is JsonPrimitive -> __input.jsonObject["count"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull() ?: 0u
                else -> 0u
            }
val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooAutoReconnectResponse(
                count,
                message,
            )
        }
    }
}



data class FooStreamConnectionErrorTestParams(
    val statusCode: Int,
    val statusMessage: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"statusCode\":"
output += statusCode
output += ",\"statusMessage\":"
output += buildString { printQuoted(statusMessage) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("statusCode=$statusCode")
queryParts.add("statusMessage=$statusMessage")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooStreamConnectionErrorTestParams> {
        @JvmStatic
        override fun new(): FooStreamConnectionErrorTestParams {
            return FooStreamConnectionErrorTestParams(
                statusCode = 0,
                statusMessage = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooStreamConnectionErrorTestParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooStreamConnectionErrorTestParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooStreamConnectionErrorTestParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooStreamConnectionErrorTestParams.")
                return new()
            }
val statusCode: Int = when (__input.jsonObject["statusCode"]) {
                is JsonPrimitive -> __input.jsonObject["statusCode"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
val statusMessage: String = when (__input.jsonObject["statusMessage"]) {
                is JsonPrimitive -> __input.jsonObject["statusMessage"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooStreamConnectionErrorTestParams(
                statusCode,
                statusMessage,
            )
        }
    }
}



data class FooStreamConnectionErrorTestResponse(
    val message: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"message\":"
output += buildString { printQuoted(message) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("message=$message")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooStreamConnectionErrorTestResponse> {
        @JvmStatic
        override fun new(): FooStreamConnectionErrorTestResponse {
            return FooStreamConnectionErrorTestResponse(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooStreamConnectionErrorTestResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooStreamConnectionErrorTestResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooStreamConnectionErrorTestResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooStreamConnectionErrorTestResponse.")
                return new()
            }
val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooStreamConnectionErrorTestResponse(
                message,
            )
        }
    }
}



data class FooStreamLargeObjectsResponse(
    val numbers: MutableList<Double>,
    val objects: MutableList<FooStreamLargeObjectsResponseObjectsElement>,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"numbers\":"
output += "["
                for ((__index, __element) in numbers.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element
                }
                output += "]"
output += ",\"objects\":"
output += "["
                for ((__index, __element) in objects.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element.toJson()
                }
                output += "]"
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /StreamLargeObjectsResponse/numbers.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /StreamLargeObjectsResponse/objects.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooStreamLargeObjectsResponse> {
        @JvmStatic
        override fun new(): FooStreamLargeObjectsResponse {
            return FooStreamLargeObjectsResponse(
                numbers = mutableListOf(),
                objects = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooStreamLargeObjectsResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooStreamLargeObjectsResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooStreamLargeObjectsResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooStreamLargeObjectsResponse.")
                return new()
            }
val numbers: MutableList<Double> = when (__input.jsonObject["numbers"]) {
                is JsonArray -> {
                    val __value: MutableList<Double> = mutableListOf()
                    for (__element in __input.jsonObject["numbers"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonPrimitive -> __element!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
val objects: MutableList<FooStreamLargeObjectsResponseObjectsElement> = when (__input.jsonObject["objects"]) {
                is JsonArray -> {
                    val __value: MutableList<FooStreamLargeObjectsResponseObjectsElement> = mutableListOf()
                    for (__element in __input.jsonObject["objects"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooStreamLargeObjectsResponseObjectsElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )

                else -> FooStreamLargeObjectsResponseObjectsElement.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooStreamLargeObjectsResponse(
                numbers,
                objects,
            )
        }
    }
}

data class FooStreamLargeObjectsResponseObjectsElement(
    val id: String,
    val name: String,
    val email: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"name\":"
output += buildString { printQuoted(name) }
output += ",\"email\":"
output += buildString { printQuoted(email) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add("name=$name")
queryParts.add("email=$email")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooStreamLargeObjectsResponseObjectsElement> {
        @JvmStatic
        override fun new(): FooStreamLargeObjectsResponseObjectsElement {
            return FooStreamLargeObjectsResponseObjectsElement(
                id = "",
                name = "",
                email = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooStreamLargeObjectsResponseObjectsElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooStreamLargeObjectsResponseObjectsElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooStreamLargeObjectsResponseObjectsElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooStreamLargeObjectsResponseObjectsElement.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val name: String = when (__input.jsonObject["name"]) {
                is JsonPrimitive -> __input.jsonObject["name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val email: String = when (__input.jsonObject["email"]) {
                is JsonPrimitive -> __input.jsonObject["email"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooStreamLargeObjectsResponseObjectsElement(
                id,
                name,
                email,
            )
        }
    }
}



data class FooChatMessageParams(
    val channelId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"channelId\":"
output += buildString { printQuoted(channelId) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("channelId=$channelId")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooChatMessageParams> {
        @JvmStatic
        override fun new(): FooChatMessageParams {
            return FooChatMessageParams(
                channelId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooChatMessageParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooChatMessageParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooChatMessageParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooChatMessageParams.")
                return new()
            }
val channelId: String = when (__input.jsonObject["channelId"]) {
                is JsonPrimitive -> __input.jsonObject["channelId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooChatMessageParams(
                channelId,
            )
        }
    }
}



sealed interface FooChatMessage : TestClientPrefixedModel {
    val messageType: String

    companion object Factory : TestClientPrefixedModelFactory<FooChatMessage> {
        @JvmStatic
        override fun new(): FooChatMessage {
            return FooChatMessageText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooChatMessage {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooChatMessage {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooChatMessage.")
                return new()
            }
            return when (__input.jsonObject["messageType"]) {
                is JsonPrimitive -> when (__input.jsonObject["messageType"]!!.jsonPrimitive.contentOrNull) {
                    "TEXT" -> FooChatMessageText.fromJsonElement(__input, instancePath)
"IMAGE" -> FooChatMessageImage.fromJsonElement(__input, instancePath)
"URL" -> FooChatMessageUrl.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooChatMessageText(
    val id: String,
    val channelId: String,
    val userId: String,
    val date: Instant,
    val text: String,
) : FooChatMessage {
    override val messageType get() = "TEXT"

    override fun toJson(): String {
var output = "{"
output += "\"messageType\":\"TEXT\""
output += ",\"id\":"
output += buildString { printQuoted(id) }
output += ",\"channelId\":"
output += buildString { printQuoted(channelId) }
output += ",\"userId\":"
output += buildString { printQuoted(userId) }
output += ",\"date\":"
output += "\"${timestampFormatter.format(date)}\""
output += ",\"text\":"
output += buildString { printQuoted(text) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("messageType=TEXT")
queryParts.add("id=$id")
queryParts.add("channelId=$channelId")
queryParts.add("userId=$userId")
queryParts.add(
                "date=${
                    timestampFormatter.format(date)
                }"
        )
queryParts.add("text=$text")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooChatMessageText> {
        @JvmStatic
        override fun new(): FooChatMessageText {
            return FooChatMessageText(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.now(),
                text = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooChatMessageText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooChatMessageText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooChatMessageText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooChatMessageText.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val channelId: String = when (__input.jsonObject["channelId"]) {
                is JsonPrimitive -> __input.jsonObject["channelId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val date: Instant = when (__input.jsonObject["date"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["date"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val text: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooChatMessageText(
                id,
                channelId,
                userId,
                date,
                text,
            )
        }
    }
}



data class FooChatMessageImage(
    val id: String,
    val channelId: String,
    val userId: String,
    val date: Instant,
    val image: String,
) : FooChatMessage {
    override val messageType get() = "IMAGE"

    override fun toJson(): String {
var output = "{"
output += "\"messageType\":\"IMAGE\""
output += ",\"id\":"
output += buildString { printQuoted(id) }
output += ",\"channelId\":"
output += buildString { printQuoted(channelId) }
output += ",\"userId\":"
output += buildString { printQuoted(userId) }
output += ",\"date\":"
output += "\"${timestampFormatter.format(date)}\""
output += ",\"image\":"
output += buildString { printQuoted(image) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("messageType=IMAGE")
queryParts.add("id=$id")
queryParts.add("channelId=$channelId")
queryParts.add("userId=$userId")
queryParts.add(
                "date=${
                    timestampFormatter.format(date)
                }"
        )
queryParts.add("image=$image")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooChatMessageImage> {
        @JvmStatic
        override fun new(): FooChatMessageImage {
            return FooChatMessageImage(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.now(),
                image = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooChatMessageImage {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooChatMessageImage {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooChatMessageImage.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooChatMessageImage.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val channelId: String = when (__input.jsonObject["channelId"]) {
                is JsonPrimitive -> __input.jsonObject["channelId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val date: Instant = when (__input.jsonObject["date"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["date"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val image: String = when (__input.jsonObject["image"]) {
                is JsonPrimitive -> __input.jsonObject["image"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooChatMessageImage(
                id,
                channelId,
                userId,
                date,
                image,
            )
        }
    }
}



data class FooChatMessageUrl(
    val id: String,
    val channelId: String,
    val userId: String,
    val date: Instant,
    val url: String,
) : FooChatMessage {
    override val messageType get() = "URL"

    override fun toJson(): String {
var output = "{"
output += "\"messageType\":\"URL\""
output += ",\"id\":"
output += buildString { printQuoted(id) }
output += ",\"channelId\":"
output += buildString { printQuoted(channelId) }
output += ",\"userId\":"
output += buildString { printQuoted(userId) }
output += ",\"date\":"
output += "\"${timestampFormatter.format(date)}\""
output += ",\"url\":"
output += buildString { printQuoted(url) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("messageType=URL")
queryParts.add("id=$id")
queryParts.add("channelId=$channelId")
queryParts.add("userId=$userId")
queryParts.add(
                "date=${
                    timestampFormatter.format(date)
                }"
        )
queryParts.add("url=$url")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooChatMessageUrl> {
        @JvmStatic
        override fun new(): FooChatMessageUrl {
            return FooChatMessageUrl(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.now(),
                url = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooChatMessageUrl {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooChatMessageUrl {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooChatMessageUrl.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooChatMessageUrl.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val channelId: String = when (__input.jsonObject["channelId"]) {
                is JsonPrimitive -> __input.jsonObject["channelId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val date: Instant = when (__input.jsonObject["date"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["date"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val url: String = when (__input.jsonObject["url"]) {
                is JsonPrimitive -> __input.jsonObject["url"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooChatMessageUrl(
                id,
                channelId,
                userId,
                date,
                url,
            )
        }
    }
}



data class FooTestsStreamRetryWithNewCredentialsResponse(
    val message: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"message\":"
output += buildString { printQuoted(message) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("message=$message")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooTestsStreamRetryWithNewCredentialsResponse> {
        @JvmStatic
        override fun new(): FooTestsStreamRetryWithNewCredentialsResponse {
            return FooTestsStreamRetryWithNewCredentialsResponse(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooTestsStreamRetryWithNewCredentialsResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooTestsStreamRetryWithNewCredentialsResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooTestsStreamRetryWithNewCredentialsResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooTestsStreamRetryWithNewCredentialsResponse.")
                return new()
            }
val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooTestsStreamRetryWithNewCredentialsResponse(
                message,
            )
        }
    }
}



data class FooUsersWatchUserParams(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"userId\":"
output += buildString { printQuoted(userId) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("userId=$userId")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserParams> {
        @JvmStatic
        override fun new(): FooUsersWatchUserParams {
            return FooUsersWatchUserParams(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUsersWatchUserParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserParams.")
                return new()
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUsersWatchUserParams(
                userId,
            )
        }
    }
}



data class FooUsersWatchUserResponse(
    val id: String,
    val role: FooUsersWatchUserResponseRole,
    /**
    * A profile picture    
*/
    val photo: FooUserPhoto?,
    val createdAt: Instant,
    val numFollowers: Int,
    val settings: FooUserSettings,
    val recentNotifications: MutableList<FooUsersWatchUserResponseRecentNotificationsElement>,
    val bookmarks: MutableMap<String, FooUsersWatchUserResponseBookmarksValue>,
    val metadata: MutableMap<String, JsonElement>,
    val randomList: MutableList<JsonElement>,
    val bio: String? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"id\":"
output += buildString { printQuoted(id) }
output += ",\"role\":"
output += "\"${role.serialValue}\""
output += ",\"photo\":"
output += photo?.toJson()
output += ",\"createdAt\":"
output += "\"${timestampFormatter.format(createdAt)}\""
output += ",\"numFollowers\":"
output += numFollowers
output += ",\"settings\":"
output += settings.toJson()
output += ",\"recentNotifications\":"
output += "["
                for ((__index, __element) in recentNotifications.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += __element.toJson()
                }
                output += "]"
output += ",\"bookmarks\":"
output += "{"
            for ((__index, __entry) in bookmarks.entries.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += "${buildString { printQuoted(__entry.key) }}:"
                output += __entry.value.toJson()
            }
            output += "}"
output += ",\"metadata\":"
output += "{"
            for ((__index, __entry) in metadata.entries.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += "${buildString { printQuoted(__entry.key) }}:"
                output += JsonInstance.encodeToString(__entry.value)
            }
            output += "}"
output += ",\"randomList\":"
output += "["
                for ((__index, __element) in randomList.withIndex()) {
                    if (__index != 0) {
                        output += ","
                    }
                    output += JsonInstance.encodeToString(__element)
                }
                output += "]"
if (bio != null) {
                output += ",\"bio\":"
                output += buildString { printQuoted(bio) }
            }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("id=$id")
queryParts.add("role=${role.serialValue}")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/photo.")
queryParts.add(
                "createdAt=${
                    timestampFormatter.format(createdAt)
                }"
        )
queryParts.add("numFollowers=$numFollowers")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/settings.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/recentNotifications.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/bookmarks.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/metadata.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/randomList.")
if (bio != null) {
            queryParts.add("bio=$bio")
        }
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserResponse> {
        @JvmStatic
        override fun new(): FooUsersWatchUserResponse {
            return FooUsersWatchUserResponse(
                id = "",
                role = FooUsersWatchUserResponseRole.new(),
                photo = null,
                createdAt = Instant.now(),
                numFollowers = 0,
                settings = FooUserSettings.new(),
                recentNotifications = mutableListOf(),
                bookmarks = mutableMapOf(),
                metadata = mutableMapOf(),
                randomList = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUsersWatchUserResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponse.")
                return new()
            }
val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val role: FooUsersWatchUserResponseRole = when (__input.jsonObject["role"]) {
                is JsonNull -> FooUsersWatchUserResponseRole.new()
                is JsonPrimitive -> FooUsersWatchUserResponseRole.fromJsonElement(__input.jsonObject["role"]!!, "$instancePath/role")
                else -> FooUsersWatchUserResponseRole.new()
            }
val photo: FooUserPhoto? = when (__input.jsonObject["photo"]) {
                    is JsonObject -> FooUserPhoto.fromJsonElement(
                        __input.jsonObject["photo"]!!,
                        "$instancePath/photo",
                    )
                    else -> null
                }
val createdAt: Instant = when (__input.jsonObject["createdAt"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["createdAt"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["createdAt"]!!.jsonPrimitive.content)
                    else
                        Instant.now()
                else -> Instant.now()
            }
val numFollowers: Int = when (__input.jsonObject["numFollowers"]) {
                is JsonPrimitive -> __input.jsonObject["numFollowers"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
val settings: FooUserSettings = when (__input.jsonObject["settings"]) {
                is JsonObject -> FooUserSettings.fromJsonElement(
                    __input.jsonObject["settings"]!!,
                    "$instancePath/settings",
                )

                else -> FooUserSettings.new()
            }
val recentNotifications: MutableList<FooUsersWatchUserResponseRecentNotificationsElement> = when (__input.jsonObject["recentNotifications"]) {
                is JsonArray -> {
                    val __value: MutableList<FooUsersWatchUserResponseRecentNotificationsElement> = mutableListOf()
                    for (__element in __input.jsonObject["recentNotifications"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooUsersWatchUserResponseRecentNotificationsElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )
                else -> FooUsersWatchUserResponseRecentNotificationsElement.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
val bookmarks: MutableMap<String, FooUsersWatchUserResponseBookmarksValue> = when (__input.jsonObject["bookmarks"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, FooUsersWatchUserResponseBookmarksValue> = mutableMapOf()
                    for (__entry in __input.jsonObject["bookmarks"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                is JsonObject -> FooUsersWatchUserResponseBookmarksValue.fromJsonElement(
                    __entry.value!!,
                    "$instancePath/bookmarks",
                )

                else -> FooUsersWatchUserResponseBookmarksValue.new()
            }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
val metadata: MutableMap<String, JsonElement> = when (__input.jsonObject["metadata"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, JsonElement> = mutableMapOf()
                    for (__entry in __input.jsonObject["metadata"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                is JsonElement -> __entry.value!!
                else -> JsonNull
            }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
val randomList: MutableList<JsonElement> = when (__input.jsonObject["randomList"]) {
                is JsonArray -> {
                    val __value: MutableList<JsonElement> = mutableListOf()
                    for (__element in __input.jsonObject["randomList"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonElement -> __element!!
                else -> JsonNull
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
val bio: String? = when (__input.jsonObject["bio"]) {
                    is JsonPrimitive -> __input.jsonObject["bio"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
            return FooUsersWatchUserResponse(
                id,
                role,
                photo,
                createdAt,
                numFollowers,
                settings,
                recentNotifications,
                bookmarks,
                metadata,
                randomList,
                bio,
            )
        }
    }
}

enum class FooUsersWatchUserResponseRole {
    Standard,
    Admin;
    val serialValue: String
        get() = when (this) {
            Standard -> "standard"
            Admin -> "admin"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserResponseRole> {
        @JvmStatic
        override fun new(): FooUsersWatchUserResponseRole {
            return Standard
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserResponseRole {
            return when (input) {
                Standard.serialValue -> Standard
                Admin.serialValue -> Admin
                else -> Standard
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserResponseRole {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooUsersWatchUserResponseRole.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponseRole.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "standard" -> Standard
                "admin" -> Admin
                else -> new()
            }
        }
    }
}

/**
* A profile picture
*/
data class FooUserPhoto(
    val url: String,
    val width: Double,
    val height: Double,
    val bytes: Long,
    /**
    * When the photo was last updated in nanoseconds    
*/
    val nanoseconds: ULong,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"url\":"
output += buildString { printQuoted(url) }
output += ",\"width\":"
output += width
output += ",\"height\":"
output += height
output += ",\"bytes\":"
output += "\"${bytes}\""
output += ",\"nanoseconds\":"
output += "\"${nanoseconds}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("url=$url")
queryParts.add("width=$width")
queryParts.add("height=$height")
queryParts.add("bytes=$bytes")
queryParts.add("nanoseconds=$nanoseconds")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUserPhoto> {
        @JvmStatic
        override fun new(): FooUserPhoto {
            return FooUserPhoto(
                url = "",
                width = 0.0,
                height = 0.0,
                bytes = 0L,
                nanoseconds = 0UL,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUserPhoto {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUserPhoto {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUserPhoto.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUserPhoto.")
                return new()
            }
val url: String = when (__input.jsonObject["url"]) {
                is JsonPrimitive -> __input.jsonObject["url"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val width: Double = when (__input.jsonObject["width"]) {
                is JsonPrimitive -> __input.jsonObject["width"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
val height: Double = when (__input.jsonObject["height"]) {
                is JsonPrimitive -> __input.jsonObject["height"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
val bytes: Long = when (__input.jsonObject["bytes"]) {
                is JsonPrimitive -> __input.jsonObject["bytes"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
val nanoseconds: ULong = when (__input.jsonObject["nanoseconds"]) {
                is JsonPrimitive -> __input.jsonObject["nanoseconds"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
            return FooUserPhoto(
                url,
                width,
                height,
                bytes,
                nanoseconds,
            )
        }
    }
}



data class FooUserSettings(
    val notificationsEnabled: Boolean,
    val preferredTheme: FooUserSettingsPreferredTheme,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"notificationsEnabled\":"
output += notificationsEnabled
output += ",\"preferredTheme\":"
output += "\"${preferredTheme.serialValue}\""
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("notificationsEnabled=$notificationsEnabled")
queryParts.add("preferredTheme=${preferredTheme.serialValue}")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUserSettings> {
        @JvmStatic
        override fun new(): FooUserSettings {
            return FooUserSettings(
                notificationsEnabled = false,
                preferredTheme = FooUserSettingsPreferredTheme.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUserSettings {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUserSettings {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUserSettings.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUserSettings.")
                return new()
            }
val notificationsEnabled: Boolean = when (__input.jsonObject["notificationsEnabled"]) {
                is JsonPrimitive -> __input.jsonObject["notificationsEnabled"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
val preferredTheme: FooUserSettingsPreferredTheme = when (__input.jsonObject["preferredTheme"]) {
                is JsonNull -> FooUserSettingsPreferredTheme.new()
                is JsonPrimitive -> FooUserSettingsPreferredTheme.fromJsonElement(__input.jsonObject["preferredTheme"]!!, "$instancePath/preferredTheme")
                else -> FooUserSettingsPreferredTheme.new()
            }
            return FooUserSettings(
                notificationsEnabled,
                preferredTheme,
            )
        }
    }
}

enum class FooUserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System;
    val serialValue: String
        get() = when (this) {
            DarkMode -> "dark-mode"
            LightMode -> "light-mode"
            System -> "system"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooUserSettingsPreferredTheme> {
        @JvmStatic
        override fun new(): FooUserSettingsPreferredTheme {
            return DarkMode
        }

        @JvmStatic
        override fun fromJson(input: String): FooUserSettingsPreferredTheme {
            return when (input) {
                DarkMode.serialValue -> DarkMode
                LightMode.serialValue -> LightMode
                System.serialValue -> System
                else -> DarkMode
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUserSettingsPreferredTheme {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooUserSettingsPreferredTheme.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooUserSettingsPreferredTheme.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "dark-mode" -> DarkMode
                "light-mode" -> LightMode
                "system" -> System
                else -> new()
            }
        }
    }
}

sealed interface FooUsersWatchUserResponseRecentNotificationsElement : TestClientPrefixedModel {
    val notificationType: String

    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserResponseRecentNotificationsElement> {
        @JvmStatic
        override fun new(): FooUsersWatchUserResponseRecentNotificationsElement {
            return FooUsersWatchUserResponseRecentNotificationsElementPostLike.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserResponseRecentNotificationsElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserResponseRecentNotificationsElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponseRecentNotificationsElement.")
                return new()
            }
            return when (__input.jsonObject["notificationType"]) {
                is JsonPrimitive -> when (__input.jsonObject["notificationType"]!!.jsonPrimitive.contentOrNull) {
                    "POST_LIKE" -> FooUsersWatchUserResponseRecentNotificationsElementPostLike.fromJsonElement(__input, instancePath)
"POST_COMMENT" -> FooUsersWatchUserResponseRecentNotificationsElementPostComment.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUsersWatchUserResponseRecentNotificationsElementPostLike(
    val postId: String,
    val userId: String,
) : FooUsersWatchUserResponseRecentNotificationsElement {
    override val notificationType get() = "POST_LIKE"

    override fun toJson(): String {
var output = "{"
output += "\"notificationType\":\"POST_LIKE\""
output += ",\"postId\":"
output += buildString { printQuoted(postId) }
output += ",\"userId\":"
output += buildString { printQuoted(userId) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("notificationType=POST_LIKE")
queryParts.add("postId=$postId")
queryParts.add("userId=$userId")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserResponseRecentNotificationsElementPostLike> {
        @JvmStatic
        override fun new(): FooUsersWatchUserResponseRecentNotificationsElementPostLike {
            return FooUsersWatchUserResponseRecentNotificationsElementPostLike(
                postId = "",
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserResponseRecentNotificationsElementPostLike {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserResponseRecentNotificationsElementPostLike {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUsersWatchUserResponseRecentNotificationsElementPostLike.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponseRecentNotificationsElementPostLike.")
                return new()
            }
val postId: String = when (__input.jsonObject["postId"]) {
                is JsonPrimitive -> __input.jsonObject["postId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUsersWatchUserResponseRecentNotificationsElementPostLike(
                postId,
                userId,
            )
        }
    }
}



data class FooUsersWatchUserResponseRecentNotificationsElementPostComment(
    val postId: String,
    val userId: String,
    val commentText: String,
) : FooUsersWatchUserResponseRecentNotificationsElement {
    override val notificationType get() = "POST_COMMENT"

    override fun toJson(): String {
var output = "{"
output += "\"notificationType\":\"POST_COMMENT\""
output += ",\"postId\":"
output += buildString { printQuoted(postId) }
output += ",\"userId\":"
output += buildString { printQuoted(userId) }
output += ",\"commentText\":"
output += buildString { printQuoted(commentText) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("notificationType=POST_COMMENT")
queryParts.add("postId=$postId")
queryParts.add("userId=$userId")
queryParts.add("commentText=$commentText")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserResponseRecentNotificationsElementPostComment> {
        @JvmStatic
        override fun new(): FooUsersWatchUserResponseRecentNotificationsElementPostComment {
            return FooUsersWatchUserResponseRecentNotificationsElementPostComment(
                postId = "",
                userId = "",
                commentText = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserResponseRecentNotificationsElementPostComment {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserResponseRecentNotificationsElementPostComment {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUsersWatchUserResponseRecentNotificationsElementPostComment.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponseRecentNotificationsElementPostComment.")
                return new()
            }
val postId: String = when (__input.jsonObject["postId"]) {
                is JsonPrimitive -> __input.jsonObject["postId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val commentText: String = when (__input.jsonObject["commentText"]) {
                is JsonPrimitive -> __input.jsonObject["commentText"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUsersWatchUserResponseRecentNotificationsElementPostComment(
                postId,
                userId,
                commentText,
            )
        }
    }
}



data class FooUsersWatchUserResponseBookmarksValue(
    val postId: String,
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
var output = "{"
output += "\"postId\":"
output += buildString { printQuoted(postId) }
output += ",\"userId\":"
output += buildString { printQuoted(userId) }
output += "}"
return output    
    }

    override fun toUrlQueryParams(): String {
val queryParts = mutableListOf<String>()
queryParts.add("postId=$postId")
queryParts.add("userId=$userId")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUsersWatchUserResponseBookmarksValue> {
        @JvmStatic
        override fun new(): FooUsersWatchUserResponseBookmarksValue {
            return FooUsersWatchUserResponseBookmarksValue(
                postId = "",
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUsersWatchUserResponseBookmarksValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUsersWatchUserResponseBookmarksValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUsersWatchUserResponseBookmarksValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponseBookmarksValue.")
                return new()
            }
val postId: String = when (__input.jsonObject["postId"]) {
                is JsonPrimitive -> __input.jsonObject["postId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUsersWatchUserResponseBookmarksValue(
                postId,
                userId,
            )
        }
    }
}



// Implementation copied from https://github.com/Kotlin/kotlinx.serialization/blob/d0ae697b9394103879e6c7f836d0f7cf128f4b1e/formats/json/commonMain/src/kotlinx/serialization/json/internal/StringOps.kt#L45
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
        this[c] = "\\u$c1$c2$c3$c4"
    }
    this['"'.code] = "\\\""
    this['\\'.code] = "\\\\"
    this['\t'.code] = "\\t"
    this['\b'.code] = "\\b"
    this['\n'.code] = "\\n"
    this['\r'.code] = "\\r"
    this[0x0c] = "\\f"
}

private val ESCAPE_MARKERS: ByteArray = ByteArray(93).apply {
    for (c in 0..0x1f) {
        this[c] = 1.toByte()
    }
    this['"'.code] = '"'.code.toByte()
    this['\\'.code] = '\\'.code.toByte()
    this['\t'.code] = 't'.code.toByte()
    this['\b'.code] = 'b'.code.toByte()
    this['\n'.code] = 'n'.code.toByte()
    this['\r'.code] = 'r'.code.toByte()
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
    params: TestClientPrefixedModel?,
    headers: MutableMap<String, String>?,
): HttpStatement {
    var finalUrl = url
    var finalBody = ""
    when (method) {
        HttpMethod.Get, HttpMethod.Head -> {
            finalUrl = "$finalUrl?${params?.toUrlQueryParams() ?: ""}"
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
private enum class __TestClientPrefixedSseEventLineType {
    Id,
    Event,
    Data,
    Retry,
    None,
}

private fun __parseSseEventLine(line: String): Pair<__TestClientPrefixedSseEventLineType, String> {
    if (line.startsWith("id:")) {
        return Pair(__TestClientPrefixedSseEventLineType.Id, line.substring(3).trim())
    }
    if (line.startsWith("event:")) {
        return Pair(__TestClientPrefixedSseEventLineType.Event, line.substring(6).trim())
    }
    if (line.startsWith("data:")) {
        return Pair(__TestClientPrefixedSseEventLineType.Data, line.substring(5).trim())
    }
    if (line.startsWith("retry:")) {
        return Pair(__TestClientPrefixedSseEventLineType.Retry, line.substring(6).trim())
    }
    return Pair(__TestClientPrefixedSseEventLineType.None, "")
}

private data class __TestClientPrefixedSseEvent(
    val id: String? = null,
    val event: String,
    val data: String,
    val retry: Int? = null
)

private class __TestClientPrefixedSseEventParsingResult(val events: List<__TestClientPrefixedSseEvent>, val leftover: String)

private fun __parseSseEvents(input: String): __TestClientPrefixedSseEventParsingResult {
    val events = mutableListOf<__TestClientPrefixedSseEvent>()
    val lines = input.lines()
    if (lines.isEmpty()) {
        return __TestClientPrefixedSseEventParsingResult(events = listOf(), leftover = "")
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
                __TestClientPrefixedSseEventLineType.Id -> id = value
                __TestClientPrefixedSseEventLineType.Event -> event = value
                __TestClientPrefixedSseEventLineType.Data -> data = value
                __TestClientPrefixedSseEventLineType.Retry -> retry = value.toInt()
                __TestClientPrefixedSseEventLineType.None -> {}
            }
        }
        val isEnd = line == ""
        if (isEnd) {
            if (data != null) {
                events.add(
                    __TestClientPrefixedSseEvent(
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
    return __TestClientPrefixedSseEventParsingResult(
        events = events,
        leftover = if (lastIndex != null) lines.subList(lastIndex!!, lines.size).joinToString(separator = "\n") else ""
    )
}
// SSE_FN_END

private suspend fun __handleSseRequest(
    httpClient: HttpClient,
    url: String,
    method: HttpMethod,
    params: TestClientPrefixedModel?,
    headers: __TestClientPrefixedHeadersFn,
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onError: ((err: Exception) -> Unit) = {},
    onRequestError: ((err: Exception) -> Unit) = {},
    onResponseError: ((err: TestClientPrefixedError) -> Unit) = {},
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
                        val err = TestClientPrefixedError.fromJson(httpResponse.bodyAsText()) 
                        onError(err)
                        onResponseError(err)
                    } else {
                        val err = TestClientPrefixedError(
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
                    val err = TestClientPrefixedError(
                        code = 0,
                        errorMessage = "Expected server to return Content-Type \"text/event-stream\". Got \"${httpResponse.headers["Content-Type"]}\"",
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
                val parsedResult = __parseSseEvents("${pendingData}${input}")
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
}