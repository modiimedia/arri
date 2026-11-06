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
    val nested: TestClientPrefixedNestedService = TestClientPrefixedNestedService(
        httpClient = httpClient,
        baseUrl = baseUrl,
        headers = headers,
        onError = onError,
    )

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

    suspend fun sendObjectWithKebabCaseKeys(params: FooObjectWithKebabCaseKeys): FooObjectWithKebabCaseKeys {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-kebab-case-keys",
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
                return FooObjectWithKebabCaseKeys.fromJson(response.bodyAsText())
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

    suspend fun sendRecursiveUnionAdjacent(params: FooRecursiveUnionAdjacent): FooRecursiveUnionAdjacent {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-adjacent",
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
                return FooRecursiveUnionAdjacent.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnionExternal(params: FooRecursiveUnionExternal): FooRecursiveUnionExternal {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-external",
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
                return FooRecursiveUnionExternal.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnionInternal(params: FooRecursiveUnionInternal): FooRecursiveUnionInternal {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-internal",
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
                return FooRecursiveUnionInternal.fromJson(response.bodyAsText())
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
            method = HttpMethod.Post,
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
            method = HttpMethod.Post,
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
     * Sends 5 messages quickly then starts sending messages slowly (1s) after that.
     * When heartbeat is enabled the client should keep the connection alive regardless of the slowdown of messages.
     * When heartbeat is disabled the client should open a new connection sometime after receiving the 5th message.
     */
    suspend fun streamHeartbeatDetectionTest(
        params: FooStreamHeartbeatDetectionTestParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024 * 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onRequestError: ((error: Exception) -> Unit) = {},
        onResponseError: ((error: TestClientPrefixedError) -> Unit) = {},
        onData: ((data: FooStreamHeartbeatDetectionTestResponse) -> Unit) = {},
        maxBackoffTime: Long? = null,
    ): Unit {
        __handleSseRequest(
            httpClient = httpClient,
            url = "$baseUrl/rpcs/tests/stream-heartbeat-detection-test",
            method = HttpMethod.Post,
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
                val data = FooStreamHeartbeatDetectionTestResponse.fromJson(str)
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
            method = HttpMethod.Post,
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
            method = HttpMethod.Post,
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
            method = HttpMethod.Post,
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
            method = HttpMethod.Post,
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

class TestClientPrefixedNestedService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __TestClientPrefixedHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    suspend fun emptyParamsGetRequest(): FooDefaultPayload {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/nested/empty-params-get-request",
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
                url = "$baseUrl/rpcs/tests/nested/empty-params-post-request",
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
                url = "$baseUrl/rpcs/tests/nested/empty-response-get-request",
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
                url = "$baseUrl/rpcs/tests/nested/empty-response-post-request",
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
        queryParts.add("hello=${__encodeQueryValue(hello)}")
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
        queryParts.add("message=${__encodeQueryValue(message)}")
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
        queryParts.add("deprecatedField=${__encodeQueryValue(deprecatedField)}")
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
                __logError("[WARNING] FooDiscriminatorWithEmptyObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooDiscriminatorWithEmptyObject.")
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
            return FooDiscriminatorWithEmptyObjectEmpty()
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
            return FooDiscriminatorWithEmptyObjectEmpty()
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
        queryParts.add("foo=${__encodeQueryValue(foo)}")
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
        queryParts.add("message=${__encodeQueryValue(message)}")
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
    val unionExternal: FooObjectWithEveryTypeUnionExternal,
    val unionInternal: FooObjectWithEveryTypeUnionInternal,
    val unionAdjacent: FooObjectWithEveryTypeUnionAdjacent,
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
        output += ",\"unionExternal\":"
        output += unionExternal.toJson()
        output += ",\"unionInternal\":"
        output += unionInternal.toJson()
        output += ",\"unionAdjacent\":"
        output += unionAdjacent.toJson()
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
        queryParts.add("string=${__encodeQueryValue(string)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("enumerator=${__encodeQueryValue(enumerator.serialValue)}")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionExternal.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionInternal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionAdjacent.")
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
                unionExternal = FooObjectWithEveryTypeUnionExternal.new(),
                unionInternal = FooObjectWithEveryTypeUnionInternal.new(),
                unionAdjacent = FooObjectWithEveryTypeUnionAdjacent.new(),
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
            val unionExternal: FooObjectWithEveryTypeUnionExternal = when (__input.jsonObject["unionExternal"]) {
                is JsonObject -> FooObjectWithEveryTypeUnionExternal.fromJsonElement(
                    __input.jsonObject["unionExternal"]!!,
                    "$instancePath/unionExternal",
                )

                else -> FooObjectWithEveryTypeUnionExternal.new()
            }
            val unionInternal: FooObjectWithEveryTypeUnionInternal = when (__input.jsonObject["unionInternal"]) {
                is JsonObject -> FooObjectWithEveryTypeUnionInternal.fromJsonElement(
                    __input.jsonObject["unionInternal"]!!,
                    "$instancePath/unionInternal",
                )

                else -> FooObjectWithEveryTypeUnionInternal.new()
            }
            val unionAdjacent: FooObjectWithEveryTypeUnionAdjacent = when (__input.jsonObject["unionAdjacent"]) {
                is JsonObject -> FooObjectWithEveryTypeUnionAdjacent.fromJsonElement(
                    __input.jsonObject["unionAdjacent"]!!,
                    "$instancePath/unionAdjacent",
                )

                else -> FooObjectWithEveryTypeUnionAdjacent.new()
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
                unionExternal,
                unionInternal,
                unionAdjacent,
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
        queryParts.add("string=${__encodeQueryValue(string)}")
        queryParts.add("boolean=$boolean")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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

sealed interface FooObjectWithEveryTypeUnionExternal : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionExternal> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionExternal {
            return FooObjectWithEveryTypeUnionExternalObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionExternal.")
                return new()
            }
            return when {
                "object" in __input -> FooObjectWithEveryTypeUnionExternalObject.fromJsonElement(__input, instancePath)
                "array" in __input -> FooObjectWithEveryTypeUnionExternalArray.fromJsonElement(__input, instancePath)
                "boolean" in __input -> FooObjectWithEveryTypeUnionExternalBoolean.fromJsonElement(__input, instancePath)
                "nullable-timestamp" in __input -> FooObjectWithEveryTypeUnionExternalNullableTimestamp.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryTypeUnionExternalObject(
    val value: FooObjectWithEveryTypeUnionExternalObjectValue,
) : FooObjectWithEveryTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"object\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionExternalObject.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionExternalObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionExternalObject {
            return FooObjectWithEveryTypeUnionExternalObject(
                value = FooObjectWithEveryTypeUnionExternalObjectValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionExternalObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionExternalObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionExternalObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionExternalObject.")
                return new()
            }
            val value: FooObjectWithEveryTypeUnionExternalObjectValue = when (__input.jsonObject["object"]) {
                is JsonObject -> FooObjectWithEveryTypeUnionExternalObjectValue.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> FooObjectWithEveryTypeUnionExternalObjectValue.new()
            }
            return FooObjectWithEveryTypeUnionExternalObject(
                value,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionExternalArray(
    val value: MutableList<String>,
) : FooObjectWithEveryTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"array\":"
        output += "["
        for ((__index, __element) in value.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += buildString { printQuoted(__element) }
        }
        output += "]"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionExternalArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionExternalArray> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionExternalArray {
            return FooObjectWithEveryTypeUnionExternalArray(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionExternalArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionExternalArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionExternalArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionExternalArray.")
                return new()
            }
            val value: MutableList<String> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryTypeUnionExternalArray(
                value,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionExternalBoolean(
    val value: Boolean,
) : FooObjectWithEveryTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"boolean\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionExternalBoolean.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionExternalBoolean> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionExternalBoolean {
            return FooObjectWithEveryTypeUnionExternalBoolean(
                value = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionExternalBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionExternalBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionExternalBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionExternalBoolean.")
                return new()
            }
            val value: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooObjectWithEveryTypeUnionExternalBoolean(
                value,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionExternalNullableTimestamp(
    val value: Instant?,
) : FooObjectWithEveryTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"nullable-timestamp\":"
        output += when (value) {
            is Instant -> "\"${timestampFormatter.format(value)}\""
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionExternalNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionExternalNullableTimestamp> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionExternalNullableTimestamp {
            return FooObjectWithEveryTypeUnionExternalNullableTimestamp(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionExternalNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionExternalNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionExternalNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionExternalNullableTimestamp.")
                return new()
            }
            val value: Instant? = when (__input.jsonObject["nullable-timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            return FooObjectWithEveryTypeUnionExternalNullableTimestamp(
                value,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionExternalObjectValue(
    val id: String,
    val content: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("content=${__encodeQueryValue(content)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionExternalObjectValue> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionExternalObjectValue {
            return FooObjectWithEveryTypeUnionExternalObjectValue(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionExternalObjectValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionExternalObjectValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionExternalObjectValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionExternalObjectValue.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryTypeUnionExternalObjectValue(
                id,
                content,
            )
        }
    }
}

sealed interface FooObjectWithEveryTypeUnionInternal : TestClientPrefixedModel {
    val shape: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionInternal> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionInternal {
            return FooObjectWithEveryTypeUnionInternalRectangle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "rectangle" -> FooObjectWithEveryTypeUnionInternalRectangle.fromJsonElement(__input, instancePath)
                    "circle" -> FooObjectWithEveryTypeUnionInternalCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryTypeUnionInternalRectangle(
    val width: Double,
    val height: Double,
) : FooObjectWithEveryTypeUnionInternal {
    override val shape get() = "rectangle"

    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":\"rectangle\""
        output += ",\"width\":"
        output += width
        output += ",\"height\":"
        output += height
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("shape=rectangle")
        queryParts.add("width=$width")
        queryParts.add("height=$height")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionInternalRectangle> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionInternalRectangle {
            return FooObjectWithEveryTypeUnionInternalRectangle(
                width = 0.0,
                height = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionInternalRectangle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionInternalRectangle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionInternalRectangle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionInternalRectangle.")
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
            return FooObjectWithEveryTypeUnionInternalRectangle(
                width,
                height,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionInternalCircle(
    val radius: Double,
) : FooObjectWithEveryTypeUnionInternal {
    override val shape get() = "circle"

    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":\"circle\""
        output += ",\"radius\":"
        output += radius
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("shape=circle")
        queryParts.add("radius=$radius")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionInternalCircle> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionInternalCircle {
            return FooObjectWithEveryTypeUnionInternalCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionInternalCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionInternalCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionInternalCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionInternalCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooObjectWithEveryTypeUnionInternalCircle(
                radius,
            )
        }
    }
}

sealed interface FooObjectWithEveryTypeUnionAdjacent : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionAdjacent> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionAdjacent {
            return FooObjectWithEveryTypeUnionAdjacentObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "object" -> FooObjectWithEveryTypeUnionAdjacentObject.fromJsonElement(__input, instancePath)
                    "array" -> FooObjectWithEveryTypeUnionAdjacentArray.fromJsonElement(__input, instancePath)
                    "boolean" -> FooObjectWithEveryTypeUnionAdjacentBoolean.fromJsonElement(__input, instancePath)
                    "nullable-timestamp" -> FooObjectWithEveryTypeUnionAdjacentNullableTimestamp.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryTypeUnionAdjacentObject(
    val data: FooObjectWithEveryTypeUnionAdjacentObjectData,
) : FooObjectWithEveryTypeUnionAdjacent {
    override val kind get() = "object"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"object\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionAdjacentObject.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionAdjacentObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionAdjacentObject {
            return FooObjectWithEveryTypeUnionAdjacentObject(
                data = FooObjectWithEveryTypeUnionAdjacentObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionAdjacentObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionAdjacentObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionAdjacentObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionAdjacentObject.")
                return new()
            }
            val data: FooObjectWithEveryTypeUnionAdjacentObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryTypeUnionAdjacentObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryTypeUnionAdjacentObjectData.new()
            }
            return FooObjectWithEveryTypeUnionAdjacentObject(
                data,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionAdjacentArray(
    val data: MutableList<String>,
) : FooObjectWithEveryTypeUnionAdjacent {
    override val kind get() = "array"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"array\""
        output += ",\"data\":"
        output += "["
        for ((__index, __element) in data.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += buildString { printQuoted(__element) }
        }
        output += "]"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionAdjacentArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionAdjacentArray> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionAdjacentArray {
            return FooObjectWithEveryTypeUnionAdjacentArray(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionAdjacentArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionAdjacentArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionAdjacentArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionAdjacentArray.")
                return new()
            }
            val data: MutableList<String> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryTypeUnionAdjacentArray(
                data,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionAdjacentBoolean(
    val data: Boolean,
) : FooObjectWithEveryTypeUnionAdjacent {
    override val kind get() = "boolean"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"boolean\""
        output += ",\"data\":"
        output += data
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionAdjacentBoolean.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionAdjacentBoolean> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionAdjacentBoolean {
            return FooObjectWithEveryTypeUnionAdjacentBoolean(
                data = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionAdjacentBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionAdjacentBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionAdjacentBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionAdjacentBoolean.")
                return new()
            }
            val data: Boolean = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooObjectWithEveryTypeUnionAdjacentBoolean(
                data,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionAdjacentNullableTimestamp(
    val data: Instant?,
) : FooObjectWithEveryTypeUnionAdjacent {
    override val kind get() = "nullable-timestamp"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"nullable-timestamp\""
        output += ",\"data\":"
        output += when (data) {
            is Instant -> "\"${timestampFormatter.format(data)}\""
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryTypeUnionAdjacentNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionAdjacentNullableTimestamp> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionAdjacentNullableTimestamp {
            return FooObjectWithEveryTypeUnionAdjacentNullableTimestamp(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionAdjacentNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionAdjacentNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionAdjacentNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionAdjacentNullableTimestamp.")
                return new()
            }
            val data: Instant? = when (__input.jsonObject["data"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["data"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            return FooObjectWithEveryTypeUnionAdjacentNullableTimestamp(
                data,
            )
        }
    }
}

data class FooObjectWithEveryTypeUnionAdjacentObjectData(
    val id: String,
    val content: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("content=${__encodeQueryValue(content)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryTypeUnionAdjacentObjectData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryTypeUnionAdjacentObjectData {
            return FooObjectWithEveryTypeUnionAdjacentObjectData(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryTypeUnionAdjacentObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryTypeUnionAdjacentObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryTypeUnionAdjacentObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryTypeUnionAdjacentObjectData.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryTypeUnionAdjacentObjectData(
                id,
                content,
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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

data class FooObjectWithKebabCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val lastEvent: FooObjectWithKebabCaseKeysLastEvent?,
    val emailAddress: String? = null,
    val isAdmin: Boolean? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"created-at\":"
        output += "\"${timestampFormatter.format(createdAt)}\""
        output += ",\"display-name\":"
        output += buildString { printQuoted(displayName) }
        output += ",\"phone-number\":"
        output += when (phoneNumber) {
            is String -> buildString { printQuoted(phoneNumber) }
            else -> "null"
        }
        output += ",\"last-event\":"
        output += lastEvent?.toJson()
        if (emailAddress != null) {
            output += ",\"email-address\":"
            output += buildString { printQuoted(emailAddress) }
        }
        if (isAdmin != null) {
            output += ",\"is-admin\":"
            output += isAdmin
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("created-at=${__encodeQueryValue(timestampFormatter.format(createdAt))}")
        queryParts.add("display-name=${__encodeQueryValue(displayName)}")
        queryParts.add("phone-number=${__encodeQueryValue(phoneNumber)}")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/last-event.")
        if (emailAddress != null) {
            queryParts.add("email-address=${__encodeQueryValue(emailAddress)}")
        }
        if (isAdmin != null) {
            queryParts.add("is-admin=$isAdmin")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeys> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeys {
            return FooObjectWithKebabCaseKeys(
                createdAt = Instant.now(),
                displayName = "",
                phoneNumber = null,
                lastEvent = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeys {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeys {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeys.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeys.")
                return new()
            }
            val createdAt: Instant = when (__input.jsonObject["created-at"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["created-at"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["created-at"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
            val displayName: String = when (__input.jsonObject["display-name"]) {
                is JsonPrimitive -> __input.jsonObject["display-name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val phoneNumber: String? = when (__input.jsonObject["phone-number"]) {
                is JsonPrimitive -> __input.jsonObject["phone-number"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val lastEvent: FooObjectWithKebabCaseKeysLastEvent? = when (__input.jsonObject["last-event"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysLastEvent.fromJsonElement(
                    __input.jsonObject["last-event"]!!,
                    "$instancePath/last-event",
                )

                else -> null
            }
            val emailAddress: String? = when (__input.jsonObject["email-address"]) {
                is JsonPrimitive -> __input.jsonObject["email-address"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val isAdmin: Boolean? = when (__input.jsonObject["is-admin"]) {
                is JsonPrimitive -> __input.jsonObject["is-admin"]!!.jsonPrimitive.booleanOrNull
                else -> null
            }
            return FooObjectWithKebabCaseKeys(
                createdAt,
                displayName,
                phoneNumber,
                lastEvent,
                emailAddress,
                isAdmin,
            )
        }
    }
}

sealed interface FooObjectWithKebabCaseKeysLastEvent : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEvent> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEvent {
            return FooObjectWithKebabCaseKeysLastEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEvent.")
                return new()
            }
            return when {
                "user-created" in __input -> FooObjectWithKebabCaseKeysLastEventUserCreated.fromJsonElement(__input, instancePath)
                "user-updated" in __input -> FooObjectWithKebabCaseKeysLastEventUserUpdated.fromJsonElement(__input, instancePath)
                "user-deleted" in __input -> FooObjectWithKebabCaseKeysLastEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithKebabCaseKeysLastEventUserCreated(
    val value: FooObjectWithKebabCaseKeysLastEventUserCreatedValue,
) : FooObjectWithKebabCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-created\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysLastEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEventUserCreated {
            return FooObjectWithKebabCaseKeysLastEventUserCreated(
                value = FooObjectWithKebabCaseKeysLastEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEventUserCreated.")
                return new()
            }
            val value: FooObjectWithKebabCaseKeysLastEventUserCreatedValue = when (__input.jsonObject["user-created"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysLastEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["user-created"]!!,
                    "$instancePath/user-created",
                )

                else -> FooObjectWithKebabCaseKeysLastEventUserCreatedValue.new()
            }
            return FooObjectWithKebabCaseKeysLastEventUserCreated(
                value,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysLastEventUserUpdated(
    val value: FooObjectWithKebabCaseKeysLastEventUserUpdatedValue,
) : FooObjectWithKebabCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-updated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysLastEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEventUserUpdated {
            return FooObjectWithKebabCaseKeysLastEventUserUpdated(
                value = FooObjectWithKebabCaseKeysLastEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEventUserUpdated.")
                return new()
            }
            val value: FooObjectWithKebabCaseKeysLastEventUserUpdatedValue = when (__input.jsonObject["user-updated"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysLastEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["user-updated"]!!,
                    "$instancePath/user-updated",
                )

                else -> FooObjectWithKebabCaseKeysLastEventUserUpdatedValue.new()
            }
            return FooObjectWithKebabCaseKeysLastEventUserUpdated(
                value,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysLastEventUserDeleted(
    val value: FooObjectWithKebabCaseKeysLastEventUserDeletedValue,
) : FooObjectWithKebabCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-deleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysLastEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEventUserDeleted> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEventUserDeleted {
            return FooObjectWithKebabCaseKeysLastEventUserDeleted(
                value = FooObjectWithKebabCaseKeysLastEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEventUserDeleted.")
                return new()
            }
            val value: FooObjectWithKebabCaseKeysLastEventUserDeletedValue = when (__input.jsonObject["user-deleted"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysLastEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["user-deleted"]!!,
                    "$instancePath/user-deleted",
                )

                else -> FooObjectWithKebabCaseKeysLastEventUserDeletedValue.new()
            }
            return FooObjectWithKebabCaseKeysLastEventUserDeleted(
                value,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysLastEventUserCreatedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("user-id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEventUserCreatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEventUserCreatedValue {
            return FooObjectWithKebabCaseKeysLastEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysLastEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysLastEventUserUpdatedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("user-id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEventUserUpdatedValue {
            return FooObjectWithKebabCaseKeysLastEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysLastEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysLastEventUserDeletedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("user-id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysLastEventUserDeletedValue> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysLastEventUserDeletedValue {
            return FooObjectWithKebabCaseKeysLastEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysLastEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysLastEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysLastEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysLastEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysLastEventUserDeletedValue(
                userId,
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
    val unionExternal: FooObjectWithEveryNullableTypeUnionExternal?,
    val unionInternal: FooObjectWithEveryNullableTypeUnionInternal?,
    val unionAdjacent: FooObjectWithEveryNullableTypeUnionAdjacent?,
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
        output += ",\"unionExternal\":"
        output += unionExternal?.toJson()
        output += ",\"unionInternal\":"
        output += unionInternal?.toJson()
        output += ",\"unionAdjacent\":"
        output += unionAdjacent?.toJson()
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
        queryParts.add("string=${__encodeQueryValue(string)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestamp?.let { timestampFormatter.format(it) })}")
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
        queryParts.add("enumerator=${__encodeQueryValue(enumerator?.serialValue)}")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/object.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/record.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionExternal.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionInternal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionAdjacent.")
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
                unionExternal = null,
                unionInternal = null,
                unionAdjacent = null,
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
            val unionExternal: FooObjectWithEveryNullableTypeUnionExternal? = when (__input.jsonObject["unionExternal"]) {
                is JsonObject -> FooObjectWithEveryNullableTypeUnionExternal.fromJsonElement(
                    __input.jsonObject["unionExternal"]!!,
                    "$instancePath/unionExternal",
                )

                else -> null
            }
            val unionInternal: FooObjectWithEveryNullableTypeUnionInternal? = when (__input.jsonObject["unionInternal"]) {
                is JsonObject -> FooObjectWithEveryNullableTypeUnionInternal.fromJsonElement(
                    __input.jsonObject["unionInternal"]!!,
                    "$instancePath/unionInternal",
                )

                else -> null
            }
            val unionAdjacent: FooObjectWithEveryNullableTypeUnionAdjacent? = when (__input.jsonObject["unionAdjacent"]) {
                is JsonObject -> FooObjectWithEveryNullableTypeUnionAdjacent.fromJsonElement(
                    __input.jsonObject["unionAdjacent"]!!,
                    "$instancePath/unionAdjacent",
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
                unionExternal,
                unionInternal,
                unionAdjacent,
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
        queryParts.add("string=${__encodeQueryValue(string)}")
        queryParts.add("boolean=$boolean")
        queryParts.add("timestamp=${__encodeQueryValue(timestamp?.let { timestampFormatter.format(it) })}")
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

sealed interface FooObjectWithEveryNullableTypeUnionExternal : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionExternal> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionExternal {
            return FooObjectWithEveryNullableTypeUnionExternalObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionExternal.")
                return new()
            }
            return when {
                "object" in __input -> FooObjectWithEveryNullableTypeUnionExternalObject.fromJsonElement(__input, instancePath)
                "array" in __input -> FooObjectWithEveryNullableTypeUnionExternalArray.fromJsonElement(__input, instancePath)
                "boolean" in __input -> FooObjectWithEveryNullableTypeUnionExternalBoolean.fromJsonElement(__input, instancePath)
                "nullable-timestamp" in __input -> FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionExternalObject(
    val value: FooObjectWithEveryNullableTypeUnionExternalObjectValue,
) : FooObjectWithEveryNullableTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"object\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionExternalObject.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionExternalObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionExternalObject {
            return FooObjectWithEveryNullableTypeUnionExternalObject(
                value = FooObjectWithEveryNullableTypeUnionExternalObjectValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionExternalObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionExternalObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionExternalObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionExternalObject.")
                return new()
            }
            val value: FooObjectWithEveryNullableTypeUnionExternalObjectValue = when (__input.jsonObject["object"]) {
                is JsonObject -> FooObjectWithEveryNullableTypeUnionExternalObjectValue.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> FooObjectWithEveryNullableTypeUnionExternalObjectValue.new()
            }
            return FooObjectWithEveryNullableTypeUnionExternalObject(
                value,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionExternalArray(
    val value: MutableList<String>,
) : FooObjectWithEveryNullableTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"array\":"
        output += "["
        for ((__index, __element) in value.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += buildString { printQuoted(__element) }
        }
        output += "]"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionExternalArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionExternalArray> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionExternalArray {
            return FooObjectWithEveryNullableTypeUnionExternalArray(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionExternalArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionExternalArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionExternalArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionExternalArray.")
                return new()
            }
            val value: MutableList<String> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryNullableTypeUnionExternalArray(
                value,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionExternalBoolean(
    val value: Boolean,
) : FooObjectWithEveryNullableTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"boolean\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionExternalBoolean.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionExternalBoolean> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionExternalBoolean {
            return FooObjectWithEveryNullableTypeUnionExternalBoolean(
                value = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionExternalBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionExternalBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionExternalBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionExternalBoolean.")
                return new()
            }
            val value: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooObjectWithEveryNullableTypeUnionExternalBoolean(
                value,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp(
    val value: Instant?,
) : FooObjectWithEveryNullableTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"nullable-timestamp\":"
        output += when (value) {
            is Instant -> "\"${timestampFormatter.format(value)}\""
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp {
            return FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp.")
                return new()
            }
            val value: Instant? = when (__input.jsonObject["nullable-timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            return FooObjectWithEveryNullableTypeUnionExternalNullableTimestamp(
                value,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionExternalObjectValue(
    val id: String,
    val content: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("content=${__encodeQueryValue(content)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionExternalObjectValue> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionExternalObjectValue {
            return FooObjectWithEveryNullableTypeUnionExternalObjectValue(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionExternalObjectValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionExternalObjectValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionExternalObjectValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionExternalObjectValue.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryNullableTypeUnionExternalObjectValue(
                id,
                content,
            )
        }
    }
}

sealed interface FooObjectWithEveryNullableTypeUnionInternal : TestClientPrefixedModel {
    val shape: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionInternal> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionInternal {
            return FooObjectWithEveryNullableTypeUnionInternalRectangle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "rectangle" -> FooObjectWithEveryNullableTypeUnionInternalRectangle.fromJsonElement(__input, instancePath)
                    "circle" -> FooObjectWithEveryNullableTypeUnionInternalCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionInternalRectangle(
    val width: Double,
    val height: Double,
) : FooObjectWithEveryNullableTypeUnionInternal {
    override val shape get() = "rectangle"

    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":\"rectangle\""
        output += ",\"width\":"
        output += width
        output += ",\"height\":"
        output += height
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("shape=rectangle")
        queryParts.add("width=$width")
        queryParts.add("height=$height")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionInternalRectangle> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionInternalRectangle {
            return FooObjectWithEveryNullableTypeUnionInternalRectangle(
                width = 0.0,
                height = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionInternalRectangle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionInternalRectangle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionInternalRectangle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionInternalRectangle.")
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
            return FooObjectWithEveryNullableTypeUnionInternalRectangle(
                width,
                height,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionInternalCircle(
    val radius: Double,
) : FooObjectWithEveryNullableTypeUnionInternal {
    override val shape get() = "circle"

    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":\"circle\""
        output += ",\"radius\":"
        output += radius
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("shape=circle")
        queryParts.add("radius=$radius")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionInternalCircle> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionInternalCircle {
            return FooObjectWithEveryNullableTypeUnionInternalCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionInternalCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionInternalCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionInternalCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionInternalCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooObjectWithEveryNullableTypeUnionInternalCircle(
                radius,
            )
        }
    }
}

sealed interface FooObjectWithEveryNullableTypeUnionAdjacent : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionAdjacent> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionAdjacent {
            return FooObjectWithEveryNullableTypeUnionAdjacentObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "object" -> FooObjectWithEveryNullableTypeUnionAdjacentObject.fromJsonElement(__input, instancePath)
                    "array" -> FooObjectWithEveryNullableTypeUnionAdjacentArray.fromJsonElement(__input, instancePath)
                    "boolean" -> FooObjectWithEveryNullableTypeUnionAdjacentBoolean.fromJsonElement(__input, instancePath)
                    "nullable-timestamp" -> FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionAdjacentObject(
    val data: FooObjectWithEveryNullableTypeUnionAdjacentObjectData,
) : FooObjectWithEveryNullableTypeUnionAdjacent {
    override val kind get() = "object"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"object\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionAdjacentObject.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionAdjacentObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionAdjacentObject {
            return FooObjectWithEveryNullableTypeUnionAdjacentObject(
                data = FooObjectWithEveryNullableTypeUnionAdjacentObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionAdjacentObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionAdjacentObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionAdjacentObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionAdjacentObject.")
                return new()
            }
            val data: FooObjectWithEveryNullableTypeUnionAdjacentObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryNullableTypeUnionAdjacentObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryNullableTypeUnionAdjacentObjectData.new()
            }
            return FooObjectWithEveryNullableTypeUnionAdjacentObject(
                data,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionAdjacentArray(
    val data: MutableList<String>,
) : FooObjectWithEveryNullableTypeUnionAdjacent {
    override val kind get() = "array"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"array\""
        output += ",\"data\":"
        output += "["
        for ((__index, __element) in data.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += buildString { printQuoted(__element) }
        }
        output += "]"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionAdjacentArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionAdjacentArray> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionAdjacentArray {
            return FooObjectWithEveryNullableTypeUnionAdjacentArray(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionAdjacentArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionAdjacentArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionAdjacentArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionAdjacentArray.")
                return new()
            }
            val data: MutableList<String> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryNullableTypeUnionAdjacentArray(
                data,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionAdjacentBoolean(
    val data: Boolean,
) : FooObjectWithEveryNullableTypeUnionAdjacent {
    override val kind get() = "boolean"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"boolean\""
        output += ",\"data\":"
        output += data
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionAdjacentBoolean.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionAdjacentBoolean> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionAdjacentBoolean {
            return FooObjectWithEveryNullableTypeUnionAdjacentBoolean(
                data = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionAdjacentBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionAdjacentBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionAdjacentBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionAdjacentBoolean.")
                return new()
            }
            val data: Boolean = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooObjectWithEveryNullableTypeUnionAdjacentBoolean(
                data,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp(
    val data: Instant?,
) : FooObjectWithEveryNullableTypeUnionAdjacent {
    override val kind get() = "nullable-timestamp"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"nullable-timestamp\""
        output += ",\"data\":"
        output += when (data) {
            is Instant -> "\"${timestampFormatter.format(data)}\""
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp {
            return FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.")
                return new()
            }
            val data: Instant? = when (__input.jsonObject["data"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["data"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            return FooObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp(
                data,
            )
        }
    }
}

data class FooObjectWithEveryNullableTypeUnionAdjacentObjectData(
    val id: String,
    val content: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("content=${__encodeQueryValue(content)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryNullableTypeUnionAdjacentObjectData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryNullableTypeUnionAdjacentObjectData {
            return FooObjectWithEveryNullableTypeUnionAdjacentObjectData(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryNullableTypeUnionAdjacentObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryNullableTypeUnionAdjacentObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryNullableTypeUnionAdjacentObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryNullableTypeUnionAdjacentObjectData.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryNullableTypeUnionAdjacentObjectData(
                id,
                content,
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestamp?.let { timestampFormatter.format(it) })}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestamp?.let { timestampFormatter.format(it) })}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestamp?.let { timestampFormatter.format(it) })}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestamp?.let { timestampFormatter.format(it) })}")
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
    val lastEvent: FooObjectWithPascalCaseKeysLastEvent?,
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
        output += ",\"LastEvent\":"
        output += lastEvent?.toJson()
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
        queryParts.add("CreatedAt=${__encodeQueryValue(timestampFormatter.format(createdAt))}")
        queryParts.add("DisplayName=${__encodeQueryValue(displayName)}")
        queryParts.add("PhoneNumber=${__encodeQueryValue(phoneNumber)}")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/LastEvent.")
        if (emailAddress != null) {
            queryParts.add("EmailAddress=${__encodeQueryValue(emailAddress)}")
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
                lastEvent = null,
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
            val lastEvent: FooObjectWithPascalCaseKeysLastEvent? = when (__input.jsonObject["LastEvent"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysLastEvent.fromJsonElement(
                    __input.jsonObject["LastEvent"]!!,
                    "$instancePath/LastEvent",
                )

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
                lastEvent,
                emailAddress,
                isAdmin,
            )
        }
    }
}

sealed interface FooObjectWithPascalCaseKeysLastEvent : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEvent> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEvent {
            return FooObjectWithPascalCaseKeysLastEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEvent.")
                return new()
            }
            return when {
                "UserCreated" in __input -> FooObjectWithPascalCaseKeysLastEventUserCreated.fromJsonElement(__input, instancePath)
                "UserUpdated" in __input -> FooObjectWithPascalCaseKeysLastEventUserUpdated.fromJsonElement(__input, instancePath)
                "UserDeleted" in __input -> FooObjectWithPascalCaseKeysLastEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithPascalCaseKeysLastEventUserCreated(
    val value: FooObjectWithPascalCaseKeysLastEventUserCreatedValue,
) : FooObjectWithPascalCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserCreated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysLastEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEventUserCreated {
            return FooObjectWithPascalCaseKeysLastEventUserCreated(
                value = FooObjectWithPascalCaseKeysLastEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEventUserCreated.")
                return new()
            }
            val value: FooObjectWithPascalCaseKeysLastEventUserCreatedValue = when (__input.jsonObject["UserCreated"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysLastEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["UserCreated"]!!,
                    "$instancePath/UserCreated",
                )

                else -> FooObjectWithPascalCaseKeysLastEventUserCreatedValue.new()
            }
            return FooObjectWithPascalCaseKeysLastEventUserCreated(
                value,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysLastEventUserUpdated(
    val value: FooObjectWithPascalCaseKeysLastEventUserUpdatedValue,
) : FooObjectWithPascalCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserUpdated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysLastEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEventUserUpdated {
            return FooObjectWithPascalCaseKeysLastEventUserUpdated(
                value = FooObjectWithPascalCaseKeysLastEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEventUserUpdated.")
                return new()
            }
            val value: FooObjectWithPascalCaseKeysLastEventUserUpdatedValue = when (__input.jsonObject["UserUpdated"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysLastEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["UserUpdated"]!!,
                    "$instancePath/UserUpdated",
                )

                else -> FooObjectWithPascalCaseKeysLastEventUserUpdatedValue.new()
            }
            return FooObjectWithPascalCaseKeysLastEventUserUpdated(
                value,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysLastEventUserDeleted(
    val value: FooObjectWithPascalCaseKeysLastEventUserDeletedValue,
) : FooObjectWithPascalCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserDeleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysLastEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEventUserDeleted> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEventUserDeleted {
            return FooObjectWithPascalCaseKeysLastEventUserDeleted(
                value = FooObjectWithPascalCaseKeysLastEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEventUserDeleted.")
                return new()
            }
            val value: FooObjectWithPascalCaseKeysLastEventUserDeletedValue = when (__input.jsonObject["UserDeleted"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysLastEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["UserDeleted"]!!,
                    "$instancePath/UserDeleted",
                )

                else -> FooObjectWithPascalCaseKeysLastEventUserDeletedValue.new()
            }
            return FooObjectWithPascalCaseKeysLastEventUserDeleted(
                value,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysLastEventUserCreatedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserId\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("UserId=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEventUserCreatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEventUserCreatedValue {
            return FooObjectWithPascalCaseKeysLastEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysLastEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysLastEventUserUpdatedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserId\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("UserId=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEventUserUpdatedValue {
            return FooObjectWithPascalCaseKeysLastEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysLastEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysLastEventUserDeletedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserId\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("UserId=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysLastEventUserDeletedValue> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysLastEventUserDeletedValue {
            return FooObjectWithPascalCaseKeysLastEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysLastEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysLastEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysLastEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysLastEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysLastEventUserDeletedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val lastEvent: FooObjectWithSnakeCaseKeysLastEvent?,
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
        output += ",\"last_event\":"
        output += lastEvent?.toJson()
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
        queryParts.add("created_at=${__encodeQueryValue(timestampFormatter.format(createdAt))}")
        queryParts.add("display_name=${__encodeQueryValue(displayName)}")
        queryParts.add("phone_number=${__encodeQueryValue(phoneNumber)}")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/last_event.")
        if (emailAddress != null) {
            queryParts.add("email_address=${__encodeQueryValue(emailAddress)}")
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
                lastEvent = null,
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
            val lastEvent: FooObjectWithSnakeCaseKeysLastEvent? = when (__input.jsonObject["last_event"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysLastEvent.fromJsonElement(
                    __input.jsonObject["last_event"]!!,
                    "$instancePath/last_event",
                )

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
                lastEvent,
                emailAddress,
                isAdmin,
            )
        }
    }
}

sealed interface FooObjectWithSnakeCaseKeysLastEvent : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEvent> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEvent {
            return FooObjectWithSnakeCaseKeysLastEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEvent.")
                return new()
            }
            return when {
                "user_created" in __input -> FooObjectWithSnakeCaseKeysLastEventUserCreated.fromJsonElement(__input, instancePath)
                "user_updated" in __input -> FooObjectWithSnakeCaseKeysLastEventUserUpdated.fromJsonElement(__input, instancePath)
                "user_deleted" in __input -> FooObjectWithSnakeCaseKeysLastEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithSnakeCaseKeysLastEventUserCreated(
    val value: FooObjectWithSnakeCaseKeysLastEventUserCreatedValue,
) : FooObjectWithSnakeCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_created\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysLastEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEventUserCreated {
            return FooObjectWithSnakeCaseKeysLastEventUserCreated(
                value = FooObjectWithSnakeCaseKeysLastEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEventUserCreated.")
                return new()
            }
            val value: FooObjectWithSnakeCaseKeysLastEventUserCreatedValue = when (__input.jsonObject["user_created"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysLastEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["user_created"]!!,
                    "$instancePath/user_created",
                )

                else -> FooObjectWithSnakeCaseKeysLastEventUserCreatedValue.new()
            }
            return FooObjectWithSnakeCaseKeysLastEventUserCreated(
                value,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysLastEventUserUpdated(
    val value: FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue,
) : FooObjectWithSnakeCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_updated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysLastEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEventUserUpdated {
            return FooObjectWithSnakeCaseKeysLastEventUserUpdated(
                value = FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEventUserUpdated.")
                return new()
            }
            val value: FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue = when (__input.jsonObject["user_updated"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["user_updated"]!!,
                    "$instancePath/user_updated",
                )

                else -> FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue.new()
            }
            return FooObjectWithSnakeCaseKeysLastEventUserUpdated(
                value,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysLastEventUserDeleted(
    val value: FooObjectWithSnakeCaseKeysLastEventUserDeletedValue,
) : FooObjectWithSnakeCaseKeysLastEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_deleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysLastEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEventUserDeleted> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEventUserDeleted {
            return FooObjectWithSnakeCaseKeysLastEventUserDeleted(
                value = FooObjectWithSnakeCaseKeysLastEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEventUserDeleted.")
                return new()
            }
            val value: FooObjectWithSnakeCaseKeysLastEventUserDeletedValue = when (__input.jsonObject["user_deleted"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysLastEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["user_deleted"]!!,
                    "$instancePath/user_deleted",
                )

                else -> FooObjectWithSnakeCaseKeysLastEventUserDeletedValue.new()
            }
            return FooObjectWithSnakeCaseKeysLastEventUserDeleted(
                value,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysLastEventUserCreatedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("user_id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEventUserCreatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEventUserCreatedValue {
            return FooObjectWithSnakeCaseKeysLastEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysLastEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("user_id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue {
            return FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysLastEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysLastEventUserDeletedValue(
    val userId: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("user_id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysLastEventUserDeletedValue> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysLastEventUserDeletedValue {
            return FooObjectWithSnakeCaseKeysLastEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysLastEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysLastEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysLastEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysLastEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysLastEventUserDeletedValue(
                userId,
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
    val unionExternal: FooObjectWithEveryOptionalTypeUnionExternal? = null,
    val unionInternal: FooObjectWithEveryOptionalTypeUnionInternal? = null,
    val unionAdjacent: FooObjectWithEveryOptionalTypeUnionAdjacent? = null,
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
        if (unionExternal != null) {
            if (hasProperties) output += ","
            output += "\"unionExternal\":"
            output += unionExternal.toJson()
            hasProperties = true
        }
        if (unionInternal != null) {
            if (hasProperties) output += ","
            output += "\"unionInternal\":"
            output += unionInternal.toJson()
            hasProperties = true
        }
        if (unionAdjacent != null) {
            if (hasProperties) output += ","
            output += "\"unionAdjacent\":"
            output += unionAdjacent.toJson()
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
            queryParts.add("string=${__encodeQueryValue(string)}")
        }
        if (timestamp != null) {
            queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
            queryParts.add("enumerator=${__encodeQueryValue(enumerator.serialValue)}")
        }
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/object.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/record.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionExternal.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionInternal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionAdjacent.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedObject.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedArray.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalType> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalType {
            return FooObjectWithEveryOptionalType()
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
            val unionExternal: FooObjectWithEveryOptionalTypeUnionExternal? = when (__input.jsonObject["unionExternal"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeUnionExternal.fromJsonElement(
                    __input.jsonObject["unionExternal"]!!,
                    "$instancePath/unionExternal",
                )

                else -> null
            }
            val unionInternal: FooObjectWithEveryOptionalTypeUnionInternal? = when (__input.jsonObject["unionInternal"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeUnionInternal.fromJsonElement(
                    __input.jsonObject["unionInternal"]!!,
                    "$instancePath/unionInternal",
                )

                else -> null
            }
            val unionAdjacent: FooObjectWithEveryOptionalTypeUnionAdjacent? = when (__input.jsonObject["unionAdjacent"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeUnionAdjacent.fromJsonElement(
                    __input.jsonObject["unionAdjacent"]!!,
                    "$instancePath/unionAdjacent",
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
                unionExternal,
                unionInternal,
                unionAdjacent,
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
        queryParts.add("string=${__encodeQueryValue(string)}")
        queryParts.add("boolean=$boolean")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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

sealed interface FooObjectWithEveryOptionalTypeUnionExternal : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionExternal> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionExternal {
            return FooObjectWithEveryOptionalTypeUnionExternalObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionExternal.")
                return new()
            }
            return when {
                "object" in __input -> FooObjectWithEveryOptionalTypeUnionExternalObject.fromJsonElement(__input, instancePath)
                "array" in __input -> FooObjectWithEveryOptionalTypeUnionExternalArray.fromJsonElement(__input, instancePath)
                "boolean" in __input -> FooObjectWithEveryOptionalTypeUnionExternalBoolean.fromJsonElement(__input, instancePath)
                "nullable-timestamp" in __input -> FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionExternalObject(
    val value: FooObjectWithEveryOptionalTypeUnionExternalObjectValue,
) : FooObjectWithEveryOptionalTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"object\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionExternalObject.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionExternalObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionExternalObject {
            return FooObjectWithEveryOptionalTypeUnionExternalObject(
                value = FooObjectWithEveryOptionalTypeUnionExternalObjectValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionExternalObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionExternalObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionExternalObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionExternalObject.")
                return new()
            }
            val value: FooObjectWithEveryOptionalTypeUnionExternalObjectValue = when (__input.jsonObject["object"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeUnionExternalObjectValue.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> FooObjectWithEveryOptionalTypeUnionExternalObjectValue.new()
            }
            return FooObjectWithEveryOptionalTypeUnionExternalObject(
                value,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionExternalArray(
    val value: MutableList<String>,
) : FooObjectWithEveryOptionalTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"array\":"
        output += "["
        for ((__index, __element) in value.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += buildString { printQuoted(__element) }
        }
        output += "]"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionExternalArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionExternalArray> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionExternalArray {
            return FooObjectWithEveryOptionalTypeUnionExternalArray(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionExternalArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionExternalArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionExternalArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionExternalArray.")
                return new()
            }
            val value: MutableList<String> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryOptionalTypeUnionExternalArray(
                value,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionExternalBoolean(
    val value: Boolean,
) : FooObjectWithEveryOptionalTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"boolean\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionExternalBoolean.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionExternalBoolean> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionExternalBoolean {
            return FooObjectWithEveryOptionalTypeUnionExternalBoolean(
                value = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionExternalBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionExternalBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionExternalBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionExternalBoolean.")
                return new()
            }
            val value: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooObjectWithEveryOptionalTypeUnionExternalBoolean(
                value,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp(
    val value: Instant?,
) : FooObjectWithEveryOptionalTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"nullable-timestamp\":"
        output += when (value) {
            is Instant -> "\"${timestampFormatter.format(value)}\""
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp {
            return FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.")
                return new()
            }
            val value: Instant? = when (__input.jsonObject["nullable-timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            return FooObjectWithEveryOptionalTypeUnionExternalNullableTimestamp(
                value,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionExternalObjectValue(
    val id: String,
    val content: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("content=${__encodeQueryValue(content)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionExternalObjectValue> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionExternalObjectValue {
            return FooObjectWithEveryOptionalTypeUnionExternalObjectValue(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionExternalObjectValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionExternalObjectValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionExternalObjectValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionExternalObjectValue.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryOptionalTypeUnionExternalObjectValue(
                id,
                content,
            )
        }
    }
}

sealed interface FooObjectWithEveryOptionalTypeUnionInternal : TestClientPrefixedModel {
    val shape: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionInternal> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionInternal {
            return FooObjectWithEveryOptionalTypeUnionInternalRectangle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "rectangle" -> FooObjectWithEveryOptionalTypeUnionInternalRectangle.fromJsonElement(__input, instancePath)
                    "circle" -> FooObjectWithEveryOptionalTypeUnionInternalCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionInternalRectangle(
    val width: Double,
    val height: Double,
) : FooObjectWithEveryOptionalTypeUnionInternal {
    override val shape get() = "rectangle"

    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":\"rectangle\""
        output += ",\"width\":"
        output += width
        output += ",\"height\":"
        output += height
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("shape=rectangle")
        queryParts.add("width=$width")
        queryParts.add("height=$height")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionInternalRectangle> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionInternalRectangle {
            return FooObjectWithEveryOptionalTypeUnionInternalRectangle(
                width = 0.0,
                height = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionInternalRectangle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionInternalRectangle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionInternalRectangle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionInternalRectangle.")
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
            return FooObjectWithEveryOptionalTypeUnionInternalRectangle(
                width,
                height,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionInternalCircle(
    val radius: Double,
) : FooObjectWithEveryOptionalTypeUnionInternal {
    override val shape get() = "circle"

    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":\"circle\""
        output += ",\"radius\":"
        output += radius
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("shape=circle")
        queryParts.add("radius=$radius")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionInternalCircle> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionInternalCircle {
            return FooObjectWithEveryOptionalTypeUnionInternalCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionInternalCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionInternalCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionInternalCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionInternalCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooObjectWithEveryOptionalTypeUnionInternalCircle(
                radius,
            )
        }
    }
}

sealed interface FooObjectWithEveryOptionalTypeUnionAdjacent : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionAdjacent> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionAdjacent {
            return FooObjectWithEveryOptionalTypeUnionAdjacentObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "object" -> FooObjectWithEveryOptionalTypeUnionAdjacentObject.fromJsonElement(__input, instancePath)
                    "array" -> FooObjectWithEveryOptionalTypeUnionAdjacentArray.fromJsonElement(__input, instancePath)
                    "boolean" -> FooObjectWithEveryOptionalTypeUnionAdjacentBoolean.fromJsonElement(__input, instancePath)
                    "nullable-timestamp" -> FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionAdjacentObject(
    val data: FooObjectWithEveryOptionalTypeUnionAdjacentObjectData,
) : FooObjectWithEveryOptionalTypeUnionAdjacent {
    override val kind get() = "object"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"object\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionAdjacentObject.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionAdjacentObject> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionAdjacentObject {
            return FooObjectWithEveryOptionalTypeUnionAdjacentObject(
                data = FooObjectWithEveryOptionalTypeUnionAdjacentObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionAdjacentObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionAdjacentObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionAdjacentObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionAdjacentObject.")
                return new()
            }
            val data: FooObjectWithEveryOptionalTypeUnionAdjacentObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooObjectWithEveryOptionalTypeUnionAdjacentObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooObjectWithEveryOptionalTypeUnionAdjacentObjectData.new()
            }
            return FooObjectWithEveryOptionalTypeUnionAdjacentObject(
                data,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionAdjacentArray(
    val data: MutableList<String>,
) : FooObjectWithEveryOptionalTypeUnionAdjacent {
    override val kind get() = "array"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"array\""
        output += ",\"data\":"
        output += "["
        for ((__index, __element) in data.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += buildString { printQuoted(__element) }
        }
        output += "]"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionAdjacentArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionAdjacentArray> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionAdjacentArray {
            return FooObjectWithEveryOptionalTypeUnionAdjacentArray(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionAdjacentArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionAdjacentArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionAdjacentArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionAdjacentArray.")
                return new()
            }
            val data: MutableList<String> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooObjectWithEveryOptionalTypeUnionAdjacentArray(
                data,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionAdjacentBoolean(
    val data: Boolean,
) : FooObjectWithEveryOptionalTypeUnionAdjacent {
    override val kind get() = "boolean"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"boolean\""
        output += ",\"data\":"
        output += data
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionAdjacentBoolean.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionAdjacentBoolean> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionAdjacentBoolean {
            return FooObjectWithEveryOptionalTypeUnionAdjacentBoolean(
                data = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionAdjacentBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionAdjacentBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionAdjacentBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionAdjacentBoolean.")
                return new()
            }
            val data: Boolean = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooObjectWithEveryOptionalTypeUnionAdjacentBoolean(
                data,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp(
    val data: Instant?,
) : FooObjectWithEveryOptionalTypeUnionAdjacent {
    override val kind get() = "nullable-timestamp"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"nullable-timestamp\""
        output += ",\"data\":"
        output += when (data) {
            is Instant -> "\"${timestampFormatter.format(data)}\""
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp {
            return FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.")
                return new()
            }
            val data: Instant? = when (__input.jsonObject["data"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["data"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            return FooObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp(
                data,
            )
        }
    }
}

data class FooObjectWithEveryOptionalTypeUnionAdjacentObjectData(
    val id: String,
    val content: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("content=${__encodeQueryValue(content)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithEveryOptionalTypeUnionAdjacentObjectData> {
        @JvmStatic
        override fun new(): FooObjectWithEveryOptionalTypeUnionAdjacentObjectData {
            return FooObjectWithEveryOptionalTypeUnionAdjacentObjectData(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithEveryOptionalTypeUnionAdjacentObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithEveryOptionalTypeUnionAdjacentObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithEveryOptionalTypeUnionAdjacentObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithEveryOptionalTypeUnionAdjacentObjectData.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithEveryOptionalTypeUnionAdjacentObjectData(
                id,
                content,
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
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
        queryParts.add("value=${__encodeQueryValue(value)}")
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

sealed interface FooRecursiveUnionAdjacent : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionAdjacent> {
        @JvmStatic
        override fun new(): FooRecursiveUnionAdjacent {
            return FooRecursiveUnionAdjacentChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "child" -> FooRecursiveUnionAdjacentChild.fromJsonElement(__input, instancePath)
                    "children" -> FooRecursiveUnionAdjacentChildren.fromJsonElement(__input, instancePath)
                    "text" -> FooRecursiveUnionAdjacentText.fromJsonElement(__input, instancePath)
                    "shape" -> FooRecursiveUnionAdjacentShape.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooRecursiveUnionAdjacentChild(
    val data: FooRecursiveUnionAdjacent,
) : FooRecursiveUnionAdjacent {
    override val kind get() = "child"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"child\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionAdjacentChild.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionAdjacentChild> {
        @JvmStatic
        override fun new(): FooRecursiveUnionAdjacentChild {
            return FooRecursiveUnionAdjacentChild(
                data = FooRecursiveUnionAdjacent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionAdjacentChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionAdjacentChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionAdjacentChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionAdjacentChild.")
                return new()
            }
            val data: FooRecursiveUnionAdjacent = when (__input.jsonObject["data"]) {
                is JsonObject -> FooRecursiveUnionAdjacent.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooRecursiveUnionAdjacent.new()
            }
            return FooRecursiveUnionAdjacentChild(
                data,
            )
        }
    }
}

data class FooRecursiveUnionAdjacentChildren(
    val data: MutableList<FooRecursiveUnionAdjacent>,
) : FooRecursiveUnionAdjacent {
    override val kind get() = "children"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"children\""
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionAdjacentChildren.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionAdjacentChildren> {
        @JvmStatic
        override fun new(): FooRecursiveUnionAdjacentChildren {
            return FooRecursiveUnionAdjacentChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionAdjacentChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionAdjacentChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionAdjacentChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionAdjacentChildren.")
                return new()
            }
            val data: MutableList<FooRecursiveUnionAdjacent> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<FooRecursiveUnionAdjacent> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> FooRecursiveUnionAdjacent.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> FooRecursiveUnionAdjacent.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooRecursiveUnionAdjacentChildren(
                data,
            )
        }
    }
}

data class FooRecursiveUnionAdjacentText(
    val data: String,
) : FooRecursiveUnionAdjacent {
    override val kind get() = "text"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"text\""
        output += ",\"data\":"
        output += buildString { printQuoted(data) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionAdjacentText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionAdjacentText> {
        @JvmStatic
        override fun new(): FooRecursiveUnionAdjacentText {
            return FooRecursiveUnionAdjacentText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionAdjacentText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionAdjacentText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionAdjacentText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionAdjacentText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooRecursiveUnionAdjacentText(
                data,
            )
        }
    }
}

data class FooRecursiveUnionAdjacentShape(
    val data: FooRecursiveUnionAdjacentShapeData,
) : FooRecursiveUnionAdjacent {
    override val kind get() = "shape"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"shape\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionAdjacentShape.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionAdjacentShape> {
        @JvmStatic
        override fun new(): FooRecursiveUnionAdjacentShape {
            return FooRecursiveUnionAdjacentShape(
                data = FooRecursiveUnionAdjacentShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionAdjacentShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionAdjacentShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionAdjacentShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionAdjacentShape.")
                return new()
            }
            val data: FooRecursiveUnionAdjacentShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooRecursiveUnionAdjacentShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooRecursiveUnionAdjacentShapeData.new()
            }
            return FooRecursiveUnionAdjacentShape(
                data,
            )
        }
    }
}

/**
 * Shape node
 */
data class FooRecursiveUnionAdjacentShapeData(
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
        queryParts.add("color=${__encodeQueryValue(color)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionAdjacentShapeData> {
        @JvmStatic
        override fun new(): FooRecursiveUnionAdjacentShapeData {
            return FooRecursiveUnionAdjacentShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionAdjacentShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionAdjacentShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionAdjacentShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionAdjacentShapeData.")
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
            return FooRecursiveUnionAdjacentShapeData(
                width,
                height,
                color,
            )
        }
    }
}

sealed interface FooRecursiveUnionExternal : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionExternal> {
        @JvmStatic
        override fun new(): FooRecursiveUnionExternal {
            return FooRecursiveUnionExternalChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionExternal.")
                return new()
            }
            return when {
                "child" in __input -> FooRecursiveUnionExternalChild.fromJsonElement(__input, instancePath)
                "children" in __input -> FooRecursiveUnionExternalChildren.fromJsonElement(__input, instancePath)
                "text" in __input -> FooRecursiveUnionExternalText.fromJsonElement(__input, instancePath)
                "shape" in __input -> FooRecursiveUnionExternalShape.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooRecursiveUnionExternalChild(
    val value: FooRecursiveUnionExternal,
) : FooRecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"child\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionExternalChild.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionExternalChild> {
        @JvmStatic
        override fun new(): FooRecursiveUnionExternalChild {
            return FooRecursiveUnionExternalChild(
                value = FooRecursiveUnionExternal.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionExternalChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionExternalChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionExternalChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionExternalChild.")
                return new()
            }
            val value: FooRecursiveUnionExternal = when (__input.jsonObject["child"]) {
                is JsonObject -> FooRecursiveUnionExternal.fromJsonElement(
                    __input.jsonObject["child"]!!,
                    "$instancePath/child",
                )

                else -> FooRecursiveUnionExternal.new()
            }
            return FooRecursiveUnionExternalChild(
                value,
            )
        }
    }
}

data class FooRecursiveUnionExternalChildren(
    val value: MutableList<FooRecursiveUnionExternal>,
) : FooRecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"children\":"
        output += "["
        for ((__index, __element) in value.withIndex()) {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionExternalChildren.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionExternalChildren> {
        @JvmStatic
        override fun new(): FooRecursiveUnionExternalChildren {
            return FooRecursiveUnionExternalChildren(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionExternalChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionExternalChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionExternalChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionExternalChildren.")
                return new()
            }
            val value: MutableList<FooRecursiveUnionExternal> = when (__input.jsonObject["children"]) {
                is JsonArray -> {
                    val __value: MutableList<FooRecursiveUnionExternal> = mutableListOf()
                    for (__element in __input.jsonObject["children"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> FooRecursiveUnionExternal.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> FooRecursiveUnionExternal.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooRecursiveUnionExternalChildren(
                value,
            )
        }
    }
}

data class FooRecursiveUnionExternalText(
    val value: String,
) : FooRecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionExternalText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionExternalText> {
        @JvmStatic
        override fun new(): FooRecursiveUnionExternalText {
            return FooRecursiveUnionExternalText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionExternalText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionExternalText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionExternalText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionExternalText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooRecursiveUnionExternalText(
                value,
            )
        }
    }
}

data class FooRecursiveUnionExternalShape(
    val value: FooRecursiveUnionExternalShapeValue,
) : FooRecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooRecursiveUnionExternalShape.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionExternalShape> {
        @JvmStatic
        override fun new(): FooRecursiveUnionExternalShape {
            return FooRecursiveUnionExternalShape(
                value = FooRecursiveUnionExternalShapeValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionExternalShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionExternalShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionExternalShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionExternalShape.")
                return new()
            }
            val value: FooRecursiveUnionExternalShapeValue = when (__input.jsonObject["shape"]) {
                is JsonObject -> FooRecursiveUnionExternalShapeValue.fromJsonElement(
                    __input.jsonObject["shape"]!!,
                    "$instancePath/shape",
                )

                else -> FooRecursiveUnionExternalShapeValue.new()
            }
            return FooRecursiveUnionExternalShape(
                value,
            )
        }
    }
}

/**
 * Shape node
 */
data class FooRecursiveUnionExternalShapeValue(
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
        queryParts.add("color=${__encodeQueryValue(color)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionExternalShapeValue> {
        @JvmStatic
        override fun new(): FooRecursiveUnionExternalShapeValue {
            return FooRecursiveUnionExternalShapeValue(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionExternalShapeValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionExternalShapeValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionExternalShapeValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionExternalShapeValue.")
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
            return FooRecursiveUnionExternalShapeValue(
                width,
                height,
                color,
            )
        }
    }
}

sealed interface FooRecursiveUnionInternal : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionInternal> {
        @JvmStatic
        override fun new(): FooRecursiveUnionInternal {
            return FooRecursiveUnionInternalChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "child" -> FooRecursiveUnionInternalChild.fromJsonElement(__input, instancePath)
                    "children" -> FooRecursiveUnionInternalChildren.fromJsonElement(__input, instancePath)
                    "text" -> FooRecursiveUnionInternalText.fromJsonElement(__input, instancePath)
                    "shape" -> FooRecursiveUnionInternalShape.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooRecursiveUnionInternalChild(
    val data: FooRecursiveUnionInternal,
) : FooRecursiveUnionInternal {
    override val kind get() = "child"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"child\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=child")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionInternalChild/data.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionInternalChild> {
        @JvmStatic
        override fun new(): FooRecursiveUnionInternalChild {
            return FooRecursiveUnionInternalChild(
                data = FooRecursiveUnionInternal.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionInternalChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionInternalChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionInternalChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionInternalChild.")
                return new()
            }
            val data: FooRecursiveUnionInternal = when (__input.jsonObject["data"]) {
                is JsonObject -> FooRecursiveUnionInternal.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooRecursiveUnionInternal.new()
            }
            return FooRecursiveUnionInternalChild(
                data,
            )
        }
    }
}

data class FooRecursiveUnionInternalChildren(
    /**
     * an array of child nodes
     */
    val data: MutableList<FooRecursiveUnionInternal>,
) : FooRecursiveUnionInternal {
    override val kind get() = "children"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"children\""
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
        queryParts.add("kind=children")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /RecursiveUnionInternalChildren/data.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionInternalChildren> {
        @JvmStatic
        override fun new(): FooRecursiveUnionInternalChildren {
            return FooRecursiveUnionInternalChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionInternalChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionInternalChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionInternalChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionInternalChildren.")
                return new()
            }
            val data: MutableList<FooRecursiveUnionInternal> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<FooRecursiveUnionInternal> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> FooRecursiveUnionInternal.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> FooRecursiveUnionInternal.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return FooRecursiveUnionInternalChildren(
                data,
            )
        }
    }
}

data class FooRecursiveUnionInternalText(
    /**
     * Text node
     */
    val data: String,
) : FooRecursiveUnionInternal {
    override val kind get() = "text"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"text\""
        output += ",\"data\":"
        output += buildString { printQuoted(data) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=text")
        queryParts.add("data=${__encodeQueryValue(data)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionInternalText> {
        @JvmStatic
        override fun new(): FooRecursiveUnionInternalText {
            return FooRecursiveUnionInternalText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionInternalText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionInternalText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionInternalText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionInternalText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooRecursiveUnionInternalText(
                data,
            )
        }
    }
}

data class FooRecursiveUnionInternalShape(
    /**
     * Shape node
     */
    val data: FooRecursiveUnionInternalShapeData,
) : FooRecursiveUnionInternal {
    override val kind get() = "shape"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"shape\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=shape")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionInternalShape/data.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionInternalShape> {
        @JvmStatic
        override fun new(): FooRecursiveUnionInternalShape {
            return FooRecursiveUnionInternalShape(
                data = FooRecursiveUnionInternalShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionInternalShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionInternalShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionInternalShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionInternalShape.")
                return new()
            }
            val data: FooRecursiveUnionInternalShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooRecursiveUnionInternalShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooRecursiveUnionInternalShapeData.new()
            }
            return FooRecursiveUnionInternalShape(
                data,
            )
        }
    }
}

/**
 * Shape node
 */
data class FooRecursiveUnionInternalShapeData(
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
        queryParts.add("color=${__encodeQueryValue(color)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooRecursiveUnionInternalShapeData> {
        @JvmStatic
        override fun new(): FooRecursiveUnionInternalShapeData {
            return FooRecursiveUnionInternalShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooRecursiveUnionInternalShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooRecursiveUnionInternalShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooRecursiveUnionInternalShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooRecursiveUnionInternalShapeData.")
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
            return FooRecursiveUnionInternalShapeData(
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
        queryParts.add("message=${__encodeQueryValue(message)}")
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
        queryParts.add("statusMessage=${__encodeQueryValue(statusMessage)}")
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
        queryParts.add("message=${__encodeQueryValue(message)}")
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

data class FooStreamHeartbeatDetectionTestParams(
    val heartbeatEnabled: Boolean,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"heartbeatEnabled\":"
        output += heartbeatEnabled
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("heartbeatEnabled=$heartbeatEnabled")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooStreamHeartbeatDetectionTestParams> {
        @JvmStatic
        override fun new(): FooStreamHeartbeatDetectionTestParams {
            return FooStreamHeartbeatDetectionTestParams(
                heartbeatEnabled = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooStreamHeartbeatDetectionTestParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooStreamHeartbeatDetectionTestParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooStreamHeartbeatDetectionTestParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooStreamHeartbeatDetectionTestParams.")
                return new()
            }
            val heartbeatEnabled: Boolean = when (__input.jsonObject["heartbeatEnabled"]) {
                is JsonPrimitive -> __input.jsonObject["heartbeatEnabled"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return FooStreamHeartbeatDetectionTestParams(
                heartbeatEnabled,
            )
        }
    }
}

data class FooStreamHeartbeatDetectionTestResponse(
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
        queryParts.add("message=${__encodeQueryValue(message)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooStreamHeartbeatDetectionTestResponse> {
        @JvmStatic
        override fun new(): FooStreamHeartbeatDetectionTestResponse {
            return FooStreamHeartbeatDetectionTestResponse(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooStreamHeartbeatDetectionTestResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooStreamHeartbeatDetectionTestResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooStreamHeartbeatDetectionTestResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooStreamHeartbeatDetectionTestResponse.")
                return new()
            }
            val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooStreamHeartbeatDetectionTestResponse(
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("name=${__encodeQueryValue(name)}")
        queryParts.add("email=${__encodeQueryValue(email)}")
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
        queryParts.add("channelId=${__encodeQueryValue(channelId)}")
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
                __logError("[WARNING] FooChatMessage.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooChatMessage.")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("channelId=${__encodeQueryValue(channelId)}")
        queryParts.add("userId=${__encodeQueryValue(userId)}")
        queryParts.add("date=${__encodeQueryValue(timestampFormatter.format(date))}")
        queryParts.add("text=${__encodeQueryValue(text)}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("channelId=${__encodeQueryValue(channelId)}")
        queryParts.add("userId=${__encodeQueryValue(userId)}")
        queryParts.add("date=${__encodeQueryValue(timestampFormatter.format(date))}")
        queryParts.add("image=${__encodeQueryValue(image)}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("channelId=${__encodeQueryValue(channelId)}")
        queryParts.add("userId=${__encodeQueryValue(userId)}")
        queryParts.add("date=${__encodeQueryValue(timestampFormatter.format(date))}")
        queryParts.add("url=${__encodeQueryValue(url)}")
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
        queryParts.add("message=${__encodeQueryValue(message)}")
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
        queryParts.add("userId=${__encodeQueryValue(userId)}")
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
        queryParts.add("id=${__encodeQueryValue(id)}")
        queryParts.add("role=${__encodeQueryValue(role.serialValue)}")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/photo.")
        queryParts.add("createdAt=${__encodeQueryValue(timestampFormatter.format(createdAt))}")
        queryParts.add("numFollowers=$numFollowers")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/settings.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/recentNotifications.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/bookmarks.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/metadata.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/randomList.")
        if (bio != null) {
            queryParts.add("bio=${__encodeQueryValue(bio)}")
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
        queryParts.add("url=${__encodeQueryValue(url)}")
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
        queryParts.add("preferredTheme=${__encodeQueryValue(preferredTheme.serialValue)}")
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
                __logError("[WARNING] FooUsersWatchUserResponseRecentNotificationsElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUsersWatchUserResponseRecentNotificationsElement.")
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
        queryParts.add("postId=${__encodeQueryValue(postId)}")
        queryParts.add("userId=${__encodeQueryValue(userId)}")
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
        queryParts.add("postId=${__encodeQueryValue(postId)}")
        queryParts.add("userId=${__encodeQueryValue(userId)}")
        queryParts.add("commentText=${__encodeQueryValue(commentText)}")
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
        queryParts.add("postId=${__encodeQueryValue(postId)}")
        queryParts.add("userId=${__encodeQueryValue(userId)}")
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

/**
 * URL encodes a query param value. Null values are serialized as "null".
 */
private fun __encodeQueryValue(value: String?): String {
    return value?.encodeURLParameter(spaceToPlus = true) ?: "null"
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