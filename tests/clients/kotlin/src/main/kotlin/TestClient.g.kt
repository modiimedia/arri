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
import kotlinx.coroutines.withTimeoutOrNull
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
private typealias __TestClientHeadersFn = (() -> MutableMap<String, String>?)?

class TestClient(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __TestClientHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    val tests: TestClientTestsService = TestClientTestsService(
        httpClient = httpClient,
        baseUrl = baseUrl,
        headers = headers,
        onError = onError,
    )

    val users: TestClientUsersService = TestClientUsersService(
        httpClient = httpClient,
        baseUrl = baseUrl,
        headers = headers,
        onError = onError,
    )
}

class TestClientTestsService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __TestClientHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    val nested: TestClientTestsNestedService = TestClientTestsNestedService(
        httpClient = httpClient,
        baseUrl = baseUrl,
        headers = headers,
        onError = onError,
    )

    /**
     * If the target language supports it. Generated code should mark this procedure as deprecated.
     */
    @Deprecated(message = "This method was marked as deprecated by the server")
    suspend fun deprecatedRpc(params: DeprecatedRpcParams): Unit {
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
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendDiscriminatorWithEmptyObject(params: DiscriminatorWithEmptyObject): DiscriminatorWithEmptyObject {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-discriminator-with-empty-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return DiscriminatorWithEmptyObject.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendError(params: SendErrorParams): Unit {
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
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObject(params: ObjectWithEveryType): ObjectWithEveryType {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return ObjectWithEveryType.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithKebabCaseKeys(params: ObjectWithKebabCaseKeys): ObjectWithKebabCaseKeys {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-kebab-case-keys",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return ObjectWithKebabCaseKeys.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithNullableFields(params: ObjectWithEveryNullableType): ObjectWithEveryNullableType {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-nullable-fields",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return ObjectWithEveryNullableType.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithPascalCaseKeys(params: ObjectWithPascalCaseKeys): ObjectWithPascalCaseKeys {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-pascal-case-keys",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return ObjectWithPascalCaseKeys.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendObjectWithSnakeCaseKeys(params: ObjectWithSnakeCaseKeys): ObjectWithSnakeCaseKeys {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-object-with-snake-case-keys",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return ObjectWithSnakeCaseKeys.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendPartialObject(params: ObjectWithEveryOptionalType): ObjectWithEveryOptionalType {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-partial-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return ObjectWithEveryOptionalType.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveObject(params: RecursiveObject): RecursiveObject {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-object",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return RecursiveObject.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnionAdjacent(params: RecursiveUnionAdjacent): RecursiveUnionAdjacent {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-adjacent",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return RecursiveUnionAdjacent.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnionExternal(params: RecursiveUnionExternal): RecursiveUnionExternal {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-external",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return RecursiveUnionExternal.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnionInternal(params: RecursiveUnionInternal): RecursiveUnionInternal {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-internal",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return RecursiveUnionInternal.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    /**
     * GET requests send params through url query params. Only internally tagged unions can be represented this way.
     */
    suspend fun sendUnionInternalGetRequest(params: UnionInternalGetRequest): UnionInternalGetRequest {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-union-internal-get-request",
                method = HttpMethod.Get,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return UnionInternalGetRequest.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    /**
     * Union variants with no fields, only optional fields, a mix of required, optional, and nullable fields, and nested fields.
     */
    suspend fun sendUnionVariantShapes(params: UnionVariantShapes): UnionVariantShapes {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-union-variant-shapes",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return UnionVariantShapes.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    /**
     * Union variants of every value type, nested unions, and names that are reserved words in many languages.
     */
    suspend fun sendUnionVariantTypes(params: UnionVariantTypes): UnionVariantTypes {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-union-variant-types",
                method = HttpMethod.Post,
                params = params,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return UnionVariantTypes.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun streamAutoReconnect(
        params: AutoReconnectParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024 * 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onRequestError: ((error: Exception) -> Unit) = {},
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: AutoReconnectResponse) -> Unit) = {},
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
                val data = AutoReconnectResponse.fromJson(str)
                onData(data)
            }
        )
    }

    /**
     * This route will always return an error. The client should automatically retry with exponential backoff.
     */
    suspend fun streamConnectionErrorTest(
        params: StreamConnectionErrorTestParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024 * 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onRequestError: ((error: Exception) -> Unit) = {},
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: StreamConnectionErrorTestResponse) -> Unit) = {},
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
                val data = StreamConnectionErrorTestResponse.fromJson(str)
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
        params: StreamHeartbeatDetectionTestParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024 * 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onRequestError: ((error: Exception) -> Unit) = {},
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: StreamHeartbeatDetectionTestResponse) -> Unit) = {},
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
                val data = StreamHeartbeatDetectionTestResponse.fromJson(str)
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
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: StreamLargeObjectsResponse) -> Unit) = {},
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
                val data = StreamLargeObjectsResponse.fromJson(str)
                onData(data)
            }
        )
    }

    suspend fun streamMessages(
        params: ChatMessageParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024 * 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onRequestError: ((error: Exception) -> Unit) = {},
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: ChatMessage) -> Unit) = {},
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
                val data = ChatMessage.fromJson(str)
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
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: TestsStreamRetryWithNewCredentialsResponse) -> Unit) = {},
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
                val data = TestsStreamRetryWithNewCredentialsResponse.fromJson(str)
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
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: ChatMessage) -> Unit) = {},
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
                val data = ChatMessage.fromJson(str)
                onData(data)
            }
        )
    }
}

class TestClientTestsNestedService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __TestClientHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    suspend fun emptyParamsGetRequest(): DefaultPayload {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/nested/empty-params-get-request",
                method = HttpMethod.Get,
                params = null,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return DefaultPayload.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun emptyParamsPostRequest(): DefaultPayload {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/nested/empty-params-post-request",
                method = HttpMethod.Post,
                params = null,
                headers = headers?.invoke(),
            ).execute()
            if (response.headers["Content-Type"] != "application/json") {
                throw TestClientError(
                    code = 0,
                    errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                    data = JsonPrimitive(response.bodyAsText()),
                    stack = null,
                )
            }
            if (response.status.value in 200..299) {
                return DefaultPayload.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun emptyResponseGetRequest(params: DefaultPayload): Unit {
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
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun emptyResponsePostRequest(params: DefaultPayload): Unit {
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
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }
}

class TestClientUsersService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: __TestClientHeadersFn,
    private val onError: ((err: Exception) -> Unit) = {},
) {
    suspend fun watchUser(
        params: UsersWatchUserParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024 * 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onRequestError: ((error: Exception) -> Unit) = {},
        onResponseError: ((error: TestClientError) -> Unit) = {},
        onData: ((data: UsersWatchUserResponse) -> Unit) = {},
        maxBackoffTime: Long? = null,
    ): Unit {
        __handleSseRequest(
            httpClient = httpClient,
            url = "$baseUrl/rpcs/users/watch-user",
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
                val data = UsersWatchUserResponse.fromJson(str)
                onData(data)
            }
        )
    }
}

interface TestClientModel {
    fun toJson(): String
    fun toUrlQueryParams(): String
}

interface TestClientModelFactory<T> {
    fun new(): T
    fun fromJson(input: String): T
    fun fromJsonElement(
        __input: JsonElement,
        instancePath: String = "",
    ): T
}

