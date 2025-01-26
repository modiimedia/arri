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
private typealias TestClientPrefixedHeadersFn = (() -> MutableMap<String, String>?)?

class TestClientPrefixed(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: TestClientPrefixedHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    val tests: TestClientPrefixedTestsService = TestClientPrefixedTestsService(
                httpClient = httpClient,
                baseUrl = baseUrl,
                headers = headers,
                onError = onError,
            )

    val users: TestClientPrefixedUsersService = TestClientPrefixedUsersService(
                httpClient = httpClient,
                baseUrl = baseUrl,
                headers = headers,
                onError = onError,
            )
}

class TestClientPrefixedTestsService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: TestClientPrefixedHeadersFn,
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



class TestClientPrefixedUsersService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: TestClientPrefixedHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    suspend fun watchUser(
            params: FooUsersWatchUserParams,
            lastEventId: String? = null,
            bufferCapacity: Int = 1024 * 1024,
            onOpen: ((response: HttpResponse) -> Unit) = {},
            onClose: (() -> Unit) = {},
            onRequestError: ((error: Exception) -> Unit) = {},
            onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
            onData: ((data: FooUsersWatchUserResponse) -> Unit) = {},
            maxBackoffTime: Long? = null,
        ): Unit {
            __handleSseRequest(
                httpClient = httpClient,
                url = "$baseUrl/rpcs/users/watch-user",
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
                    val data = FooUsersWatchUserResponse.fromJson(str)
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
    val enumerator: FooFooObjectWithEveryTypeEnumerator,
    val array: MutableList<Boolean>,
    val `object`: FooFooObjectWithEveryTypeObject,
    val record: MutableMap<String, ULong>,
    val discriminator: FooFooObjectWithEveryTypeDiscriminator,
    val nestedObject: FooFooObjectWithEveryTypeNestedObject,
    val nestedArray: MutableList<MutableList<FooFooObjectWithEveryTypeNestedArrayElementElement>>,
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
__logError("[WARNING] any's cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/any.")
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
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/array.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/object.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/record.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/discriminator.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/nestedObject.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooObjectWithEveryType/nestedArray.")
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
                enumerator = FooFooObjectWithEveryTypeEnumerator.new(),
                array = mutableListOf(),
                `object` = FooFooObjectWithEveryTypeObject.new(),
                record = mutableMapOf(),
                discriminator = FooFooObjectWithEveryTypeDiscriminator.new(),
                nestedObject = FooFooObjectWithEveryTypeNestedObject.new(),
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
val enumerator: FooFooObjectWithEveryTypeEnumerator = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> FooFooObjectWithEveryTypeEnumerator.new()
                is JsonPrimitive -> FooFooObjectWithEveryTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                else -> FooFooObjectWithEveryTypeEnumerator.new()
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
val `object`: FooFooObjectWithEveryTypeObject = when (__input.jsonObject["object"]) {
                is JsonObject -> FooFooObjectWithEveryTypeObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> FooFooObjectWithEveryTypeObject.new()
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
val discriminator: FooFooObjectWithEveryTypeDiscriminator = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> FooFooObjectWithEveryTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )
                else -> FooFooObjectWithEveryTypeDiscriminator.new()
            }
val nestedObject: FooFooObjectWithEveryTypeNestedObject = when (__input.jsonObject["nestedObject"]) {
                is JsonObject -> FooFooObjectWithEveryTypeNestedObject.fromJsonElement(
                    __input.jsonObject["nestedObject"]!!,
                    "$instancePath/nestedObject",
                )

                else -> FooFooObjectWithEveryTypeNestedObject.new()
            }
val nestedArray: MutableList<MutableList<FooFooObjectWithEveryTypeNestedArrayElementElement>> = when (__input.jsonObject["nestedArray"]) {
                is JsonArray -> {
                    val __value: MutableList<MutableList<FooFooObjectWithEveryTypeNestedArrayElementElement>> = mutableListOf()
                    for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonArray -> {
                    val __value: MutableList<FooFooObjectWithEveryTypeNestedArrayElementElement> = mutableListOf()
                    for (__element in __element!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooFooObjectWithEveryTypeNestedArrayElementElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )

                else -> FooFooObjectWithEveryTypeNestedArrayElementElement.new()
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

enum class FooFooObjectWithEveryTypeEnumerator {
    A,
    B,
    C;
    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryTypeEnumerator> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooFooObjectWithEveryTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryTypeEnumerator.")
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

data class FooFooObjectWithEveryTypeObject(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryTypeObject> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryTypeObject {
            return FooFooObjectWithEveryTypeObject(
                string = "",
                boolean = false,
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryTypeObject.")
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
            return FooFooObjectWithEveryTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}



sealed interface FooFooObjectWithEveryTypeDiscriminator : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryTypeDiscriminator> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryTypeDiscriminator {
            return FooFooFooObjectWithEveryTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> FooFooFooObjectWithEveryTypeDiscriminatorA.fromJsonElement(__input, instancePath)
"B" -> FooFooFooObjectWithEveryTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooFooFooObjectWithEveryTypeDiscriminatorA(
    val title: String,
) : FooFooObjectWithEveryTypeDiscriminator {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryTypeDiscriminatorA {
            return FooFooFooObjectWithEveryTypeDiscriminatorA(
                title = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryTypeDiscriminatorA.")
                return new()
            }
val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooFooFooObjectWithEveryTypeDiscriminatorA(
                title,
            )
        }
    }
}



data class FooFooFooObjectWithEveryTypeDiscriminatorB(
    val title: String,
    val description: String,
) : FooFooObjectWithEveryTypeDiscriminator {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryTypeDiscriminatorB {
            return FooFooFooObjectWithEveryTypeDiscriminatorB(
                title = "",
                description = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryTypeDiscriminatorB.")
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
            return FooFooFooObjectWithEveryTypeDiscriminatorB(
                title,
                description,
            )
        }
    }
}



data class FooFooObjectWithEveryTypeNestedObject(
    val id: String,
    val timestamp: Instant,
    val data: FooFooFooObjectWithEveryTypeNestedObjectData,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooObjectWithEveryTypeNestedObject/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryTypeNestedObject> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryTypeNestedObject {
            return FooFooObjectWithEveryTypeNestedObject(
                id = "",
                timestamp = Instant.now(),
                data = FooFooFooObjectWithEveryTypeNestedObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryTypeNestedObject.")
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
val data: FooFooFooObjectWithEveryTypeNestedObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooFooFooObjectWithEveryTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooFooFooObjectWithEveryTypeNestedObjectData.new()
            }
            return FooFooObjectWithEveryTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooFooFooObjectWithEveryTypeNestedObjectData(
    val id: String,
    val timestamp: Instant,
    val data: FooFooFooFooObjectWithEveryTypeNestedObjectDataData,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooFooObjectWithEveryTypeNestedObjectData/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryTypeNestedObjectData> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryTypeNestedObjectData {
            return FooFooFooObjectWithEveryTypeNestedObjectData(
                id = "",
                timestamp = Instant.now(),
                data = FooFooFooFooObjectWithEveryTypeNestedObjectDataData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryTypeNestedObjectData.")
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
val data: FooFooFooFooObjectWithEveryTypeNestedObjectDataData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooFooFooFooObjectWithEveryTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooFooFooFooObjectWithEveryTypeNestedObjectDataData.new()
            }
            return FooFooFooObjectWithEveryTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooFooFooFooObjectWithEveryTypeNestedObjectDataData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooFooObjectWithEveryTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): FooFooFooFooObjectWithEveryTypeNestedObjectDataData {
            return FooFooFooFooObjectWithEveryTypeNestedObjectDataData(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooFooObjectWithEveryTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooFooObjectWithEveryTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooFooObjectWithEveryTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooFooObjectWithEveryTypeNestedObjectDataData.")
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
            return FooFooFooFooObjectWithEveryTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}



data class FooFooObjectWithEveryTypeNestedArrayElementElement(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryTypeNestedArrayElementElement {
            return FooFooObjectWithEveryTypeNestedArrayElementElement(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryTypeNestedArrayElementElement.")
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
            return FooFooObjectWithEveryTypeNestedArrayElementElement(
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
    val enumerator: FooFooObjectWithEveryNullableTypeEnumerator?,
    val array: MutableList<Boolean?>?,
    val `object`: FooFooObjectWithEveryNullableTypeObject?,
    val record: MutableMap<String, ULong?>?,
    val discriminator: FooFooObjectWithEveryNullableTypeDiscriminator?,
    val nestedObject: FooFooObjectWithEveryNullableTypeNestedObject?,
    val nestedArray: MutableList<MutableList<FooFooObjectWithEveryNullableTypeNestedArrayElementElement?>?>?,
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
                    is FooFooObjectWithEveryNullableTypeEnumerator -> "\"${enumerator.serialValue}\""
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
__logError("[WARNING] any's cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/any.")
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
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/array.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/object.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/record.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/discriminator.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/nestedObject.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooObjectWithEveryNullableType/nestedArray.")
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
val enumerator: FooFooObjectWithEveryNullableTypeEnumerator? = when (__input.jsonObject["enumerator"]) {
                    is JsonNull -> null
                    is JsonPrimitive -> FooFooObjectWithEveryNullableTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
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
val `object`: FooFooObjectWithEveryNullableTypeObject? = when (__input.jsonObject["object"]) {
                    is JsonObject -> FooFooObjectWithEveryNullableTypeObject.fromJsonElement(
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
val discriminator: FooFooObjectWithEveryNullableTypeDiscriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> FooFooObjectWithEveryNullableTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )
                else -> null
            }
val nestedObject: FooFooObjectWithEveryNullableTypeNestedObject? = when (__input.jsonObject["nestedObject"]) {
                    is JsonObject -> FooFooObjectWithEveryNullableTypeNestedObject.fromJsonElement(
                        __input.jsonObject["nestedObject"]!!,
                        "$instancePath/nestedObject",
                    )
                    else -> null
                }
val nestedArray: MutableList<MutableList<FooFooObjectWithEveryNullableTypeNestedArrayElementElement?>?>? = when (__input.jsonObject["nestedArray"]) {
                    is JsonArray -> {
                        val __value: MutableList<MutableList<FooFooObjectWithEveryNullableTypeNestedArrayElementElement?>?> = mutableListOf()
                        for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                            __value.add(
                                when (__element) {
                    is JsonArray -> {
                        val __value: MutableList<FooFooObjectWithEveryNullableTypeNestedArrayElementElement?> = mutableListOf()
                        for (__element in __element!!.jsonArray) {
                            __value.add(
                                when (__element) {
                    is JsonObject -> FooFooObjectWithEveryNullableTypeNestedArrayElementElement.fromJsonElement(
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

enum class FooFooObjectWithEveryNullableTypeEnumerator {
    A,
    B,
    C;
    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryNullableTypeEnumerator> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryNullableTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryNullableTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryNullableTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooFooObjectWithEveryNullableTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryNullableTypeEnumerator.")
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

data class FooFooObjectWithEveryNullableTypeObject(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryNullableTypeObject> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryNullableTypeObject {
            return FooFooObjectWithEveryNullableTypeObject(
                string = null,
                boolean = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryNullableTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryNullableTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryNullableTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryNullableTypeObject.")
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
            return FooFooObjectWithEveryNullableTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}



sealed interface FooFooObjectWithEveryNullableTypeDiscriminator : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryNullableTypeDiscriminator> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryNullableTypeDiscriminator {
            return FooFooFooObjectWithEveryNullableTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryNullableTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryNullableTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryNullableTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> FooFooFooObjectWithEveryNullableTypeDiscriminatorA.fromJsonElement(__input, instancePath)
"B" -> FooFooFooObjectWithEveryNullableTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooFooFooObjectWithEveryNullableTypeDiscriminatorA(
    val title: String?,
) : FooFooObjectWithEveryNullableTypeDiscriminator {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryNullableTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryNullableTypeDiscriminatorA {
            return FooFooFooObjectWithEveryNullableTypeDiscriminatorA(
                title = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryNullableTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryNullableTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryNullableTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryNullableTypeDiscriminatorA.")
                return new()
            }
val title: String? = when (__input.jsonObject["title"]) {
                    is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull
                    else -> null
                }
            return FooFooFooObjectWithEveryNullableTypeDiscriminatorA(
                title,
            )
        }
    }
}



data class FooFooFooObjectWithEveryNullableTypeDiscriminatorB(
    val title: String?,
    val description: String?,
) : FooFooObjectWithEveryNullableTypeDiscriminator {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryNullableTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryNullableTypeDiscriminatorB {
            return FooFooFooObjectWithEveryNullableTypeDiscriminatorB(
                title = null,
                description = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryNullableTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryNullableTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryNullableTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryNullableTypeDiscriminatorB.")
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
            return FooFooFooObjectWithEveryNullableTypeDiscriminatorB(
                title,
                description,
            )
        }
    }
}



data class FooFooObjectWithEveryNullableTypeNestedObject(
    val id: String?,
    val timestamp: Instant?,
    val data: FooFooFooObjectWithEveryNullableTypeNestedObjectData?,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooObjectWithEveryNullableTypeNestedObject/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryNullableTypeNestedObject> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryNullableTypeNestedObject {
            return FooFooObjectWithEveryNullableTypeNestedObject(
                id = null,
                timestamp = null,
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryNullableTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryNullableTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryNullableTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryNullableTypeNestedObject.")
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
val data: FooFooFooObjectWithEveryNullableTypeNestedObjectData? = when (__input.jsonObject["data"]) {
                    is JsonObject -> FooFooFooObjectWithEveryNullableTypeNestedObjectData.fromJsonElement(
                        __input.jsonObject["data"]!!,
                        "$instancePath/data",
                    )
                    else -> null
                }
            return FooFooObjectWithEveryNullableTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooFooFooObjectWithEveryNullableTypeNestedObjectData(
    val id: String?,
    val timestamp: Instant?,
    val data: FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData?,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooFooObjectWithEveryNullableTypeNestedObjectData/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryNullableTypeNestedObjectData> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryNullableTypeNestedObjectData {
            return FooFooFooObjectWithEveryNullableTypeNestedObjectData(
                id = null,
                timestamp = null,
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryNullableTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryNullableTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryNullableTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryNullableTypeNestedObjectData.")
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
val data: FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData? = when (__input.jsonObject["data"]) {
                    is JsonObject -> FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData.fromJsonElement(
                        __input.jsonObject["data"]!!,
                        "$instancePath/data",
                    )
                    else -> null
                }
            return FooFooFooObjectWithEveryNullableTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData {
            return FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData(
                id = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData.")
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
            return FooFooFooFooObjectWithEveryNullableTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}



data class FooFooObjectWithEveryNullableTypeNestedArrayElementElement(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryNullableTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryNullableTypeNestedArrayElementElement {
            return FooFooObjectWithEveryNullableTypeNestedArrayElementElement(
                id = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryNullableTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryNullableTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryNullableTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryNullableTypeNestedArrayElementElement.")
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
            return FooFooObjectWithEveryNullableTypeNestedArrayElementElement(
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
    val enumerator: FooFooObjectWithEveryOptionalTypeEnumerator? = null,
    val array: MutableList<Boolean>? = null,
    val `object`: FooFooObjectWithEveryOptionalTypeObject? = null,
    val record: MutableMap<String, ULong>? = null,
    val discriminator: FooFooObjectWithEveryOptionalTypeDiscriminator? = null,
    val nestedObject: FooFooObjectWithEveryOptionalTypeNestedObject? = null,
    val nestedArray: MutableList<MutableList<FooFooObjectWithEveryOptionalTypeNestedArrayElementElement>>? = null,
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
__logError("[WARNING] any's cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/any.")
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
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/array.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/object.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/record.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/discriminator.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/nestedObject.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooObjectWithEveryOptionalType/nestedArray.")
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
val enumerator: FooFooObjectWithEveryOptionalTypeEnumerator? = when (__input.jsonObject["enumerator"]) {
                    is JsonNull -> null
                    is JsonPrimitive -> FooFooObjectWithEveryOptionalTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
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
val `object`: FooFooObjectWithEveryOptionalTypeObject? = when (__input.jsonObject["object"]) {
                    is JsonObject -> FooFooObjectWithEveryOptionalTypeObject.fromJsonElement(
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
val discriminator: FooFooObjectWithEveryOptionalTypeDiscriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> FooFooObjectWithEveryOptionalTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )
                else -> null
            }
val nestedObject: FooFooObjectWithEveryOptionalTypeNestedObject? = when (__input.jsonObject["nestedObject"]) {
                    is JsonObject -> FooFooObjectWithEveryOptionalTypeNestedObject.fromJsonElement(
                        __input.jsonObject["nestedObject"]!!,
                        "$instancePath/nestedObject",
                    )
                    else -> null
                }
val nestedArray: MutableList<MutableList<FooFooObjectWithEveryOptionalTypeNestedArrayElementElement>>? = when (__input.jsonObject["nestedArray"]) {
                    is JsonArray -> {
                        val __value: MutableList<MutableList<FooFooObjectWithEveryOptionalTypeNestedArrayElementElement>> = mutableListOf()
                        for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                            __value.add(
                                when (__element) {
                is JsonArray -> {
                    val __value: MutableList<FooFooObjectWithEveryOptionalTypeNestedArrayElementElement> = mutableListOf()
                    for (__element in __element!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooFooObjectWithEveryOptionalTypeNestedArrayElementElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )

                else -> FooFooObjectWithEveryOptionalTypeNestedArrayElementElement.new()
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

enum class FooFooObjectWithEveryOptionalTypeEnumerator {
    A,
    B,
    C;
    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryOptionalTypeEnumerator> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryOptionalTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryOptionalTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryOptionalTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooFooObjectWithEveryOptionalTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryOptionalTypeEnumerator.")
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

data class FooFooObjectWithEveryOptionalTypeObject(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryOptionalTypeObject> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryOptionalTypeObject {
            return FooFooObjectWithEveryOptionalTypeObject(
                string = "",
                boolean = false,
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryOptionalTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryOptionalTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryOptionalTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryOptionalTypeObject.")
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
            return FooFooObjectWithEveryOptionalTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}



sealed interface FooFooObjectWithEveryOptionalTypeDiscriminator : TestClientPrefixedModel {
    val type: String

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryOptionalTypeDiscriminator> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryOptionalTypeDiscriminator {
            return FooFooFooObjectWithEveryOptionalTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryOptionalTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryOptionalTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryOptionalTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> FooFooFooObjectWithEveryOptionalTypeDiscriminatorA.fromJsonElement(__input, instancePath)
"B" -> FooFooFooObjectWithEveryOptionalTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooFooFooObjectWithEveryOptionalTypeDiscriminatorA(
    val title: String,
) : FooFooObjectWithEveryOptionalTypeDiscriminator {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryOptionalTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryOptionalTypeDiscriminatorA {
            return FooFooFooObjectWithEveryOptionalTypeDiscriminatorA(
                title = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryOptionalTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryOptionalTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryOptionalTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryOptionalTypeDiscriminatorA.")
                return new()
            }
val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooFooFooObjectWithEveryOptionalTypeDiscriminatorA(
                title,
            )
        }
    }
}



data class FooFooFooObjectWithEveryOptionalTypeDiscriminatorB(
    val title: String,
    val description: String,
) : FooFooObjectWithEveryOptionalTypeDiscriminator {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryOptionalTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryOptionalTypeDiscriminatorB {
            return FooFooFooObjectWithEveryOptionalTypeDiscriminatorB(
                title = "",
                description = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryOptionalTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryOptionalTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryOptionalTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryOptionalTypeDiscriminatorB.")
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
            return FooFooFooObjectWithEveryOptionalTypeDiscriminatorB(
                title,
                description,
            )
        }
    }
}



data class FooFooObjectWithEveryOptionalTypeNestedObject(
    val id: String,
    val timestamp: Instant,
    val data: FooFooFooObjectWithEveryOptionalTypeNestedObjectData,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooObjectWithEveryOptionalTypeNestedObject/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryOptionalTypeNestedObject> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryOptionalTypeNestedObject {
            return FooFooObjectWithEveryOptionalTypeNestedObject(
                id = "",
                timestamp = Instant.now(),
                data = FooFooFooObjectWithEveryOptionalTypeNestedObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryOptionalTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryOptionalTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryOptionalTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryOptionalTypeNestedObject.")
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
val data: FooFooFooObjectWithEveryOptionalTypeNestedObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooFooFooObjectWithEveryOptionalTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooFooFooObjectWithEveryOptionalTypeNestedObjectData.new()
            }
            return FooFooObjectWithEveryOptionalTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooFooFooObjectWithEveryOptionalTypeNestedObjectData(
    val id: String,
    val timestamp: Instant,
    val data: FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooFooObjectWithEveryOptionalTypeNestedObjectData/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooObjectWithEveryOptionalTypeNestedObjectData> {
        @JvmStatic
        override fun new(): FooFooFooObjectWithEveryOptionalTypeNestedObjectData {
            return FooFooFooObjectWithEveryOptionalTypeNestedObjectData(
                id = "",
                timestamp = Instant.now(),
                data = FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooObjectWithEveryOptionalTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooObjectWithEveryOptionalTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooObjectWithEveryOptionalTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooObjectWithEveryOptionalTypeNestedObjectData.")
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
val data: FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData.new()
            }
            return FooFooFooObjectWithEveryOptionalTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData {
            return FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData.")
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
            return FooFooFooFooObjectWithEveryOptionalTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}



data class FooFooObjectWithEveryOptionalTypeNestedArrayElementElement(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooObjectWithEveryOptionalTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): FooFooObjectWithEveryOptionalTypeNestedArrayElementElement {
            return FooFooObjectWithEveryOptionalTypeNestedArrayElementElement(
                id = "",
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooObjectWithEveryOptionalTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooObjectWithEveryOptionalTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooObjectWithEveryOptionalTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooObjectWithEveryOptionalTypeNestedArrayElementElement.")
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
            return FooFooObjectWithEveryOptionalTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}



data class FooRecursiveObject(
    val left: RecursiveObject?,
    val right: RecursiveObject?,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooRecursiveObject/left.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooRecursiveObject/right.")
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
val left: RecursiveObject? = when (__input.jsonObject["left"]) {
                is JsonObject -> RecursiveObject.fromJsonElement(
                    __input.jsonObject["left"]!!,
                    "$instancePath/left",
                )
                else -> null
            }
val right: RecursiveObject? = when (__input.jsonObject["right"]) {
                is JsonObject -> RecursiveObject.fromJsonElement(
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
            return FooFooRecursiveUnionChild.new()
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
                    "CHILD" -> FooFooRecursiveUnionChild.fromJsonElement(__input, instancePath)
"CHILDREN" -> FooFooRecursiveUnionChildren.fromJsonElement(__input, instancePath)
"TEXT" -> FooFooRecursiveUnionText.fromJsonElement(__input, instancePath)
"SHAPE" -> FooFooRecursiveUnionShape.fromJsonElement(__input, instancePath)
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
data class FooFooRecursiveUnionChild(
    val data: RecursiveUnion,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooRecursiveUnionChild/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooRecursiveUnionChild> {
        @JvmStatic
        override fun new(): FooFooRecursiveUnionChild {
            return FooFooRecursiveUnionChild(
                data = RecursiveUnion.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooRecursiveUnionChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooRecursiveUnionChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooRecursiveUnionChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooRecursiveUnionChild.")
                return new()
            }
val data: RecursiveUnion = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnion.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )
                else -> RecursiveUnion.new()
            }
            return FooFooRecursiveUnionChild(
                data,
            )
        }
    }
}



/**
* List of children node
*/
data class FooFooRecursiveUnionChildren(
    val data: MutableList<RecursiveUnion>,
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
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooFooRecursiveUnionChildren/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooRecursiveUnionChildren> {
        @JvmStatic
        override fun new(): FooFooRecursiveUnionChildren {
            return FooFooRecursiveUnionChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooRecursiveUnionChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooRecursiveUnionChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooRecursiveUnionChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooRecursiveUnionChildren.")
                return new()
            }
val data: MutableList<RecursiveUnion> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<RecursiveUnion> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> RecursiveUnion.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )
                else -> RecursiveUnion.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooFooRecursiveUnionChildren(
                data,
            )
        }
    }
}



/**
* Text node
*/
data class FooFooRecursiveUnionText(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooRecursiveUnionText> {
        @JvmStatic
        override fun new(): FooFooRecursiveUnionText {
            return FooFooRecursiveUnionText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooRecursiveUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooRecursiveUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooRecursiveUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooRecursiveUnionText.")
                return new()
            }
val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooFooRecursiveUnionText(
                data,
            )
        }
    }
}



/**
* Shape node
*/
data class FooFooRecursiveUnionShape(
    val data: FooFooFooRecursiveUnionShapeData,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooFooRecursiveUnionShape/data.")
return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooFooRecursiveUnionShape> {
        @JvmStatic
        override fun new(): FooFooRecursiveUnionShape {
            return FooFooRecursiveUnionShape(
                data = FooFooFooRecursiveUnionShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooRecursiveUnionShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooRecursiveUnionShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooRecursiveUnionShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooRecursiveUnionShape.")
                return new()
            }
val data: FooFooFooRecursiveUnionShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooFooFooRecursiveUnionShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooFooFooRecursiveUnionShapeData.new()
            }
            return FooFooRecursiveUnionShape(
                data,
            )
        }
    }
}

data class FooFooFooRecursiveUnionShapeData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooRecursiveUnionShapeData> {
        @JvmStatic
        override fun new(): FooFooFooRecursiveUnionShapeData {
            return FooFooFooRecursiveUnionShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooRecursiveUnionShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooRecursiveUnionShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooRecursiveUnionShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooRecursiveUnionShapeData.")
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
            return FooFooFooRecursiveUnionShapeData(
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
    val objects: MutableList<FooFooStreamLargeObjectsResponseObjectsElement>,
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
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooStreamLargeObjectsResponse/numbers.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooStreamLargeObjectsResponse/objects.")
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
val objects: MutableList<FooFooStreamLargeObjectsResponseObjectsElement> = when (__input.jsonObject["objects"]) {
                is JsonArray -> {
                    val __value: MutableList<FooFooStreamLargeObjectsResponseObjectsElement> = mutableListOf()
                    for (__element in __input.jsonObject["objects"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooFooStreamLargeObjectsResponseObjectsElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )

                else -> FooFooStreamLargeObjectsResponseObjectsElement.new()
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

data class FooFooStreamLargeObjectsResponseObjectsElement(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooStreamLargeObjectsResponseObjectsElement> {
        @JvmStatic
        override fun new(): FooFooStreamLargeObjectsResponseObjectsElement {
            return FooFooStreamLargeObjectsResponseObjectsElement(
                id = "",
                name = "",
                email = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooStreamLargeObjectsResponseObjectsElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooStreamLargeObjectsResponseObjectsElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooStreamLargeObjectsResponseObjectsElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooStreamLargeObjectsResponseObjectsElement.")
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
            return FooFooStreamLargeObjectsResponseObjectsElement(
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
            return FooFooChatMessageText.new()
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
                    "TEXT" -> FooFooChatMessageText.fromJsonElement(__input, instancePath)
"IMAGE" -> FooFooChatMessageImage.fromJsonElement(__input, instancePath)
"URL" -> FooFooChatMessageUrl.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooFooChatMessageText(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooChatMessageText> {
        @JvmStatic
        override fun new(): FooFooChatMessageText {
            return FooFooChatMessageText(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.now(),
                text = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooChatMessageText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooChatMessageText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooChatMessageText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooChatMessageText.")
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
            return FooFooChatMessageText(
                id,
                channelId,
                userId,
                date,
                text,
            )
        }
    }
}



data class FooFooChatMessageImage(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooChatMessageImage> {
        @JvmStatic
        override fun new(): FooFooChatMessageImage {
            return FooFooChatMessageImage(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.now(),
                image = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooChatMessageImage {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooChatMessageImage {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooChatMessageImage.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooChatMessageImage.")
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
            return FooFooChatMessageImage(
                id,
                channelId,
                userId,
                date,
                image,
            )
        }
    }
}



data class FooFooChatMessageUrl(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooChatMessageUrl> {
        @JvmStatic
        override fun new(): FooFooChatMessageUrl {
            return FooFooChatMessageUrl(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.now(),
                url = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooChatMessageUrl {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooChatMessageUrl {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooChatMessageUrl.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooChatMessageUrl.")
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
            return FooFooChatMessageUrl(
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
    val role: FooFooUsersWatchUserResponseRole,
    /**
    * A profile picture    
*/
    val photo: FooUserPhoto?,
    val createdAt: Instant,
    val numFollowers: Int,
    val settings: FooUserSettings,
    val recentNotifications: MutableList<FooFooUsersWatchUserResponseRecentNotificationsElement>,
    val bookmarks: MutableMap<String, FooFooUsersWatchUserResponseBookmarksValue>,
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
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooUsersWatchUserResponse/photo.")
queryParts.add(
                "createdAt=${
                    timestampFormatter.format(createdAt)
                }"
        )
queryParts.add("numFollowers=$numFollowers")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooUsersWatchUserResponse/settings.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooUsersWatchUserResponse/recentNotifications.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooUsersWatchUserResponse/bookmarks.")
__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /FooUsersWatchUserResponse/metadata.")
__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /FooUsersWatchUserResponse/randomList.")
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
                role = FooFooUsersWatchUserResponseRole.new(),
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
val role: FooFooUsersWatchUserResponseRole = when (__input.jsonObject["role"]) {
                is JsonNull -> FooFooUsersWatchUserResponseRole.new()
                is JsonPrimitive -> FooFooUsersWatchUserResponseRole.fromJsonElement(__input.jsonObject["role"]!!, "$instancePath/role")
                else -> FooFooUsersWatchUserResponseRole.new()
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
val recentNotifications: MutableList<FooFooUsersWatchUserResponseRecentNotificationsElement> = when (__input.jsonObject["recentNotifications"]) {
                is JsonArray -> {
                    val __value: MutableList<FooFooUsersWatchUserResponseRecentNotificationsElement> = mutableListOf()
                    for (__element in __input.jsonObject["recentNotifications"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                is JsonObject -> FooFooUsersWatchUserResponseRecentNotificationsElement.fromJsonElement(
                    __element!!,
                    "$instancePath/undefined",
                )
                else -> FooFooUsersWatchUserResponseRecentNotificationsElement.new()
            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
val bookmarks: MutableMap<String, FooFooUsersWatchUserResponseBookmarksValue> = when (__input.jsonObject["bookmarks"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, FooFooUsersWatchUserResponseBookmarksValue> = mutableMapOf()
                    for (__entry in __input.jsonObject["bookmarks"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                is JsonObject -> FooFooUsersWatchUserResponseBookmarksValue.fromJsonElement(
                    __entry.value!!,
                    "$instancePath/bookmarks",
                )

                else -> FooFooUsersWatchUserResponseBookmarksValue.new()
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

enum class FooFooUsersWatchUserResponseRole {
    Standard,
    Admin;
    val serialValue: String
        get() = when (this) {
            Standard -> "standard"
            Admin -> "admin"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooFooUsersWatchUserResponseRole> {
        @JvmStatic
        override fun new(): FooFooUsersWatchUserResponseRole {
            return Standard
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooUsersWatchUserResponseRole {
            return when (input) {
                Standard.serialValue -> Standard
                Admin.serialValue -> Admin
                else -> Standard
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooUsersWatchUserResponseRole {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooFooUsersWatchUserResponseRole.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooUsersWatchUserResponseRole.")
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
    val preferredTheme: FooFooUserSettingsPreferredTheme,
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
                preferredTheme = FooFooUserSettingsPreferredTheme.new(),
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
val preferredTheme: FooFooUserSettingsPreferredTheme = when (__input.jsonObject["preferredTheme"]) {
                is JsonNull -> FooFooUserSettingsPreferredTheme.new()
                is JsonPrimitive -> FooFooUserSettingsPreferredTheme.fromJsonElement(__input.jsonObject["preferredTheme"]!!, "$instancePath/preferredTheme")
                else -> FooFooUserSettingsPreferredTheme.new()
            }
            return FooUserSettings(
                notificationsEnabled,
                preferredTheme,
            )
        }
    }
}

enum class FooFooUserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System;
    val serialValue: String
        get() = when (this) {
            DarkMode -> "dark-mode"
            LightMode -> "light-mode"
            System -> "system"
        }
    
    companion object Factory : TestClientPrefixedModelFactory<FooFooUserSettingsPreferredTheme> {
        @JvmStatic
        override fun new(): FooFooUserSettingsPreferredTheme {
            return DarkMode
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooUserSettingsPreferredTheme {
            return when (input) {
                DarkMode.serialValue -> DarkMode
                LightMode.serialValue -> LightMode
                System.serialValue -> System
                else -> DarkMode
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooUserSettingsPreferredTheme {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooFooUserSettingsPreferredTheme.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooUserSettingsPreferredTheme.")
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

sealed interface FooFooUsersWatchUserResponseRecentNotificationsElement : TestClientPrefixedModel {
    val notificationType: String

    companion object Factory : TestClientPrefixedModelFactory<FooFooUsersWatchUserResponseRecentNotificationsElement> {
        @JvmStatic
        override fun new(): FooFooUsersWatchUserResponseRecentNotificationsElement {
            return FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooUsersWatchUserResponseRecentNotificationsElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooUsersWatchUserResponseRecentNotificationsElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooUsersWatchUserResponseRecentNotificationsElement.")
                return new()
            }
            return when (__input.jsonObject["notificationType"]) {
                is JsonPrimitive -> when (__input.jsonObject["notificationType"]!!.jsonPrimitive.contentOrNull) {
                    "POST_LIKE" -> FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike.fromJsonElement(__input, instancePath)
"POST_COMMENT" -> FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike(
    val postId: String,
    val userId: String,
) : FooFooUsersWatchUserResponseRecentNotificationsElement {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike> {
        @JvmStatic
        override fun new(): FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike {
            return FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike(
                postId = "",
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike.")
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
            return FooFooFooUsersWatchUserResponseRecentNotificationsElementPostLike(
                postId,
                userId,
            )
        }
    }
}



data class FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment(
    val postId: String,
    val userId: String,
    val commentText: String,
) : FooFooUsersWatchUserResponseRecentNotificationsElement {
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment> {
        @JvmStatic
        override fun new(): FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment {
            return FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment(
                postId = "",
                userId = "",
                commentText = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment.")
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
            return FooFooFooUsersWatchUserResponseRecentNotificationsElementPostComment(
                postId,
                userId,
                commentText,
            )
        }
    }
}



data class FooFooUsersWatchUserResponseBookmarksValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooFooUsersWatchUserResponseBookmarksValue> {
        @JvmStatic
        override fun new(): FooFooUsersWatchUserResponseBookmarksValue {
            return FooFooUsersWatchUserResponseBookmarksValue(
                postId = "",
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooFooUsersWatchUserResponseBookmarksValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooFooUsersWatchUserResponseBookmarksValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooFooUsersWatchUserResponseBookmarksValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooFooUsersWatchUserResponseBookmarksValue.")
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
            return FooFooUsersWatchUserResponseBookmarksValue(
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
    headers: TestClientPrefixedHeadersFn,
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