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

    /**
     * GET requests send params through url query params. Only internally tagged unions can be represented this way.
     */
    suspend fun sendUnionInternalGetRequest(params: FooUnionInternalGetRequest): FooUnionInternalGetRequest {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-union-internal-get-request",
                method = HttpMethod.Get,
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
                return FooUnionInternalGetRequest.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    /**
     * Union variants with no fields, only optional fields, a mix of required, optional, and nullable fields, and nested fields.
     */
    suspend fun sendUnionVariantShapes(params: FooUnionVariantShapes): FooUnionVariantShapes {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-union-variant-shapes",
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
                return FooUnionVariantShapes.fromJson(response.bodyAsText())
            }
            throw TestClientPrefixedError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    /**
     * Union variants of every value type, nested unions, and names that are reserved words in many languages.
     */
    suspend fun sendUnionVariantTypes(params: FooUnionVariantTypes): FooUnionVariantTypes {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-union-variant-types",
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
                return FooUnionVariantTypes.fromJson(response.bodyAsText())
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
    val externalEvent: FooObjectWithKebabCaseKeysExternalEvent?,
    val internalEvent: FooObjectWithKebabCaseKeysInternalEvent,
    val adjacentEvent: FooObjectWithKebabCaseKeysAdjacentEvent,
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
        output += ",\"external-event\":"
        output += externalEvent?.toJson()
        output += ",\"internal-event\":"
        output += internalEvent.toJson()
        output += ",\"adjacent-event\":"
        output += adjacentEvent.toJson()
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/external-event.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/internal-event.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/adjacent-event.")
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
                externalEvent = null,
                internalEvent = FooObjectWithKebabCaseKeysInternalEvent.new(),
                adjacentEvent = FooObjectWithKebabCaseKeysAdjacentEvent.new(),
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
                        try {
                            Instant.parse(__input.jsonObject["created-at"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
            val externalEvent: FooObjectWithKebabCaseKeysExternalEvent? = when (__input.jsonObject["external-event"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysExternalEvent.fromJsonElement(
                    __input.jsonObject["external-event"]!!,
                    "$instancePath/external-event",
                )

                else -> null
            }
            val internalEvent: FooObjectWithKebabCaseKeysInternalEvent = when (__input.jsonObject["internal-event"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysInternalEvent.fromJsonElement(
                    __input.jsonObject["internal-event"]!!,
                    "$instancePath/internal-event",
                )

                else -> FooObjectWithKebabCaseKeysInternalEvent.new()
            }
            val adjacentEvent: FooObjectWithKebabCaseKeysAdjacentEvent = when (__input.jsonObject["adjacent-event"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysAdjacentEvent.fromJsonElement(
                    __input.jsonObject["adjacent-event"]!!,
                    "$instancePath/adjacent-event",
                )

                else -> FooObjectWithKebabCaseKeysAdjacentEvent.new()
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
                externalEvent,
                internalEvent,
                adjacentEvent,
                emailAddress,
                isAdmin,
            )
        }
    }
}

sealed interface FooObjectWithKebabCaseKeysExternalEvent : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEvent> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEvent {
            return FooObjectWithKebabCaseKeysExternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEvent.")
                return new()
            }
            return when {
                "user-created" in __input -> FooObjectWithKebabCaseKeysExternalEventUserCreated.fromJsonElement(__input, instancePath)
                "user-updated" in __input -> FooObjectWithKebabCaseKeysExternalEventUserUpdated.fromJsonElement(__input, instancePath)
                "user-deleted" in __input -> FooObjectWithKebabCaseKeysExternalEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithKebabCaseKeysExternalEventUserCreated(
    val value: FooObjectWithKebabCaseKeysExternalEventUserCreatedValue,
) : FooObjectWithKebabCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-created\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysExternalEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEventUserCreated {
            return FooObjectWithKebabCaseKeysExternalEventUserCreated(
                value = FooObjectWithKebabCaseKeysExternalEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEventUserCreated.")
                return new()
            }
            val value: FooObjectWithKebabCaseKeysExternalEventUserCreatedValue = when (__input.jsonObject["user-created"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysExternalEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["user-created"]!!,
                    "$instancePath/user-created",
                )

                else -> FooObjectWithKebabCaseKeysExternalEventUserCreatedValue.new()
            }
            return FooObjectWithKebabCaseKeysExternalEventUserCreated(
                value,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysExternalEventUserUpdated(
    val value: FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue,
) : FooObjectWithKebabCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-updated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysExternalEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEventUserUpdated {
            return FooObjectWithKebabCaseKeysExternalEventUserUpdated(
                value = FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEventUserUpdated.")
                return new()
            }
            val value: FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue = when (__input.jsonObject["user-updated"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["user-updated"]!!,
                    "$instancePath/user-updated",
                )

                else -> FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue.new()
            }
            return FooObjectWithKebabCaseKeysExternalEventUserUpdated(
                value,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysExternalEventUserDeleted(
    val value: FooObjectWithKebabCaseKeysExternalEventUserDeletedValue,
) : FooObjectWithKebabCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-deleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysExternalEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEventUserDeleted> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEventUserDeleted {
            return FooObjectWithKebabCaseKeysExternalEventUserDeleted(
                value = FooObjectWithKebabCaseKeysExternalEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEventUserDeleted.")
                return new()
            }
            val value: FooObjectWithKebabCaseKeysExternalEventUserDeletedValue = when (__input.jsonObject["user-deleted"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysExternalEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["user-deleted"]!!,
                    "$instancePath/user-deleted",
                )

                else -> FooObjectWithKebabCaseKeysExternalEventUserDeletedValue.new()
            }
            return FooObjectWithKebabCaseKeysExternalEventUserDeleted(
                value,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysExternalEventUserCreatedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEventUserCreatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEventUserCreatedValue {
            return FooObjectWithKebabCaseKeysExternalEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysExternalEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
            return FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysExternalEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysExternalEventUserDeletedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysExternalEventUserDeletedValue> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysExternalEventUserDeletedValue {
            return FooObjectWithKebabCaseKeysExternalEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysExternalEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysExternalEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysExternalEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysExternalEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysExternalEventUserDeletedValue(
                userId,
            )
        }
    }
}

sealed interface FooObjectWithKebabCaseKeysInternalEvent : TestClientPrefixedModel {
    val eventType: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysInternalEvent> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysInternalEvent {
            return FooObjectWithKebabCaseKeysInternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysInternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysInternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysInternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysInternalEvent.")
                return new()
            }
            return when (__input.jsonObject["event-type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event-type"]!!.jsonPrimitive.contentOrNull) {
                    "user-created" -> FooObjectWithKebabCaseKeysInternalEventUserCreated.fromJsonElement(__input, instancePath)
                    "user-updated" -> FooObjectWithKebabCaseKeysInternalEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithKebabCaseKeysInternalEventUserCreated(
    val userId: String,
) : FooObjectWithKebabCaseKeysInternalEvent {
    override val eventType get() = "user-created"

    override fun toJson(): String {
        var output = "{"
        output += "\"event-type\":\"user-created\""
        output += ",\"user-id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("event-type=user-created")
        queryParts.add("user-id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysInternalEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysInternalEventUserCreated {
            return FooObjectWithKebabCaseKeysInternalEventUserCreated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysInternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysInternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysInternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysInternalEventUserCreated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysInternalEventUserCreated(
                userId,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysInternalEventUserUpdated(
    val userId: String,
    val updatedAt: Instant? = null,
) : FooObjectWithKebabCaseKeysInternalEvent {
    override val eventType get() = "user-updated"

    override fun toJson(): String {
        var output = "{"
        output += "\"event-type\":\"user-updated\""
        output += ",\"user-id\":"
        output += buildString { printQuoted(userId) }
        if (updatedAt != null) {
            output += ",\"updated-at\":"
            output += "\"${timestampFormatter.format(updatedAt)}\""
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("event-type=user-updated")
        queryParts.add("user-id=${__encodeQueryValue(userId)}")
        if (updatedAt != null) {
            queryParts.add("updated-at=${__encodeQueryValue(timestampFormatter.format(updatedAt))}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysInternalEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysInternalEventUserUpdated {
            return FooObjectWithKebabCaseKeysInternalEventUserUpdated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysInternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysInternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysInternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysInternalEventUserUpdated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val updatedAt: Instant? = when (__input.jsonObject["updated-at"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["updated-at"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["updated-at"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
                    else
                        null

                else -> null
            }
            return FooObjectWithKebabCaseKeysInternalEventUserUpdated(
                userId,
                updatedAt,
            )
        }
    }
}

sealed interface FooObjectWithKebabCaseKeysAdjacentEvent : TestClientPrefixedModel {
    val eventType: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysAdjacentEvent> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysAdjacentEvent {
            return FooObjectWithKebabCaseKeysAdjacentEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysAdjacentEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysAdjacentEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysAdjacentEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysAdjacentEvent.")
                return new()
            }
            return when (__input.jsonObject["event-type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event-type"]!!.jsonPrimitive.contentOrNull) {
                    "user-created" -> FooObjectWithKebabCaseKeysAdjacentEventUserCreated.fromJsonElement(__input, instancePath)
                    "user-updated" -> FooObjectWithKebabCaseKeysAdjacentEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithKebabCaseKeysAdjacentEventUserCreated(
    val eventData: FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData,
) : FooObjectWithKebabCaseKeysAdjacentEvent {
    override val eventType get() = "user-created"

    override fun toJson(): String {
        var output = "{"
        output += "\"event-type\":\"user-created\""
        output += ",\"event-data\":"
        output += eventData.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysAdjacentEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysAdjacentEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysAdjacentEventUserCreated {
            return FooObjectWithKebabCaseKeysAdjacentEventUserCreated(
                eventData = FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysAdjacentEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysAdjacentEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysAdjacentEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysAdjacentEventUserCreated.")
                return new()
            }
            val eventData: FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData = when (__input.jsonObject["event-data"]) {
                is JsonObject -> FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement(
                    __input.jsonObject["event-data"]!!,
                    "$instancePath/event-data",
                )

                else -> FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.new()
            }
            return FooObjectWithKebabCaseKeysAdjacentEventUserCreated(
                eventData,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysAdjacentEventUserUpdated(
    val eventData: String,
) : FooObjectWithKebabCaseKeysAdjacentEvent {
    override val eventType get() = "user-updated"

    override fun toJson(): String {
        var output = "{"
        output += "\"event-type\":\"user-updated\""
        output += ",\"event-data\":"
        output += buildString { printQuoted(eventData) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithKebabCaseKeysAdjacentEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysAdjacentEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysAdjacentEventUserUpdated {
            return FooObjectWithKebabCaseKeysAdjacentEventUserUpdated(
                eventData = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysAdjacentEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysAdjacentEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysAdjacentEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysAdjacentEventUserUpdated.")
                return new()
            }
            val eventData: String = when (__input.jsonObject["event-data"]) {
                is JsonPrimitive -> __input.jsonObject["event-data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysAdjacentEventUserUpdated(
                eventData,
            )
        }
    }
}

data class FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData> {
        @JvmStatic
        override fun new(): FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
            return FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
    val externalEvent: FooObjectWithPascalCaseKeysExternalEvent?,
    val internalEvent: FooObjectWithPascalCaseKeysInternalEvent,
    val adjacentEvent: FooObjectWithPascalCaseKeysAdjacentEvent,
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
        output += ",\"ExternalEvent\":"
        output += externalEvent?.toJson()
        output += ",\"InternalEvent\":"
        output += internalEvent.toJson()
        output += ",\"AdjacentEvent\":"
        output += adjacentEvent.toJson()
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/ExternalEvent.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/InternalEvent.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/AdjacentEvent.")
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
                externalEvent = null,
                internalEvent = FooObjectWithPascalCaseKeysInternalEvent.new(),
                adjacentEvent = FooObjectWithPascalCaseKeysAdjacentEvent.new(),
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
                        try {
                            Instant.parse(__input.jsonObject["CreatedAt"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
            val externalEvent: FooObjectWithPascalCaseKeysExternalEvent? = when (__input.jsonObject["ExternalEvent"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysExternalEvent.fromJsonElement(
                    __input.jsonObject["ExternalEvent"]!!,
                    "$instancePath/ExternalEvent",
                )

                else -> null
            }
            val internalEvent: FooObjectWithPascalCaseKeysInternalEvent = when (__input.jsonObject["InternalEvent"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysInternalEvent.fromJsonElement(
                    __input.jsonObject["InternalEvent"]!!,
                    "$instancePath/InternalEvent",
                )

                else -> FooObjectWithPascalCaseKeysInternalEvent.new()
            }
            val adjacentEvent: FooObjectWithPascalCaseKeysAdjacentEvent = when (__input.jsonObject["AdjacentEvent"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysAdjacentEvent.fromJsonElement(
                    __input.jsonObject["AdjacentEvent"]!!,
                    "$instancePath/AdjacentEvent",
                )

                else -> FooObjectWithPascalCaseKeysAdjacentEvent.new()
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
                externalEvent,
                internalEvent,
                adjacentEvent,
                emailAddress,
                isAdmin,
            )
        }
    }
}

sealed interface FooObjectWithPascalCaseKeysExternalEvent : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEvent> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEvent {
            return FooObjectWithPascalCaseKeysExternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEvent.")
                return new()
            }
            return when {
                "UserCreated" in __input -> FooObjectWithPascalCaseKeysExternalEventUserCreated.fromJsonElement(__input, instancePath)
                "UserUpdated" in __input -> FooObjectWithPascalCaseKeysExternalEventUserUpdated.fromJsonElement(__input, instancePath)
                "UserDeleted" in __input -> FooObjectWithPascalCaseKeysExternalEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithPascalCaseKeysExternalEventUserCreated(
    val value: FooObjectWithPascalCaseKeysExternalEventUserCreatedValue,
) : FooObjectWithPascalCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserCreated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysExternalEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEventUserCreated {
            return FooObjectWithPascalCaseKeysExternalEventUserCreated(
                value = FooObjectWithPascalCaseKeysExternalEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEventUserCreated.")
                return new()
            }
            val value: FooObjectWithPascalCaseKeysExternalEventUserCreatedValue = when (__input.jsonObject["UserCreated"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysExternalEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["UserCreated"]!!,
                    "$instancePath/UserCreated",
                )

                else -> FooObjectWithPascalCaseKeysExternalEventUserCreatedValue.new()
            }
            return FooObjectWithPascalCaseKeysExternalEventUserCreated(
                value,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysExternalEventUserUpdated(
    val value: FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue,
) : FooObjectWithPascalCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserUpdated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysExternalEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEventUserUpdated {
            return FooObjectWithPascalCaseKeysExternalEventUserUpdated(
                value = FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEventUserUpdated.")
                return new()
            }
            val value: FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue = when (__input.jsonObject["UserUpdated"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["UserUpdated"]!!,
                    "$instancePath/UserUpdated",
                )

                else -> FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue.new()
            }
            return FooObjectWithPascalCaseKeysExternalEventUserUpdated(
                value,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysExternalEventUserDeleted(
    val value: FooObjectWithPascalCaseKeysExternalEventUserDeletedValue,
) : FooObjectWithPascalCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserDeleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysExternalEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEventUserDeleted> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEventUserDeleted {
            return FooObjectWithPascalCaseKeysExternalEventUserDeleted(
                value = FooObjectWithPascalCaseKeysExternalEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEventUserDeleted.")
                return new()
            }
            val value: FooObjectWithPascalCaseKeysExternalEventUserDeletedValue = when (__input.jsonObject["UserDeleted"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysExternalEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["UserDeleted"]!!,
                    "$instancePath/UserDeleted",
                )

                else -> FooObjectWithPascalCaseKeysExternalEventUserDeletedValue.new()
            }
            return FooObjectWithPascalCaseKeysExternalEventUserDeleted(
                value,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysExternalEventUserCreatedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEventUserCreatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEventUserCreatedValue {
            return FooObjectWithPascalCaseKeysExternalEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysExternalEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
            return FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysExternalEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysExternalEventUserDeletedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysExternalEventUserDeletedValue> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysExternalEventUserDeletedValue {
            return FooObjectWithPascalCaseKeysExternalEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysExternalEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysExternalEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysExternalEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysExternalEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysExternalEventUserDeletedValue(
                userId,
            )
        }
    }
}

sealed interface FooObjectWithPascalCaseKeysInternalEvent : TestClientPrefixedModel {
    val eventType: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysInternalEvent> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysInternalEvent {
            return FooObjectWithPascalCaseKeysInternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysInternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysInternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysInternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysInternalEvent.")
                return new()
            }
            return when (__input.jsonObject["EventType"]) {
                is JsonPrimitive -> when (__input.jsonObject["EventType"]!!.jsonPrimitive.contentOrNull) {
                    "UserCreated" -> FooObjectWithPascalCaseKeysInternalEventUserCreated.fromJsonElement(__input, instancePath)
                    "UserUpdated" -> FooObjectWithPascalCaseKeysInternalEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithPascalCaseKeysInternalEventUserCreated(
    val userId: String,
) : FooObjectWithPascalCaseKeysInternalEvent {
    override val eventType get() = "UserCreated"

    override fun toJson(): String {
        var output = "{"
        output += "\"EventType\":\"UserCreated\""
        output += ",\"UserId\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("EventType=UserCreated")
        queryParts.add("UserId=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysInternalEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysInternalEventUserCreated {
            return FooObjectWithPascalCaseKeysInternalEventUserCreated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysInternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysInternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysInternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysInternalEventUserCreated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysInternalEventUserCreated(
                userId,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysInternalEventUserUpdated(
    val userId: String,
    val updatedAt: Instant? = null,
) : FooObjectWithPascalCaseKeysInternalEvent {
    override val eventType get() = "UserUpdated"

    override fun toJson(): String {
        var output = "{"
        output += "\"EventType\":\"UserUpdated\""
        output += ",\"UserId\":"
        output += buildString { printQuoted(userId) }
        if (updatedAt != null) {
            output += ",\"UpdatedAt\":"
            output += "\"${timestampFormatter.format(updatedAt)}\""
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("EventType=UserUpdated")
        queryParts.add("UserId=${__encodeQueryValue(userId)}")
        if (updatedAt != null) {
            queryParts.add("UpdatedAt=${__encodeQueryValue(timestampFormatter.format(updatedAt))}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysInternalEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysInternalEventUserUpdated {
            return FooObjectWithPascalCaseKeysInternalEventUserUpdated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysInternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysInternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysInternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysInternalEventUserUpdated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val updatedAt: Instant? = when (__input.jsonObject["UpdatedAt"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["UpdatedAt"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["UpdatedAt"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
                    else
                        null

                else -> null
            }
            return FooObjectWithPascalCaseKeysInternalEventUserUpdated(
                userId,
                updatedAt,
            )
        }
    }
}

sealed interface FooObjectWithPascalCaseKeysAdjacentEvent : TestClientPrefixedModel {
    val eventType: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysAdjacentEvent> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysAdjacentEvent {
            return FooObjectWithPascalCaseKeysAdjacentEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysAdjacentEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysAdjacentEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysAdjacentEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysAdjacentEvent.")
                return new()
            }
            return when (__input.jsonObject["EventType"]) {
                is JsonPrimitive -> when (__input.jsonObject["EventType"]!!.jsonPrimitive.contentOrNull) {
                    "UserCreated" -> FooObjectWithPascalCaseKeysAdjacentEventUserCreated.fromJsonElement(__input, instancePath)
                    "UserUpdated" -> FooObjectWithPascalCaseKeysAdjacentEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithPascalCaseKeysAdjacentEventUserCreated(
    val eventData: FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData,
) : FooObjectWithPascalCaseKeysAdjacentEvent {
    override val eventType get() = "UserCreated"

    override fun toJson(): String {
        var output = "{"
        output += "\"EventType\":\"UserCreated\""
        output += ",\"EventData\":"
        output += eventData.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysAdjacentEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysAdjacentEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysAdjacentEventUserCreated {
            return FooObjectWithPascalCaseKeysAdjacentEventUserCreated(
                eventData = FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysAdjacentEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysAdjacentEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysAdjacentEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysAdjacentEventUserCreated.")
                return new()
            }
            val eventData: FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData = when (__input.jsonObject["EventData"]) {
                is JsonObject -> FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement(
                    __input.jsonObject["EventData"]!!,
                    "$instancePath/EventData",
                )

                else -> FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.new()
            }
            return FooObjectWithPascalCaseKeysAdjacentEventUserCreated(
                eventData,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysAdjacentEventUserUpdated(
    val eventData: String,
) : FooObjectWithPascalCaseKeysAdjacentEvent {
    override val eventType get() = "UserUpdated"

    override fun toJson(): String {
        var output = "{"
        output += "\"EventType\":\"UserUpdated\""
        output += ",\"EventData\":"
        output += buildString { printQuoted(eventData) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithPascalCaseKeysAdjacentEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysAdjacentEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysAdjacentEventUserUpdated {
            return FooObjectWithPascalCaseKeysAdjacentEventUserUpdated(
                eventData = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysAdjacentEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysAdjacentEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysAdjacentEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysAdjacentEventUserUpdated.")
                return new()
            }
            val eventData: String = when (__input.jsonObject["EventData"]) {
                is JsonPrimitive -> __input.jsonObject["EventData"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysAdjacentEventUserUpdated(
                eventData,
            )
        }
    }
}

data class FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData> {
        @JvmStatic
        override fun new(): FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
            return FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val externalEvent: FooObjectWithSnakeCaseKeysExternalEvent?,
    val internalEvent: FooObjectWithSnakeCaseKeysInternalEvent,
    val adjacentEvent: FooObjectWithSnakeCaseKeysAdjacentEvent,
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
        output += ",\"external_event\":"
        output += externalEvent?.toJson()
        output += ",\"internal_event\":"
        output += internalEvent.toJson()
        output += ",\"adjacent_event\":"
        output += adjacentEvent.toJson()
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/external_event.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/internal_event.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/adjacent_event.")
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
                externalEvent = null,
                internalEvent = FooObjectWithSnakeCaseKeysInternalEvent.new(),
                adjacentEvent = FooObjectWithSnakeCaseKeysAdjacentEvent.new(),
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
                        try {
                            Instant.parse(__input.jsonObject["created_at"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
            val externalEvent: FooObjectWithSnakeCaseKeysExternalEvent? = when (__input.jsonObject["external_event"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysExternalEvent.fromJsonElement(
                    __input.jsonObject["external_event"]!!,
                    "$instancePath/external_event",
                )

                else -> null
            }
            val internalEvent: FooObjectWithSnakeCaseKeysInternalEvent = when (__input.jsonObject["internal_event"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysInternalEvent.fromJsonElement(
                    __input.jsonObject["internal_event"]!!,
                    "$instancePath/internal_event",
                )

                else -> FooObjectWithSnakeCaseKeysInternalEvent.new()
            }
            val adjacentEvent: FooObjectWithSnakeCaseKeysAdjacentEvent = when (__input.jsonObject["adjacent_event"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysAdjacentEvent.fromJsonElement(
                    __input.jsonObject["adjacent_event"]!!,
                    "$instancePath/adjacent_event",
                )

                else -> FooObjectWithSnakeCaseKeysAdjacentEvent.new()
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
                externalEvent,
                internalEvent,
                adjacentEvent,
                emailAddress,
                isAdmin,
            )
        }
    }
}

sealed interface FooObjectWithSnakeCaseKeysExternalEvent : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEvent> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEvent {
            return FooObjectWithSnakeCaseKeysExternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEvent.")
                return new()
            }
            return when {
                "user_created" in __input -> FooObjectWithSnakeCaseKeysExternalEventUserCreated.fromJsonElement(__input, instancePath)
                "user_updated" in __input -> FooObjectWithSnakeCaseKeysExternalEventUserUpdated.fromJsonElement(__input, instancePath)
                "user_deleted" in __input -> FooObjectWithSnakeCaseKeysExternalEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooObjectWithSnakeCaseKeysExternalEventUserCreated(
    val value: FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue,
) : FooObjectWithSnakeCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_created\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysExternalEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEventUserCreated {
            return FooObjectWithSnakeCaseKeysExternalEventUserCreated(
                value = FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEventUserCreated.")
                return new()
            }
            val value: FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue = when (__input.jsonObject["user_created"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["user_created"]!!,
                    "$instancePath/user_created",
                )

                else -> FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue.new()
            }
            return FooObjectWithSnakeCaseKeysExternalEventUserCreated(
                value,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysExternalEventUserUpdated(
    val value: FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue,
) : FooObjectWithSnakeCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_updated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysExternalEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEventUserUpdated {
            return FooObjectWithSnakeCaseKeysExternalEventUserUpdated(
                value = FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEventUserUpdated.")
                return new()
            }
            val value: FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue = when (__input.jsonObject["user_updated"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["user_updated"]!!,
                    "$instancePath/user_updated",
                )

                else -> FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.new()
            }
            return FooObjectWithSnakeCaseKeysExternalEventUserUpdated(
                value,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysExternalEventUserDeleted(
    val value: FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue,
) : FooObjectWithSnakeCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_deleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysExternalEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEventUserDeleted> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEventUserDeleted {
            return FooObjectWithSnakeCaseKeysExternalEventUserDeleted(
                value = FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEventUserDeleted.")
                return new()
            }
            val value: FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue = when (__input.jsonObject["user_deleted"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["user_deleted"]!!,
                    "$instancePath/user_deleted",
                )

                else -> FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue.new()
            }
            return FooObjectWithSnakeCaseKeysExternalEventUserDeleted(
                value,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
            return FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysExternalEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
            return FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysExternalEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
            return FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysExternalEventUserDeletedValue(
                userId,
            )
        }
    }
}

sealed interface FooObjectWithSnakeCaseKeysInternalEvent : TestClientPrefixedModel {
    val eventType: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysInternalEvent> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysInternalEvent {
            return FooObjectWithSnakeCaseKeysInternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysInternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysInternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysInternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysInternalEvent.")
                return new()
            }
            return when (__input.jsonObject["event_type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event_type"]!!.jsonPrimitive.contentOrNull) {
                    "user_created" -> FooObjectWithSnakeCaseKeysInternalEventUserCreated.fromJsonElement(__input, instancePath)
                    "user_updated" -> FooObjectWithSnakeCaseKeysInternalEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithSnakeCaseKeysInternalEventUserCreated(
    val userId: String,
) : FooObjectWithSnakeCaseKeysInternalEvent {
    override val eventType get() = "user_created"

    override fun toJson(): String {
        var output = "{"
        output += "\"event_type\":\"user_created\""
        output += ",\"user_id\":"
        output += buildString { printQuoted(userId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("event_type=user_created")
        queryParts.add("user_id=${__encodeQueryValue(userId)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysInternalEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysInternalEventUserCreated {
            return FooObjectWithSnakeCaseKeysInternalEventUserCreated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysInternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysInternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysInternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysInternalEventUserCreated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysInternalEventUserCreated(
                userId,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysInternalEventUserUpdated(
    val userId: String,
    val updatedAt: Instant? = null,
) : FooObjectWithSnakeCaseKeysInternalEvent {
    override val eventType get() = "user_updated"

    override fun toJson(): String {
        var output = "{"
        output += "\"event_type\":\"user_updated\""
        output += ",\"user_id\":"
        output += buildString { printQuoted(userId) }
        if (updatedAt != null) {
            output += ",\"updated_at\":"
            output += "\"${timestampFormatter.format(updatedAt)}\""
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("event_type=user_updated")
        queryParts.add("user_id=${__encodeQueryValue(userId)}")
        if (updatedAt != null) {
            queryParts.add("updated_at=${__encodeQueryValue(timestampFormatter.format(updatedAt))}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysInternalEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysInternalEventUserUpdated {
            return FooObjectWithSnakeCaseKeysInternalEventUserUpdated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysInternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysInternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysInternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysInternalEventUserUpdated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val updatedAt: Instant? = when (__input.jsonObject["updated_at"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["updated_at"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["updated_at"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
                    else
                        null

                else -> null
            }
            return FooObjectWithSnakeCaseKeysInternalEventUserUpdated(
                userId,
                updatedAt,
            )
        }
    }
}

sealed interface FooObjectWithSnakeCaseKeysAdjacentEvent : TestClientPrefixedModel {
    val eventType: String

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysAdjacentEvent> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysAdjacentEvent {
            return FooObjectWithSnakeCaseKeysAdjacentEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysAdjacentEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysAdjacentEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysAdjacentEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysAdjacentEvent.")
                return new()
            }
            return when (__input.jsonObject["event_type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event_type"]!!.jsonPrimitive.contentOrNull) {
                    "user_created" -> FooObjectWithSnakeCaseKeysAdjacentEventUserCreated.fromJsonElement(__input, instancePath)
                    "user_updated" -> FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooObjectWithSnakeCaseKeysAdjacentEventUserCreated(
    val eventData: FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData,
) : FooObjectWithSnakeCaseKeysAdjacentEvent {
    override val eventType get() = "user_created"

    override fun toJson(): String {
        var output = "{"
        output += "\"event_type\":\"user_created\""
        output += ",\"event_data\":"
        output += eventData.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysAdjacentEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysAdjacentEventUserCreated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysAdjacentEventUserCreated {
            return FooObjectWithSnakeCaseKeysAdjacentEventUserCreated(
                eventData = FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysAdjacentEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysAdjacentEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysAdjacentEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysAdjacentEventUserCreated.")
                return new()
            }
            val eventData: FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData = when (__input.jsonObject["event_data"]) {
                is JsonObject -> FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement(
                    __input.jsonObject["event_data"]!!,
                    "$instancePath/event_data",
                )

                else -> FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.new()
            }
            return FooObjectWithSnakeCaseKeysAdjacentEventUserCreated(
                eventData,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated(
    val eventData: String,
) : FooObjectWithSnakeCaseKeysAdjacentEvent {
    override val eventType get() = "user_updated"

    override fun toJson(): String {
        var output = "{"
        output += "\"event_type\":\"user_updated\""
        output += ",\"event_data\":"
        output += buildString { printQuoted(eventData) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated {
            return FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated(
                eventData = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated.")
                return new()
            }
            val eventData: String = when (__input.jsonObject["event_data"]) {
                is JsonPrimitive -> __input.jsonObject["event_data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysAdjacentEventUserUpdated(
                eventData,
            )
        }
    }
}

data class FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(
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

    companion object Factory : TestClientPrefixedModelFactory<FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData> {
        @JvmStatic
        override fun new(): FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
            return FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            null
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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

sealed interface FooUnionInternalGetRequest : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionInternalGetRequest> {
        @JvmStatic
        override fun new(): FooUnionInternalGetRequest {
            return FooUnionInternalGetRequestWithFields.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionInternalGetRequest {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionInternalGetRequest {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionInternalGetRequest.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionInternalGetRequest.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "with-fields" -> FooUnionInternalGetRequestWithFields.fromJsonElement(__input, instancePath)
                    "empty" -> FooUnionInternalGetRequestEmpty.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionInternalGetRequestWithFields(
    val string: String,
    val nullableString: String?,
    val float64: Double,
    val int64: Long,
    val boolean: Boolean,
    val timestamp: Instant,
    val nullableEnum: FooUnionInternalGetRequestWithFieldsNullableEnum?,
    val optionalString: String? = null,
) : FooUnionInternalGetRequest {
    override val kind get() = "with-fields"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"with-fields\""
        output += ",\"string\":"
        output += buildString { printQuoted(string) }
        output += ",\"nullableString\":"
        output += when (nullableString) {
            is String -> buildString { printQuoted(nullableString) }
            else -> "null"
        }
        output += ",\"float64\":"
        output += float64
        output += ",\"int64\":"
        output += "\"${int64}\""
        output += ",\"boolean\":"
        output += boolean
        output += ",\"timestamp\":"
        output += "\"${timestampFormatter.format(timestamp)}\""
        output += ",\"nullableEnum\":"
        output += when (nullableEnum) {
            is FooUnionInternalGetRequestWithFieldsNullableEnum -> "\"${nullableEnum.serialValue}\""
            else -> "null"
        }
        if (optionalString != null) {
            output += ",\"optionalString\":"
            output += buildString { printQuoted(optionalString) }
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=with-fields")
        queryParts.add("string=${__encodeQueryValue(string)}")
        queryParts.add("nullableString=${__encodeQueryValue(nullableString)}")
        queryParts.add("float64=$float64")
        queryParts.add("int64=$int64")
        queryParts.add("boolean=$boolean")
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
        queryParts.add("nullableEnum=${__encodeQueryValue(nullableEnum?.serialValue)}")
        if (optionalString != null) {
            queryParts.add("optionalString=${__encodeQueryValue(optionalString)}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionInternalGetRequestWithFields> {
        @JvmStatic
        override fun new(): FooUnionInternalGetRequestWithFields {
            return FooUnionInternalGetRequestWithFields(
                string = "",
                nullableString = null,
                float64 = 0.0,
                int64 = 0L,
                boolean = false,
                timestamp = Instant.now(),
                nullableEnum = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionInternalGetRequestWithFields {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionInternalGetRequestWithFields {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionInternalGetRequestWithFields.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionInternalGetRequestWithFields.")
                return new()
            }
            val string: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val nullableString: String? = when (__input.jsonObject["nullableString"]) {
                is JsonPrimitive -> __input.jsonObject["nullableString"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val float64: Double = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            val int64: Long = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
            val boolean: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
                    else
                        Instant.now()

                else -> Instant.now()
            }
            val nullableEnum: FooUnionInternalGetRequestWithFieldsNullableEnum? = when (__input.jsonObject["nullableEnum"]) {
                is JsonNull -> null
                is JsonPrimitive -> FooUnionInternalGetRequestWithFieldsNullableEnum.fromJsonElement(__input.jsonObject["nullableEnum"]!!, "$instancePath/nullableEnum")
                else -> null
            }
            val optionalString: String? = when (__input.jsonObject["optionalString"]) {
                is JsonPrimitive -> __input.jsonObject["optionalString"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return FooUnionInternalGetRequestWithFields(
                string,
                nullableString,
                float64,
                int64,
                boolean,
                timestamp,
                nullableEnum,
                optionalString,
            )
        }
    }
}

enum class FooUnionInternalGetRequestWithFieldsNullableEnum {
    A,
    B;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
        }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionInternalGetRequestWithFieldsNullableEnum> {
        @JvmStatic
        override fun new(): FooUnionInternalGetRequestWithFieldsNullableEnum {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionInternalGetRequestWithFieldsNullableEnum {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionInternalGetRequestWithFieldsNullableEnum {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooUnionInternalGetRequestWithFieldsNullableEnum.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionInternalGetRequestWithFieldsNullableEnum.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "A" -> A
                "B" -> B
                else -> new()
            }
        }
    }
}

data class FooUnionInternalGetRequestEmpty(
    private val placeholderKey: Short = 0
) : FooUnionInternalGetRequest {
    override val kind get() = "empty"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"empty\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=empty")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionInternalGetRequestEmpty> {
        @JvmStatic
        override fun new(): FooUnionInternalGetRequestEmpty {
            return FooUnionInternalGetRequestEmpty()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionInternalGetRequestEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionInternalGetRequestEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionInternalGetRequestEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionInternalGetRequestEmpty.")
                return new()
            }
            return FooUnionInternalGetRequestEmpty()
        }
    }
}

data class FooUnionVariantShapes(
    val internal: FooUnionVariantShapesInternal,
    val external: FooUnionVariantShapesExternal,
    val adjacent: FooUnionVariantShapesAdjacent,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"internal\":"
        output += internal.toJson()
        output += ",\"external\":"
        output += external.toJson()
        output += ",\"adjacent\":"
        output += adjacent.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UnionVariantShapes/internal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantShapes/external.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantShapes/adjacent.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapes> {
        @JvmStatic
        override fun new(): FooUnionVariantShapes {
            return FooUnionVariantShapes(
                internal = FooUnionVariantShapesInternal.new(),
                external = FooUnionVariantShapesExternal.new(),
                adjacent = FooUnionVariantShapesAdjacent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapes {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapes {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapes.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapes.")
                return new()
            }
            val internal: FooUnionVariantShapesInternal = when (__input.jsonObject["internal"]) {
                is JsonObject -> FooUnionVariantShapesInternal.fromJsonElement(
                    __input.jsonObject["internal"]!!,
                    "$instancePath/internal",
                )

                else -> FooUnionVariantShapesInternal.new()
            }
            val external: FooUnionVariantShapesExternal = when (__input.jsonObject["external"]) {
                is JsonObject -> FooUnionVariantShapesExternal.fromJsonElement(
                    __input.jsonObject["external"]!!,
                    "$instancePath/external",
                )

                else -> FooUnionVariantShapesExternal.new()
            }
            val adjacent: FooUnionVariantShapesAdjacent = when (__input.jsonObject["adjacent"]) {
                is JsonObject -> FooUnionVariantShapesAdjacent.fromJsonElement(
                    __input.jsonObject["adjacent"]!!,
                    "$instancePath/adjacent",
                )

                else -> FooUnionVariantShapesAdjacent.new()
            }
            return FooUnionVariantShapes(
                internal,
                external,
                adjacent,
            )
        }
    }
}

sealed interface FooUnionVariantShapesInternal : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternal> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternal {
            return FooUnionVariantShapesInternalEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternal.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "empty" -> FooUnionVariantShapesInternalEmpty.fromJsonElement(__input, instancePath)
                    "all-optional" -> FooUnionVariantShapesInternalAllOptional.fromJsonElement(__input, instancePath)
                    "mixed" -> FooUnionVariantShapesInternalMixed.fromJsonElement(__input, instancePath)
                    "nested" -> FooUnionVariantShapesInternalNested.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantShapesInternalEmpty(
    private val placeholderKey: Short = 0
) : FooUnionVariantShapesInternal {
    override val kind get() = "empty"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"empty\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=empty")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternalEmpty> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternalEmpty {
            return FooUnionVariantShapesInternalEmpty()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternalEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternalEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternalEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternalEmpty.")
                return new()
            }
            return FooUnionVariantShapesInternalEmpty()
        }
    }
}

data class FooUnionVariantShapesInternalAllOptional(
    val first: String? = null,
    val second: Int? = null,
) : FooUnionVariantShapesInternal {
    override val kind get() = "all-optional"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"all-optional\""
        if (first != null) {
            output += ",\"first\":"
            output += buildString { printQuoted(first) }
        }
        if (second != null) {
            output += ",\"second\":"
            output += second
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=all-optional")
        if (first != null) {
            queryParts.add("first=${__encodeQueryValue(first)}")
        }
        if (second != null) {
            queryParts.add("second=$second")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternalAllOptional> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternalAllOptional {
            return FooUnionVariantShapesInternalAllOptional()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternalAllOptional {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternalAllOptional {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternalAllOptional.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternalAllOptional.")
                return new()
            }
            val first: String? = when (__input.jsonObject["first"]) {
                is JsonPrimitive -> __input.jsonObject["first"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val second: Int? = when (__input.jsonObject["second"]) {
                is JsonPrimitive -> __input.jsonObject["second"]!!.jsonPrimitive.intOrNull
                else -> null
            }
            return FooUnionVariantShapesInternalAllOptional(
                first,
                second,
            )
        }
    }
}

data class FooUnionVariantShapesInternalMixed(
    val required: String,
    val nullable: String?,
    val optional: String? = null,
) : FooUnionVariantShapesInternal {
    override val kind get() = "mixed"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"mixed\""
        output += ",\"required\":"
        output += buildString { printQuoted(required) }
        output += ",\"nullable\":"
        output += when (nullable) {
            is String -> buildString { printQuoted(nullable) }
            else -> "null"
        }
        if (optional != null) {
            output += ",\"optional\":"
            output += buildString { printQuoted(optional) }
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=mixed")
        queryParts.add("required=${__encodeQueryValue(required)}")
        queryParts.add("nullable=${__encodeQueryValue(nullable)}")
        if (optional != null) {
            queryParts.add("optional=${__encodeQueryValue(optional)}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternalMixed> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternalMixed {
            return FooUnionVariantShapesInternalMixed(
                required = "",
                nullable = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternalMixed {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternalMixed {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternalMixed.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternalMixed.")
                return new()
            }
            val required: String = when (__input.jsonObject["required"]) {
                is JsonPrimitive -> __input.jsonObject["required"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val nullable: String? = when (__input.jsonObject["nullable"]) {
                is JsonPrimitive -> __input.jsonObject["nullable"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val optional: String? = when (__input.jsonObject["optional"]) {
                is JsonPrimitive -> __input.jsonObject["optional"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return FooUnionVariantShapesInternalMixed(
                required,
                nullable,
                optional,
            )
        }
    }
}

data class FooUnionVariantShapesInternalNested(
    val array: MutableList<FooUnionVariantShapesInternalNestedArrayElement>,
    val record: MutableMap<String, Long>,
    val `object`: FooUnionVariantShapesInternalNestedObject,
) : FooUnionVariantShapesInternal {
    override val kind get() = "nested"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"nested\""
        output += ",\"array\":"
        output += "["
        for ((__index, __element) in array.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += __element.toJson()
        }
        output += "]"
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
        output += ",\"object\":"
        output += `object`.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=nested")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /UnionVariantShapesInternalNested/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UnionVariantShapesInternalNested/record.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UnionVariantShapesInternalNested/object.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternalNested> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternalNested {
            return FooUnionVariantShapesInternalNested(
                array = mutableListOf(),
                record = mutableMapOf(),
                `object` = FooUnionVariantShapesInternalNestedObject.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternalNested {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternalNested {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternalNested.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternalNested.")
                return new()
            }
            val array: MutableList<FooUnionVariantShapesInternalNestedArrayElement> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<FooUnionVariantShapesInternalNestedArrayElement> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> FooUnionVariantShapesInternalNestedArrayElement.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> FooUnionVariantShapesInternalNestedArrayElement.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            val record: MutableMap<String, Long> = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, Long> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonPrimitive -> __entry.value!!.jsonPrimitive.longOrNull ?: 0L
                            else -> 0L
                        }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
            val `object`: FooUnionVariantShapesInternalNestedObject = when (__input.jsonObject["object"]) {
                is JsonObject -> FooUnionVariantShapesInternalNestedObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> FooUnionVariantShapesInternalNestedObject.new()
            }
            return FooUnionVariantShapesInternalNested(
                array,
                record,
                `object`,
            )
        }
    }
}

data class FooUnionVariantShapesInternalNestedArrayElement(
    val id: String,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${__encodeQueryValue(id)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternalNestedArrayElement> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternalNestedArrayElement {
            return FooUnionVariantShapesInternalNestedArrayElement(
                id = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternalNestedArrayElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternalNestedArrayElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternalNestedArrayElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternalNestedArrayElement.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantShapesInternalNestedArrayElement(
                id,
            )
        }
    }
}

data class FooUnionVariantShapesInternalNestedObject(
    val timestamp: Instant,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"timestamp\":"
        output += "\"${timestampFormatter.format(timestamp)}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("timestamp=${__encodeQueryValue(timestampFormatter.format(timestamp))}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesInternalNestedObject> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesInternalNestedObject {
            return FooUnionVariantShapesInternalNestedObject(
                timestamp = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesInternalNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesInternalNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesInternalNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesInternalNestedObject.")
                return new()
            }
            val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
                    else
                        Instant.now()

                else -> Instant.now()
            }
            return FooUnionVariantShapesInternalNestedObject(
                timestamp,
            )
        }
    }
}

sealed interface FooUnionVariantShapesExternal : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternal> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternal {
            return FooUnionVariantShapesExternalEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternal.")
                return new()
            }
            return when {
                "empty" in __input -> FooUnionVariantShapesExternalEmpty.fromJsonElement(__input, instancePath)
                "all-optional" in __input -> FooUnionVariantShapesExternalAllOptional.fromJsonElement(__input, instancePath)
                "mixed" in __input -> FooUnionVariantShapesExternalMixed.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooUnionVariantShapesExternalEmpty(
    val value: FooUnionVariantShapesExternalEmptyValue,
) : FooUnionVariantShapesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"empty\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantShapesExternalEmpty.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternalEmpty> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternalEmpty {
            return FooUnionVariantShapesExternalEmpty(
                value = FooUnionVariantShapesExternalEmptyValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternalEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternalEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternalEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternalEmpty.")
                return new()
            }
            val value: FooUnionVariantShapesExternalEmptyValue = when (__input.jsonObject["empty"]) {
                is JsonObject -> FooUnionVariantShapesExternalEmptyValue.fromJsonElement(
                    __input.jsonObject["empty"]!!,
                    "$instancePath/empty",
                )

                else -> FooUnionVariantShapesExternalEmptyValue.new()
            }
            return FooUnionVariantShapesExternalEmpty(
                value,
            )
        }
    }
}

data class FooUnionVariantShapesExternalAllOptional(
    val value: FooUnionVariantShapesExternalAllOptionalValue,
) : FooUnionVariantShapesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"all-optional\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantShapesExternalAllOptional.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternalAllOptional> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternalAllOptional {
            return FooUnionVariantShapesExternalAllOptional(
                value = FooUnionVariantShapesExternalAllOptionalValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternalAllOptional {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternalAllOptional {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternalAllOptional.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternalAllOptional.")
                return new()
            }
            val value: FooUnionVariantShapesExternalAllOptionalValue = when (__input.jsonObject["all-optional"]) {
                is JsonObject -> FooUnionVariantShapesExternalAllOptionalValue.fromJsonElement(
                    __input.jsonObject["all-optional"]!!,
                    "$instancePath/all-optional",
                )

                else -> FooUnionVariantShapesExternalAllOptionalValue.new()
            }
            return FooUnionVariantShapesExternalAllOptional(
                value,
            )
        }
    }
}

data class FooUnionVariantShapesExternalMixed(
    val value: FooUnionVariantShapesExternalMixedValue,
) : FooUnionVariantShapesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"mixed\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantShapesExternalMixed.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternalMixed> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternalMixed {
            return FooUnionVariantShapesExternalMixed(
                value = FooUnionVariantShapesExternalMixedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternalMixed {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternalMixed {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternalMixed.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternalMixed.")
                return new()
            }
            val value: FooUnionVariantShapesExternalMixedValue = when (__input.jsonObject["mixed"]) {
                is JsonObject -> FooUnionVariantShapesExternalMixedValue.fromJsonElement(
                    __input.jsonObject["mixed"]!!,
                    "$instancePath/mixed",
                )

                else -> FooUnionVariantShapesExternalMixedValue.new()
            }
            return FooUnionVariantShapesExternalMixed(
                value,
            )
        }
    }
}

data class FooUnionVariantShapesExternalEmptyValue(
    private val placeholderKey: Short = 0
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        var hasProperties = false
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternalEmptyValue> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternalEmptyValue {
            return FooUnionVariantShapesExternalEmptyValue()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternalEmptyValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternalEmptyValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternalEmptyValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternalEmptyValue.")
                return new()
            }
            return FooUnionVariantShapesExternalEmptyValue()
        }
    }
}

data class FooUnionVariantShapesExternalAllOptionalValue(
    val first: String? = null,
    val second: Int? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        var hasProperties = false
        if (first != null) {
            output += "\"first\":"
            output += buildString { printQuoted(first) }
            hasProperties = true
        }
        if (second != null) {
            if (hasProperties) output += ","
            output += "\"second\":"
            output += second
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        if (first != null) {
            queryParts.add("first=${__encodeQueryValue(first)}")
        }
        if (second != null) {
            queryParts.add("second=$second")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternalAllOptionalValue> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternalAllOptionalValue {
            return FooUnionVariantShapesExternalAllOptionalValue()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternalAllOptionalValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternalAllOptionalValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternalAllOptionalValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternalAllOptionalValue.")
                return new()
            }
            val first: String? = when (__input.jsonObject["first"]) {
                is JsonPrimitive -> __input.jsonObject["first"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val second: Int? = when (__input.jsonObject["second"]) {
                is JsonPrimitive -> __input.jsonObject["second"]!!.jsonPrimitive.intOrNull
                else -> null
            }
            return FooUnionVariantShapesExternalAllOptionalValue(
                first,
                second,
            )
        }
    }
}

data class FooUnionVariantShapesExternalMixedValue(
    val required: String,
    val nullable: String?,
    val optional: String? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"required\":"
        output += buildString { printQuoted(required) }
        output += ",\"nullable\":"
        output += when (nullable) {
            is String -> buildString { printQuoted(nullable) }
            else -> "null"
        }
        if (optional != null) {
            output += ",\"optional\":"
            output += buildString { printQuoted(optional) }
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("required=${__encodeQueryValue(required)}")
        queryParts.add("nullable=${__encodeQueryValue(nullable)}")
        if (optional != null) {
            queryParts.add("optional=${__encodeQueryValue(optional)}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesExternalMixedValue> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesExternalMixedValue {
            return FooUnionVariantShapesExternalMixedValue(
                required = "",
                nullable = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesExternalMixedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesExternalMixedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesExternalMixedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesExternalMixedValue.")
                return new()
            }
            val required: String = when (__input.jsonObject["required"]) {
                is JsonPrimitive -> __input.jsonObject["required"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val nullable: String? = when (__input.jsonObject["nullable"]) {
                is JsonPrimitive -> __input.jsonObject["nullable"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val optional: String? = when (__input.jsonObject["optional"]) {
                is JsonPrimitive -> __input.jsonObject["optional"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return FooUnionVariantShapesExternalMixedValue(
                required,
                nullable,
                optional,
            )
        }
    }
}

sealed interface FooUnionVariantShapesAdjacent : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacent> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacent {
            return FooUnionVariantShapesAdjacentEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "empty" -> FooUnionVariantShapesAdjacentEmpty.fromJsonElement(__input, instancePath)
                    "all-optional" -> FooUnionVariantShapesAdjacentAllOptional.fromJsonElement(__input, instancePath)
                    "mixed" -> FooUnionVariantShapesAdjacentMixed.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantShapesAdjacentEmpty(
    val data: FooUnionVariantShapesAdjacentEmptyData,
) : FooUnionVariantShapesAdjacent {
    override val kind get() = "empty"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"empty\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantShapesAdjacentEmpty.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacentEmpty> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacentEmpty {
            return FooUnionVariantShapesAdjacentEmpty(
                data = FooUnionVariantShapesAdjacentEmptyData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacentEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacentEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacentEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacentEmpty.")
                return new()
            }
            val data: FooUnionVariantShapesAdjacentEmptyData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooUnionVariantShapesAdjacentEmptyData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooUnionVariantShapesAdjacentEmptyData.new()
            }
            return FooUnionVariantShapesAdjacentEmpty(
                data,
            )
        }
    }
}

data class FooUnionVariantShapesAdjacentAllOptional(
    val data: FooUnionVariantShapesAdjacentAllOptionalData,
) : FooUnionVariantShapesAdjacent {
    override val kind get() = "all-optional"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"all-optional\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantShapesAdjacentAllOptional.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacentAllOptional> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacentAllOptional {
            return FooUnionVariantShapesAdjacentAllOptional(
                data = FooUnionVariantShapesAdjacentAllOptionalData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacentAllOptional {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacentAllOptional {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacentAllOptional.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacentAllOptional.")
                return new()
            }
            val data: FooUnionVariantShapesAdjacentAllOptionalData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooUnionVariantShapesAdjacentAllOptionalData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooUnionVariantShapesAdjacentAllOptionalData.new()
            }
            return FooUnionVariantShapesAdjacentAllOptional(
                data,
            )
        }
    }
}

data class FooUnionVariantShapesAdjacentMixed(
    val data: FooUnionVariantShapesAdjacentMixedData,
) : FooUnionVariantShapesAdjacent {
    override val kind get() = "mixed"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"mixed\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantShapesAdjacentMixed.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacentMixed> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacentMixed {
            return FooUnionVariantShapesAdjacentMixed(
                data = FooUnionVariantShapesAdjacentMixedData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacentMixed {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacentMixed {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacentMixed.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacentMixed.")
                return new()
            }
            val data: FooUnionVariantShapesAdjacentMixedData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooUnionVariantShapesAdjacentMixedData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooUnionVariantShapesAdjacentMixedData.new()
            }
            return FooUnionVariantShapesAdjacentMixed(
                data,
            )
        }
    }
}

data class FooUnionVariantShapesAdjacentEmptyData(
    private val placeholderKey: Short = 0
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        var hasProperties = false
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacentEmptyData> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacentEmptyData {
            return FooUnionVariantShapesAdjacentEmptyData()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacentEmptyData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacentEmptyData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacentEmptyData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacentEmptyData.")
                return new()
            }
            return FooUnionVariantShapesAdjacentEmptyData()
        }
    }
}

data class FooUnionVariantShapesAdjacentAllOptionalData(
    val first: String? = null,
    val second: Int? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        var hasProperties = false
        if (first != null) {
            output += "\"first\":"
            output += buildString { printQuoted(first) }
            hasProperties = true
        }
        if (second != null) {
            if (hasProperties) output += ","
            output += "\"second\":"
            output += second
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        if (first != null) {
            queryParts.add("first=${__encodeQueryValue(first)}")
        }
        if (second != null) {
            queryParts.add("second=$second")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacentAllOptionalData> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacentAllOptionalData {
            return FooUnionVariantShapesAdjacentAllOptionalData()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacentAllOptionalData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacentAllOptionalData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacentAllOptionalData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacentAllOptionalData.")
                return new()
            }
            val first: String? = when (__input.jsonObject["first"]) {
                is JsonPrimitive -> __input.jsonObject["first"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val second: Int? = when (__input.jsonObject["second"]) {
                is JsonPrimitive -> __input.jsonObject["second"]!!.jsonPrimitive.intOrNull
                else -> null
            }
            return FooUnionVariantShapesAdjacentAllOptionalData(
                first,
                second,
            )
        }
    }
}

data class FooUnionVariantShapesAdjacentMixedData(
    val required: String,
    val nullable: String?,
    val optional: String? = null,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"required\":"
        output += buildString { printQuoted(required) }
        output += ",\"nullable\":"
        output += when (nullable) {
            is String -> buildString { printQuoted(nullable) }
            else -> "null"
        }
        if (optional != null) {
            output += ",\"optional\":"
            output += buildString { printQuoted(optional) }
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("required=${__encodeQueryValue(required)}")
        queryParts.add("nullable=${__encodeQueryValue(nullable)}")
        if (optional != null) {
            queryParts.add("optional=${__encodeQueryValue(optional)}")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantShapesAdjacentMixedData> {
        @JvmStatic
        override fun new(): FooUnionVariantShapesAdjacentMixedData {
            return FooUnionVariantShapesAdjacentMixedData(
                required = "",
                nullable = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantShapesAdjacentMixedData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantShapesAdjacentMixedData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantShapesAdjacentMixedData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantShapesAdjacentMixedData.")
                return new()
            }
            val required: String = when (__input.jsonObject["required"]) {
                is JsonPrimitive -> __input.jsonObject["required"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val nullable: String? = when (__input.jsonObject["nullable"]) {
                is JsonPrimitive -> __input.jsonObject["nullable"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val optional: String? = when (__input.jsonObject["optional"]) {
                is JsonPrimitive -> __input.jsonObject["optional"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return FooUnionVariantShapesAdjacentMixedData(
                required,
                nullable,
                optional,
            )
        }
    }
}

data class FooUnionVariantTypes(
    val external: FooUnionVariantTypesExternal,
    val adjacent: FooUnionVariantTypesAdjacent,
    val internal: FooUnionVariantTypesInternal,
) : TestClientPrefixedModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"external\":"
        output += external.toJson()
        output += ",\"adjacent\":"
        output += adjacent.toJson()
        output += ",\"internal\":"
        output += internal.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypes/external.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypes/adjacent.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UnionVariantTypes/internal.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypes> {
        @JvmStatic
        override fun new(): FooUnionVariantTypes {
            return FooUnionVariantTypes(
                external = FooUnionVariantTypesExternal.new(),
                adjacent = FooUnionVariantTypesAdjacent.new(),
                internal = FooUnionVariantTypesInternal.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypes {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypes {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypes.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypes.")
                return new()
            }
            val external: FooUnionVariantTypesExternal = when (__input.jsonObject["external"]) {
                is JsonObject -> FooUnionVariantTypesExternal.fromJsonElement(
                    __input.jsonObject["external"]!!,
                    "$instancePath/external",
                )

                else -> FooUnionVariantTypesExternal.new()
            }
            val adjacent: FooUnionVariantTypesAdjacent = when (__input.jsonObject["adjacent"]) {
                is JsonObject -> FooUnionVariantTypesAdjacent.fromJsonElement(
                    __input.jsonObject["adjacent"]!!,
                    "$instancePath/adjacent",
                )

                else -> FooUnionVariantTypesAdjacent.new()
            }
            val internal: FooUnionVariantTypesInternal = when (__input.jsonObject["internal"]) {
                is JsonObject -> FooUnionVariantTypesInternal.fromJsonElement(
                    __input.jsonObject["internal"]!!,
                    "$instancePath/internal",
                )

                else -> FooUnionVariantTypesInternal.new()
            }
            return FooUnionVariantTypes(
                external,
                adjacent,
                internal,
            )
        }
    }
}

sealed interface FooUnionVariantTypesExternal : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternal> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternal {
            return FooUnionVariantTypesExternalString.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternal.")
                return new()
            }
            return when {
                "string" in __input -> FooUnionVariantTypesExternalString.fromJsonElement(__input, instancePath)
                "int64" in __input -> FooUnionVariantTypesExternalInt64.fromJsonElement(__input, instancePath)
                "uint64" in __input -> FooUnionVariantTypesExternalUint64.fromJsonElement(__input, instancePath)
                "float64" in __input -> FooUnionVariantTypesExternalFloat64.fromJsonElement(__input, instancePath)
                "enumerator" in __input -> FooUnionVariantTypesExternalEnumerator.fromJsonElement(__input, instancePath)
                "record" in __input -> FooUnionVariantTypesExternalRecord.fromJsonElement(__input, instancePath)
                "any" in __input -> FooUnionVariantTypesExternalAny.fromJsonElement(__input, instancePath)
                "nullableString" in __input -> FooUnionVariantTypesExternalNullableString.fromJsonElement(__input, instancePath)
                "nullableArray" in __input -> FooUnionVariantTypesExternalNullableArray.fromJsonElement(__input, instancePath)
                "externalUnion" in __input -> FooUnionVariantTypesExternalExternalUnion.fromJsonElement(__input, instancePath)
                "internalUnion" in __input -> FooUnionVariantTypesExternalInternalUnion.fromJsonElement(__input, instancePath)
                "adjacentUnion" in __input -> FooUnionVariantTypesExternalAdjacentUnion.fromJsonElement(__input, instancePath)
                "class" in __input -> FooUnionVariantTypesExternalClass.fromJsonElement(__input, instancePath)
                "default" in __input -> FooUnionVariantTypesExternalDefault.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesExternalString(
    val value: String,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"string\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalString.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalString> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalString {
            return FooUnionVariantTypesExternalString(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalString {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalString.")
                return new()
            }
            val value: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesExternalString(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalInt64(
    val value: Long,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"int64\":"
        output += "\"${value}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalInt64.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalInt64> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalInt64 {
            return FooUnionVariantTypesExternalInt64(
                value = 0L,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalInt64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalInt64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalInt64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalInt64.")
                return new()
            }
            val value: Long = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
            return FooUnionVariantTypesExternalInt64(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalUint64(
    val value: ULong,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"uint64\":"
        output += "\"${value}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalUint64.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalUint64> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalUint64 {
            return FooUnionVariantTypesExternalUint64(
                value = 0UL,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalUint64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalUint64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalUint64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalUint64.")
                return new()
            }
            val value: ULong = when (__input.jsonObject["uint64"]) {
                is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
            return FooUnionVariantTypesExternalUint64(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalFloat64(
    val value: Double,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"float64\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalFloat64.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalFloat64> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalFloat64 {
            return FooUnionVariantTypesExternalFloat64(
                value = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalFloat64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalFloat64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalFloat64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalFloat64.")
                return new()
            }
            val value: Double = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooUnionVariantTypesExternalFloat64(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalEnumerator(
    val value: FooUnionVariantTypesExternalEnumeratorValue,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"enumerator\":"
        output += "\"${value.serialValue}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalEnumerator.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalEnumerator> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalEnumerator {
            return FooUnionVariantTypesExternalEnumerator(
                value = FooUnionVariantTypesExternalEnumeratorValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalEnumerator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalEnumerator {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalEnumerator.")
                return new()
            }
            val value: FooUnionVariantTypesExternalEnumeratorValue = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> FooUnionVariantTypesExternalEnumeratorValue.new()
                is JsonPrimitive -> FooUnionVariantTypesExternalEnumeratorValue.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                else -> FooUnionVariantTypesExternalEnumeratorValue.new()
            }
            return FooUnionVariantTypesExternalEnumerator(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalRecord(
    val value: MutableMap<String, String>,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"record\":"
        output += "{"
        for ((__index, __entry) in value.entries.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += "${buildString { printQuoted(__entry.key) }}:"
            output += buildString { printQuoted(__entry.value) }
        }
        output += "}"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalRecord.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalRecord> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalRecord {
            return FooUnionVariantTypesExternalRecord(
                value = mutableMapOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalRecord {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalRecord {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalRecord.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalRecord.")
                return new()
            }
            val value: MutableMap<String, String> = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, String> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonPrimitive -> __entry.value!!.jsonPrimitive.contentOrNull ?: ""
                            else -> ""
                        }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
            return FooUnionVariantTypesExternalRecord(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalAny(
    val value: JsonElement,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"any\":"
        output += JsonInstance.encodeToString(value)
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalAny.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalAny> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalAny {
            return FooUnionVariantTypesExternalAny(
                value = JsonNull,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalAny {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalAny {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalAny.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalAny.")
                return new()
            }
            val value: JsonElement = when (__input.jsonObject["any"]) {
                is JsonElement -> __input.jsonObject["any"]!!
                else -> JsonNull
            }
            return FooUnionVariantTypesExternalAny(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalNullableString(
    val value: String?,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"nullableString\":"
        output += when (value) {
            is String -> buildString { printQuoted(value) }
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalNullableString.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalNullableString> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalNullableString {
            return FooUnionVariantTypesExternalNullableString(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalNullableString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalNullableString {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalNullableString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalNullableString.")
                return new()
            }
            val value: String? = when (__input.jsonObject["nullableString"]) {
                is JsonPrimitive -> __input.jsonObject["nullableString"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return FooUnionVariantTypesExternalNullableString(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalNullableArray(
    val value: MutableList<String>?,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"nullableArray\":"
        if (value == null) {
            output += "null"
        } else {
            output += "["
            for ((__index, __element) in value.withIndex()) {
                if (__index != 0) {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalNullableArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalNullableArray> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalNullableArray {
            return FooUnionVariantTypesExternalNullableArray(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalNullableArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalNullableArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalNullableArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalNullableArray.")
                return new()
            }
            val value: MutableList<String>? = when (__input.jsonObject["nullableArray"]) {
                is JsonArray -> {
                    val __value: MutableList<String> = mutableListOf()
                    for (__element in __input.jsonObject["nullableArray"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    __value
                }

                else -> null
            }
            return FooUnionVariantTypesExternalNullableArray(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalExternalUnion(
    val value: FooUnionVariantTypesExternalExternalUnionValue,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"externalUnion\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalExternalUnion.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalExternalUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalExternalUnion {
            return FooUnionVariantTypesExternalExternalUnion(
                value = FooUnionVariantTypesExternalExternalUnionValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalExternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalExternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalExternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalExternalUnion.")
                return new()
            }
            val value: FooUnionVariantTypesExternalExternalUnionValue = when (__input.jsonObject["externalUnion"]) {
                is JsonObject -> FooUnionVariantTypesExternalExternalUnionValue.fromJsonElement(
                    __input.jsonObject["externalUnion"]!!,
                    "$instancePath/externalUnion",
                )

                else -> FooUnionVariantTypesExternalExternalUnionValue.new()
            }
            return FooUnionVariantTypesExternalExternalUnion(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalInternalUnion(
    val value: FooUnionVariantTypesExternalInternalUnionValue,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"internalUnion\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalInternalUnion.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalInternalUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalInternalUnion {
            return FooUnionVariantTypesExternalInternalUnion(
                value = FooUnionVariantTypesExternalInternalUnionValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalInternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalInternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalInternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalInternalUnion.")
                return new()
            }
            val value: FooUnionVariantTypesExternalInternalUnionValue = when (__input.jsonObject["internalUnion"]) {
                is JsonObject -> FooUnionVariantTypesExternalInternalUnionValue.fromJsonElement(
                    __input.jsonObject["internalUnion"]!!,
                    "$instancePath/internalUnion",
                )

                else -> FooUnionVariantTypesExternalInternalUnionValue.new()
            }
            return FooUnionVariantTypesExternalInternalUnion(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalAdjacentUnion(
    val value: FooUnionVariantTypesExternalAdjacentUnionValue,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"adjacentUnion\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalAdjacentUnion.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalAdjacentUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalAdjacentUnion {
            return FooUnionVariantTypesExternalAdjacentUnion(
                value = FooUnionVariantTypesExternalAdjacentUnionValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalAdjacentUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalAdjacentUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalAdjacentUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalAdjacentUnion.")
                return new()
            }
            val value: FooUnionVariantTypesExternalAdjacentUnionValue = when (__input.jsonObject["adjacentUnion"]) {
                is JsonObject -> FooUnionVariantTypesExternalAdjacentUnionValue.fromJsonElement(
                    __input.jsonObject["adjacentUnion"]!!,
                    "$instancePath/adjacentUnion",
                )

                else -> FooUnionVariantTypesExternalAdjacentUnionValue.new()
            }
            return FooUnionVariantTypesExternalAdjacentUnion(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalClass(
    val value: String,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"class\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalClass.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalClass> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalClass {
            return FooUnionVariantTypesExternalClass(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalClass {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalClass {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalClass.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalClass.")
                return new()
            }
            val value: String = when (__input.jsonObject["class"]) {
                is JsonPrimitive -> __input.jsonObject["class"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesExternalClass(
                value,
            )
        }
    }
}

data class FooUnionVariantTypesExternalDefault(
    val value: String,
) : FooUnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"default\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalDefault.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalDefault> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalDefault {
            return FooUnionVariantTypesExternalDefault(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalDefault {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalDefault {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalDefault.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalDefault.")
                return new()
            }
            val value: String = when (__input.jsonObject["default"]) {
                is JsonPrimitive -> __input.jsonObject["default"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesExternalDefault(
                value,
            )
        }
    }
}

enum class FooUnionVariantTypesExternalEnumeratorValue {
    A,
    B;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
        }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalEnumeratorValue> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalEnumeratorValue {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalEnumeratorValue {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalEnumeratorValue {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooUnionVariantTypesExternalEnumeratorValue.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalEnumeratorValue.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "A" -> A
                "B" -> B
                else -> new()
            }
        }
    }
}

sealed interface FooUnionVariantTypesExternalExternalUnionValue : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalExternalUnionValue> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalExternalUnionValue {
            return FooUnionVariantTypesExternalExternalUnionValueText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalExternalUnionValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalExternalUnionValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalExternalUnionValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalExternalUnionValue.")
                return new()
            }
            return when {
                "text" in __input -> FooUnionVariantTypesExternalExternalUnionValueText.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesExternalExternalUnionValueText(
    val value: String,
) : FooUnionVariantTypesExternalExternalUnionValue {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalExternalUnionValueText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalExternalUnionValueText> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalExternalUnionValueText {
            return FooUnionVariantTypesExternalExternalUnionValueText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalExternalUnionValueText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalExternalUnionValueText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalExternalUnionValueText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalExternalUnionValueText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesExternalExternalUnionValueText(
                value,
            )
        }
    }
}

sealed interface FooUnionVariantTypesExternalInternalUnionValue : TestClientPrefixedModel {
    val shape: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalInternalUnionValue> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalInternalUnionValue {
            return FooUnionVariantTypesExternalInternalUnionValueCircle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalInternalUnionValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalInternalUnionValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalInternalUnionValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalInternalUnionValue.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "circle" -> FooUnionVariantTypesExternalInternalUnionValueCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesExternalInternalUnionValueCircle(
    val radius: Double,
) : FooUnionVariantTypesExternalInternalUnionValue {
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

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalInternalUnionValueCircle> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalInternalUnionValueCircle {
            return FooUnionVariantTypesExternalInternalUnionValueCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalInternalUnionValueCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalInternalUnionValueCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalInternalUnionValueCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalInternalUnionValueCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooUnionVariantTypesExternalInternalUnionValueCircle(
                radius,
            )
        }
    }
}

sealed interface FooUnionVariantTypesExternalAdjacentUnionValue : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalAdjacentUnionValue> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalAdjacentUnionValue {
            return FooUnionVariantTypesExternalAdjacentUnionValueText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalAdjacentUnionValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalAdjacentUnionValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalAdjacentUnionValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalAdjacentUnionValue.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "text" -> FooUnionVariantTypesExternalAdjacentUnionValueText.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesExternalAdjacentUnionValueText(
    val data: String,
) : FooUnionVariantTypesExternalAdjacentUnionValue {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesExternalAdjacentUnionValueText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesExternalAdjacentUnionValueText> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesExternalAdjacentUnionValueText {
            return FooUnionVariantTypesExternalAdjacentUnionValueText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesExternalAdjacentUnionValueText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesExternalAdjacentUnionValueText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesExternalAdjacentUnionValueText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesExternalAdjacentUnionValueText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesExternalAdjacentUnionValueText(
                data,
            )
        }
    }
}

sealed interface FooUnionVariantTypesAdjacent : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacent> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacent {
            return FooUnionVariantTypesAdjacentString.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "string" -> FooUnionVariantTypesAdjacentString.fromJsonElement(__input, instancePath)
                    "int64" -> FooUnionVariantTypesAdjacentInt64.fromJsonElement(__input, instancePath)
                    "uint64" -> FooUnionVariantTypesAdjacentUint64.fromJsonElement(__input, instancePath)
                    "float64" -> FooUnionVariantTypesAdjacentFloat64.fromJsonElement(__input, instancePath)
                    "enumerator" -> FooUnionVariantTypesAdjacentEnumerator.fromJsonElement(__input, instancePath)
                    "record" -> FooUnionVariantTypesAdjacentRecord.fromJsonElement(__input, instancePath)
                    "any" -> FooUnionVariantTypesAdjacentAny.fromJsonElement(__input, instancePath)
                    "nullableString" -> FooUnionVariantTypesAdjacentNullableString.fromJsonElement(__input, instancePath)
                    "nullableArray" -> FooUnionVariantTypesAdjacentNullableArray.fromJsonElement(__input, instancePath)
                    "externalUnion" -> FooUnionVariantTypesAdjacentExternalUnion.fromJsonElement(__input, instancePath)
                    "internalUnion" -> FooUnionVariantTypesAdjacentInternalUnion.fromJsonElement(__input, instancePath)
                    "adjacentUnion" -> FooUnionVariantTypesAdjacentAdjacentUnion.fromJsonElement(__input, instancePath)
                    "class" -> FooUnionVariantTypesAdjacentClass.fromJsonElement(__input, instancePath)
                    "default" -> FooUnionVariantTypesAdjacentDefault.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesAdjacentString(
    val data: String,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "string"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"string\""
        output += ",\"data\":"
        output += buildString { printQuoted(data) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentString.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentString> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentString {
            return FooUnionVariantTypesAdjacentString(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentString {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentString.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesAdjacentString(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentInt64(
    val data: Long,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "int64"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"int64\""
        output += ",\"data\":"
        output += "\"${data}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentInt64.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentInt64> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentInt64 {
            return FooUnionVariantTypesAdjacentInt64(
                data = 0L,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentInt64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentInt64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentInt64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentInt64.")
                return new()
            }
            val data: Long = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
            return FooUnionVariantTypesAdjacentInt64(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentUint64(
    val data: ULong,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "uint64"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"uint64\""
        output += ",\"data\":"
        output += "\"${data}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentUint64.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentUint64> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentUint64 {
            return FooUnionVariantTypesAdjacentUint64(
                data = 0UL,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentUint64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentUint64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentUint64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentUint64.")
                return new()
            }
            val data: ULong = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
            return FooUnionVariantTypesAdjacentUint64(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentFloat64(
    val data: Double,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "float64"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"float64\""
        output += ",\"data\":"
        output += data
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentFloat64.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentFloat64> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentFloat64 {
            return FooUnionVariantTypesAdjacentFloat64(
                data = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentFloat64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentFloat64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentFloat64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentFloat64.")
                return new()
            }
            val data: Double = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooUnionVariantTypesAdjacentFloat64(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentEnumerator(
    val data: FooUnionVariantTypesAdjacentEnumeratorData,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "enumerator"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"enumerator\""
        output += ",\"data\":"
        output += "\"${data.serialValue}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentEnumerator.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentEnumerator> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentEnumerator {
            return FooUnionVariantTypesAdjacentEnumerator(
                data = FooUnionVariantTypesAdjacentEnumeratorData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentEnumerator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentEnumerator {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentEnumerator.")
                return new()
            }
            val data: FooUnionVariantTypesAdjacentEnumeratorData = when (__input.jsonObject["data"]) {
                is JsonNull -> FooUnionVariantTypesAdjacentEnumeratorData.new()
                is JsonPrimitive -> FooUnionVariantTypesAdjacentEnumeratorData.fromJsonElement(__input.jsonObject["data"]!!, "$instancePath/data")
                else -> FooUnionVariantTypesAdjacentEnumeratorData.new()
            }
            return FooUnionVariantTypesAdjacentEnumerator(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentRecord(
    val data: MutableMap<String, String>,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "record"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"record\""
        output += ",\"data\":"
        output += "{"
        for ((__index, __entry) in data.entries.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += "${buildString { printQuoted(__entry.key) }}:"
            output += buildString { printQuoted(__entry.value) }
        }
        output += "}"
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentRecord.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentRecord> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentRecord {
            return FooUnionVariantTypesAdjacentRecord(
                data = mutableMapOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentRecord {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentRecord {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentRecord.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentRecord.")
                return new()
            }
            val data: MutableMap<String, String> = when (__input.jsonObject["data"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, String> = mutableMapOf()
                    for (__entry in __input.jsonObject["data"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonPrimitive -> __entry.value!!.jsonPrimitive.contentOrNull ?: ""
                            else -> ""
                        }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
            return FooUnionVariantTypesAdjacentRecord(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentAny(
    val data: JsonElement,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "any"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"any\""
        output += ",\"data\":"
        output += JsonInstance.encodeToString(data)
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentAny.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentAny> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentAny {
            return FooUnionVariantTypesAdjacentAny(
                data = JsonNull,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentAny {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentAny {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentAny.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentAny.")
                return new()
            }
            val data: JsonElement = when (__input.jsonObject["data"]) {
                is JsonElement -> __input.jsonObject["data"]!!
                else -> JsonNull
            }
            return FooUnionVariantTypesAdjacentAny(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentNullableString(
    val data: String?,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "nullableString"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"nullableString\""
        output += ",\"data\":"
        output += when (data) {
            is String -> buildString { printQuoted(data) }
            else -> "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentNullableString.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentNullableString> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentNullableString {
            return FooUnionVariantTypesAdjacentNullableString(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentNullableString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentNullableString {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentNullableString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentNullableString.")
                return new()
            }
            val data: String? = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return FooUnionVariantTypesAdjacentNullableString(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentNullableArray(
    val data: MutableList<String>?,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "nullableArray"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"nullableArray\""
        output += ",\"data\":"
        if (data == null) {
            output += "null"
        } else {
            output += "["
            for ((__index, __element) in data.withIndex()) {
                if (__index != 0) {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentNullableArray.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentNullableArray> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentNullableArray {
            return FooUnionVariantTypesAdjacentNullableArray(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentNullableArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentNullableArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentNullableArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentNullableArray.")
                return new()
            }
            val data: MutableList<String>? = when (__input.jsonObject["data"]) {
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

                else -> null
            }
            return FooUnionVariantTypesAdjacentNullableArray(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentExternalUnion(
    val data: FooUnionVariantTypesAdjacentExternalUnionData,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "externalUnion"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"externalUnion\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentExternalUnion.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentExternalUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentExternalUnion {
            return FooUnionVariantTypesAdjacentExternalUnion(
                data = FooUnionVariantTypesAdjacentExternalUnionData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentExternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentExternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentExternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentExternalUnion.")
                return new()
            }
            val data: FooUnionVariantTypesAdjacentExternalUnionData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooUnionVariantTypesAdjacentExternalUnionData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooUnionVariantTypesAdjacentExternalUnionData.new()
            }
            return FooUnionVariantTypesAdjacentExternalUnion(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentInternalUnion(
    val data: FooUnionVariantTypesAdjacentInternalUnionData,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "internalUnion"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"internalUnion\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentInternalUnion.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentInternalUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentInternalUnion {
            return FooUnionVariantTypesAdjacentInternalUnion(
                data = FooUnionVariantTypesAdjacentInternalUnionData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentInternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentInternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentInternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentInternalUnion.")
                return new()
            }
            val data: FooUnionVariantTypesAdjacentInternalUnionData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooUnionVariantTypesAdjacentInternalUnionData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooUnionVariantTypesAdjacentInternalUnionData.new()
            }
            return FooUnionVariantTypesAdjacentInternalUnion(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentAdjacentUnion(
    val data: FooUnionVariantTypesAdjacentAdjacentUnionData,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "adjacentUnion"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"adjacentUnion\""
        output += ",\"data\":"
        output += data.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentAdjacentUnion.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentAdjacentUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentAdjacentUnion {
            return FooUnionVariantTypesAdjacentAdjacentUnion(
                data = FooUnionVariantTypesAdjacentAdjacentUnionData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentAdjacentUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentAdjacentUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentAdjacentUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentAdjacentUnion.")
                return new()
            }
            val data: FooUnionVariantTypesAdjacentAdjacentUnionData = when (__input.jsonObject["data"]) {
                is JsonObject -> FooUnionVariantTypesAdjacentAdjacentUnionData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> FooUnionVariantTypesAdjacentAdjacentUnionData.new()
            }
            return FooUnionVariantTypesAdjacentAdjacentUnion(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentClass(
    val data: String,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "class"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"class\""
        output += ",\"data\":"
        output += buildString { printQuoted(data) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentClass.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentClass> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentClass {
            return FooUnionVariantTypesAdjacentClass(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentClass {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentClass {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentClass.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentClass.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesAdjacentClass(
                data,
            )
        }
    }
}

data class FooUnionVariantTypesAdjacentDefault(
    val data: String,
) : FooUnionVariantTypesAdjacent {
    override val kind get() = "default"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"default\""
        output += ",\"data\":"
        output += buildString { printQuoted(data) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentDefault.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentDefault> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentDefault {
            return FooUnionVariantTypesAdjacentDefault(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentDefault {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentDefault {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentDefault.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentDefault.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesAdjacentDefault(
                data,
            )
        }
    }
}

enum class FooUnionVariantTypesAdjacentEnumeratorData {
    A,
    B;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
        }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentEnumeratorData> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentEnumeratorData {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentEnumeratorData {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentEnumeratorData {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentEnumeratorData.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentEnumeratorData.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "A" -> A
                "B" -> B
                else -> new()
            }
        }
    }
}

sealed interface FooUnionVariantTypesAdjacentExternalUnionData : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentExternalUnionData> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentExternalUnionData {
            return FooUnionVariantTypesAdjacentExternalUnionDataText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentExternalUnionData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentExternalUnionData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentExternalUnionData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentExternalUnionData.")
                return new()
            }
            return when {
                "text" in __input -> FooUnionVariantTypesAdjacentExternalUnionDataText.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesAdjacentExternalUnionDataText(
    val value: String,
) : FooUnionVariantTypesAdjacentExternalUnionData {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentExternalUnionDataText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentExternalUnionDataText> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentExternalUnionDataText {
            return FooUnionVariantTypesAdjacentExternalUnionDataText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentExternalUnionDataText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentExternalUnionDataText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentExternalUnionDataText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentExternalUnionDataText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesAdjacentExternalUnionDataText(
                value,
            )
        }
    }
}

sealed interface FooUnionVariantTypesAdjacentInternalUnionData : TestClientPrefixedModel {
    val shape: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentInternalUnionData> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentInternalUnionData {
            return FooUnionVariantTypesAdjacentInternalUnionDataCircle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentInternalUnionData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentInternalUnionData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentInternalUnionData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentInternalUnionData.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "circle" -> FooUnionVariantTypesAdjacentInternalUnionDataCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesAdjacentInternalUnionDataCircle(
    val radius: Double,
) : FooUnionVariantTypesAdjacentInternalUnionData {
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

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentInternalUnionDataCircle> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentInternalUnionDataCircle {
            return FooUnionVariantTypesAdjacentInternalUnionDataCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentInternalUnionDataCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentInternalUnionDataCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentInternalUnionDataCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentInternalUnionDataCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooUnionVariantTypesAdjacentInternalUnionDataCircle(
                radius,
            )
        }
    }
}

sealed interface FooUnionVariantTypesAdjacentAdjacentUnionData : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentAdjacentUnionData> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentAdjacentUnionData {
            return FooUnionVariantTypesAdjacentAdjacentUnionDataText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentAdjacentUnionData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentAdjacentUnionData {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentAdjacentUnionData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentAdjacentUnionData.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "text" -> FooUnionVariantTypesAdjacentAdjacentUnionDataText.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesAdjacentAdjacentUnionDataText(
    val data: String,
) : FooUnionVariantTypesAdjacentAdjacentUnionData {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesAdjacentAdjacentUnionDataText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesAdjacentAdjacentUnionDataText> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesAdjacentAdjacentUnionDataText {
            return FooUnionVariantTypesAdjacentAdjacentUnionDataText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesAdjacentAdjacentUnionDataText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesAdjacentAdjacentUnionDataText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesAdjacentAdjacentUnionDataText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesAdjacentAdjacentUnionDataText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesAdjacentAdjacentUnionDataText(
                data,
            )
        }
    }
}

sealed interface FooUnionVariantTypesInternal : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternal> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternal {
            return FooUnionVariantTypesInternalClass.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternal.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "class" -> FooUnionVariantTypesInternalClass.fromJsonElement(__input, instancePath)
                    "default" -> FooUnionVariantTypesInternalDefault.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesInternalClass(
    val `for`: String,
    val default: String,
) : FooUnionVariantTypesInternal {
    override val kind get() = "class"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"class\""
        output += ",\"for\":"
        output += buildString { printQuoted(`for`) }
        output += ",\"default\":"
        output += buildString { printQuoted(default) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=class")
        queryParts.add("for=${__encodeQueryValue(`for`)}")
        queryParts.add("default=${__encodeQueryValue(default)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalClass> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalClass {
            return FooUnionVariantTypesInternalClass(
                `for` = "",
                default = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalClass {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalClass {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalClass.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalClass.")
                return new()
            }
            val `for`: String = when (__input.jsonObject["for"]) {
                is JsonPrimitive -> __input.jsonObject["for"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val default: String = when (__input.jsonObject["default"]) {
                is JsonPrimitive -> __input.jsonObject["default"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesInternalClass(
                `for`,
                default,
            )
        }
    }
}

data class FooUnionVariantTypesInternalDefault(
    val `class`: String,
    val internalUnion: FooUnionVariantTypesInternalDefaultInternalUnion,
    val adjacentUnion: FooUnionVariantTypesInternalDefaultAdjacentUnion,
    val externalUnion: FooUnionVariantTypesInternalDefaultExternalUnion,
) : FooUnionVariantTypesInternal {
    override val kind get() = "default"

    override fun toJson(): String {
        var output = "{"
        output += "\"kind\":\"default\""
        output += ",\"class\":"
        output += buildString { printQuoted(`class`) }
        output += ",\"internalUnion\":"
        output += internalUnion.toJson()
        output += ",\"adjacentUnion\":"
        output += adjacentUnion.toJson()
        output += ",\"externalUnion\":"
        output += externalUnion.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("kind=default")
        queryParts.add("class=${__encodeQueryValue(`class`)}")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UnionVariantTypesInternalDefault/internalUnion.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypesInternalDefault/adjacentUnion.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypesInternalDefault/externalUnion.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefault> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefault {
            return FooUnionVariantTypesInternalDefault(
                `class` = "",
                internalUnion = FooUnionVariantTypesInternalDefaultInternalUnion.new(),
                adjacentUnion = FooUnionVariantTypesInternalDefaultAdjacentUnion.new(),
                externalUnion = FooUnionVariantTypesInternalDefaultExternalUnion.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefault {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefault {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefault.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefault.")
                return new()
            }
            val `class`: String = when (__input.jsonObject["class"]) {
                is JsonPrimitive -> __input.jsonObject["class"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val internalUnion: FooUnionVariantTypesInternalDefaultInternalUnion = when (__input.jsonObject["internalUnion"]) {
                is JsonObject -> FooUnionVariantTypesInternalDefaultInternalUnion.fromJsonElement(
                    __input.jsonObject["internalUnion"]!!,
                    "$instancePath/internalUnion",
                )

                else -> FooUnionVariantTypesInternalDefaultInternalUnion.new()
            }
            val adjacentUnion: FooUnionVariantTypesInternalDefaultAdjacentUnion = when (__input.jsonObject["adjacentUnion"]) {
                is JsonObject -> FooUnionVariantTypesInternalDefaultAdjacentUnion.fromJsonElement(
                    __input.jsonObject["adjacentUnion"]!!,
                    "$instancePath/adjacentUnion",
                )

                else -> FooUnionVariantTypesInternalDefaultAdjacentUnion.new()
            }
            val externalUnion: FooUnionVariantTypesInternalDefaultExternalUnion = when (__input.jsonObject["externalUnion"]) {
                is JsonObject -> FooUnionVariantTypesInternalDefaultExternalUnion.fromJsonElement(
                    __input.jsonObject["externalUnion"]!!,
                    "$instancePath/externalUnion",
                )

                else -> FooUnionVariantTypesInternalDefaultExternalUnion.new()
            }
            return FooUnionVariantTypesInternalDefault(
                `class`,
                internalUnion,
                adjacentUnion,
                externalUnion,
            )
        }
    }
}

sealed interface FooUnionVariantTypesInternalDefaultInternalUnion : TestClientPrefixedModel {
    val shape: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefaultInternalUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefaultInternalUnion {
            return FooUnionVariantTypesInternalDefaultInternalUnionCircle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefaultInternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefaultInternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefaultInternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefaultInternalUnion.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "circle" -> FooUnionVariantTypesInternalDefaultInternalUnionCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesInternalDefaultInternalUnionCircle(
    val radius: Double,
) : FooUnionVariantTypesInternalDefaultInternalUnion {
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

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefaultInternalUnionCircle> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefaultInternalUnionCircle {
            return FooUnionVariantTypesInternalDefaultInternalUnionCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefaultInternalUnionCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefaultInternalUnionCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefaultInternalUnionCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefaultInternalUnionCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return FooUnionVariantTypesInternalDefaultInternalUnionCircle(
                radius,
            )
        }
    }
}

sealed interface FooUnionVariantTypesInternalDefaultAdjacentUnion : TestClientPrefixedModel {
    val kind: String

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefaultAdjacentUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefaultAdjacentUnion {
            return FooUnionVariantTypesInternalDefaultAdjacentUnionText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefaultAdjacentUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefaultAdjacentUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefaultAdjacentUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefaultAdjacentUnion.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "text" -> FooUnionVariantTypesInternalDefaultAdjacentUnionText.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesInternalDefaultAdjacentUnionText(
    val data: String,
) : FooUnionVariantTypesInternalDefaultAdjacentUnion {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesInternalDefaultAdjacentUnionText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefaultAdjacentUnionText> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefaultAdjacentUnionText {
            return FooUnionVariantTypesInternalDefaultAdjacentUnionText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefaultAdjacentUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefaultAdjacentUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefaultAdjacentUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefaultAdjacentUnionText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesInternalDefaultAdjacentUnionText(
                data,
            )
        }
    }
}

sealed interface FooUnionVariantTypesInternalDefaultExternalUnion : TestClientPrefixedModel {
    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefaultExternalUnion> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefaultExternalUnion {
            return FooUnionVariantTypesInternalDefaultExternalUnionText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefaultExternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefaultExternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefaultExternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefaultExternalUnion.")
                return new()
            }
            return when {
                "text" in __input -> FooUnionVariantTypesInternalDefaultExternalUnionText.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class FooUnionVariantTypesInternalDefaultExternalUnionText(
    val value: String,
) : FooUnionVariantTypesInternalDefaultExternalUnion {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping FooUnionVariantTypesInternalDefaultExternalUnionText.")
        return ""
    }

    companion object Factory : TestClientPrefixedModelFactory<FooUnionVariantTypesInternalDefaultExternalUnionText> {
        @JvmStatic
        override fun new(): FooUnionVariantTypesInternalDefaultExternalUnionText {
            return FooUnionVariantTypesInternalDefaultExternalUnionText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): FooUnionVariantTypesInternalDefaultExternalUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): FooUnionVariantTypesInternalDefaultExternalUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] FooUnionVariantTypesInternalDefaultExternalUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty FooUnionVariantTypesInternalDefaultExternalUnionText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return FooUnionVariantTypesInternalDefaultExternalUnionText(
                value,
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
                        try {
                            Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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
                        try {
                            Instant.parse(__input.jsonObject["createdAt"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.now()
                        }
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