data class TestClientError(
    val code: Int,
    val errorMessage: String,
    val data: JsonElement?,
    val stack: List<String>?,
) : Exception(errorMessage), TestClientModel {
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

    companion object Factory : TestClientModelFactory<TestClientError> {
        override fun new(): TestClientError {
            return TestClientError(
                code = 0,
                errorMessage = "",
                data = null,
                stack = null
            )
        }

        override fun fromJson(input: String): TestClientError {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        override fun fromJsonElement(__input: JsonElement, instancePath: String): TestClientError {
            if (__input !is JsonObject) {
                __logError("[WARNING] TestClientError.fromJsonElement() expected JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty TestClientError.")
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
            return TestClientError(
                code,
                errorMessage,
                data,
                stack,
            )
        }

    }
}

data class ManuallyAddedModel(
    val hello: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ManuallyAddedModel> {
        @JvmStatic
        override fun new(): ManuallyAddedModel {
            return ManuallyAddedModel(
                hello = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ManuallyAddedModel {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ManuallyAddedModel {
            if (__input !is JsonObject) {
                __logError("[WARNING] ManuallyAddedModel.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ManuallyAddedModel.")
                return new()
            }
            val hello: String = when (__input.jsonObject["hello"]) {
                is JsonPrimitive -> __input.jsonObject["hello"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ManuallyAddedModel(
                hello,
            )
        }
    }
}

data class DefaultPayload(
    val message: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<DefaultPayload> {
        @JvmStatic
        override fun new(): DefaultPayload {
            return DefaultPayload(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): DefaultPayload {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DefaultPayload {
            if (__input !is JsonObject) {
                __logError("[WARNING] DefaultPayload.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DefaultPayload.")
                return new()
            }
            val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return DefaultPayload(
                message,
            )
        }
    }
}

@Deprecated(message = "This class was marked as deprecated by the server")
data class DeprecatedRpcParams(
    @Deprecated(message = "This field was marked as deprecated by the server")
    val deprecatedField: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<DeprecatedRpcParams> {
        @JvmStatic
        override fun new(): DeprecatedRpcParams {
            return DeprecatedRpcParams(
                deprecatedField = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): DeprecatedRpcParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DeprecatedRpcParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] DeprecatedRpcParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DeprecatedRpcParams.")
                return new()
            }
            val deprecatedField: String = when (__input.jsonObject["deprecatedField"]) {
                is JsonPrimitive -> __input.jsonObject["deprecatedField"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return DeprecatedRpcParams(
                deprecatedField,
            )
        }
    }
}

sealed interface DiscriminatorWithEmptyObject : TestClientModel {
    val type: String

    companion object Factory : TestClientModelFactory<DiscriminatorWithEmptyObject> {
        @JvmStatic
        override fun new(): DiscriminatorWithEmptyObject {
            return DiscriminatorWithEmptyObjectEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): DiscriminatorWithEmptyObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DiscriminatorWithEmptyObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] DiscriminatorWithEmptyObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DiscriminatorWithEmptyObject.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "EMPTY" -> DiscriminatorWithEmptyObjectEmpty.fromJsonElement(__input, instancePath)
                    "NOT_EMPTY" -> DiscriminatorWithEmptyObjectNotEmpty.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class DiscriminatorWithEmptyObjectEmpty(
    private val placeholderKey: Short = 0
) : DiscriminatorWithEmptyObject {
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

    companion object Factory : TestClientModelFactory<DiscriminatorWithEmptyObjectEmpty> {
        @JvmStatic
        override fun new(): DiscriminatorWithEmptyObjectEmpty {
            return DiscriminatorWithEmptyObjectEmpty()
        }

        @JvmStatic
        override fun fromJson(input: String): DiscriminatorWithEmptyObjectEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DiscriminatorWithEmptyObjectEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] DiscriminatorWithEmptyObjectEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DiscriminatorWithEmptyObjectEmpty.")
                return new()
            }
            return DiscriminatorWithEmptyObjectEmpty()
        }
    }
}

data class DiscriminatorWithEmptyObjectNotEmpty(
    val foo: String,
    val bar: Double,
    val baz: Boolean,
) : DiscriminatorWithEmptyObject {
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

    companion object Factory : TestClientModelFactory<DiscriminatorWithEmptyObjectNotEmpty> {
        @JvmStatic
        override fun new(): DiscriminatorWithEmptyObjectNotEmpty {
            return DiscriminatorWithEmptyObjectNotEmpty(
                foo = "",
                bar = 0.0,
                baz = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): DiscriminatorWithEmptyObjectNotEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DiscriminatorWithEmptyObjectNotEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] DiscriminatorWithEmptyObjectNotEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DiscriminatorWithEmptyObjectNotEmpty.")
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
            return DiscriminatorWithEmptyObjectNotEmpty(
                foo,
                bar,
                baz,
            )
        }
    }
}

data class SendErrorParams(
    val code: UShort,
    val message: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<SendErrorParams> {
        @JvmStatic
        override fun new(): SendErrorParams {
            return SendErrorParams(
                code = 0u,
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): SendErrorParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): SendErrorParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] SendErrorParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty SendErrorParams.")
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
            return SendErrorParams(
                code,
                message,
            )
        }
    }
}

data class ObjectWithEveryType(
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
    val enumerator: ObjectWithEveryTypeEnumerator,
    val array: MutableList<Boolean>,
    val `object`: ObjectWithEveryTypeObject,
    val record: MutableMap<String, ULong>,
    val unionExternal: ObjectWithEveryTypeUnionExternal,
    val unionInternal: ObjectWithEveryTypeUnionInternal,
    val unionAdjacent: ObjectWithEveryTypeUnionAdjacent,
    val nestedObject: ObjectWithEveryTypeNestedObject,
    val nestedArray: MutableList<MutableList<ObjectWithEveryTypeNestedArrayElementElement>>,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionInternal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionAdjacent.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedObject.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedArray.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryType> {
        @JvmStatic
        override fun new(): ObjectWithEveryType {
            return ObjectWithEveryType(
                any = JsonNull,
                boolean = false,
                string = "",
                timestamp = Instant.EPOCH,
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
                enumerator = ObjectWithEveryTypeEnumerator.new(),
                array = mutableListOf(),
                `object` = ObjectWithEveryTypeObject.new(),
                record = mutableMapOf(),
                unionExternal = ObjectWithEveryTypeUnionExternal.new(),
                unionInternal = ObjectWithEveryTypeUnionInternal.new(),
                unionAdjacent = ObjectWithEveryTypeUnionAdjacent.new(),
                nestedObject = ObjectWithEveryTypeNestedObject.new(),
                nestedArray = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryType {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryType.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
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
            val enumerator: ObjectWithEveryTypeEnumerator = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> ObjectWithEveryTypeEnumerator.new()
                is JsonPrimitive -> ObjectWithEveryTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                else -> ObjectWithEveryTypeEnumerator.new()
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
            val `object`: ObjectWithEveryTypeObject = when (__input.jsonObject["object"]) {
                is JsonObject -> ObjectWithEveryTypeObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> ObjectWithEveryTypeObject.new()
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
            val unionExternal: ObjectWithEveryTypeUnionExternal = when (__input.jsonObject["unionExternal"]) {
                is JsonObject -> ObjectWithEveryTypeUnionExternal.fromJsonElement(
                    __input.jsonObject["unionExternal"]!!,
                    "$instancePath/unionExternal",
                )

                else -> ObjectWithEveryTypeUnionExternal.new()
            }
            val unionInternal: ObjectWithEveryTypeUnionInternal = when (__input.jsonObject["unionInternal"]) {
                is JsonObject -> ObjectWithEveryTypeUnionInternal.fromJsonElement(
                    __input.jsonObject["unionInternal"]!!,
                    "$instancePath/unionInternal",
                )

                else -> ObjectWithEveryTypeUnionInternal.new()
            }
            val unionAdjacent: ObjectWithEveryTypeUnionAdjacent = when (__input.jsonObject["unionAdjacent"]) {
                is JsonObject -> ObjectWithEveryTypeUnionAdjacent.fromJsonElement(
                    __input.jsonObject["unionAdjacent"]!!,
                    "$instancePath/unionAdjacent",
                )

                else -> ObjectWithEveryTypeUnionAdjacent.new()
            }
            val nestedObject: ObjectWithEveryTypeNestedObject = when (__input.jsonObject["nestedObject"]) {
                is JsonObject -> ObjectWithEveryTypeNestedObject.fromJsonElement(
                    __input.jsonObject["nestedObject"]!!,
                    "$instancePath/nestedObject",
                )

                else -> ObjectWithEveryTypeNestedObject.new()
            }
            val nestedArray: MutableList<MutableList<ObjectWithEveryTypeNestedArrayElementElement>> = when (__input.jsonObject["nestedArray"]) {
                is JsonArray -> {
                    val __value: MutableList<MutableList<ObjectWithEveryTypeNestedArrayElementElement>> = mutableListOf()
                    for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonArray -> {
                                    val __value: MutableList<ObjectWithEveryTypeNestedArrayElementElement> = mutableListOf()
                                    for (__element in __element!!.jsonArray) {
                                        __value.add(
                                            when (__element) {
                                                is JsonObject -> ObjectWithEveryTypeNestedArrayElementElement.fromJsonElement(
                                                    __element!!,
                                                    "$instancePath/undefined",
                                                )

                                                else -> ObjectWithEveryTypeNestedArrayElementElement.new()
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
            return ObjectWithEveryType(
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

enum class ObjectWithEveryTypeEnumerator {
    A,
    B,
    C;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeEnumerator> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] ObjectWithEveryTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeEnumerator.")
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

data class ObjectWithEveryTypeObject(
    val string: String,
    val boolean: Boolean,
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeObject {
            return ObjectWithEveryTypeObject(
                string = "",
                boolean = false,
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeObject.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return ObjectWithEveryTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}

sealed interface ObjectWithEveryTypeUnionExternal : TestClientModel {
    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionExternal> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionExternal {
            return ObjectWithEveryTypeUnionExternalObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionExternal.")
                return new()
            }
            return when {
                "object" in __input -> ObjectWithEveryTypeUnionExternalObject.fromJsonElement(__input, instancePath)
                "array" in __input -> ObjectWithEveryTypeUnionExternalArray.fromJsonElement(__input, instancePath)
                "boolean" in __input -> ObjectWithEveryTypeUnionExternalBoolean.fromJsonElement(__input, instancePath)
                "nullable-timestamp" in __input -> ObjectWithEveryTypeUnionExternalNullableTimestamp.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class ObjectWithEveryTypeUnionExternalObject(
    val value: ObjectWithEveryTypeUnionExternalObjectValue,
) : ObjectWithEveryTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"object\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionExternalObject.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionExternalObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionExternalObject {
            return ObjectWithEveryTypeUnionExternalObject(
                value = ObjectWithEveryTypeUnionExternalObjectValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionExternalObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionExternalObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionExternalObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionExternalObject.")
                return new()
            }
            val value: ObjectWithEveryTypeUnionExternalObjectValue = when (__input.jsonObject["object"]) {
                is JsonObject -> ObjectWithEveryTypeUnionExternalObjectValue.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> ObjectWithEveryTypeUnionExternalObjectValue.new()
            }
            return ObjectWithEveryTypeUnionExternalObject(
                value,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionExternalArray(
    val value: MutableList<String>,
) : ObjectWithEveryTypeUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionExternalArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionExternalArray> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionExternalArray {
            return ObjectWithEveryTypeUnionExternalArray(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionExternalArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionExternalArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionExternalArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionExternalArray.")
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
            return ObjectWithEveryTypeUnionExternalArray(
                value,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionExternalBoolean(
    val value: Boolean,
) : ObjectWithEveryTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"boolean\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionExternalBoolean.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionExternalBoolean> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionExternalBoolean {
            return ObjectWithEveryTypeUnionExternalBoolean(
                value = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionExternalBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionExternalBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionExternalBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionExternalBoolean.")
                return new()
            }
            val value: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return ObjectWithEveryTypeUnionExternalBoolean(
                value,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionExternalNullableTimestamp(
    val value: Instant?,
) : ObjectWithEveryTypeUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionExternalNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionExternalNullableTimestamp> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionExternalNullableTimestamp {
            return ObjectWithEveryTypeUnionExternalNullableTimestamp(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionExternalNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionExternalNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionExternalNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionExternalNullableTimestamp.")
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
            return ObjectWithEveryTypeUnionExternalNullableTimestamp(
                value,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionExternalObjectValue(
    val id: String,
    val content: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionExternalObjectValue> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionExternalObjectValue {
            return ObjectWithEveryTypeUnionExternalObjectValue(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionExternalObjectValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionExternalObjectValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionExternalObjectValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionExternalObjectValue.")
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
            return ObjectWithEveryTypeUnionExternalObjectValue(
                id,
                content,
            )
        }
    }
}

sealed interface ObjectWithEveryTypeUnionInternal : TestClientModel {
    val shape: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionInternal> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionInternal {
            return ObjectWithEveryTypeUnionInternalRectangle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "rectangle" -> ObjectWithEveryTypeUnionInternalRectangle.fromJsonElement(__input, instancePath)
                    "circle" -> ObjectWithEveryTypeUnionInternalCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryTypeUnionInternalRectangle(
    val width: Double,
    val height: Double,
) : ObjectWithEveryTypeUnionInternal {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionInternalRectangle> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionInternalRectangle {
            return ObjectWithEveryTypeUnionInternalRectangle(
                width = 0.0,
                height = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionInternalRectangle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionInternalRectangle {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionInternalRectangle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionInternalRectangle.")
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
            return ObjectWithEveryTypeUnionInternalRectangle(
                width,
                height,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionInternalCircle(
    val radius: Double,
) : ObjectWithEveryTypeUnionInternal {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionInternalCircle> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionInternalCircle {
            return ObjectWithEveryTypeUnionInternalCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionInternalCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionInternalCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionInternalCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionInternalCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return ObjectWithEveryTypeUnionInternalCircle(
                radius,
            )
        }
    }
}

sealed interface ObjectWithEveryTypeUnionAdjacent : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionAdjacent> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionAdjacent {
            return ObjectWithEveryTypeUnionAdjacentObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "object" -> ObjectWithEveryTypeUnionAdjacentObject.fromJsonElement(__input, instancePath)
                    "array" -> ObjectWithEveryTypeUnionAdjacentArray.fromJsonElement(__input, instancePath)
                    "boolean" -> ObjectWithEveryTypeUnionAdjacentBoolean.fromJsonElement(__input, instancePath)
                    "nullable-timestamp" -> ObjectWithEveryTypeUnionAdjacentNullableTimestamp.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryTypeUnionAdjacentObject(
    val data: ObjectWithEveryTypeUnionAdjacentObjectData,
) : ObjectWithEveryTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionAdjacentObject.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionAdjacentObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionAdjacentObject {
            return ObjectWithEveryTypeUnionAdjacentObject(
                data = ObjectWithEveryTypeUnionAdjacentObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionAdjacentObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionAdjacentObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionAdjacentObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionAdjacentObject.")
                return new()
            }
            val data: ObjectWithEveryTypeUnionAdjacentObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryTypeUnionAdjacentObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryTypeUnionAdjacentObjectData.new()
            }
            return ObjectWithEveryTypeUnionAdjacentObject(
                data,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionAdjacentArray(
    val data: MutableList<String>,
) : ObjectWithEveryTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionAdjacentArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionAdjacentArray> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionAdjacentArray {
            return ObjectWithEveryTypeUnionAdjacentArray(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionAdjacentArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionAdjacentArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionAdjacentArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionAdjacentArray.")
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
            return ObjectWithEveryTypeUnionAdjacentArray(
                data,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionAdjacentBoolean(
    val data: Boolean,
) : ObjectWithEveryTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionAdjacentBoolean.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionAdjacentBoolean> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionAdjacentBoolean {
            return ObjectWithEveryTypeUnionAdjacentBoolean(
                data = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionAdjacentBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionAdjacentBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionAdjacentBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionAdjacentBoolean.")
                return new()
            }
            val data: Boolean = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return ObjectWithEveryTypeUnionAdjacentBoolean(
                data,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionAdjacentNullableTimestamp(
    val data: Instant?,
) : ObjectWithEveryTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionAdjacentNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionAdjacentNullableTimestamp> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionAdjacentNullableTimestamp {
            return ObjectWithEveryTypeUnionAdjacentNullableTimestamp(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionAdjacentNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionAdjacentNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionAdjacentNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionAdjacentNullableTimestamp.")
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
            return ObjectWithEveryTypeUnionAdjacentNullableTimestamp(
                data,
            )
        }
    }
}

data class ObjectWithEveryTypeUnionAdjacentObjectData(
    val id: String,
    val content: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeUnionAdjacentObjectData> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeUnionAdjacentObjectData {
            return ObjectWithEveryTypeUnionAdjacentObjectData(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeUnionAdjacentObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeUnionAdjacentObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeUnionAdjacentObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeUnionAdjacentObjectData.")
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
            return ObjectWithEveryTypeUnionAdjacentObjectData(
                id,
                content,
            )
        }
    }
}

data class ObjectWithEveryTypeNestedObject(
    val id: String,
    val timestamp: Instant,
    val data: ObjectWithEveryTypeNestedObjectData,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeNestedObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeNestedObject {
            return ObjectWithEveryTypeNestedObject(
                id = "",
                timestamp = Instant.EPOCH,
                data = ObjectWithEveryTypeNestedObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeNestedObject.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val data: ObjectWithEveryTypeNestedObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryTypeNestedObjectData.new()
            }
            return ObjectWithEveryTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class ObjectWithEveryTypeNestedObjectData(
    val id: String,
    val timestamp: Instant,
    val data: ObjectWithEveryTypeNestedObjectDataData,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeNestedObjectData> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeNestedObjectData {
            return ObjectWithEveryTypeNestedObjectData(
                id = "",
                timestamp = Instant.EPOCH,
                data = ObjectWithEveryTypeNestedObjectDataData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeNestedObjectData.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val data: ObjectWithEveryTypeNestedObjectDataData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryTypeNestedObjectDataData.new()
            }
            return ObjectWithEveryTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class ObjectWithEveryTypeNestedObjectDataData(
    val id: String,
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeNestedObjectDataData {
            return ObjectWithEveryTypeNestedObjectDataData(
                id = "",
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeNestedObjectDataData.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return ObjectWithEveryTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}

data class ObjectWithEveryTypeNestedArrayElementElement(
    val id: String,
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeNestedArrayElementElement {
            return ObjectWithEveryTypeNestedArrayElementElement(
                id = "",
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeNestedArrayElementElement.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return ObjectWithEveryTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}

data class ObjectWithKebabCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val externalEvent: ObjectWithKebabCaseKeysExternalEvent?,
    val internalEvent: ObjectWithKebabCaseKeysInternalEvent,
    val adjacentEvent: ObjectWithKebabCaseKeysAdjacentEvent,
    val emailAddress: String? = null,
    val isAdmin: Boolean? = null,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/internal-event.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/adjacent-event.")
        if (emailAddress != null) {
            queryParts.add("email-address=${__encodeQueryValue(emailAddress)}")
        }
        if (isAdmin != null) {
            queryParts.add("is-admin=$isAdmin")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeys> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeys {
            return ObjectWithKebabCaseKeys(
                createdAt = Instant.EPOCH,
                displayName = "",
                phoneNumber = null,
                externalEvent = null,
                internalEvent = ObjectWithKebabCaseKeysInternalEvent.new(),
                adjacentEvent = ObjectWithKebabCaseKeysAdjacentEvent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeys {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeys {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeys.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeys.")
                return new()
            }
            val createdAt: Instant = when (__input.jsonObject["created-at"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["created-at"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["created-at"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val displayName: String = when (__input.jsonObject["display-name"]) {
                is JsonPrimitive -> __input.jsonObject["display-name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val phoneNumber: String? = when (__input.jsonObject["phone-number"]) {
                is JsonPrimitive -> __input.jsonObject["phone-number"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val externalEvent: ObjectWithKebabCaseKeysExternalEvent? = when (__input.jsonObject["external-event"]) {
                is JsonObject -> ObjectWithKebabCaseKeysExternalEvent.fromJsonElement(
                    __input.jsonObject["external-event"]!!,
                    "$instancePath/external-event",
                )

                else -> null
            }
            val internalEvent: ObjectWithKebabCaseKeysInternalEvent = when (__input.jsonObject["internal-event"]) {
                is JsonObject -> ObjectWithKebabCaseKeysInternalEvent.fromJsonElement(
                    __input.jsonObject["internal-event"]!!,
                    "$instancePath/internal-event",
                )

                else -> ObjectWithKebabCaseKeysInternalEvent.new()
            }
            val adjacentEvent: ObjectWithKebabCaseKeysAdjacentEvent = when (__input.jsonObject["adjacent-event"]) {
                is JsonObject -> ObjectWithKebabCaseKeysAdjacentEvent.fromJsonElement(
                    __input.jsonObject["adjacent-event"]!!,
                    "$instancePath/adjacent-event",
                )

                else -> ObjectWithKebabCaseKeysAdjacentEvent.new()
            }
            val emailAddress: String? = when (__input.jsonObject["email-address"]) {
                is JsonPrimitive -> __input.jsonObject["email-address"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val isAdmin: Boolean? = when (__input.jsonObject["is-admin"]) {
                is JsonPrimitive -> __input.jsonObject["is-admin"]!!.jsonPrimitive.booleanOrNull
                else -> null
            }
            return ObjectWithKebabCaseKeys(
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

sealed interface ObjectWithKebabCaseKeysExternalEvent : TestClientModel {
    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEvent> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEvent {
            return ObjectWithKebabCaseKeysExternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEvent.")
                return new()
            }
            return when {
                "user-created" in __input -> ObjectWithKebabCaseKeysExternalEventUserCreated.fromJsonElement(__input, instancePath)
                "user-updated" in __input -> ObjectWithKebabCaseKeysExternalEventUserUpdated.fromJsonElement(__input, instancePath)
                "user-deleted" in __input -> ObjectWithKebabCaseKeysExternalEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class ObjectWithKebabCaseKeysExternalEventUserCreated(
    val value: ObjectWithKebabCaseKeysExternalEventUserCreatedValue,
) : ObjectWithKebabCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-created\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithKebabCaseKeysExternalEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEventUserCreated {
            return ObjectWithKebabCaseKeysExternalEventUserCreated(
                value = ObjectWithKebabCaseKeysExternalEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEventUserCreated.")
                return new()
            }
            val value: ObjectWithKebabCaseKeysExternalEventUserCreatedValue = when (__input.jsonObject["user-created"]) {
                is JsonObject -> ObjectWithKebabCaseKeysExternalEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["user-created"]!!,
                    "$instancePath/user-created",
                )

                else -> ObjectWithKebabCaseKeysExternalEventUserCreatedValue.new()
            }
            return ObjectWithKebabCaseKeysExternalEventUserCreated(
                value,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysExternalEventUserUpdated(
    val value: ObjectWithKebabCaseKeysExternalEventUserUpdatedValue,
) : ObjectWithKebabCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-updated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithKebabCaseKeysExternalEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEventUserUpdated {
            return ObjectWithKebabCaseKeysExternalEventUserUpdated(
                value = ObjectWithKebabCaseKeysExternalEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEventUserUpdated.")
                return new()
            }
            val value: ObjectWithKebabCaseKeysExternalEventUserUpdatedValue = when (__input.jsonObject["user-updated"]) {
                is JsonObject -> ObjectWithKebabCaseKeysExternalEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["user-updated"]!!,
                    "$instancePath/user-updated",
                )

                else -> ObjectWithKebabCaseKeysExternalEventUserUpdatedValue.new()
            }
            return ObjectWithKebabCaseKeysExternalEventUserUpdated(
                value,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysExternalEventUserDeleted(
    val value: ObjectWithKebabCaseKeysExternalEventUserDeletedValue,
) : ObjectWithKebabCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user-deleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithKebabCaseKeysExternalEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEventUserDeleted> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEventUserDeleted {
            return ObjectWithKebabCaseKeysExternalEventUserDeleted(
                value = ObjectWithKebabCaseKeysExternalEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEventUserDeleted.")
                return new()
            }
            val value: ObjectWithKebabCaseKeysExternalEventUserDeletedValue = when (__input.jsonObject["user-deleted"]) {
                is JsonObject -> ObjectWithKebabCaseKeysExternalEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["user-deleted"]!!,
                    "$instancePath/user-deleted",
                )

                else -> ObjectWithKebabCaseKeysExternalEventUserDeletedValue.new()
            }
            return ObjectWithKebabCaseKeysExternalEventUserDeleted(
                value,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysExternalEventUserCreatedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEventUserCreatedValue> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEventUserCreatedValue {
            return ObjectWithKebabCaseKeysExternalEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithKebabCaseKeysExternalEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysExternalEventUserUpdatedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
            return ObjectWithKebabCaseKeysExternalEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithKebabCaseKeysExternalEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysExternalEventUserDeletedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysExternalEventUserDeletedValue> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysExternalEventUserDeletedValue {
            return ObjectWithKebabCaseKeysExternalEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysExternalEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysExternalEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysExternalEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysExternalEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithKebabCaseKeysExternalEventUserDeletedValue(
                userId,
            )
        }
    }
}

sealed interface ObjectWithKebabCaseKeysInternalEvent : TestClientModel {
    val eventType: String

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysInternalEvent> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysInternalEvent {
            return ObjectWithKebabCaseKeysInternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysInternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysInternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysInternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysInternalEvent.")
                return new()
            }
            return when (__input.jsonObject["event-type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event-type"]!!.jsonPrimitive.contentOrNull) {
                    "user-created" -> ObjectWithKebabCaseKeysInternalEventUserCreated.fromJsonElement(__input, instancePath)
                    "user-updated" -> ObjectWithKebabCaseKeysInternalEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithKebabCaseKeysInternalEventUserCreated(
    val userId: String,
) : ObjectWithKebabCaseKeysInternalEvent {
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

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysInternalEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysInternalEventUserCreated {
            return ObjectWithKebabCaseKeysInternalEventUserCreated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysInternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysInternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysInternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysInternalEventUserCreated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithKebabCaseKeysInternalEventUserCreated(
                userId,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysInternalEventUserUpdated(
    val userId: String,
    val updatedAt: Instant? = null,
) : ObjectWithKebabCaseKeysInternalEvent {
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

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysInternalEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysInternalEventUserUpdated {
            return ObjectWithKebabCaseKeysInternalEventUserUpdated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysInternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysInternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysInternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysInternalEventUserUpdated.")
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
            return ObjectWithKebabCaseKeysInternalEventUserUpdated(
                userId,
                updatedAt,
            )
        }
    }
}

sealed interface ObjectWithKebabCaseKeysAdjacentEvent : TestClientModel {
    val eventType: String

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysAdjacentEvent> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysAdjacentEvent {
            return ObjectWithKebabCaseKeysAdjacentEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysAdjacentEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysAdjacentEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysAdjacentEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysAdjacentEvent.")
                return new()
            }
            return when (__input.jsonObject["event-type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event-type"]!!.jsonPrimitive.contentOrNull) {
                    "user-created" -> ObjectWithKebabCaseKeysAdjacentEventUserCreated.fromJsonElement(__input, instancePath)
                    "user-updated" -> ObjectWithKebabCaseKeysAdjacentEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithKebabCaseKeysAdjacentEventUserCreated(
    val eventData: ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData,
) : ObjectWithKebabCaseKeysAdjacentEvent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithKebabCaseKeysAdjacentEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysAdjacentEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysAdjacentEventUserCreated {
            return ObjectWithKebabCaseKeysAdjacentEventUserCreated(
                eventData = ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysAdjacentEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysAdjacentEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysAdjacentEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysAdjacentEventUserCreated.")
                return new()
            }
            val eventData: ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData = when (__input.jsonObject["event-data"]) {
                is JsonObject -> ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement(
                    __input.jsonObject["event-data"]!!,
                    "$instancePath/event-data",
                )

                else -> ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.new()
            }
            return ObjectWithKebabCaseKeysAdjacentEventUserCreated(
                eventData,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysAdjacentEventUserUpdated(
    val eventData: String,
) : ObjectWithKebabCaseKeysAdjacentEvent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithKebabCaseKeysAdjacentEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysAdjacentEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysAdjacentEventUserUpdated {
            return ObjectWithKebabCaseKeysAdjacentEventUserUpdated(
                eventData = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysAdjacentEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysAdjacentEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysAdjacentEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysAdjacentEventUserUpdated.")
                return new()
            }
            val eventData: String = when (__input.jsonObject["event-data"]) {
                is JsonPrimitive -> __input.jsonObject["event-data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithKebabCaseKeysAdjacentEventUserUpdated(
                eventData,
            )
        }
    }
}

data class ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData> {
        @JvmStatic
        override fun new(): ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
            return ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user-id"]) {
                is JsonPrimitive -> __input.jsonObject["user-id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(
                userId,
            )
        }
    }
}

data class ObjectWithEveryNullableType(
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
    val enumerator: ObjectWithEveryNullableTypeEnumerator?,
    val array: MutableList<Boolean?>?,
    val `object`: ObjectWithEveryNullableTypeObject?,
    val record: MutableMap<String, ULong?>?,
    val unionExternal: ObjectWithEveryNullableTypeUnionExternal?,
    val unionInternal: ObjectWithEveryNullableTypeUnionInternal?,
    val unionAdjacent: ObjectWithEveryNullableTypeUnionAdjacent?,
    val nestedObject: ObjectWithEveryNullableTypeNestedObject?,
    val nestedArray: MutableList<MutableList<ObjectWithEveryNullableTypeNestedArrayElementElement?>?>?,
) : TestClientModel {
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
            is ObjectWithEveryNullableTypeEnumerator -> "\"${enumerator.serialValue}\""
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionInternal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionAdjacent.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/nestedObject.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/nestedArray.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableType> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableType {
            return ObjectWithEveryNullableType(
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
        override fun fromJson(input: String): ObjectWithEveryNullableType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableType {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableType.")
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
            val enumerator: ObjectWithEveryNullableTypeEnumerator? = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> null
                is JsonPrimitive -> ObjectWithEveryNullableTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
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
            val `object`: ObjectWithEveryNullableTypeObject? = when (__input.jsonObject["object"]) {
                is JsonObject -> ObjectWithEveryNullableTypeObject.fromJsonElement(
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
            val unionExternal: ObjectWithEveryNullableTypeUnionExternal? = when (__input.jsonObject["unionExternal"]) {
                is JsonObject -> ObjectWithEveryNullableTypeUnionExternal.fromJsonElement(
                    __input.jsonObject["unionExternal"]!!,
                    "$instancePath/unionExternal",
                )

                else -> null
            }
            val unionInternal: ObjectWithEveryNullableTypeUnionInternal? = when (__input.jsonObject["unionInternal"]) {
                is JsonObject -> ObjectWithEveryNullableTypeUnionInternal.fromJsonElement(
                    __input.jsonObject["unionInternal"]!!,
                    "$instancePath/unionInternal",
                )

                else -> null
            }
            val unionAdjacent: ObjectWithEveryNullableTypeUnionAdjacent? = when (__input.jsonObject["unionAdjacent"]) {
                is JsonObject -> ObjectWithEveryNullableTypeUnionAdjacent.fromJsonElement(
                    __input.jsonObject["unionAdjacent"]!!,
                    "$instancePath/unionAdjacent",
                )

                else -> null
            }
            val nestedObject: ObjectWithEveryNullableTypeNestedObject? = when (__input.jsonObject["nestedObject"]) {
                is JsonObject -> ObjectWithEveryNullableTypeNestedObject.fromJsonElement(
                    __input.jsonObject["nestedObject"]!!,
                    "$instancePath/nestedObject",
                )

                else -> null
            }
            val nestedArray: MutableList<MutableList<ObjectWithEveryNullableTypeNestedArrayElementElement?>?>? = when (__input.jsonObject["nestedArray"]) {
                is JsonArray -> {
                    val __value: MutableList<MutableList<ObjectWithEveryNullableTypeNestedArrayElementElement?>?> = mutableListOf()
                    for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonArray -> {
                                    val __value: MutableList<ObjectWithEveryNullableTypeNestedArrayElementElement?> = mutableListOf()
                                    for (__element in __element!!.jsonArray) {
                                        __value.add(
                                            when (__element) {
                                                is JsonObject -> ObjectWithEveryNullableTypeNestedArrayElementElement.fromJsonElement(
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
            return ObjectWithEveryNullableType(
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

enum class ObjectWithEveryNullableTypeEnumerator {
    A,
    B,
    C;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeEnumerator> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] ObjectWithEveryNullableTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeEnumerator.")
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

data class ObjectWithEveryNullableTypeObject(
    val string: String?,
    val boolean: Boolean?,
    val timestamp: Instant?,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeObject {
            return ObjectWithEveryNullableTypeObject(
                string = null,
                boolean = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeObject.")
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
            return ObjectWithEveryNullableTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}

sealed interface ObjectWithEveryNullableTypeUnionExternal : TestClientModel {
    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionExternal> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionExternal {
            return ObjectWithEveryNullableTypeUnionExternalObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionExternal.")
                return new()
            }
            return when {
                "object" in __input -> ObjectWithEveryNullableTypeUnionExternalObject.fromJsonElement(__input, instancePath)
                "array" in __input -> ObjectWithEveryNullableTypeUnionExternalArray.fromJsonElement(__input, instancePath)
                "boolean" in __input -> ObjectWithEveryNullableTypeUnionExternalBoolean.fromJsonElement(__input, instancePath)
                "nullable-timestamp" in __input -> ObjectWithEveryNullableTypeUnionExternalNullableTimestamp.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class ObjectWithEveryNullableTypeUnionExternalObject(
    val value: ObjectWithEveryNullableTypeUnionExternalObjectValue,
) : ObjectWithEveryNullableTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"object\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionExternalObject.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionExternalObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionExternalObject {
            return ObjectWithEveryNullableTypeUnionExternalObject(
                value = ObjectWithEveryNullableTypeUnionExternalObjectValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionExternalObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionExternalObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionExternalObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionExternalObject.")
                return new()
            }
            val value: ObjectWithEveryNullableTypeUnionExternalObjectValue = when (__input.jsonObject["object"]) {
                is JsonObject -> ObjectWithEveryNullableTypeUnionExternalObjectValue.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> ObjectWithEveryNullableTypeUnionExternalObjectValue.new()
            }
            return ObjectWithEveryNullableTypeUnionExternalObject(
                value,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionExternalArray(
    val value: MutableList<String>,
) : ObjectWithEveryNullableTypeUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionExternalArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionExternalArray> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionExternalArray {
            return ObjectWithEveryNullableTypeUnionExternalArray(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionExternalArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionExternalArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionExternalArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionExternalArray.")
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
            return ObjectWithEveryNullableTypeUnionExternalArray(
                value,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionExternalBoolean(
    val value: Boolean,
) : ObjectWithEveryNullableTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"boolean\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionExternalBoolean.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionExternalBoolean> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionExternalBoolean {
            return ObjectWithEveryNullableTypeUnionExternalBoolean(
                value = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionExternalBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionExternalBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionExternalBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionExternalBoolean.")
                return new()
            }
            val value: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return ObjectWithEveryNullableTypeUnionExternalBoolean(
                value,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionExternalNullableTimestamp(
    val value: Instant?,
) : ObjectWithEveryNullableTypeUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionExternalNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionExternalNullableTimestamp> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionExternalNullableTimestamp {
            return ObjectWithEveryNullableTypeUnionExternalNullableTimestamp(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionExternalNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionExternalNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionExternalNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionExternalNullableTimestamp.")
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
            return ObjectWithEveryNullableTypeUnionExternalNullableTimestamp(
                value,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionExternalObjectValue(
    val id: String,
    val content: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionExternalObjectValue> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionExternalObjectValue {
            return ObjectWithEveryNullableTypeUnionExternalObjectValue(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionExternalObjectValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionExternalObjectValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionExternalObjectValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionExternalObjectValue.")
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
            return ObjectWithEveryNullableTypeUnionExternalObjectValue(
                id,
                content,
            )
        }
    }
}

sealed interface ObjectWithEveryNullableTypeUnionInternal : TestClientModel {
    val shape: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionInternal> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionInternal {
            return ObjectWithEveryNullableTypeUnionInternalRectangle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "rectangle" -> ObjectWithEveryNullableTypeUnionInternalRectangle.fromJsonElement(__input, instancePath)
                    "circle" -> ObjectWithEveryNullableTypeUnionInternalCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryNullableTypeUnionInternalRectangle(
    val width: Double,
    val height: Double,
) : ObjectWithEveryNullableTypeUnionInternal {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionInternalRectangle> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionInternalRectangle {
            return ObjectWithEveryNullableTypeUnionInternalRectangle(
                width = 0.0,
                height = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionInternalRectangle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionInternalRectangle {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionInternalRectangle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionInternalRectangle.")
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
            return ObjectWithEveryNullableTypeUnionInternalRectangle(
                width,
                height,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionInternalCircle(
    val radius: Double,
) : ObjectWithEveryNullableTypeUnionInternal {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionInternalCircle> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionInternalCircle {
            return ObjectWithEveryNullableTypeUnionInternalCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionInternalCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionInternalCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionInternalCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionInternalCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return ObjectWithEveryNullableTypeUnionInternalCircle(
                radius,
            )
        }
    }
}

sealed interface ObjectWithEveryNullableTypeUnionAdjacent : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionAdjacent> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionAdjacent {
            return ObjectWithEveryNullableTypeUnionAdjacentObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "object" -> ObjectWithEveryNullableTypeUnionAdjacentObject.fromJsonElement(__input, instancePath)
                    "array" -> ObjectWithEveryNullableTypeUnionAdjacentArray.fromJsonElement(__input, instancePath)
                    "boolean" -> ObjectWithEveryNullableTypeUnionAdjacentBoolean.fromJsonElement(__input, instancePath)
                    "nullable-timestamp" -> ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryNullableTypeUnionAdjacentObject(
    val data: ObjectWithEveryNullableTypeUnionAdjacentObjectData,
) : ObjectWithEveryNullableTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionAdjacentObject.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionAdjacentObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionAdjacentObject {
            return ObjectWithEveryNullableTypeUnionAdjacentObject(
                data = ObjectWithEveryNullableTypeUnionAdjacentObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionAdjacentObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionAdjacentObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionAdjacentObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionAdjacentObject.")
                return new()
            }
            val data: ObjectWithEveryNullableTypeUnionAdjacentObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryNullableTypeUnionAdjacentObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryNullableTypeUnionAdjacentObjectData.new()
            }
            return ObjectWithEveryNullableTypeUnionAdjacentObject(
                data,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionAdjacentArray(
    val data: MutableList<String>,
) : ObjectWithEveryNullableTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionAdjacentArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionAdjacentArray> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionAdjacentArray {
            return ObjectWithEveryNullableTypeUnionAdjacentArray(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionAdjacentArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionAdjacentArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionAdjacentArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionAdjacentArray.")
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
            return ObjectWithEveryNullableTypeUnionAdjacentArray(
                data,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionAdjacentBoolean(
    val data: Boolean,
) : ObjectWithEveryNullableTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionAdjacentBoolean.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionAdjacentBoolean> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionAdjacentBoolean {
            return ObjectWithEveryNullableTypeUnionAdjacentBoolean(
                data = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionAdjacentBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionAdjacentBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionAdjacentBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionAdjacentBoolean.")
                return new()
            }
            val data: Boolean = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return ObjectWithEveryNullableTypeUnionAdjacentBoolean(
                data,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp(
    val data: Instant?,
) : ObjectWithEveryNullableTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp {
            return ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp.")
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
            return ObjectWithEveryNullableTypeUnionAdjacentNullableTimestamp(
                data,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeUnionAdjacentObjectData(
    val id: String,
    val content: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeUnionAdjacentObjectData> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeUnionAdjacentObjectData {
            return ObjectWithEveryNullableTypeUnionAdjacentObjectData(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeUnionAdjacentObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeUnionAdjacentObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeUnionAdjacentObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeUnionAdjacentObjectData.")
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
            return ObjectWithEveryNullableTypeUnionAdjacentObjectData(
                id,
                content,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeNestedObject(
    val id: String?,
    val timestamp: Instant?,
    val data: ObjectWithEveryNullableTypeNestedObjectData?,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeNestedObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeNestedObject {
            return ObjectWithEveryNullableTypeNestedObject(
                id = null,
                timestamp = null,
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeNestedObject.")
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
            val data: ObjectWithEveryNullableTypeNestedObjectData? = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryNullableTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> null
            }
            return ObjectWithEveryNullableTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeNestedObjectData(
    val id: String?,
    val timestamp: Instant?,
    val data: ObjectWithEveryNullableTypeNestedObjectDataData?,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeNestedObjectData> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeNestedObjectData {
            return ObjectWithEveryNullableTypeNestedObjectData(
                id = null,
                timestamp = null,
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeNestedObjectData.")
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
            val data: ObjectWithEveryNullableTypeNestedObjectDataData? = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryNullableTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> null
            }
            return ObjectWithEveryNullableTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeNestedObjectDataData(
    val id: String?,
    val timestamp: Instant?,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeNestedObjectDataData {
            return ObjectWithEveryNullableTypeNestedObjectDataData(
                id = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeNestedObjectDataData.")
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
            return ObjectWithEveryNullableTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeNestedArrayElementElement(
    val id: String?,
    val timestamp: Instant?,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeNestedArrayElementElement {
            return ObjectWithEveryNullableTypeNestedArrayElementElement(
                id = null,
                timestamp = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeNestedArrayElementElement.")
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
            return ObjectWithEveryNullableTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}

data class ObjectWithPascalCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val externalEvent: ObjectWithPascalCaseKeysExternalEvent?,
    val internalEvent: ObjectWithPascalCaseKeysInternalEvent,
    val adjacentEvent: ObjectWithPascalCaseKeysAdjacentEvent,
    val emailAddress: String? = null,
    val isAdmin: Boolean? = null,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/InternalEvent.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/AdjacentEvent.")
        if (emailAddress != null) {
            queryParts.add("EmailAddress=${__encodeQueryValue(emailAddress)}")
        }
        if (isAdmin != null) {
            queryParts.add("IsAdmin=$isAdmin")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeys> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeys {
            return ObjectWithPascalCaseKeys(
                createdAt = Instant.EPOCH,
                displayName = "",
                phoneNumber = null,
                externalEvent = null,
                internalEvent = ObjectWithPascalCaseKeysInternalEvent.new(),
                adjacentEvent = ObjectWithPascalCaseKeysAdjacentEvent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeys {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeys {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeys.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeys.")
                return new()
            }
            val createdAt: Instant = when (__input.jsonObject["CreatedAt"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["CreatedAt"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["CreatedAt"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val displayName: String = when (__input.jsonObject["DisplayName"]) {
                is JsonPrimitive -> __input.jsonObject["DisplayName"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val phoneNumber: String? = when (__input.jsonObject["PhoneNumber"]) {
                is JsonPrimitive -> __input.jsonObject["PhoneNumber"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val externalEvent: ObjectWithPascalCaseKeysExternalEvent? = when (__input.jsonObject["ExternalEvent"]) {
                is JsonObject -> ObjectWithPascalCaseKeysExternalEvent.fromJsonElement(
                    __input.jsonObject["ExternalEvent"]!!,
                    "$instancePath/ExternalEvent",
                )

                else -> null
            }
            val internalEvent: ObjectWithPascalCaseKeysInternalEvent = when (__input.jsonObject["InternalEvent"]) {
                is JsonObject -> ObjectWithPascalCaseKeysInternalEvent.fromJsonElement(
                    __input.jsonObject["InternalEvent"]!!,
                    "$instancePath/InternalEvent",
                )

                else -> ObjectWithPascalCaseKeysInternalEvent.new()
            }
            val adjacentEvent: ObjectWithPascalCaseKeysAdjacentEvent = when (__input.jsonObject["AdjacentEvent"]) {
                is JsonObject -> ObjectWithPascalCaseKeysAdjacentEvent.fromJsonElement(
                    __input.jsonObject["AdjacentEvent"]!!,
                    "$instancePath/AdjacentEvent",
                )

                else -> ObjectWithPascalCaseKeysAdjacentEvent.new()
            }
            val emailAddress: String? = when (__input.jsonObject["EmailAddress"]) {
                is JsonPrimitive -> __input.jsonObject["EmailAddress"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val isAdmin: Boolean? = when (__input.jsonObject["IsAdmin"]) {
                is JsonPrimitive -> __input.jsonObject["IsAdmin"]!!.jsonPrimitive.booleanOrNull
                else -> null
            }
            return ObjectWithPascalCaseKeys(
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

sealed interface ObjectWithPascalCaseKeysExternalEvent : TestClientModel {
    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEvent> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEvent {
            return ObjectWithPascalCaseKeysExternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEvent.")
                return new()
            }
            return when {
                "UserCreated" in __input -> ObjectWithPascalCaseKeysExternalEventUserCreated.fromJsonElement(__input, instancePath)
                "UserUpdated" in __input -> ObjectWithPascalCaseKeysExternalEventUserUpdated.fromJsonElement(__input, instancePath)
                "UserDeleted" in __input -> ObjectWithPascalCaseKeysExternalEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class ObjectWithPascalCaseKeysExternalEventUserCreated(
    val value: ObjectWithPascalCaseKeysExternalEventUserCreatedValue,
) : ObjectWithPascalCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserCreated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithPascalCaseKeysExternalEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEventUserCreated {
            return ObjectWithPascalCaseKeysExternalEventUserCreated(
                value = ObjectWithPascalCaseKeysExternalEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEventUserCreated.")
                return new()
            }
            val value: ObjectWithPascalCaseKeysExternalEventUserCreatedValue = when (__input.jsonObject["UserCreated"]) {
                is JsonObject -> ObjectWithPascalCaseKeysExternalEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["UserCreated"]!!,
                    "$instancePath/UserCreated",
                )

                else -> ObjectWithPascalCaseKeysExternalEventUserCreatedValue.new()
            }
            return ObjectWithPascalCaseKeysExternalEventUserCreated(
                value,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysExternalEventUserUpdated(
    val value: ObjectWithPascalCaseKeysExternalEventUserUpdatedValue,
) : ObjectWithPascalCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserUpdated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithPascalCaseKeysExternalEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEventUserUpdated {
            return ObjectWithPascalCaseKeysExternalEventUserUpdated(
                value = ObjectWithPascalCaseKeysExternalEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEventUserUpdated.")
                return new()
            }
            val value: ObjectWithPascalCaseKeysExternalEventUserUpdatedValue = when (__input.jsonObject["UserUpdated"]) {
                is JsonObject -> ObjectWithPascalCaseKeysExternalEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["UserUpdated"]!!,
                    "$instancePath/UserUpdated",
                )

                else -> ObjectWithPascalCaseKeysExternalEventUserUpdatedValue.new()
            }
            return ObjectWithPascalCaseKeysExternalEventUserUpdated(
                value,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysExternalEventUserDeleted(
    val value: ObjectWithPascalCaseKeysExternalEventUserDeletedValue,
) : ObjectWithPascalCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"UserDeleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithPascalCaseKeysExternalEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEventUserDeleted> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEventUserDeleted {
            return ObjectWithPascalCaseKeysExternalEventUserDeleted(
                value = ObjectWithPascalCaseKeysExternalEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEventUserDeleted.")
                return new()
            }
            val value: ObjectWithPascalCaseKeysExternalEventUserDeletedValue = when (__input.jsonObject["UserDeleted"]) {
                is JsonObject -> ObjectWithPascalCaseKeysExternalEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["UserDeleted"]!!,
                    "$instancePath/UserDeleted",
                )

                else -> ObjectWithPascalCaseKeysExternalEventUserDeletedValue.new()
            }
            return ObjectWithPascalCaseKeysExternalEventUserDeleted(
                value,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysExternalEventUserCreatedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEventUserCreatedValue> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEventUserCreatedValue {
            return ObjectWithPascalCaseKeysExternalEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithPascalCaseKeysExternalEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysExternalEventUserUpdatedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
            return ObjectWithPascalCaseKeysExternalEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithPascalCaseKeysExternalEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysExternalEventUserDeletedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysExternalEventUserDeletedValue> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysExternalEventUserDeletedValue {
            return ObjectWithPascalCaseKeysExternalEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysExternalEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysExternalEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysExternalEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysExternalEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithPascalCaseKeysExternalEventUserDeletedValue(
                userId,
            )
        }
    }
}

sealed interface ObjectWithPascalCaseKeysInternalEvent : TestClientModel {
    val eventType: String

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysInternalEvent> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysInternalEvent {
            return ObjectWithPascalCaseKeysInternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysInternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysInternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysInternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysInternalEvent.")
                return new()
            }
            return when (__input.jsonObject["EventType"]) {
                is JsonPrimitive -> when (__input.jsonObject["EventType"]!!.jsonPrimitive.contentOrNull) {
                    "UserCreated" -> ObjectWithPascalCaseKeysInternalEventUserCreated.fromJsonElement(__input, instancePath)
                    "UserUpdated" -> ObjectWithPascalCaseKeysInternalEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithPascalCaseKeysInternalEventUserCreated(
    val userId: String,
) : ObjectWithPascalCaseKeysInternalEvent {
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

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysInternalEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysInternalEventUserCreated {
            return ObjectWithPascalCaseKeysInternalEventUserCreated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysInternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysInternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysInternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysInternalEventUserCreated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithPascalCaseKeysInternalEventUserCreated(
                userId,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysInternalEventUserUpdated(
    val userId: String,
    val updatedAt: Instant? = null,
) : ObjectWithPascalCaseKeysInternalEvent {
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

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysInternalEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysInternalEventUserUpdated {
            return ObjectWithPascalCaseKeysInternalEventUserUpdated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysInternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysInternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysInternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysInternalEventUserUpdated.")
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
            return ObjectWithPascalCaseKeysInternalEventUserUpdated(
                userId,
                updatedAt,
            )
        }
    }
}

sealed interface ObjectWithPascalCaseKeysAdjacentEvent : TestClientModel {
    val eventType: String

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysAdjacentEvent> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysAdjacentEvent {
            return ObjectWithPascalCaseKeysAdjacentEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysAdjacentEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysAdjacentEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysAdjacentEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysAdjacentEvent.")
                return new()
            }
            return when (__input.jsonObject["EventType"]) {
                is JsonPrimitive -> when (__input.jsonObject["EventType"]!!.jsonPrimitive.contentOrNull) {
                    "UserCreated" -> ObjectWithPascalCaseKeysAdjacentEventUserCreated.fromJsonElement(__input, instancePath)
                    "UserUpdated" -> ObjectWithPascalCaseKeysAdjacentEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithPascalCaseKeysAdjacentEventUserCreated(
    val eventData: ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData,
) : ObjectWithPascalCaseKeysAdjacentEvent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithPascalCaseKeysAdjacentEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysAdjacentEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysAdjacentEventUserCreated {
            return ObjectWithPascalCaseKeysAdjacentEventUserCreated(
                eventData = ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysAdjacentEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysAdjacentEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysAdjacentEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysAdjacentEventUserCreated.")
                return new()
            }
            val eventData: ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData = when (__input.jsonObject["EventData"]) {
                is JsonObject -> ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement(
                    __input.jsonObject["EventData"]!!,
                    "$instancePath/EventData",
                )

                else -> ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.new()
            }
            return ObjectWithPascalCaseKeysAdjacentEventUserCreated(
                eventData,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysAdjacentEventUserUpdated(
    val eventData: String,
) : ObjectWithPascalCaseKeysAdjacentEvent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithPascalCaseKeysAdjacentEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysAdjacentEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysAdjacentEventUserUpdated {
            return ObjectWithPascalCaseKeysAdjacentEventUserUpdated(
                eventData = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysAdjacentEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysAdjacentEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysAdjacentEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysAdjacentEventUserUpdated.")
                return new()
            }
            val eventData: String = when (__input.jsonObject["EventData"]) {
                is JsonPrimitive -> __input.jsonObject["EventData"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithPascalCaseKeysAdjacentEventUserUpdated(
                eventData,
            )
        }
    }
}

data class ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData> {
        @JvmStatic
        override fun new(): ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
            return ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData.")
                return new()
            }
            val userId: String = when (__input.jsonObject["UserId"]) {
                is JsonPrimitive -> __input.jsonObject["UserId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData(
                userId,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
    val externalEvent: ObjectWithSnakeCaseKeysExternalEvent?,
    val internalEvent: ObjectWithSnakeCaseKeysInternalEvent,
    val adjacentEvent: ObjectWithSnakeCaseKeysAdjacentEvent,
    val emailAddress: String? = null,
    val isAdmin: Boolean? = null,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/internal_event.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/adjacent_event.")
        if (emailAddress != null) {
            queryParts.add("email_address=${__encodeQueryValue(emailAddress)}")
        }
        if (isAdmin != null) {
            queryParts.add("is_admin=$isAdmin")
        }
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeys> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeys {
            return ObjectWithSnakeCaseKeys(
                createdAt = Instant.EPOCH,
                displayName = "",
                phoneNumber = null,
                externalEvent = null,
                internalEvent = ObjectWithSnakeCaseKeysInternalEvent.new(),
                adjacentEvent = ObjectWithSnakeCaseKeysAdjacentEvent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeys {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeys {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeys.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeys.")
                return new()
            }
            val createdAt: Instant = when (__input.jsonObject["created_at"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["created_at"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["created_at"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val displayName: String = when (__input.jsonObject["display_name"]) {
                is JsonPrimitive -> __input.jsonObject["display_name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val phoneNumber: String? = when (__input.jsonObject["phone_number"]) {
                is JsonPrimitive -> __input.jsonObject["phone_number"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val externalEvent: ObjectWithSnakeCaseKeysExternalEvent? = when (__input.jsonObject["external_event"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysExternalEvent.fromJsonElement(
                    __input.jsonObject["external_event"]!!,
                    "$instancePath/external_event",
                )

                else -> null
            }
            val internalEvent: ObjectWithSnakeCaseKeysInternalEvent = when (__input.jsonObject["internal_event"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysInternalEvent.fromJsonElement(
                    __input.jsonObject["internal_event"]!!,
                    "$instancePath/internal_event",
                )

                else -> ObjectWithSnakeCaseKeysInternalEvent.new()
            }
            val adjacentEvent: ObjectWithSnakeCaseKeysAdjacentEvent = when (__input.jsonObject["adjacent_event"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysAdjacentEvent.fromJsonElement(
                    __input.jsonObject["adjacent_event"]!!,
                    "$instancePath/adjacent_event",
                )

                else -> ObjectWithSnakeCaseKeysAdjacentEvent.new()
            }
            val emailAddress: String? = when (__input.jsonObject["email_address"]) {
                is JsonPrimitive -> __input.jsonObject["email_address"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val isAdmin: Boolean? = when (__input.jsonObject["is_admin"]) {
                is JsonPrimitive -> __input.jsonObject["is_admin"]!!.jsonPrimitive.booleanOrNull
                else -> null
            }
            return ObjectWithSnakeCaseKeys(
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

sealed interface ObjectWithSnakeCaseKeysExternalEvent : TestClientModel {
    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEvent> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEvent {
            return ObjectWithSnakeCaseKeysExternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEvent.")
                return new()
            }
            return when {
                "user_created" in __input -> ObjectWithSnakeCaseKeysExternalEventUserCreated.fromJsonElement(__input, instancePath)
                "user_updated" in __input -> ObjectWithSnakeCaseKeysExternalEventUserUpdated.fromJsonElement(__input, instancePath)
                "user_deleted" in __input -> ObjectWithSnakeCaseKeysExternalEventUserDeleted.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class ObjectWithSnakeCaseKeysExternalEventUserCreated(
    val value: ObjectWithSnakeCaseKeysExternalEventUserCreatedValue,
) : ObjectWithSnakeCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_created\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithSnakeCaseKeysExternalEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEventUserCreated {
            return ObjectWithSnakeCaseKeysExternalEventUserCreated(
                value = ObjectWithSnakeCaseKeysExternalEventUserCreatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEventUserCreated.")
                return new()
            }
            val value: ObjectWithSnakeCaseKeysExternalEventUserCreatedValue = when (__input.jsonObject["user_created"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysExternalEventUserCreatedValue.fromJsonElement(
                    __input.jsonObject["user_created"]!!,
                    "$instancePath/user_created",
                )

                else -> ObjectWithSnakeCaseKeysExternalEventUserCreatedValue.new()
            }
            return ObjectWithSnakeCaseKeysExternalEventUserCreated(
                value,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysExternalEventUserUpdated(
    val value: ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue,
) : ObjectWithSnakeCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_updated\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithSnakeCaseKeysExternalEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEventUserUpdated {
            return ObjectWithSnakeCaseKeysExternalEventUserUpdated(
                value = ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEventUserUpdated.")
                return new()
            }
            val value: ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue = when (__input.jsonObject["user_updated"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.fromJsonElement(
                    __input.jsonObject["user_updated"]!!,
                    "$instancePath/user_updated",
                )

                else -> ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.new()
            }
            return ObjectWithSnakeCaseKeysExternalEventUserUpdated(
                value,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysExternalEventUserDeleted(
    val value: ObjectWithSnakeCaseKeysExternalEventUserDeletedValue,
) : ObjectWithSnakeCaseKeysExternalEvent {
    override fun toJson(): String {
        var output = "{"
        output += "\"user_deleted\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithSnakeCaseKeysExternalEventUserDeleted.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEventUserDeleted> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEventUserDeleted {
            return ObjectWithSnakeCaseKeysExternalEventUserDeleted(
                value = ObjectWithSnakeCaseKeysExternalEventUserDeletedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEventUserDeleted {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEventUserDeleted {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEventUserDeleted.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEventUserDeleted.")
                return new()
            }
            val value: ObjectWithSnakeCaseKeysExternalEventUserDeletedValue = when (__input.jsonObject["user_deleted"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysExternalEventUserDeletedValue.fromJsonElement(
                    __input.jsonObject["user_deleted"]!!,
                    "$instancePath/user_deleted",
                )

                else -> ObjectWithSnakeCaseKeysExternalEventUserDeletedValue.new()
            }
            return ObjectWithSnakeCaseKeysExternalEventUserDeleted(
                value,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysExternalEventUserCreatedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEventUserCreatedValue> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
            return ObjectWithSnakeCaseKeysExternalEventUserCreatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEventUserCreatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEventUserCreatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithSnakeCaseKeysExternalEventUserCreatedValue(
                userId,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
            return ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue(
                userId,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysExternalEventUserDeletedValue(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysExternalEventUserDeletedValue> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
            return ObjectWithSnakeCaseKeysExternalEventUserDeletedValue(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysExternalEventUserDeletedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysExternalEventUserDeletedValue.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithSnakeCaseKeysExternalEventUserDeletedValue(
                userId,
            )
        }
    }
}

sealed interface ObjectWithSnakeCaseKeysInternalEvent : TestClientModel {
    val eventType: String

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysInternalEvent> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysInternalEvent {
            return ObjectWithSnakeCaseKeysInternalEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysInternalEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysInternalEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysInternalEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysInternalEvent.")
                return new()
            }
            return when (__input.jsonObject["event_type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event_type"]!!.jsonPrimitive.contentOrNull) {
                    "user_created" -> ObjectWithSnakeCaseKeysInternalEventUserCreated.fromJsonElement(__input, instancePath)
                    "user_updated" -> ObjectWithSnakeCaseKeysInternalEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithSnakeCaseKeysInternalEventUserCreated(
    val userId: String,
) : ObjectWithSnakeCaseKeysInternalEvent {
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

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysInternalEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysInternalEventUserCreated {
            return ObjectWithSnakeCaseKeysInternalEventUserCreated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysInternalEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysInternalEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysInternalEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysInternalEventUserCreated.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithSnakeCaseKeysInternalEventUserCreated(
                userId,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysInternalEventUserUpdated(
    val userId: String,
    val updatedAt: Instant? = null,
) : ObjectWithSnakeCaseKeysInternalEvent {
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

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysInternalEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysInternalEventUserUpdated {
            return ObjectWithSnakeCaseKeysInternalEventUserUpdated(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysInternalEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysInternalEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysInternalEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysInternalEventUserUpdated.")
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
            return ObjectWithSnakeCaseKeysInternalEventUserUpdated(
                userId,
                updatedAt,
            )
        }
    }
}

sealed interface ObjectWithSnakeCaseKeysAdjacentEvent : TestClientModel {
    val eventType: String

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysAdjacentEvent> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysAdjacentEvent {
            return ObjectWithSnakeCaseKeysAdjacentEventUserCreated.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysAdjacentEvent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysAdjacentEvent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysAdjacentEvent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysAdjacentEvent.")
                return new()
            }
            return when (__input.jsonObject["event_type"]) {
                is JsonPrimitive -> when (__input.jsonObject["event_type"]!!.jsonPrimitive.contentOrNull) {
                    "user_created" -> ObjectWithSnakeCaseKeysAdjacentEventUserCreated.fromJsonElement(__input, instancePath)
                    "user_updated" -> ObjectWithSnakeCaseKeysAdjacentEventUserUpdated.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithSnakeCaseKeysAdjacentEventUserCreated(
    val eventData: ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData,
) : ObjectWithSnakeCaseKeysAdjacentEvent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithSnakeCaseKeysAdjacentEventUserCreated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysAdjacentEventUserCreated> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysAdjacentEventUserCreated {
            return ObjectWithSnakeCaseKeysAdjacentEventUserCreated(
                eventData = ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysAdjacentEventUserCreated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysAdjacentEventUserCreated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysAdjacentEventUserCreated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysAdjacentEventUserCreated.")
                return new()
            }
            val eventData: ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData = when (__input.jsonObject["event_data"]) {
                is JsonObject -> ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement(
                    __input.jsonObject["event_data"]!!,
                    "$instancePath/event_data",
                )

                else -> ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.new()
            }
            return ObjectWithSnakeCaseKeysAdjacentEventUserCreated(
                eventData,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysAdjacentEventUserUpdated(
    val eventData: String,
) : ObjectWithSnakeCaseKeysAdjacentEvent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithSnakeCaseKeysAdjacentEventUserUpdated.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysAdjacentEventUserUpdated> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysAdjacentEventUserUpdated {
            return ObjectWithSnakeCaseKeysAdjacentEventUserUpdated(
                eventData = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysAdjacentEventUserUpdated {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysAdjacentEventUserUpdated {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysAdjacentEventUserUpdated.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysAdjacentEventUserUpdated.")
                return new()
            }
            val eventData: String = when (__input.jsonObject["event_data"]) {
                is JsonPrimitive -> __input.jsonObject["event_data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithSnakeCaseKeysAdjacentEventUserUpdated(
                eventData,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData> {
        @JvmStatic
        override fun new(): ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
            return ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData.")
                return new()
            }
            val userId: String = when (__input.jsonObject["user_id"]) {
                is JsonPrimitive -> __input.jsonObject["user_id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(
                userId,
            )
        }
    }
}

data class ObjectWithEveryOptionalType(
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
    val enumerator: ObjectWithEveryOptionalTypeEnumerator? = null,
    val array: MutableList<Boolean>? = null,
    val `object`: ObjectWithEveryOptionalTypeObject? = null,
    val record: MutableMap<String, ULong>? = null,
    val unionExternal: ObjectWithEveryOptionalTypeUnionExternal? = null,
    val unionInternal: ObjectWithEveryOptionalTypeUnionInternal? = null,
    val unionAdjacent: ObjectWithEveryOptionalTypeUnionAdjacent? = null,
    val nestedObject: ObjectWithEveryOptionalTypeNestedObject? = null,
    val nestedArray: MutableList<MutableList<ObjectWithEveryOptionalTypeNestedArrayElementElement>>? = null,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionInternal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionAdjacent.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedObject.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedArray.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalType> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalType {
            return ObjectWithEveryOptionalType()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalType {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalType.")
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
            val enumerator: ObjectWithEveryOptionalTypeEnumerator? = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> null
                is JsonPrimitive -> ObjectWithEveryOptionalTypeEnumerator.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
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
            val `object`: ObjectWithEveryOptionalTypeObject? = when (__input.jsonObject["object"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeObject.fromJsonElement(
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
            val unionExternal: ObjectWithEveryOptionalTypeUnionExternal? = when (__input.jsonObject["unionExternal"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeUnionExternal.fromJsonElement(
                    __input.jsonObject["unionExternal"]!!,
                    "$instancePath/unionExternal",
                )

                else -> null
            }
            val unionInternal: ObjectWithEveryOptionalTypeUnionInternal? = when (__input.jsonObject["unionInternal"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeUnionInternal.fromJsonElement(
                    __input.jsonObject["unionInternal"]!!,
                    "$instancePath/unionInternal",
                )

                else -> null
            }
            val unionAdjacent: ObjectWithEveryOptionalTypeUnionAdjacent? = when (__input.jsonObject["unionAdjacent"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeUnionAdjacent.fromJsonElement(
                    __input.jsonObject["unionAdjacent"]!!,
                    "$instancePath/unionAdjacent",
                )

                else -> null
            }
            val nestedObject: ObjectWithEveryOptionalTypeNestedObject? = when (__input.jsonObject["nestedObject"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeNestedObject.fromJsonElement(
                    __input.jsonObject["nestedObject"]!!,
                    "$instancePath/nestedObject",
                )

                else -> null
            }
            val nestedArray: MutableList<MutableList<ObjectWithEveryOptionalTypeNestedArrayElementElement>>? = when (__input.jsonObject["nestedArray"]) {
                is JsonArray -> {
                    val __value: MutableList<MutableList<ObjectWithEveryOptionalTypeNestedArrayElementElement>> = mutableListOf()
                    for (__element in __input.jsonObject["nestedArray"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonArray -> {
                                    val __value: MutableList<ObjectWithEveryOptionalTypeNestedArrayElementElement> = mutableListOf()
                                    for (__element in __element!!.jsonArray) {
                                        __value.add(
                                            when (__element) {
                                                is JsonObject -> ObjectWithEveryOptionalTypeNestedArrayElementElement.fromJsonElement(
                                                    __element!!,
                                                    "$instancePath/undefined",
                                                )

                                                else -> ObjectWithEveryOptionalTypeNestedArrayElementElement.new()
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
            return ObjectWithEveryOptionalType(
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

enum class ObjectWithEveryOptionalTypeEnumerator {
    A,
    B,
    C;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
            C -> "C"
        }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeEnumerator> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeEnumerator {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeEnumerator {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                C.serialValue -> C
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeEnumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeEnumerator.")
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

data class ObjectWithEveryOptionalTypeObject(
    val string: String,
    val boolean: Boolean,
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeObject {
            return ObjectWithEveryOptionalTypeObject(
                string = "",
                boolean = false,
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeObject.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return ObjectWithEveryOptionalTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}

sealed interface ObjectWithEveryOptionalTypeUnionExternal : TestClientModel {
    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionExternal> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionExternal {
            return ObjectWithEveryOptionalTypeUnionExternalObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionExternal.")
                return new()
            }
            return when {
                "object" in __input -> ObjectWithEveryOptionalTypeUnionExternalObject.fromJsonElement(__input, instancePath)
                "array" in __input -> ObjectWithEveryOptionalTypeUnionExternalArray.fromJsonElement(__input, instancePath)
                "boolean" in __input -> ObjectWithEveryOptionalTypeUnionExternalBoolean.fromJsonElement(__input, instancePath)
                "nullable-timestamp" in __input -> ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionExternalObject(
    val value: ObjectWithEveryOptionalTypeUnionExternalObjectValue,
) : ObjectWithEveryOptionalTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"object\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionExternalObject.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionExternalObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionExternalObject {
            return ObjectWithEveryOptionalTypeUnionExternalObject(
                value = ObjectWithEveryOptionalTypeUnionExternalObjectValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionExternalObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionExternalObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionExternalObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionExternalObject.")
                return new()
            }
            val value: ObjectWithEveryOptionalTypeUnionExternalObjectValue = when (__input.jsonObject["object"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeUnionExternalObjectValue.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> ObjectWithEveryOptionalTypeUnionExternalObjectValue.new()
            }
            return ObjectWithEveryOptionalTypeUnionExternalObject(
                value,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionExternalArray(
    val value: MutableList<String>,
) : ObjectWithEveryOptionalTypeUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionExternalArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionExternalArray> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionExternalArray {
            return ObjectWithEveryOptionalTypeUnionExternalArray(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionExternalArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionExternalArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionExternalArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionExternalArray.")
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
            return ObjectWithEveryOptionalTypeUnionExternalArray(
                value,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionExternalBoolean(
    val value: Boolean,
) : ObjectWithEveryOptionalTypeUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"boolean\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionExternalBoolean.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionExternalBoolean> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionExternalBoolean {
            return ObjectWithEveryOptionalTypeUnionExternalBoolean(
                value = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionExternalBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionExternalBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionExternalBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionExternalBoolean.")
                return new()
            }
            val value: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return ObjectWithEveryOptionalTypeUnionExternalBoolean(
                value,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp(
    val value: Instant?,
) : ObjectWithEveryOptionalTypeUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp {
            return ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp.")
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
            return ObjectWithEveryOptionalTypeUnionExternalNullableTimestamp(
                value,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionExternalObjectValue(
    val id: String,
    val content: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionExternalObjectValue> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionExternalObjectValue {
            return ObjectWithEveryOptionalTypeUnionExternalObjectValue(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionExternalObjectValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionExternalObjectValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionExternalObjectValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionExternalObjectValue.")
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
            return ObjectWithEveryOptionalTypeUnionExternalObjectValue(
                id,
                content,
            )
        }
    }
}

sealed interface ObjectWithEveryOptionalTypeUnionInternal : TestClientModel {
    val shape: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionInternal> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionInternal {
            return ObjectWithEveryOptionalTypeUnionInternalRectangle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "rectangle" -> ObjectWithEveryOptionalTypeUnionInternalRectangle.fromJsonElement(__input, instancePath)
                    "circle" -> ObjectWithEveryOptionalTypeUnionInternalCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionInternalRectangle(
    val width: Double,
    val height: Double,
) : ObjectWithEveryOptionalTypeUnionInternal {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionInternalRectangle> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionInternalRectangle {
            return ObjectWithEveryOptionalTypeUnionInternalRectangle(
                width = 0.0,
                height = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionInternalRectangle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionInternalRectangle {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionInternalRectangle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionInternalRectangle.")
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
            return ObjectWithEveryOptionalTypeUnionInternalRectangle(
                width,
                height,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionInternalCircle(
    val radius: Double,
) : ObjectWithEveryOptionalTypeUnionInternal {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionInternalCircle> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionInternalCircle {
            return ObjectWithEveryOptionalTypeUnionInternalCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionInternalCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionInternalCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionInternalCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionInternalCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return ObjectWithEveryOptionalTypeUnionInternalCircle(
                radius,
            )
        }
    }
}

sealed interface ObjectWithEveryOptionalTypeUnionAdjacent : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionAdjacent> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionAdjacent {
            return ObjectWithEveryOptionalTypeUnionAdjacentObject.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "object" -> ObjectWithEveryOptionalTypeUnionAdjacentObject.fromJsonElement(__input, instancePath)
                    "array" -> ObjectWithEveryOptionalTypeUnionAdjacentArray.fromJsonElement(__input, instancePath)
                    "boolean" -> ObjectWithEveryOptionalTypeUnionAdjacentBoolean.fromJsonElement(__input, instancePath)
                    "nullable-timestamp" -> ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionAdjacentObject(
    val data: ObjectWithEveryOptionalTypeUnionAdjacentObjectData,
) : ObjectWithEveryOptionalTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionAdjacentObject.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionAdjacentObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionAdjacentObject {
            return ObjectWithEveryOptionalTypeUnionAdjacentObject(
                data = ObjectWithEveryOptionalTypeUnionAdjacentObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionAdjacentObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionAdjacentObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionAdjacentObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionAdjacentObject.")
                return new()
            }
            val data: ObjectWithEveryOptionalTypeUnionAdjacentObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeUnionAdjacentObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryOptionalTypeUnionAdjacentObjectData.new()
            }
            return ObjectWithEveryOptionalTypeUnionAdjacentObject(
                data,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionAdjacentArray(
    val data: MutableList<String>,
) : ObjectWithEveryOptionalTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionAdjacentArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionAdjacentArray> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionAdjacentArray {
            return ObjectWithEveryOptionalTypeUnionAdjacentArray(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionAdjacentArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionAdjacentArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionAdjacentArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionAdjacentArray.")
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
            return ObjectWithEveryOptionalTypeUnionAdjacentArray(
                data,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionAdjacentBoolean(
    val data: Boolean,
) : ObjectWithEveryOptionalTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionAdjacentBoolean.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionAdjacentBoolean> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionAdjacentBoolean {
            return ObjectWithEveryOptionalTypeUnionAdjacentBoolean(
                data = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionAdjacentBoolean {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionAdjacentBoolean {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionAdjacentBoolean.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionAdjacentBoolean.")
                return new()
            }
            val data: Boolean = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return ObjectWithEveryOptionalTypeUnionAdjacentBoolean(
                data,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp(
    val data: Instant?,
) : ObjectWithEveryOptionalTypeUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.")
        return ""
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp {
            return ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp.")
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
            return ObjectWithEveryOptionalTypeUnionAdjacentNullableTimestamp(
                data,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeUnionAdjacentObjectData(
    val id: String,
    val content: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeUnionAdjacentObjectData> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeUnionAdjacentObjectData {
            return ObjectWithEveryOptionalTypeUnionAdjacentObjectData(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeUnionAdjacentObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeUnionAdjacentObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeUnionAdjacentObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeUnionAdjacentObjectData.")
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
            return ObjectWithEveryOptionalTypeUnionAdjacentObjectData(
                id,
                content,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeNestedObject(
    val id: String,
    val timestamp: Instant,
    val data: ObjectWithEveryOptionalTypeNestedObjectData,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeNestedObject> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeNestedObject {
            return ObjectWithEveryOptionalTypeNestedObject(
                id = "",
                timestamp = Instant.EPOCH,
                data = ObjectWithEveryOptionalTypeNestedObjectData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeNestedObject.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val data: ObjectWithEveryOptionalTypeNestedObjectData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeNestedObjectData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryOptionalTypeNestedObjectData.new()
            }
            return ObjectWithEveryOptionalTypeNestedObject(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeNestedObjectData(
    val id: String,
    val timestamp: Instant,
    val data: ObjectWithEveryOptionalTypeNestedObjectDataData,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeNestedObjectData> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeNestedObjectData {
            return ObjectWithEveryOptionalTypeNestedObjectData(
                id = "",
                timestamp = Instant.EPOCH,
                data = ObjectWithEveryOptionalTypeNestedObjectDataData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeNestedObjectData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeNestedObjectData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeNestedObjectData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeNestedObjectData.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val data: ObjectWithEveryOptionalTypeNestedObjectDataData = when (__input.jsonObject["data"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeNestedObjectDataData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> ObjectWithEveryOptionalTypeNestedObjectDataData.new()
            }
            return ObjectWithEveryOptionalTypeNestedObjectData(
                id,
                timestamp,
                data,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeNestedObjectDataData(
    val id: String,
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeNestedObjectDataData> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeNestedObjectDataData {
            return ObjectWithEveryOptionalTypeNestedObjectDataData(
                id = "",
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeNestedObjectDataData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeNestedObjectDataData {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeNestedObjectDataData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeNestedObjectDataData.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return ObjectWithEveryOptionalTypeNestedObjectDataData(
                id,
                timestamp,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeNestedArrayElementElement(
    val id: String,
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeNestedArrayElementElement> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeNestedArrayElementElement {
            return ObjectWithEveryOptionalTypeNestedArrayElementElement(
                id = "",
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeNestedArrayElementElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeNestedArrayElementElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeNestedArrayElementElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeNestedArrayElementElement.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return ObjectWithEveryOptionalTypeNestedArrayElementElement(
                id,
                timestamp,
            )
        }
    }
}

data class RecursiveObject(
    val left: RecursiveObject?,
    val right: RecursiveObject?,
    val value: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<RecursiveObject> {
        @JvmStatic
        override fun new(): RecursiveObject {
            return RecursiveObject(
                left = null,
                right = null,
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveObject.")
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
            return RecursiveObject(
                left,
                right,
                value,
            )
        }
    }
}

sealed interface RecursiveUnionAdjacent : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<RecursiveUnionAdjacent> {
        @JvmStatic
        override fun new(): RecursiveUnionAdjacent {
            return RecursiveUnionAdjacentChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "child" -> RecursiveUnionAdjacentChild.fromJsonElement(__input, instancePath)
                    "children" -> RecursiveUnionAdjacentChildren.fromJsonElement(__input, instancePath)
                    "text" -> RecursiveUnionAdjacentText.fromJsonElement(__input, instancePath)
                    "shape" -> RecursiveUnionAdjacentShape.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class RecursiveUnionAdjacentChild(
    val data: RecursiveUnionAdjacent,
) : RecursiveUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionAdjacentChild.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionAdjacentChild> {
        @JvmStatic
        override fun new(): RecursiveUnionAdjacentChild {
            return RecursiveUnionAdjacentChild(
                data = RecursiveUnionAdjacent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionAdjacentChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionAdjacentChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionAdjacentChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionAdjacentChild.")
                return new()
            }
            val data: RecursiveUnionAdjacent = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnionAdjacent.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> RecursiveUnionAdjacent.new()
            }
            return RecursiveUnionAdjacentChild(
                data,
            )
        }
    }
}

data class RecursiveUnionAdjacentChildren(
    val data: MutableList<RecursiveUnionAdjacent>,
) : RecursiveUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionAdjacentChildren.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionAdjacentChildren> {
        @JvmStatic
        override fun new(): RecursiveUnionAdjacentChildren {
            return RecursiveUnionAdjacentChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionAdjacentChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionAdjacentChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionAdjacentChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionAdjacentChildren.")
                return new()
            }
            val data: MutableList<RecursiveUnionAdjacent> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<RecursiveUnionAdjacent> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> RecursiveUnionAdjacent.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> RecursiveUnionAdjacent.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return RecursiveUnionAdjacentChildren(
                data,
            )
        }
    }
}

data class RecursiveUnionAdjacentText(
    val data: String,
) : RecursiveUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionAdjacentText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionAdjacentText> {
        @JvmStatic
        override fun new(): RecursiveUnionAdjacentText {
            return RecursiveUnionAdjacentText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionAdjacentText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionAdjacentText {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionAdjacentText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionAdjacentText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return RecursiveUnionAdjacentText(
                data,
            )
        }
    }
}

data class RecursiveUnionAdjacentShape(
    val data: RecursiveUnionAdjacentShapeData,
) : RecursiveUnionAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionAdjacentShape.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionAdjacentShape> {
        @JvmStatic
        override fun new(): RecursiveUnionAdjacentShape {
            return RecursiveUnionAdjacentShape(
                data = RecursiveUnionAdjacentShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionAdjacentShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionAdjacentShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionAdjacentShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionAdjacentShape.")
                return new()
            }
            val data: RecursiveUnionAdjacentShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnionAdjacentShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> RecursiveUnionAdjacentShapeData.new()
            }
            return RecursiveUnionAdjacentShape(
                data,
            )
        }
    }
}

/**
 * Shape node
 */
data class RecursiveUnionAdjacentShapeData(
    val width: Double,
    val height: Double,
    val color: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionAdjacentShapeData> {
        @JvmStatic
        override fun new(): RecursiveUnionAdjacentShapeData {
            return RecursiveUnionAdjacentShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionAdjacentShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionAdjacentShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionAdjacentShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionAdjacentShapeData.")
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
            return RecursiveUnionAdjacentShapeData(
                width,
                height,
                color,
            )
        }
    }
}

sealed interface RecursiveUnionExternal : TestClientModel {
    companion object Factory : TestClientModelFactory<RecursiveUnionExternal> {
        @JvmStatic
        override fun new(): RecursiveUnionExternal {
            return RecursiveUnionExternalChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionExternal.")
                return new()
            }
            return when {
                "child" in __input -> RecursiveUnionExternalChild.fromJsonElement(__input, instancePath)
                "children" in __input -> RecursiveUnionExternalChildren.fromJsonElement(__input, instancePath)
                "text" in __input -> RecursiveUnionExternalText.fromJsonElement(__input, instancePath)
                "shape" in __input -> RecursiveUnionExternalShape.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class RecursiveUnionExternalChild(
    val value: RecursiveUnionExternal,
) : RecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"child\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionExternalChild.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionExternalChild> {
        @JvmStatic
        override fun new(): RecursiveUnionExternalChild {
            return RecursiveUnionExternalChild(
                value = RecursiveUnionExternal.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionExternalChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionExternalChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionExternalChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionExternalChild.")
                return new()
            }
            val value: RecursiveUnionExternal = when (__input.jsonObject["child"]) {
                is JsonObject -> RecursiveUnionExternal.fromJsonElement(
                    __input.jsonObject["child"]!!,
                    "$instancePath/child",
                )

                else -> RecursiveUnionExternal.new()
            }
            return RecursiveUnionExternalChild(
                value,
            )
        }
    }
}

data class RecursiveUnionExternalChildren(
    val value: MutableList<RecursiveUnionExternal>,
) : RecursiveUnionExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionExternalChildren.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionExternalChildren> {
        @JvmStatic
        override fun new(): RecursiveUnionExternalChildren {
            return RecursiveUnionExternalChildren(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionExternalChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionExternalChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionExternalChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionExternalChildren.")
                return new()
            }
            val value: MutableList<RecursiveUnionExternal> = when (__input.jsonObject["children"]) {
                is JsonArray -> {
                    val __value: MutableList<RecursiveUnionExternal> = mutableListOf()
                    for (__element in __input.jsonObject["children"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> RecursiveUnionExternal.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> RecursiveUnionExternal.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return RecursiveUnionExternalChildren(
                value,
            )
        }
    }
}

data class RecursiveUnionExternalText(
    val value: String,
) : RecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionExternalText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionExternalText> {
        @JvmStatic
        override fun new(): RecursiveUnionExternalText {
            return RecursiveUnionExternalText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionExternalText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionExternalText {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionExternalText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionExternalText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return RecursiveUnionExternalText(
                value,
            )
        }
    }
}

data class RecursiveUnionExternalShape(
    val value: RecursiveUnionExternalShapeValue,
) : RecursiveUnionExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionExternalShape.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionExternalShape> {
        @JvmStatic
        override fun new(): RecursiveUnionExternalShape {
            return RecursiveUnionExternalShape(
                value = RecursiveUnionExternalShapeValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionExternalShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionExternalShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionExternalShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionExternalShape.")
                return new()
            }
            val value: RecursiveUnionExternalShapeValue = when (__input.jsonObject["shape"]) {
                is JsonObject -> RecursiveUnionExternalShapeValue.fromJsonElement(
                    __input.jsonObject["shape"]!!,
                    "$instancePath/shape",
                )

                else -> RecursiveUnionExternalShapeValue.new()
            }
            return RecursiveUnionExternalShape(
                value,
            )
        }
    }
}

/**
 * Shape node
 */
data class RecursiveUnionExternalShapeValue(
    val width: Double,
    val height: Double,
    val color: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionExternalShapeValue> {
        @JvmStatic
        override fun new(): RecursiveUnionExternalShapeValue {
            return RecursiveUnionExternalShapeValue(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionExternalShapeValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionExternalShapeValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionExternalShapeValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionExternalShapeValue.")
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
            return RecursiveUnionExternalShapeValue(
                width,
                height,
                color,
            )
        }
    }
}

sealed interface RecursiveUnionInternal : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<RecursiveUnionInternal> {
        @JvmStatic
        override fun new(): RecursiveUnionInternal {
            return RecursiveUnionInternalChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionInternal.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "child" -> RecursiveUnionInternalChild.fromJsonElement(__input, instancePath)
                    "children" -> RecursiveUnionInternalChildren.fromJsonElement(__input, instancePath)
                    "text" -> RecursiveUnionInternalText.fromJsonElement(__input, instancePath)
                    "shape" -> RecursiveUnionInternalShape.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class RecursiveUnionInternalChild(
    val data: RecursiveUnionInternal,
) : RecursiveUnionInternal {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionInternalChild> {
        @JvmStatic
        override fun new(): RecursiveUnionInternalChild {
            return RecursiveUnionInternalChild(
                data = RecursiveUnionInternal.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionInternalChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionInternalChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionInternalChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionInternalChild.")
                return new()
            }
            val data: RecursiveUnionInternal = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnionInternal.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> RecursiveUnionInternal.new()
            }
            return RecursiveUnionInternalChild(
                data,
            )
        }
    }
}

data class RecursiveUnionInternalChildren(
    /**
     * an array of child nodes
     */
    val data: MutableList<RecursiveUnionInternal>,
) : RecursiveUnionInternal {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionInternalChildren> {
        @JvmStatic
        override fun new(): RecursiveUnionInternalChildren {
            return RecursiveUnionInternalChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionInternalChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionInternalChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionInternalChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionInternalChildren.")
                return new()
            }
            val data: MutableList<RecursiveUnionInternal> = when (__input.jsonObject["data"]) {
                is JsonArray -> {
                    val __value: MutableList<RecursiveUnionInternal> = mutableListOf()
                    for (__element in __input.jsonObject["data"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> RecursiveUnionInternal.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> RecursiveUnionInternal.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return RecursiveUnionInternalChildren(
                data,
            )
        }
    }
}

data class RecursiveUnionInternalText(
    /**
     * Text node
     */
    val data: String,
) : RecursiveUnionInternal {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionInternalText> {
        @JvmStatic
        override fun new(): RecursiveUnionInternalText {
            return RecursiveUnionInternalText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionInternalText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionInternalText {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionInternalText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionInternalText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return RecursiveUnionInternalText(
                data,
            )
        }
    }
}

data class RecursiveUnionInternalShape(
    /**
     * Shape node
     */
    val data: RecursiveUnionInternalShapeData,
) : RecursiveUnionInternal {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionInternalShape> {
        @JvmStatic
        override fun new(): RecursiveUnionInternalShape {
            return RecursiveUnionInternalShape(
                data = RecursiveUnionInternalShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionInternalShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionInternalShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionInternalShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionInternalShape.")
                return new()
            }
            val data: RecursiveUnionInternalShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnionInternalShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> RecursiveUnionInternalShapeData.new()
            }
            return RecursiveUnionInternalShape(
                data,
            )
        }
    }
}

/**
 * Shape node
 */
data class RecursiveUnionInternalShapeData(
    val width: Double,
    val height: Double,
    val color: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionInternalShapeData> {
        @JvmStatic
        override fun new(): RecursiveUnionInternalShapeData {
            return RecursiveUnionInternalShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionInternalShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionInternalShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionInternalShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionInternalShapeData.")
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
            return RecursiveUnionInternalShapeData(
                width,
                height,
                color,
            )
        }
    }
}

sealed interface UnionInternalGetRequest : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionInternalGetRequest> {
        @JvmStatic
        override fun new(): UnionInternalGetRequest {
            return UnionInternalGetRequestWithFields.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionInternalGetRequest {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionInternalGetRequest {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionInternalGetRequest.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionInternalGetRequest.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "with-fields" -> UnionInternalGetRequestWithFields.fromJsonElement(__input, instancePath)
                    "empty" -> UnionInternalGetRequestEmpty.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionInternalGetRequestWithFields(
    val string: String,
    val nullableString: String?,
    val float64: Double,
    val int64: Long,
    val boolean: Boolean,
    val timestamp: Instant,
    val nullableEnum: UnionInternalGetRequestWithFieldsNullableEnum?,
    val optionalString: String? = null,
) : UnionInternalGetRequest {
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
            is UnionInternalGetRequestWithFieldsNullableEnum -> "\"${nullableEnum.serialValue}\""
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

    companion object Factory : TestClientModelFactory<UnionInternalGetRequestWithFields> {
        @JvmStatic
        override fun new(): UnionInternalGetRequestWithFields {
            return UnionInternalGetRequestWithFields(
                string = "",
                nullableString = null,
                float64 = 0.0,
                int64 = 0L,
                boolean = false,
                timestamp = Instant.EPOCH,
                nullableEnum = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionInternalGetRequestWithFields {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionInternalGetRequestWithFields {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionInternalGetRequestWithFields.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionInternalGetRequestWithFields.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val nullableEnum: UnionInternalGetRequestWithFieldsNullableEnum? = when (__input.jsonObject["nullableEnum"]) {
                is JsonNull -> null
                is JsonPrimitive -> UnionInternalGetRequestWithFieldsNullableEnum.fromJsonElement(__input.jsonObject["nullableEnum"]!!, "$instancePath/nullableEnum")
                else -> null
            }
            val optionalString: String? = when (__input.jsonObject["optionalString"]) {
                is JsonPrimitive -> __input.jsonObject["optionalString"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return UnionInternalGetRequestWithFields(
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

enum class UnionInternalGetRequestWithFieldsNullableEnum {
    A,
    B;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
        }

    companion object Factory : TestClientModelFactory<UnionInternalGetRequestWithFieldsNullableEnum> {
        @JvmStatic
        override fun new(): UnionInternalGetRequestWithFieldsNullableEnum {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): UnionInternalGetRequestWithFieldsNullableEnum {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionInternalGetRequestWithFieldsNullableEnum {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] UnionInternalGetRequestWithFieldsNullableEnum.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty UnionInternalGetRequestWithFieldsNullableEnum.")
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

data class UnionInternalGetRequestEmpty(
    private val placeholderKey: Short = 0
) : UnionInternalGetRequest {
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

    companion object Factory : TestClientModelFactory<UnionInternalGetRequestEmpty> {
        @JvmStatic
        override fun new(): UnionInternalGetRequestEmpty {
            return UnionInternalGetRequestEmpty()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionInternalGetRequestEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionInternalGetRequestEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionInternalGetRequestEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionInternalGetRequestEmpty.")
                return new()
            }
            return UnionInternalGetRequestEmpty()
        }
    }
}

data class UnionVariantShapes(
    val internal: UnionVariantShapesInternal,
    val external: UnionVariantShapesExternal,
    val adjacent: UnionVariantShapesAdjacent,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantShapes/internal.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantShapes/external.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantShapes/adjacent.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapes> {
        @JvmStatic
        override fun new(): UnionVariantShapes {
            return UnionVariantShapes(
                internal = UnionVariantShapesInternal.new(),
                external = UnionVariantShapesExternal.new(),
                adjacent = UnionVariantShapesAdjacent.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapes {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapes {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapes.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapes.")
                return new()
            }
            val internal: UnionVariantShapesInternal = when (__input.jsonObject["internal"]) {
                is JsonObject -> UnionVariantShapesInternal.fromJsonElement(
                    __input.jsonObject["internal"]!!,
                    "$instancePath/internal",
                )

                else -> UnionVariantShapesInternal.new()
            }
            val external: UnionVariantShapesExternal = when (__input.jsonObject["external"]) {
                is JsonObject -> UnionVariantShapesExternal.fromJsonElement(
                    __input.jsonObject["external"]!!,
                    "$instancePath/external",
                )

                else -> UnionVariantShapesExternal.new()
            }
            val adjacent: UnionVariantShapesAdjacent = when (__input.jsonObject["adjacent"]) {
                is JsonObject -> UnionVariantShapesAdjacent.fromJsonElement(
                    __input.jsonObject["adjacent"]!!,
                    "$instancePath/adjacent",
                )

                else -> UnionVariantShapesAdjacent.new()
            }
            return UnionVariantShapes(
                internal,
                external,
                adjacent,
            )
        }
    }
}

sealed interface UnionVariantShapesInternal : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternal> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternal {
            return UnionVariantShapesInternalEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternal.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "empty" -> UnionVariantShapesInternalEmpty.fromJsonElement(__input, instancePath)
                    "all-optional" -> UnionVariantShapesInternalAllOptional.fromJsonElement(__input, instancePath)
                    "mixed" -> UnionVariantShapesInternalMixed.fromJsonElement(__input, instancePath)
                    "nested" -> UnionVariantShapesInternalNested.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantShapesInternalEmpty(
    private val placeholderKey: Short = 0
) : UnionVariantShapesInternal {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternalEmpty> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternalEmpty {
            return UnionVariantShapesInternalEmpty()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternalEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternalEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternalEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternalEmpty.")
                return new()
            }
            return UnionVariantShapesInternalEmpty()
        }
    }
}

data class UnionVariantShapesInternalAllOptional(
    val first: String? = null,
    val second: Int? = null,
) : UnionVariantShapesInternal {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternalAllOptional> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternalAllOptional {
            return UnionVariantShapesInternalAllOptional()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternalAllOptional {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternalAllOptional {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternalAllOptional.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternalAllOptional.")
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
            return UnionVariantShapesInternalAllOptional(
                first,
                second,
            )
        }
    }
}

data class UnionVariantShapesInternalMixed(
    val required: String,
    val nullable: String?,
    val optional: String? = null,
) : UnionVariantShapesInternal {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternalMixed> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternalMixed {
            return UnionVariantShapesInternalMixed(
                required = "",
                nullable = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternalMixed {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternalMixed {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternalMixed.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternalMixed.")
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
            return UnionVariantShapesInternalMixed(
                required,
                nullable,
                optional,
            )
        }
    }
}

data class UnionVariantShapesInternalNested(
    val array: MutableList<UnionVariantShapesInternalNestedArrayElement>,
    val record: MutableMap<String, Long>,
    val `object`: UnionVariantShapesInternalNestedObject,
) : UnionVariantShapesInternal {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternalNested> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternalNested {
            return UnionVariantShapesInternalNested(
                array = mutableListOf(),
                record = mutableMapOf(),
                `object` = UnionVariantShapesInternalNestedObject.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternalNested {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternalNested {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternalNested.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternalNested.")
                return new()
            }
            val array: MutableList<UnionVariantShapesInternalNestedArrayElement> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<UnionVariantShapesInternalNestedArrayElement> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> UnionVariantShapesInternalNestedArrayElement.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> UnionVariantShapesInternalNestedArrayElement.new()
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
            val `object`: UnionVariantShapesInternalNestedObject = when (__input.jsonObject["object"]) {
                is JsonObject -> UnionVariantShapesInternalNestedObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> UnionVariantShapesInternalNestedObject.new()
            }
            return UnionVariantShapesInternalNested(
                array,
                record,
                `object`,
            )
        }
    }
}

data class UnionVariantShapesInternalNestedArrayElement(
    val id: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternalNestedArrayElement> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternalNestedArrayElement {
            return UnionVariantShapesInternalNestedArrayElement(
                id = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternalNestedArrayElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternalNestedArrayElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternalNestedArrayElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternalNestedArrayElement.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantShapesInternalNestedArrayElement(
                id,
            )
        }
    }
}

data class UnionVariantShapesInternalNestedObject(
    val timestamp: Instant,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesInternalNestedObject> {
        @JvmStatic
        override fun new(): UnionVariantShapesInternalNestedObject {
            return UnionVariantShapesInternalNestedObject(
                timestamp = Instant.EPOCH,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesInternalNestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesInternalNestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesInternalNestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesInternalNestedObject.")
                return new()
            }
            val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        try {
                            Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                        } catch (e: java.time.format.DateTimeParseException) {
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            return UnionVariantShapesInternalNestedObject(
                timestamp,
            )
        }
    }
}

sealed interface UnionVariantShapesExternal : TestClientModel {
    companion object Factory : TestClientModelFactory<UnionVariantShapesExternal> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternal {
            return UnionVariantShapesExternalEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternal.")
                return new()
            }
            return when {
                "empty" in __input -> UnionVariantShapesExternalEmpty.fromJsonElement(__input, instancePath)
                "all-optional" in __input -> UnionVariantShapesExternalAllOptional.fromJsonElement(__input, instancePath)
                "mixed" in __input -> UnionVariantShapesExternalMixed.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class UnionVariantShapesExternalEmpty(
    val value: UnionVariantShapesExternalEmptyValue,
) : UnionVariantShapesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"empty\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantShapesExternalEmpty.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapesExternalEmpty> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternalEmpty {
            return UnionVariantShapesExternalEmpty(
                value = UnionVariantShapesExternalEmptyValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternalEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternalEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternalEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternalEmpty.")
                return new()
            }
            val value: UnionVariantShapesExternalEmptyValue = when (__input.jsonObject["empty"]) {
                is JsonObject -> UnionVariantShapesExternalEmptyValue.fromJsonElement(
                    __input.jsonObject["empty"]!!,
                    "$instancePath/empty",
                )

                else -> UnionVariantShapesExternalEmptyValue.new()
            }
            return UnionVariantShapesExternalEmpty(
                value,
            )
        }
    }
}

data class UnionVariantShapesExternalAllOptional(
    val value: UnionVariantShapesExternalAllOptionalValue,
) : UnionVariantShapesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"all-optional\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantShapesExternalAllOptional.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapesExternalAllOptional> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternalAllOptional {
            return UnionVariantShapesExternalAllOptional(
                value = UnionVariantShapesExternalAllOptionalValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternalAllOptional {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternalAllOptional {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternalAllOptional.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternalAllOptional.")
                return new()
            }
            val value: UnionVariantShapesExternalAllOptionalValue = when (__input.jsonObject["all-optional"]) {
                is JsonObject -> UnionVariantShapesExternalAllOptionalValue.fromJsonElement(
                    __input.jsonObject["all-optional"]!!,
                    "$instancePath/all-optional",
                )

                else -> UnionVariantShapesExternalAllOptionalValue.new()
            }
            return UnionVariantShapesExternalAllOptional(
                value,
            )
        }
    }
}

data class UnionVariantShapesExternalMixed(
    val value: UnionVariantShapesExternalMixedValue,
) : UnionVariantShapesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"mixed\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantShapesExternalMixed.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapesExternalMixed> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternalMixed {
            return UnionVariantShapesExternalMixed(
                value = UnionVariantShapesExternalMixedValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternalMixed {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternalMixed {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternalMixed.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternalMixed.")
                return new()
            }
            val value: UnionVariantShapesExternalMixedValue = when (__input.jsonObject["mixed"]) {
                is JsonObject -> UnionVariantShapesExternalMixedValue.fromJsonElement(
                    __input.jsonObject["mixed"]!!,
                    "$instancePath/mixed",
                )

                else -> UnionVariantShapesExternalMixedValue.new()
            }
            return UnionVariantShapesExternalMixed(
                value,
            )
        }
    }
}

data class UnionVariantShapesExternalEmptyValue(
    private val placeholderKey: Short = 0
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesExternalEmptyValue> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternalEmptyValue {
            return UnionVariantShapesExternalEmptyValue()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternalEmptyValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternalEmptyValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternalEmptyValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternalEmptyValue.")
                return new()
            }
            return UnionVariantShapesExternalEmptyValue()
        }
    }
}

data class UnionVariantShapesExternalAllOptionalValue(
    val first: String? = null,
    val second: Int? = null,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesExternalAllOptionalValue> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternalAllOptionalValue {
            return UnionVariantShapesExternalAllOptionalValue()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternalAllOptionalValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternalAllOptionalValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternalAllOptionalValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternalAllOptionalValue.")
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
            return UnionVariantShapesExternalAllOptionalValue(
                first,
                second,
            )
        }
    }
}

data class UnionVariantShapesExternalMixedValue(
    val required: String,
    val nullable: String?,
    val optional: String? = null,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesExternalMixedValue> {
        @JvmStatic
        override fun new(): UnionVariantShapesExternalMixedValue {
            return UnionVariantShapesExternalMixedValue(
                required = "",
                nullable = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesExternalMixedValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesExternalMixedValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesExternalMixedValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesExternalMixedValue.")
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
            return UnionVariantShapesExternalMixedValue(
                required,
                nullable,
                optional,
            )
        }
    }
}

sealed interface UnionVariantShapesAdjacent : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacent> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacent {
            return UnionVariantShapesAdjacentEmpty.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "empty" -> UnionVariantShapesAdjacentEmpty.fromJsonElement(__input, instancePath)
                    "all-optional" -> UnionVariantShapesAdjacentAllOptional.fromJsonElement(__input, instancePath)
                    "mixed" -> UnionVariantShapesAdjacentMixed.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantShapesAdjacentEmpty(
    val data: UnionVariantShapesAdjacentEmptyData,
) : UnionVariantShapesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantShapesAdjacentEmpty.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacentEmpty> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacentEmpty {
            return UnionVariantShapesAdjacentEmpty(
                data = UnionVariantShapesAdjacentEmptyData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacentEmpty {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacentEmpty {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacentEmpty.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacentEmpty.")
                return new()
            }
            val data: UnionVariantShapesAdjacentEmptyData = when (__input.jsonObject["data"]) {
                is JsonObject -> UnionVariantShapesAdjacentEmptyData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> UnionVariantShapesAdjacentEmptyData.new()
            }
            return UnionVariantShapesAdjacentEmpty(
                data,
            )
        }
    }
}

data class UnionVariantShapesAdjacentAllOptional(
    val data: UnionVariantShapesAdjacentAllOptionalData,
) : UnionVariantShapesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantShapesAdjacentAllOptional.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacentAllOptional> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacentAllOptional {
            return UnionVariantShapesAdjacentAllOptional(
                data = UnionVariantShapesAdjacentAllOptionalData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacentAllOptional {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacentAllOptional {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacentAllOptional.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacentAllOptional.")
                return new()
            }
            val data: UnionVariantShapesAdjacentAllOptionalData = when (__input.jsonObject["data"]) {
                is JsonObject -> UnionVariantShapesAdjacentAllOptionalData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> UnionVariantShapesAdjacentAllOptionalData.new()
            }
            return UnionVariantShapesAdjacentAllOptional(
                data,
            )
        }
    }
}

data class UnionVariantShapesAdjacentMixed(
    val data: UnionVariantShapesAdjacentMixedData,
) : UnionVariantShapesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantShapesAdjacentMixed.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacentMixed> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacentMixed {
            return UnionVariantShapesAdjacentMixed(
                data = UnionVariantShapesAdjacentMixedData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacentMixed {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacentMixed {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacentMixed.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacentMixed.")
                return new()
            }
            val data: UnionVariantShapesAdjacentMixedData = when (__input.jsonObject["data"]) {
                is JsonObject -> UnionVariantShapesAdjacentMixedData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> UnionVariantShapesAdjacentMixedData.new()
            }
            return UnionVariantShapesAdjacentMixed(
                data,
            )
        }
    }
}

data class UnionVariantShapesAdjacentEmptyData(
    private val placeholderKey: Short = 0
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacentEmptyData> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacentEmptyData {
            return UnionVariantShapesAdjacentEmptyData()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacentEmptyData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacentEmptyData {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacentEmptyData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacentEmptyData.")
                return new()
            }
            return UnionVariantShapesAdjacentEmptyData()
        }
    }
}

data class UnionVariantShapesAdjacentAllOptionalData(
    val first: String? = null,
    val second: Int? = null,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacentAllOptionalData> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacentAllOptionalData {
            return UnionVariantShapesAdjacentAllOptionalData()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacentAllOptionalData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacentAllOptionalData {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacentAllOptionalData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacentAllOptionalData.")
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
            return UnionVariantShapesAdjacentAllOptionalData(
                first,
                second,
            )
        }
    }
}

data class UnionVariantShapesAdjacentMixedData(
    val required: String,
    val nullable: String?,
    val optional: String? = null,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UnionVariantShapesAdjacentMixedData> {
        @JvmStatic
        override fun new(): UnionVariantShapesAdjacentMixedData {
            return UnionVariantShapesAdjacentMixedData(
                required = "",
                nullable = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantShapesAdjacentMixedData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantShapesAdjacentMixedData {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantShapesAdjacentMixedData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantShapesAdjacentMixedData.")
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
            return UnionVariantShapesAdjacentMixedData(
                required,
                nullable,
                optional,
            )
        }
    }
}

data class UnionVariantTypes(
    val external: UnionVariantTypesExternal,
    val adjacent: UnionVariantTypesAdjacent,
    val internal: UnionVariantTypesInternal,
) : TestClientModel {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypes/internal.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypes> {
        @JvmStatic
        override fun new(): UnionVariantTypes {
            return UnionVariantTypes(
                external = UnionVariantTypesExternal.new(),
                adjacent = UnionVariantTypesAdjacent.new(),
                internal = UnionVariantTypesInternal.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypes {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypes {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypes.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypes.")
                return new()
            }
            val external: UnionVariantTypesExternal = when (__input.jsonObject["external"]) {
                is JsonObject -> UnionVariantTypesExternal.fromJsonElement(
                    __input.jsonObject["external"]!!,
                    "$instancePath/external",
                )

                else -> UnionVariantTypesExternal.new()
            }
            val adjacent: UnionVariantTypesAdjacent = when (__input.jsonObject["adjacent"]) {
                is JsonObject -> UnionVariantTypesAdjacent.fromJsonElement(
                    __input.jsonObject["adjacent"]!!,
                    "$instancePath/adjacent",
                )

                else -> UnionVariantTypesAdjacent.new()
            }
            val internal: UnionVariantTypesInternal = when (__input.jsonObject["internal"]) {
                is JsonObject -> UnionVariantTypesInternal.fromJsonElement(
                    __input.jsonObject["internal"]!!,
                    "$instancePath/internal",
                )

                else -> UnionVariantTypesInternal.new()
            }
            return UnionVariantTypes(
                external,
                adjacent,
                internal,
            )
        }
    }
}

sealed interface UnionVariantTypesExternal : TestClientModel {
    companion object Factory : TestClientModelFactory<UnionVariantTypesExternal> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternal {
            return UnionVariantTypesExternalString.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternal.")
                return new()
            }
            return when {
                "string" in __input -> UnionVariantTypesExternalString.fromJsonElement(__input, instancePath)
                "int64" in __input -> UnionVariantTypesExternalInt64.fromJsonElement(__input, instancePath)
                "uint64" in __input -> UnionVariantTypesExternalUint64.fromJsonElement(__input, instancePath)
                "float64" in __input -> UnionVariantTypesExternalFloat64.fromJsonElement(__input, instancePath)
                "enumerator" in __input -> UnionVariantTypesExternalEnumerator.fromJsonElement(__input, instancePath)
                "record" in __input -> UnionVariantTypesExternalRecord.fromJsonElement(__input, instancePath)
                "any" in __input -> UnionVariantTypesExternalAny.fromJsonElement(__input, instancePath)
                "nullableString" in __input -> UnionVariantTypesExternalNullableString.fromJsonElement(__input, instancePath)
                "nullableArray" in __input -> UnionVariantTypesExternalNullableArray.fromJsonElement(__input, instancePath)
                "externalUnion" in __input -> UnionVariantTypesExternalExternalUnion.fromJsonElement(__input, instancePath)
                "internalUnion" in __input -> UnionVariantTypesExternalInternalUnion.fromJsonElement(__input, instancePath)
                "adjacentUnion" in __input -> UnionVariantTypesExternalAdjacentUnion.fromJsonElement(__input, instancePath)
                "class" in __input -> UnionVariantTypesExternalClass.fromJsonElement(__input, instancePath)
                "default" in __input -> UnionVariantTypesExternalDefault.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class UnionVariantTypesExternalString(
    val value: String,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"string\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalString.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalString> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalString {
            return UnionVariantTypesExternalString(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalString {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalString.")
                return new()
            }
            val value: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesExternalString(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalInt64(
    val value: Long,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"int64\":"
        output += "\"${value}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalInt64.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalInt64> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalInt64 {
            return UnionVariantTypesExternalInt64(
                value = 0L,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalInt64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalInt64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalInt64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalInt64.")
                return new()
            }
            val value: Long = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
            return UnionVariantTypesExternalInt64(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalUint64(
    val value: ULong,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"uint64\":"
        output += "\"${value}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalUint64.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalUint64> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalUint64 {
            return UnionVariantTypesExternalUint64(
                value = 0UL,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalUint64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalUint64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalUint64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalUint64.")
                return new()
            }
            val value: ULong = when (__input.jsonObject["uint64"]) {
                is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
            return UnionVariantTypesExternalUint64(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalFloat64(
    val value: Double,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"float64\":"
        output += value
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalFloat64.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalFloat64> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalFloat64 {
            return UnionVariantTypesExternalFloat64(
                value = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalFloat64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalFloat64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalFloat64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalFloat64.")
                return new()
            }
            val value: Double = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return UnionVariantTypesExternalFloat64(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalEnumerator(
    val value: UnionVariantTypesExternalEnumeratorValue,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"enumerator\":"
        output += "\"${value.serialValue}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalEnumerator.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalEnumerator> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalEnumerator {
            return UnionVariantTypesExternalEnumerator(
                value = UnionVariantTypesExternalEnumeratorValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalEnumerator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalEnumerator {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalEnumerator.")
                return new()
            }
            val value: UnionVariantTypesExternalEnumeratorValue = when (__input.jsonObject["enumerator"]) {
                is JsonNull -> UnionVariantTypesExternalEnumeratorValue.new()
                is JsonPrimitive -> UnionVariantTypesExternalEnumeratorValue.fromJsonElement(__input.jsonObject["enumerator"]!!, "$instancePath/enumerator")
                else -> UnionVariantTypesExternalEnumeratorValue.new()
            }
            return UnionVariantTypesExternalEnumerator(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalRecord(
    val value: MutableMap<String, String>,
) : UnionVariantTypesExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalRecord.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalRecord> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalRecord {
            return UnionVariantTypesExternalRecord(
                value = mutableMapOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalRecord {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalRecord {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalRecord.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalRecord.")
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
            return UnionVariantTypesExternalRecord(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalAny(
    val value: JsonElement,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"any\":"
        output += JsonInstance.encodeToString(value)
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalAny.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalAny> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalAny {
            return UnionVariantTypesExternalAny(
                value = JsonNull,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalAny {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalAny {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalAny.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalAny.")
                return new()
            }
            val value: JsonElement = when (__input.jsonObject["any"]) {
                is JsonElement -> __input.jsonObject["any"]!!
                else -> JsonNull
            }
            return UnionVariantTypesExternalAny(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalNullableString(
    val value: String?,
) : UnionVariantTypesExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalNullableString.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalNullableString> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalNullableString {
            return UnionVariantTypesExternalNullableString(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalNullableString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalNullableString {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalNullableString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalNullableString.")
                return new()
            }
            val value: String? = when (__input.jsonObject["nullableString"]) {
                is JsonPrimitive -> __input.jsonObject["nullableString"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return UnionVariantTypesExternalNullableString(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalNullableArray(
    val value: MutableList<String>?,
) : UnionVariantTypesExternal {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalNullableArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalNullableArray> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalNullableArray {
            return UnionVariantTypesExternalNullableArray(
                value = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalNullableArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalNullableArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalNullableArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalNullableArray.")
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
            return UnionVariantTypesExternalNullableArray(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalExternalUnion(
    val value: UnionVariantTypesExternalExternalUnionValue,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"externalUnion\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalExternalUnion.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalExternalUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalExternalUnion {
            return UnionVariantTypesExternalExternalUnion(
                value = UnionVariantTypesExternalExternalUnionValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalExternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalExternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalExternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalExternalUnion.")
                return new()
            }
            val value: UnionVariantTypesExternalExternalUnionValue = when (__input.jsonObject["externalUnion"]) {
                is JsonObject -> UnionVariantTypesExternalExternalUnionValue.fromJsonElement(
                    __input.jsonObject["externalUnion"]!!,
                    "$instancePath/externalUnion",
                )

                else -> UnionVariantTypesExternalExternalUnionValue.new()
            }
            return UnionVariantTypesExternalExternalUnion(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalInternalUnion(
    val value: UnionVariantTypesExternalInternalUnionValue,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"internalUnion\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalInternalUnion.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalInternalUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalInternalUnion {
            return UnionVariantTypesExternalInternalUnion(
                value = UnionVariantTypesExternalInternalUnionValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalInternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalInternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalInternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalInternalUnion.")
                return new()
            }
            val value: UnionVariantTypesExternalInternalUnionValue = when (__input.jsonObject["internalUnion"]) {
                is JsonObject -> UnionVariantTypesExternalInternalUnionValue.fromJsonElement(
                    __input.jsonObject["internalUnion"]!!,
                    "$instancePath/internalUnion",
                )

                else -> UnionVariantTypesExternalInternalUnionValue.new()
            }
            return UnionVariantTypesExternalInternalUnion(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalAdjacentUnion(
    val value: UnionVariantTypesExternalAdjacentUnionValue,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"adjacentUnion\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalAdjacentUnion.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalAdjacentUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalAdjacentUnion {
            return UnionVariantTypesExternalAdjacentUnion(
                value = UnionVariantTypesExternalAdjacentUnionValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalAdjacentUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalAdjacentUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalAdjacentUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalAdjacentUnion.")
                return new()
            }
            val value: UnionVariantTypesExternalAdjacentUnionValue = when (__input.jsonObject["adjacentUnion"]) {
                is JsonObject -> UnionVariantTypesExternalAdjacentUnionValue.fromJsonElement(
                    __input.jsonObject["adjacentUnion"]!!,
                    "$instancePath/adjacentUnion",
                )

                else -> UnionVariantTypesExternalAdjacentUnionValue.new()
            }
            return UnionVariantTypesExternalAdjacentUnion(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalClass(
    val value: String,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"class\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalClass.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalClass> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalClass {
            return UnionVariantTypesExternalClass(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalClass {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalClass {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalClass.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalClass.")
                return new()
            }
            val value: String = when (__input.jsonObject["class"]) {
                is JsonPrimitive -> __input.jsonObject["class"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesExternalClass(
                value,
            )
        }
    }
}

data class UnionVariantTypesExternalDefault(
    val value: String,
) : UnionVariantTypesExternal {
    override fun toJson(): String {
        var output = "{"
        output += "\"default\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalDefault.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalDefault> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalDefault {
            return UnionVariantTypesExternalDefault(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalDefault {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalDefault {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalDefault.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalDefault.")
                return new()
            }
            val value: String = when (__input.jsonObject["default"]) {
                is JsonPrimitive -> __input.jsonObject["default"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesExternalDefault(
                value,
            )
        }
    }
}

enum class UnionVariantTypesExternalEnumeratorValue {
    A,
    B;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
        }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalEnumeratorValue> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalEnumeratorValue {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalEnumeratorValue {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalEnumeratorValue {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] UnionVariantTypesExternalEnumeratorValue.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalEnumeratorValue.")
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

sealed interface UnionVariantTypesExternalExternalUnionValue : TestClientModel {
    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalExternalUnionValue> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalExternalUnionValue {
            return UnionVariantTypesExternalExternalUnionValueText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalExternalUnionValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalExternalUnionValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalExternalUnionValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalExternalUnionValue.")
                return new()
            }
            return when {
                "text" in __input -> UnionVariantTypesExternalExternalUnionValueText.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class UnionVariantTypesExternalExternalUnionValueText(
    val value: String,
) : UnionVariantTypesExternalExternalUnionValue {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalExternalUnionValueText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalExternalUnionValueText> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalExternalUnionValueText {
            return UnionVariantTypesExternalExternalUnionValueText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalExternalUnionValueText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalExternalUnionValueText {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalExternalUnionValueText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalExternalUnionValueText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesExternalExternalUnionValueText(
                value,
            )
        }
    }
}

sealed interface UnionVariantTypesExternalInternalUnionValue : TestClientModel {
    val shape: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalInternalUnionValue> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalInternalUnionValue {
            return UnionVariantTypesExternalInternalUnionValueCircle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalInternalUnionValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalInternalUnionValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalInternalUnionValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalInternalUnionValue.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "circle" -> UnionVariantTypesExternalInternalUnionValueCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesExternalInternalUnionValueCircle(
    val radius: Double,
) : UnionVariantTypesExternalInternalUnionValue {
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

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalInternalUnionValueCircle> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalInternalUnionValueCircle {
            return UnionVariantTypesExternalInternalUnionValueCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalInternalUnionValueCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalInternalUnionValueCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalInternalUnionValueCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalInternalUnionValueCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return UnionVariantTypesExternalInternalUnionValueCircle(
                radius,
            )
        }
    }
}

sealed interface UnionVariantTypesExternalAdjacentUnionValue : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalAdjacentUnionValue> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalAdjacentUnionValue {
            return UnionVariantTypesExternalAdjacentUnionValueText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalAdjacentUnionValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalAdjacentUnionValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalAdjacentUnionValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalAdjacentUnionValue.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "text" -> UnionVariantTypesExternalAdjacentUnionValueText.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesExternalAdjacentUnionValueText(
    val data: String,
) : UnionVariantTypesExternalAdjacentUnionValue {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesExternalAdjacentUnionValueText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesExternalAdjacentUnionValueText> {
        @JvmStatic
        override fun new(): UnionVariantTypesExternalAdjacentUnionValueText {
            return UnionVariantTypesExternalAdjacentUnionValueText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesExternalAdjacentUnionValueText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesExternalAdjacentUnionValueText {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesExternalAdjacentUnionValueText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesExternalAdjacentUnionValueText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesExternalAdjacentUnionValueText(
                data,
            )
        }
    }
}

sealed interface UnionVariantTypesAdjacent : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacent> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacent {
            return UnionVariantTypesAdjacentString.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacent {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacent {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacent.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacent.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "string" -> UnionVariantTypesAdjacentString.fromJsonElement(__input, instancePath)
                    "int64" -> UnionVariantTypesAdjacentInt64.fromJsonElement(__input, instancePath)
                    "uint64" -> UnionVariantTypesAdjacentUint64.fromJsonElement(__input, instancePath)
                    "float64" -> UnionVariantTypesAdjacentFloat64.fromJsonElement(__input, instancePath)
                    "enumerator" -> UnionVariantTypesAdjacentEnumerator.fromJsonElement(__input, instancePath)
                    "record" -> UnionVariantTypesAdjacentRecord.fromJsonElement(__input, instancePath)
                    "any" -> UnionVariantTypesAdjacentAny.fromJsonElement(__input, instancePath)
                    "nullableString" -> UnionVariantTypesAdjacentNullableString.fromJsonElement(__input, instancePath)
                    "nullableArray" -> UnionVariantTypesAdjacentNullableArray.fromJsonElement(__input, instancePath)
                    "externalUnion" -> UnionVariantTypesAdjacentExternalUnion.fromJsonElement(__input, instancePath)
                    "internalUnion" -> UnionVariantTypesAdjacentInternalUnion.fromJsonElement(__input, instancePath)
                    "adjacentUnion" -> UnionVariantTypesAdjacentAdjacentUnion.fromJsonElement(__input, instancePath)
                    "class" -> UnionVariantTypesAdjacentClass.fromJsonElement(__input, instancePath)
                    "default" -> UnionVariantTypesAdjacentDefault.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesAdjacentString(
    val data: String,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentString.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentString> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentString {
            return UnionVariantTypesAdjacentString(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentString {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentString.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesAdjacentString(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentInt64(
    val data: Long,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentInt64.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentInt64> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentInt64 {
            return UnionVariantTypesAdjacentInt64(
                data = 0L,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentInt64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentInt64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentInt64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentInt64.")
                return new()
            }
            val data: Long = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
            return UnionVariantTypesAdjacentInt64(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentUint64(
    val data: ULong,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentUint64.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentUint64> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentUint64 {
            return UnionVariantTypesAdjacentUint64(
                data = 0UL,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentUint64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentUint64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentUint64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentUint64.")
                return new()
            }
            val data: ULong = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
            return UnionVariantTypesAdjacentUint64(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentFloat64(
    val data: Double,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentFloat64.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentFloat64> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentFloat64 {
            return UnionVariantTypesAdjacentFloat64(
                data = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentFloat64 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentFloat64 {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentFloat64.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentFloat64.")
                return new()
            }
            val data: Double = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return UnionVariantTypesAdjacentFloat64(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentEnumerator(
    val data: UnionVariantTypesAdjacentEnumeratorData,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentEnumerator.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentEnumerator> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentEnumerator {
            return UnionVariantTypesAdjacentEnumerator(
                data = UnionVariantTypesAdjacentEnumeratorData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentEnumerator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentEnumerator {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentEnumerator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentEnumerator.")
                return new()
            }
            val data: UnionVariantTypesAdjacentEnumeratorData = when (__input.jsonObject["data"]) {
                is JsonNull -> UnionVariantTypesAdjacentEnumeratorData.new()
                is JsonPrimitive -> UnionVariantTypesAdjacentEnumeratorData.fromJsonElement(__input.jsonObject["data"]!!, "$instancePath/data")
                else -> UnionVariantTypesAdjacentEnumeratorData.new()
            }
            return UnionVariantTypesAdjacentEnumerator(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentRecord(
    val data: MutableMap<String, String>,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentRecord.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentRecord> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentRecord {
            return UnionVariantTypesAdjacentRecord(
                data = mutableMapOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentRecord {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentRecord {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentRecord.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentRecord.")
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
            return UnionVariantTypesAdjacentRecord(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentAny(
    val data: JsonElement,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentAny.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentAny> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentAny {
            return UnionVariantTypesAdjacentAny(
                data = JsonNull,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentAny {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentAny {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentAny.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentAny.")
                return new()
            }
            val data: JsonElement = when (__input.jsonObject["data"]) {
                is JsonElement -> __input.jsonObject["data"]!!
                else -> JsonNull
            }
            return UnionVariantTypesAdjacentAny(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentNullableString(
    val data: String?,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentNullableString.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentNullableString> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentNullableString {
            return UnionVariantTypesAdjacentNullableString(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentNullableString {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentNullableString {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentNullableString.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentNullableString.")
                return new()
            }
            val data: String? = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return UnionVariantTypesAdjacentNullableString(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentNullableArray(
    val data: MutableList<String>?,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentNullableArray.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentNullableArray> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentNullableArray {
            return UnionVariantTypesAdjacentNullableArray(
                data = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentNullableArray {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentNullableArray {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentNullableArray.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentNullableArray.")
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
            return UnionVariantTypesAdjacentNullableArray(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentExternalUnion(
    val data: UnionVariantTypesAdjacentExternalUnionData,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentExternalUnion.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentExternalUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentExternalUnion {
            return UnionVariantTypesAdjacentExternalUnion(
                data = UnionVariantTypesAdjacentExternalUnionData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentExternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentExternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentExternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentExternalUnion.")
                return new()
            }
            val data: UnionVariantTypesAdjacentExternalUnionData = when (__input.jsonObject["data"]) {
                is JsonObject -> UnionVariantTypesAdjacentExternalUnionData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> UnionVariantTypesAdjacentExternalUnionData.new()
            }
            return UnionVariantTypesAdjacentExternalUnion(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentInternalUnion(
    val data: UnionVariantTypesAdjacentInternalUnionData,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentInternalUnion.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentInternalUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentInternalUnion {
            return UnionVariantTypesAdjacentInternalUnion(
                data = UnionVariantTypesAdjacentInternalUnionData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentInternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentInternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentInternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentInternalUnion.")
                return new()
            }
            val data: UnionVariantTypesAdjacentInternalUnionData = when (__input.jsonObject["data"]) {
                is JsonObject -> UnionVariantTypesAdjacentInternalUnionData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> UnionVariantTypesAdjacentInternalUnionData.new()
            }
            return UnionVariantTypesAdjacentInternalUnion(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentAdjacentUnion(
    val data: UnionVariantTypesAdjacentAdjacentUnionData,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentAdjacentUnion.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentAdjacentUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentAdjacentUnion {
            return UnionVariantTypesAdjacentAdjacentUnion(
                data = UnionVariantTypesAdjacentAdjacentUnionData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentAdjacentUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentAdjacentUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentAdjacentUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentAdjacentUnion.")
                return new()
            }
            val data: UnionVariantTypesAdjacentAdjacentUnionData = when (__input.jsonObject["data"]) {
                is JsonObject -> UnionVariantTypesAdjacentAdjacentUnionData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> UnionVariantTypesAdjacentAdjacentUnionData.new()
            }
            return UnionVariantTypesAdjacentAdjacentUnion(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentClass(
    val data: String,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentClass.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentClass> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentClass {
            return UnionVariantTypesAdjacentClass(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentClass {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentClass {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentClass.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentClass.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesAdjacentClass(
                data,
            )
        }
    }
}

data class UnionVariantTypesAdjacentDefault(
    val data: String,
) : UnionVariantTypesAdjacent {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentDefault.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentDefault> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentDefault {
            return UnionVariantTypesAdjacentDefault(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentDefault {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentDefault {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentDefault.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentDefault.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesAdjacentDefault(
                data,
            )
        }
    }
}

enum class UnionVariantTypesAdjacentEnumeratorData {
    A,
    B;

    val serialValue: String
        get() = when (this) {
            A -> "A"
            B -> "B"
        }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentEnumeratorData> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentEnumeratorData {
            return A
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentEnumeratorData {
            return when (input) {
                A.serialValue -> A
                B.serialValue -> B
                else -> A
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentEnumeratorData {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] UnionVariantTypesAdjacentEnumeratorData.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentEnumeratorData.")
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

sealed interface UnionVariantTypesAdjacentExternalUnionData : TestClientModel {
    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentExternalUnionData> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentExternalUnionData {
            return UnionVariantTypesAdjacentExternalUnionDataText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentExternalUnionData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentExternalUnionData {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentExternalUnionData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentExternalUnionData.")
                return new()
            }
            return when {
                "text" in __input -> UnionVariantTypesAdjacentExternalUnionDataText.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class UnionVariantTypesAdjacentExternalUnionDataText(
    val value: String,
) : UnionVariantTypesAdjacentExternalUnionData {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentExternalUnionDataText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentExternalUnionDataText> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentExternalUnionDataText {
            return UnionVariantTypesAdjacentExternalUnionDataText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentExternalUnionDataText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentExternalUnionDataText {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentExternalUnionDataText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentExternalUnionDataText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesAdjacentExternalUnionDataText(
                value,
            )
        }
    }
}

sealed interface UnionVariantTypesAdjacentInternalUnionData : TestClientModel {
    val shape: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentInternalUnionData> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentInternalUnionData {
            return UnionVariantTypesAdjacentInternalUnionDataCircle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentInternalUnionData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentInternalUnionData {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentInternalUnionData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentInternalUnionData.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "circle" -> UnionVariantTypesAdjacentInternalUnionDataCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesAdjacentInternalUnionDataCircle(
    val radius: Double,
) : UnionVariantTypesAdjacentInternalUnionData {
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

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentInternalUnionDataCircle> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentInternalUnionDataCircle {
            return UnionVariantTypesAdjacentInternalUnionDataCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentInternalUnionDataCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentInternalUnionDataCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentInternalUnionDataCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentInternalUnionDataCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return UnionVariantTypesAdjacentInternalUnionDataCircle(
                radius,
            )
        }
    }
}

sealed interface UnionVariantTypesAdjacentAdjacentUnionData : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentAdjacentUnionData> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentAdjacentUnionData {
            return UnionVariantTypesAdjacentAdjacentUnionDataText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentAdjacentUnionData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentAdjacentUnionData {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentAdjacentUnionData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentAdjacentUnionData.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "text" -> UnionVariantTypesAdjacentAdjacentUnionDataText.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesAdjacentAdjacentUnionDataText(
    val data: String,
) : UnionVariantTypesAdjacentAdjacentUnionData {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesAdjacentAdjacentUnionDataText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesAdjacentAdjacentUnionDataText> {
        @JvmStatic
        override fun new(): UnionVariantTypesAdjacentAdjacentUnionDataText {
            return UnionVariantTypesAdjacentAdjacentUnionDataText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesAdjacentAdjacentUnionDataText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesAdjacentAdjacentUnionDataText {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesAdjacentAdjacentUnionDataText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesAdjacentAdjacentUnionDataText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesAdjacentAdjacentUnionDataText(
                data,
            )
        }
    }
}

sealed interface UnionVariantTypesInternal : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternal> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternal {
            return UnionVariantTypesInternalClass.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternal {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternal {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternal.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternal.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "class" -> UnionVariantTypesInternalClass.fromJsonElement(__input, instancePath)
                    "default" -> UnionVariantTypesInternalDefault.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesInternalClass(
    val `for`: String,
    val default: String,
) : UnionVariantTypesInternal {
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

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalClass> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalClass {
            return UnionVariantTypesInternalClass(
                `for` = "",
                default = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalClass {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalClass {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalClass.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalClass.")
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
            return UnionVariantTypesInternalClass(
                `for`,
                default,
            )
        }
    }
}

data class UnionVariantTypesInternalDefault(
    val `class`: String,
    val internalUnion: UnionVariantTypesInternalDefaultInternalUnion,
    val adjacentUnion: UnionVariantTypesInternalDefaultAdjacentUnion,
    val externalUnion: UnionVariantTypesInternalDefaultExternalUnion,
) : UnionVariantTypesInternal {
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
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypesInternalDefault/internalUnion.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypesInternalDefault/adjacentUnion.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /UnionVariantTypesInternalDefault/externalUnion.")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefault> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefault {
            return UnionVariantTypesInternalDefault(
                `class` = "",
                internalUnion = UnionVariantTypesInternalDefaultInternalUnion.new(),
                adjacentUnion = UnionVariantTypesInternalDefaultAdjacentUnion.new(),
                externalUnion = UnionVariantTypesInternalDefaultExternalUnion.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefault {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefault {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefault.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefault.")
                return new()
            }
            val `class`: String = when (__input.jsonObject["class"]) {
                is JsonPrimitive -> __input.jsonObject["class"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val internalUnion: UnionVariantTypesInternalDefaultInternalUnion = when (__input.jsonObject["internalUnion"]) {
                is JsonObject -> UnionVariantTypesInternalDefaultInternalUnion.fromJsonElement(
                    __input.jsonObject["internalUnion"]!!,
                    "$instancePath/internalUnion",
                )

                else -> UnionVariantTypesInternalDefaultInternalUnion.new()
            }
            val adjacentUnion: UnionVariantTypesInternalDefaultAdjacentUnion = when (__input.jsonObject["adjacentUnion"]) {
                is JsonObject -> UnionVariantTypesInternalDefaultAdjacentUnion.fromJsonElement(
                    __input.jsonObject["adjacentUnion"]!!,
                    "$instancePath/adjacentUnion",
                )

                else -> UnionVariantTypesInternalDefaultAdjacentUnion.new()
            }
            val externalUnion: UnionVariantTypesInternalDefaultExternalUnion = when (__input.jsonObject["externalUnion"]) {
                is JsonObject -> UnionVariantTypesInternalDefaultExternalUnion.fromJsonElement(
                    __input.jsonObject["externalUnion"]!!,
                    "$instancePath/externalUnion",
                )

                else -> UnionVariantTypesInternalDefaultExternalUnion.new()
            }
            return UnionVariantTypesInternalDefault(
                `class`,
                internalUnion,
                adjacentUnion,
                externalUnion,
            )
        }
    }
}

sealed interface UnionVariantTypesInternalDefaultInternalUnion : TestClientModel {
    val shape: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefaultInternalUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefaultInternalUnion {
            return UnionVariantTypesInternalDefaultInternalUnionCircle.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefaultInternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefaultInternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefaultInternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefaultInternalUnion.")
                return new()
            }
            return when (__input.jsonObject["shape"]) {
                is JsonPrimitive -> when (__input.jsonObject["shape"]!!.jsonPrimitive.contentOrNull) {
                    "circle" -> UnionVariantTypesInternalDefaultInternalUnionCircle.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesInternalDefaultInternalUnionCircle(
    val radius: Double,
) : UnionVariantTypesInternalDefaultInternalUnion {
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

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefaultInternalUnionCircle> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefaultInternalUnionCircle {
            return UnionVariantTypesInternalDefaultInternalUnionCircle(
                radius = 0.0,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefaultInternalUnionCircle {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefaultInternalUnionCircle {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefaultInternalUnionCircle.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefaultInternalUnionCircle.")
                return new()
            }
            val radius: Double = when (__input.jsonObject["radius"]) {
                is JsonPrimitive -> __input.jsonObject["radius"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            return UnionVariantTypesInternalDefaultInternalUnionCircle(
                radius,
            )
        }
    }
}

sealed interface UnionVariantTypesInternalDefaultAdjacentUnion : TestClientModel {
    val kind: String

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefaultAdjacentUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefaultAdjacentUnion {
            return UnionVariantTypesInternalDefaultAdjacentUnionText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefaultAdjacentUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefaultAdjacentUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefaultAdjacentUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefaultAdjacentUnion.")
                return new()
            }
            return when (__input.jsonObject["kind"]) {
                is JsonPrimitive -> when (__input.jsonObject["kind"]!!.jsonPrimitive.contentOrNull) {
                    "text" -> UnionVariantTypesInternalDefaultAdjacentUnionText.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UnionVariantTypesInternalDefaultAdjacentUnionText(
    val data: String,
) : UnionVariantTypesInternalDefaultAdjacentUnion {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesInternalDefaultAdjacentUnionText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefaultAdjacentUnionText> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefaultAdjacentUnionText {
            return UnionVariantTypesInternalDefaultAdjacentUnionText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefaultAdjacentUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefaultAdjacentUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefaultAdjacentUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefaultAdjacentUnionText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesInternalDefaultAdjacentUnionText(
                data,
            )
        }
    }
}

sealed interface UnionVariantTypesInternalDefaultExternalUnion : TestClientModel {
    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefaultExternalUnion> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefaultExternalUnion {
            return UnionVariantTypesInternalDefaultExternalUnionText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefaultExternalUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefaultExternalUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefaultExternalUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefaultExternalUnion.")
                return new()
            }
            return when {
                "text" in __input -> UnionVariantTypesInternalDefaultExternalUnionText.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class UnionVariantTypesInternalDefaultExternalUnionText(
    val value: String,
) : UnionVariantTypesInternalDefaultExternalUnion {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping UnionVariantTypesInternalDefaultExternalUnionText.")
        return ""
    }

    companion object Factory : TestClientModelFactory<UnionVariantTypesInternalDefaultExternalUnionText> {
        @JvmStatic
        override fun new(): UnionVariantTypesInternalDefaultExternalUnionText {
            return UnionVariantTypesInternalDefaultExternalUnionText(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UnionVariantTypesInternalDefaultExternalUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UnionVariantTypesInternalDefaultExternalUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] UnionVariantTypesInternalDefaultExternalUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UnionVariantTypesInternalDefaultExternalUnionText.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UnionVariantTypesInternalDefaultExternalUnionText(
                value,
            )
        }
    }
}

data class AutoReconnectParams(
    val messageCount: UByte,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<AutoReconnectParams> {
        @JvmStatic
        override fun new(): AutoReconnectParams {
            return AutoReconnectParams(
                messageCount = 0u,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): AutoReconnectParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): AutoReconnectParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] AutoReconnectParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty AutoReconnectParams.")
                return new()
            }
            val messageCount: UByte = when (__input.jsonObject["messageCount"]) {
                is JsonPrimitive -> __input.jsonObject["messageCount"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull() ?: 0u
                else -> 0u
            }
            return AutoReconnectParams(
                messageCount,
            )
        }
    }
}

data class AutoReconnectResponse(
    val count: UByte,
    val message: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<AutoReconnectResponse> {
        @JvmStatic
        override fun new(): AutoReconnectResponse {
            return AutoReconnectResponse(
                count = 0u,
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): AutoReconnectResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): AutoReconnectResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] AutoReconnectResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty AutoReconnectResponse.")
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
            return AutoReconnectResponse(
                count,
                message,
            )
        }
    }
}

data class StreamConnectionErrorTestParams(
    val statusCode: Int,
    val statusMessage: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<StreamConnectionErrorTestParams> {
        @JvmStatic
        override fun new(): StreamConnectionErrorTestParams {
            return StreamConnectionErrorTestParams(
                statusCode = 0,
                statusMessage = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): StreamConnectionErrorTestParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): StreamConnectionErrorTestParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] StreamConnectionErrorTestParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty StreamConnectionErrorTestParams.")
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
            return StreamConnectionErrorTestParams(
                statusCode,
                statusMessage,
            )
        }
    }
}

data class StreamConnectionErrorTestResponse(
    val message: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<StreamConnectionErrorTestResponse> {
        @JvmStatic
        override fun new(): StreamConnectionErrorTestResponse {
            return StreamConnectionErrorTestResponse(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): StreamConnectionErrorTestResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): StreamConnectionErrorTestResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] StreamConnectionErrorTestResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty StreamConnectionErrorTestResponse.")
                return new()
            }
            val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return StreamConnectionErrorTestResponse(
                message,
            )
        }
    }
}

data class StreamHeartbeatDetectionTestParams(
    val heartbeatEnabled: Boolean,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<StreamHeartbeatDetectionTestParams> {
        @JvmStatic
        override fun new(): StreamHeartbeatDetectionTestParams {
            return StreamHeartbeatDetectionTestParams(
                heartbeatEnabled = false,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): StreamHeartbeatDetectionTestParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): StreamHeartbeatDetectionTestParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] StreamHeartbeatDetectionTestParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty StreamHeartbeatDetectionTestParams.")
                return new()
            }
            val heartbeatEnabled: Boolean = when (__input.jsonObject["heartbeatEnabled"]) {
                is JsonPrimitive -> __input.jsonObject["heartbeatEnabled"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            return StreamHeartbeatDetectionTestParams(
                heartbeatEnabled,
            )
        }
    }
}

data class StreamHeartbeatDetectionTestResponse(
    val message: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<StreamHeartbeatDetectionTestResponse> {
        @JvmStatic
        override fun new(): StreamHeartbeatDetectionTestResponse {
            return StreamHeartbeatDetectionTestResponse(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): StreamHeartbeatDetectionTestResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): StreamHeartbeatDetectionTestResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] StreamHeartbeatDetectionTestResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty StreamHeartbeatDetectionTestResponse.")
                return new()
            }
            val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return StreamHeartbeatDetectionTestResponse(
                message,
            )
        }
    }
}

data class StreamLargeObjectsResponse(
    val numbers: MutableList<Double>,
    val objects: MutableList<StreamLargeObjectsResponseObjectsElement>,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<StreamLargeObjectsResponse> {
        @JvmStatic
        override fun new(): StreamLargeObjectsResponse {
            return StreamLargeObjectsResponse(
                numbers = mutableListOf(),
                objects = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): StreamLargeObjectsResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): StreamLargeObjectsResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] StreamLargeObjectsResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty StreamLargeObjectsResponse.")
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
            val objects: MutableList<StreamLargeObjectsResponseObjectsElement> = when (__input.jsonObject["objects"]) {
                is JsonArray -> {
                    val __value: MutableList<StreamLargeObjectsResponseObjectsElement> = mutableListOf()
                    for (__element in __input.jsonObject["objects"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> StreamLargeObjectsResponseObjectsElement.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> StreamLargeObjectsResponseObjectsElement.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return StreamLargeObjectsResponse(
                numbers,
                objects,
            )
        }
    }
}

data class StreamLargeObjectsResponseObjectsElement(
    val id: String,
    val name: String,
    val email: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<StreamLargeObjectsResponseObjectsElement> {
        @JvmStatic
        override fun new(): StreamLargeObjectsResponseObjectsElement {
            return StreamLargeObjectsResponseObjectsElement(
                id = "",
                name = "",
                email = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): StreamLargeObjectsResponseObjectsElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): StreamLargeObjectsResponseObjectsElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] StreamLargeObjectsResponseObjectsElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty StreamLargeObjectsResponseObjectsElement.")
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
            return StreamLargeObjectsResponseObjectsElement(
                id,
                name,
                email,
            )
        }
    }
}

data class ChatMessageParams(
    val channelId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<ChatMessageParams> {
        @JvmStatic
        override fun new(): ChatMessageParams {
            return ChatMessageParams(
                channelId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ChatMessageParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ChatMessageParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] ChatMessageParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ChatMessageParams.")
                return new()
            }
            val channelId: String = when (__input.jsonObject["channelId"]) {
                is JsonPrimitive -> __input.jsonObject["channelId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ChatMessageParams(
                channelId,
            )
        }
    }
}

sealed interface ChatMessage : TestClientModel {
    val messageType: String

    companion object Factory : TestClientModelFactory<ChatMessage> {
        @JvmStatic
        override fun new(): ChatMessage {
            return ChatMessageText.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ChatMessage {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ChatMessage {
            if (__input !is JsonObject) {
                __logError("[WARNING] ChatMessage.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ChatMessage.")
                return new()
            }
            return when (__input.jsonObject["messageType"]) {
                is JsonPrimitive -> when (__input.jsonObject["messageType"]!!.jsonPrimitive.contentOrNull) {
                    "TEXT" -> ChatMessageText.fromJsonElement(__input, instancePath)
                    "IMAGE" -> ChatMessageImage.fromJsonElement(__input, instancePath)
                    "URL" -> ChatMessageUrl.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ChatMessageText(
    val id: String,
    val channelId: String,
    val userId: String,
    val date: Instant,
    val text: String,
) : ChatMessage {
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

    companion object Factory : TestClientModelFactory<ChatMessageText> {
        @JvmStatic
        override fun new(): ChatMessageText {
            return ChatMessageText(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.EPOCH,
                text = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ChatMessageText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ChatMessageText {
            if (__input !is JsonObject) {
                __logError("[WARNING] ChatMessageText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ChatMessageText.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val text: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ChatMessageText(
                id,
                channelId,
                userId,
                date,
                text,
            )
        }
    }
}

data class ChatMessageImage(
    val id: String,
    val channelId: String,
    val userId: String,
    val date: Instant,
    val image: String,
) : ChatMessage {
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

    companion object Factory : TestClientModelFactory<ChatMessageImage> {
        @JvmStatic
        override fun new(): ChatMessageImage {
            return ChatMessageImage(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.EPOCH,
                image = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ChatMessageImage {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ChatMessageImage {
            if (__input !is JsonObject) {
                __logError("[WARNING] ChatMessageImage.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ChatMessageImage.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val image: String = when (__input.jsonObject["image"]) {
                is JsonPrimitive -> __input.jsonObject["image"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ChatMessageImage(
                id,
                channelId,
                userId,
                date,
                image,
            )
        }
    }
}

data class ChatMessageUrl(
    val id: String,
    val channelId: String,
    val userId: String,
    val date: Instant,
    val url: String,
) : ChatMessage {
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

    companion object Factory : TestClientModelFactory<ChatMessageUrl> {
        @JvmStatic
        override fun new(): ChatMessageUrl {
            return ChatMessageUrl(
                id = "",
                channelId = "",
                userId = "",
                date = Instant.EPOCH,
                url = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ChatMessageUrl {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ChatMessageUrl {
            if (__input !is JsonObject) {
                __logError("[WARNING] ChatMessageUrl.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ChatMessageUrl.")
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val url: String = when (__input.jsonObject["url"]) {
                is JsonPrimitive -> __input.jsonObject["url"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ChatMessageUrl(
                id,
                channelId,
                userId,
                date,
                url,
            )
        }
    }
}

data class TestsStreamRetryWithNewCredentialsResponse(
    val message: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<TestsStreamRetryWithNewCredentialsResponse> {
        @JvmStatic
        override fun new(): TestsStreamRetryWithNewCredentialsResponse {
            return TestsStreamRetryWithNewCredentialsResponse(
                message = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): TestsStreamRetryWithNewCredentialsResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): TestsStreamRetryWithNewCredentialsResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] TestsStreamRetryWithNewCredentialsResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty TestsStreamRetryWithNewCredentialsResponse.")
                return new()
            }
            val message: String = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return TestsStreamRetryWithNewCredentialsResponse(
                message,
            )
        }
    }
}

data class UsersWatchUserParams(
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UsersWatchUserParams> {
        @JvmStatic
        override fun new(): UsersWatchUserParams {
            return UsersWatchUserParams(
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] UsersWatchUserParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserParams.")
                return new()
            }
            val userId: String = when (__input.jsonObject["userId"]) {
                is JsonPrimitive -> __input.jsonObject["userId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return UsersWatchUserParams(
                userId,
            )
        }
    }
}

data class UsersWatchUserResponse(
    val id: String,
    val role: UsersWatchUserResponseRole,
    /**
     * A profile picture
     */
    val photo: UserPhoto?,
    val createdAt: Instant,
    val numFollowers: Int,
    val settings: UserSettings,
    val recentNotifications: MutableList<UsersWatchUserResponseRecentNotificationsElement>,
    val bookmarks: MutableMap<String, UsersWatchUserResponseBookmarksValue>,
    val metadata: MutableMap<String, JsonElement>,
    val randomList: MutableList<JsonElement>,
    val bio: String? = null,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UsersWatchUserResponse> {
        @JvmStatic
        override fun new(): UsersWatchUserResponse {
            return UsersWatchUserResponse(
                id = "",
                role = UsersWatchUserResponseRole.new(),
                photo = null,
                createdAt = Instant.EPOCH,
                numFollowers = 0,
                settings = UserSettings.new(),
                recentNotifications = mutableListOf(),
                bookmarks = mutableMapOf(),
                metadata = mutableMapOf(),
                randomList = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserResponse {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserResponse {
            if (__input !is JsonObject) {
                __logError("[WARNING] UsersWatchUserResponse.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserResponse.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val role: UsersWatchUserResponseRole = when (__input.jsonObject["role"]) {
                is JsonNull -> UsersWatchUserResponseRole.new()
                is JsonPrimitive -> UsersWatchUserResponseRole.fromJsonElement(__input.jsonObject["role"]!!, "$instancePath/role")
                else -> UsersWatchUserResponseRole.new()
            }
            val photo: UserPhoto? = when (__input.jsonObject["photo"]) {
                is JsonObject -> UserPhoto.fromJsonElement(
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
                            Instant.EPOCH
                        }
                    else
                        Instant.EPOCH

                else -> Instant.EPOCH
            }
            val numFollowers: Int = when (__input.jsonObject["numFollowers"]) {
                is JsonPrimitive -> __input.jsonObject["numFollowers"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
            val settings: UserSettings = when (__input.jsonObject["settings"]) {
                is JsonObject -> UserSettings.fromJsonElement(
                    __input.jsonObject["settings"]!!,
                    "$instancePath/settings",
                )

                else -> UserSettings.new()
            }
            val recentNotifications: MutableList<UsersWatchUserResponseRecentNotificationsElement> = when (__input.jsonObject["recentNotifications"]) {
                is JsonArray -> {
                    val __value: MutableList<UsersWatchUserResponseRecentNotificationsElement> = mutableListOf()
                    for (__element in __input.jsonObject["recentNotifications"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> UsersWatchUserResponseRecentNotificationsElement.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> UsersWatchUserResponseRecentNotificationsElement.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            val bookmarks: MutableMap<String, UsersWatchUserResponseBookmarksValue> = when (__input.jsonObject["bookmarks"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, UsersWatchUserResponseBookmarksValue> = mutableMapOf()
                    for (__entry in __input.jsonObject["bookmarks"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonObject -> UsersWatchUserResponseBookmarksValue.fromJsonElement(
                                __entry.value!!,
                                "$instancePath/bookmarks",
                            )

                            else -> UsersWatchUserResponseBookmarksValue.new()
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
            return UsersWatchUserResponse(
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

enum class UsersWatchUserResponseRole {
    Standard,
    Admin;

    val serialValue: String
        get() = when (this) {
            Standard -> "standard"
            Admin -> "admin"
        }

    companion object Factory : TestClientModelFactory<UsersWatchUserResponseRole> {
        @JvmStatic
        override fun new(): UsersWatchUserResponseRole {
            return Standard
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserResponseRole {
            return when (input) {
                Standard.serialValue -> Standard
                Admin.serialValue -> Admin
                else -> Standard
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserResponseRole {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] UsersWatchUserResponseRole.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserResponseRole.")
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
data class UserPhoto(
    val url: String,
    val width: Double,
    val height: Double,
    val bytes: Long,
    /**
     * When the photo was last updated in nanoseconds
     */
    val nanoseconds: ULong,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UserPhoto> {
        @JvmStatic
        override fun new(): UserPhoto {
            return UserPhoto(
                url = "",
                width = 0.0,
                height = 0.0,
                bytes = 0L,
                nanoseconds = 0UL,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UserPhoto {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UserPhoto {
            if (__input !is JsonObject) {
                __logError("[WARNING] UserPhoto.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UserPhoto.")
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
            return UserPhoto(
                url,
                width,
                height,
                bytes,
                nanoseconds,
            )
        }
    }
}

data class UserSettings(
    val notificationsEnabled: Boolean,
    val preferredTheme: UserSettingsPreferredTheme,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UserSettings> {
        @JvmStatic
        override fun new(): UserSettings {
            return UserSettings(
                notificationsEnabled = false,
                preferredTheme = UserSettingsPreferredTheme.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UserSettings {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UserSettings {
            if (__input !is JsonObject) {
                __logError("[WARNING] UserSettings.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UserSettings.")
                return new()
            }
            val notificationsEnabled: Boolean = when (__input.jsonObject["notificationsEnabled"]) {
                is JsonPrimitive -> __input.jsonObject["notificationsEnabled"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            val preferredTheme: UserSettingsPreferredTheme = when (__input.jsonObject["preferredTheme"]) {
                is JsonNull -> UserSettingsPreferredTheme.new()
                is JsonPrimitive -> UserSettingsPreferredTheme.fromJsonElement(__input.jsonObject["preferredTheme"]!!, "$instancePath/preferredTheme")
                else -> UserSettingsPreferredTheme.new()
            }
            return UserSettings(
                notificationsEnabled,
                preferredTheme,
            )
        }
    }
}

enum class UserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System;

    val serialValue: String
        get() = when (this) {
            DarkMode -> "dark-mode"
            LightMode -> "light-mode"
            System -> "system"
        }

    companion object Factory : TestClientModelFactory<UserSettingsPreferredTheme> {
        @JvmStatic
        override fun new(): UserSettingsPreferredTheme {
            return DarkMode
        }

        @JvmStatic
        override fun fromJson(input: String): UserSettingsPreferredTheme {
            return when (input) {
                DarkMode.serialValue -> DarkMode
                LightMode.serialValue -> LightMode
                System.serialValue -> System
                else -> DarkMode
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UserSettingsPreferredTheme {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] UserSettingsPreferredTheme.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty UserSettingsPreferredTheme.")
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

sealed interface UsersWatchUserResponseRecentNotificationsElement : TestClientModel {
    val notificationType: String

    companion object Factory : TestClientModelFactory<UsersWatchUserResponseRecentNotificationsElement> {
        @JvmStatic
        override fun new(): UsersWatchUserResponseRecentNotificationsElement {
            return UsersWatchUserResponseRecentNotificationsElementPostLike.new()
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserResponseRecentNotificationsElement {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserResponseRecentNotificationsElement {
            if (__input !is JsonObject) {
                __logError("[WARNING] UsersWatchUserResponseRecentNotificationsElement.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserResponseRecentNotificationsElement.")
                return new()
            }
            return when (__input.jsonObject["notificationType"]) {
                is JsonPrimitive -> when (__input.jsonObject["notificationType"]!!.jsonPrimitive.contentOrNull) {
                    "POST_LIKE" -> UsersWatchUserResponseRecentNotificationsElementPostLike.fromJsonElement(__input, instancePath)
                    "POST_COMMENT" -> UsersWatchUserResponseRecentNotificationsElementPostComment.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class UsersWatchUserResponseRecentNotificationsElementPostLike(
    val postId: String,
    val userId: String,
) : UsersWatchUserResponseRecentNotificationsElement {
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

    companion object Factory : TestClientModelFactory<UsersWatchUserResponseRecentNotificationsElementPostLike> {
        @JvmStatic
        override fun new(): UsersWatchUserResponseRecentNotificationsElementPostLike {
            return UsersWatchUserResponseRecentNotificationsElementPostLike(
                postId = "",
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserResponseRecentNotificationsElementPostLike {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserResponseRecentNotificationsElementPostLike {
            if (__input !is JsonObject) {
                __logError("[WARNING] UsersWatchUserResponseRecentNotificationsElementPostLike.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserResponseRecentNotificationsElementPostLike.")
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
            return UsersWatchUserResponseRecentNotificationsElementPostLike(
                postId,
                userId,
            )
        }
    }
}

data class UsersWatchUserResponseRecentNotificationsElementPostComment(
    val postId: String,
    val userId: String,
    val commentText: String,
) : UsersWatchUserResponseRecentNotificationsElement {
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

    companion object Factory : TestClientModelFactory<UsersWatchUserResponseRecentNotificationsElementPostComment> {
        @JvmStatic
        override fun new(): UsersWatchUserResponseRecentNotificationsElementPostComment {
            return UsersWatchUserResponseRecentNotificationsElementPostComment(
                postId = "",
                userId = "",
                commentText = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserResponseRecentNotificationsElementPostComment {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserResponseRecentNotificationsElementPostComment {
            if (__input !is JsonObject) {
                __logError("[WARNING] UsersWatchUserResponseRecentNotificationsElementPostComment.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserResponseRecentNotificationsElementPostComment.")
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
            return UsersWatchUserResponseRecentNotificationsElementPostComment(
                postId,
                userId,
                commentText,
            )
        }
    }
}

data class UsersWatchUserResponseBookmarksValue(
    val postId: String,
    val userId: String,
) : TestClientModel {
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

    companion object Factory : TestClientModelFactory<UsersWatchUserResponseBookmarksValue> {
        @JvmStatic
        override fun new(): UsersWatchUserResponseBookmarksValue {
            return UsersWatchUserResponseBookmarksValue(
                postId = "",
                userId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): UsersWatchUserResponseBookmarksValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): UsersWatchUserResponseBookmarksValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] UsersWatchUserResponseBookmarksValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty UsersWatchUserResponseBookmarksValue.")
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
            return UsersWatchUserResponseBookmarksValue(
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
    params: TestClientModel?,
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
private enum class __TestClientSseEventLineType {
    Id,
    Event,
    Data,
    Retry,
    None,
}

private fun __parseSseEventLine(line: String): Pair<__TestClientSseEventLineType, String> {
    if (line.startsWith("id:")) {
        return Pair(__TestClientSseEventLineType.Id, line.substring(3).trim())
    }
    if (line.startsWith("event:")) {
        return Pair(__TestClientSseEventLineType.Event, line.substring(6).trim())
    }
    if (line.startsWith("data:")) {
        return Pair(__TestClientSseEventLineType.Data, line.substring(5).trim())
    }
    if (line.startsWith("retry:")) {
        return Pair(__TestClientSseEventLineType.Retry, line.substring(6).trim())
    }
    return Pair(__TestClientSseEventLineType.None, "")
}

private data class __TestClientSseEvent(
    val id: String? = null,
    val event: String,
    val data: String,
    val retry: Int? = null
)

private class __TestClientSseEventParsingResult(val events: List<__TestClientSseEvent>, val leftover: String)

private fun __parseSseEvents(input: String): __TestClientSseEventParsingResult {
    val events = mutableListOf<__TestClientSseEvent>()
    val lines = input.lines()
    if (lines.isEmpty()) {
        return __TestClientSseEventParsingResult(events = listOf(), leftover = "")
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
                __TestClientSseEventLineType.Id -> id = value
                __TestClientSseEventLineType.Event -> event = value
                __TestClientSseEventLineType.Data -> data = value
                __TestClientSseEventLineType.Retry -> retry = value.toInt()
                __TestClientSseEventLineType.None -> {}
            }
        }
        val isEnd = line == ""
        if (isEnd) {
            if (data != null) {
                events.add(
                    __TestClientSseEvent(
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
    return __TestClientSseEventParsingResult(
        events = events,
        leftover = if (lastIndex != null) lines.subList(lastIndex!!, lines.size).joinToString(separator = "\n") else ""
    )
}
// SSE_FN_END

private suspend fun __handleSseRequest(
    httpClient: HttpClient,
    url: String,
    method: HttpMethod,
    params: TestClientModel?,
    headers: __TestClientHeadersFn,
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onError: ((err: Exception) -> Unit) = {},
    onRequestError: ((err: Exception) -> Unit) = {},
    onResponseError: ((err: TestClientError) -> Unit) = {},
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
                        val err = TestClientError.fromJson(httpResponse.bodyAsText())
                        onError(err)
                        onResponseError(err)
                    } else {
                        val err = TestClientError(
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
                    val err = TestClientError(
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
            val heartbeatIntervalMs = httpResponse.headers["heartbeat-interval"]?.toLongOrNull() ?: 0L
            val channel: ByteReadChannel = httpResponse.body()
            var pendingData = ""
            while (!channel.isClosedForRead) {
                val buffer = ByteBuffer.allocateDirect(bufferCapacity)
                val read = if (heartbeatIntervalMs > 0L) {
                    withTimeoutOrNull(heartbeatIntervalMs * 2L) {
                        channel.readAvailable(buffer)
                    }
                } else {
                    channel.readAvailable(buffer)
                }
                if (read == null) {
                    // no data or heartbeat was received in time so assume the connection is dead and reconnect
                    httpResponse.cancel()
                    break
                }
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