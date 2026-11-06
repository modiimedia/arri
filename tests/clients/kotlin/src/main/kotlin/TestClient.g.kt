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

    suspend fun sendRecursiveUnion(params: RecursiveUnion): RecursiveUnion {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union",
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
                return RecursiveUnion.fromJson(response.bodyAsText())
            }
            throw TestClientError.fromJson(response.bodyAsText())
        } catch (e: Exception) {
            onError(e)
            throw e
        }
    }

    suspend fun sendRecursiveUnionV2(params: RecursiveUnionV2): RecursiveUnionV2 {
        try {
            val response = __prepareRequest(
                client = httpClient,
                url = "$baseUrl/rpcs/tests/send-recursive-union-v2",
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
                return RecursiveUnionV2.fromJson(response.bodyAsText())
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
    val discriminator: ObjectWithEveryTypeDiscriminator,
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
        output += ",\"discriminator\":"
        output += discriminator.toJson()
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
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/discriminator.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionExternal.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionInternal.")
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
                enumerator = ObjectWithEveryTypeEnumerator.new(),
                array = mutableListOf(),
                `object` = ObjectWithEveryTypeObject.new(),
                record = mutableMapOf(),
                discriminator = ObjectWithEveryTypeDiscriminator.new(),
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
            val discriminator: ObjectWithEveryTypeDiscriminator = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> ObjectWithEveryTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )

                else -> ObjectWithEveryTypeDiscriminator.new()
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
                discriminator,
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
            return ObjectWithEveryTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}

sealed interface ObjectWithEveryTypeDiscriminator : TestClientModel {
    val type: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeDiscriminator> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeDiscriminator {
            return ObjectWithEveryTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeDiscriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> ObjectWithEveryTypeDiscriminatorA.fromJsonElement(__input, instancePath)
                    "B" -> ObjectWithEveryTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryTypeDiscriminatorA(
    val title: String,
) : ObjectWithEveryTypeDiscriminator {
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
        queryParts.add("title=${__encodeQueryValue(title)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeDiscriminatorA {
            return ObjectWithEveryTypeDiscriminatorA(
                title = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeDiscriminatorA.")
                return new()
            }
            val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithEveryTypeDiscriminatorA(
                title,
            )
        }
    }
}

data class ObjectWithEveryTypeDiscriminatorB(
    val title: String,
    val description: String,
) : ObjectWithEveryTypeDiscriminator {
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
        queryParts.add("title=${__encodeQueryValue(title)}")
        queryParts.add("description=${__encodeQueryValue(description)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): ObjectWithEveryTypeDiscriminatorB {
            return ObjectWithEveryTypeDiscriminatorB(
                title = "",
                description = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryTypeDiscriminatorB.")
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
            return ObjectWithEveryTypeDiscriminatorB(
                title,
                description,
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
                        Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
            return ObjectWithEveryTypeNestedArrayElementElement(
                id,
                timestamp,
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
    val discriminator: ObjectWithEveryNullableTypeDiscriminator?,
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
        output += ",\"discriminator\":"
        output += discriminator?.toJson()
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
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/discriminator.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionExternal.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionInternal.")
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
                discriminator = null,
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
            val discriminator: ObjectWithEveryNullableTypeDiscriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> ObjectWithEveryNullableTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )

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
                discriminator,
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
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

sealed interface ObjectWithEveryNullableTypeDiscriminator : TestClientModel {
    val type: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeDiscriminator> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeDiscriminator {
            return ObjectWithEveryNullableTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeDiscriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> ObjectWithEveryNullableTypeDiscriminatorA.fromJsonElement(__input, instancePath)
                    "B" -> ObjectWithEveryNullableTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryNullableTypeDiscriminatorA(
    val title: String?,
) : ObjectWithEveryNullableTypeDiscriminator {
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
        queryParts.add("title=${__encodeQueryValue(title)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeDiscriminatorA {
            return ObjectWithEveryNullableTypeDiscriminatorA(
                title = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeDiscriminatorA.")
                return new()
            }
            val title: String? = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            return ObjectWithEveryNullableTypeDiscriminatorA(
                title,
            )
        }
    }
}

data class ObjectWithEveryNullableTypeDiscriminatorB(
    val title: String?,
    val description: String?,
) : ObjectWithEveryNullableTypeDiscriminator {
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
        queryParts.add("title=${__encodeQueryValue(title)}")
        queryParts.add("description=${__encodeQueryValue(description)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryNullableTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): ObjectWithEveryNullableTypeDiscriminatorB {
            return ObjectWithEveryNullableTypeDiscriminatorB(
                title = null,
                description = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryNullableTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryNullableTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryNullableTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryNullableTypeDiscriminatorB.")
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
            return ObjectWithEveryNullableTypeDiscriminatorB(
                title,
                description,
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
                        Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
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
                createdAt = Instant.now(),
                displayName = "",
                phoneNumber = null,
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
            return ObjectWithPascalCaseKeys(
                createdAt,
                displayName,
                phoneNumber,
                emailAddress,
                isAdmin,
            )
        }
    }
}

data class ObjectWithSnakeCaseKeys(
    val createdAt: Instant,
    val displayName: String,
    val phoneNumber: String?,
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
                createdAt = Instant.now(),
                displayName = "",
                phoneNumber = null,
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
            return ObjectWithSnakeCaseKeys(
                createdAt,
                displayName,
                phoneNumber,
                emailAddress,
                isAdmin,
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
    val discriminator: ObjectWithEveryOptionalTypeDiscriminator? = null,
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
        if (discriminator != null) {
            if (hasProperties) output += ","
            output += "\"discriminator\":"
            output += discriminator.toJson()
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
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/discriminator.")
        __logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionExternal.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionInternal.")
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
            val discriminator: ObjectWithEveryOptionalTypeDiscriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> ObjectWithEveryOptionalTypeDiscriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )

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
                discriminator,
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
            return ObjectWithEveryOptionalTypeObject(
                string,
                boolean,
                timestamp,
            )
        }
    }
}

sealed interface ObjectWithEveryOptionalTypeDiscriminator : TestClientModel {
    val type: String

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeDiscriminator> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeDiscriminator {
            return ObjectWithEveryOptionalTypeDiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeDiscriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeDiscriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeDiscriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeDiscriminator.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> ObjectWithEveryOptionalTypeDiscriminatorA.fromJsonElement(__input, instancePath)
                    "B" -> ObjectWithEveryOptionalTypeDiscriminatorB.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
            }
        }
    }
}

data class ObjectWithEveryOptionalTypeDiscriminatorA(
    val title: String,
) : ObjectWithEveryOptionalTypeDiscriminator {
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
        queryParts.add("title=${__encodeQueryValue(title)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeDiscriminatorA> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeDiscriminatorA {
            return ObjectWithEveryOptionalTypeDiscriminatorA(
                title = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeDiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeDiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeDiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeDiscriminatorA.")
                return new()
            }
            val title: String = when (__input.jsonObject["title"]) {
                is JsonPrimitive -> __input.jsonObject["title"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return ObjectWithEveryOptionalTypeDiscriminatorA(
                title,
            )
        }
    }
}

data class ObjectWithEveryOptionalTypeDiscriminatorB(
    val title: String,
    val description: String,
) : ObjectWithEveryOptionalTypeDiscriminator {
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
        queryParts.add("title=${__encodeQueryValue(title)}")
        queryParts.add("description=${__encodeQueryValue(description)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<ObjectWithEveryOptionalTypeDiscriminatorB> {
        @JvmStatic
        override fun new(): ObjectWithEveryOptionalTypeDiscriminatorB {
            return ObjectWithEveryOptionalTypeDiscriminatorB(
                title = "",
                description = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryOptionalTypeDiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryOptionalTypeDiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryOptionalTypeDiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryOptionalTypeDiscriminatorB.")
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
            return ObjectWithEveryOptionalTypeDiscriminatorB(
                title,
                description,
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
                        Instant.parse(__input.jsonObject["nullable-timestamp"]!!.jsonPrimitive.content)
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
                        Instant.parse(__input.jsonObject["data"]!!.jsonPrimitive.content)
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                timestamp = Instant.now(),
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
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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

sealed interface RecursiveUnion : TestClientModel {
    val type: String

    companion object Factory : TestClientModelFactory<RecursiveUnion> {
        @JvmStatic
        override fun new(): RecursiveUnion {
            return RecursiveUnionChildren.new()
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnion {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnion {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnion.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnion.")
                return new()
            }
            return when (__input.jsonObject["type"]) {
                is JsonPrimitive -> when (__input.jsonObject["type"]!!.jsonPrimitive.contentOrNull) {
                    "CHILD" -> RecursiveUnionChild.fromJsonElement(__input, instancePath)
                    "CHILDREN" -> RecursiveUnionChildren.fromJsonElement(__input, instancePath)
                    "TEXT" -> RecursiveUnionText.fromJsonElement(__input, instancePath)
                    "SHAPE" -> RecursiveUnionShape.fromJsonElement(__input, instancePath)
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
data class RecursiveUnionChild(
    val data: RecursiveUnion,
) : RecursiveUnion {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionChild> {
        @JvmStatic
        override fun new(): RecursiveUnionChild {
            return RecursiveUnionChild(
                data = RecursiveUnion.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionChild {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionChild {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionChild.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionChild.")
                return new()
            }
            val data: RecursiveUnion = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnion.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> RecursiveUnion.new()
            }
            return RecursiveUnionChild(
                data,
            )
        }
    }
}

/**
 * List of children node
 */
data class RecursiveUnionChildren(
    val data: MutableList<RecursiveUnion>,
) : RecursiveUnion {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionChildren> {
        @JvmStatic
        override fun new(): RecursiveUnionChildren {
            return RecursiveUnionChildren(
                data = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionChildren {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionChildren {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionChildren.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionChildren.")
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
            return RecursiveUnionChildren(
                data,
            )
        }
    }
}

/**
 * Text node
 */
data class RecursiveUnionText(
    val data: String,
) : RecursiveUnion {
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
        queryParts.add("data=${__encodeQueryValue(data)}")
        return queryParts.joinToString("&")
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionText> {
        @JvmStatic
        override fun new(): RecursiveUnionText {
            return RecursiveUnionText(
                data = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionText {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionText {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionText.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionText.")
                return new()
            }
            val data: String = when (__input.jsonObject["data"]) {
                is JsonPrimitive -> __input.jsonObject["data"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return RecursiveUnionText(
                data,
            )
        }
    }
}

/**
 * Shape node
 */
data class RecursiveUnionShape(
    val data: RecursiveUnionShapeData,
) : RecursiveUnion {
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

    companion object Factory : TestClientModelFactory<RecursiveUnionShape> {
        @JvmStatic
        override fun new(): RecursiveUnionShape {
            return RecursiveUnionShape(
                data = RecursiveUnionShapeData.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionShape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionShape {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionShape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionShape.")
                return new()
            }
            val data: RecursiveUnionShapeData = when (__input.jsonObject["data"]) {
                is JsonObject -> RecursiveUnionShapeData.fromJsonElement(
                    __input.jsonObject["data"]!!,
                    "$instancePath/data",
                )

                else -> RecursiveUnionShapeData.new()
            }
            return RecursiveUnionShape(
                data,
            )
        }
    }
}

data class RecursiveUnionShapeData(
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

    companion object Factory : TestClientModelFactory<RecursiveUnionShapeData> {
        @JvmStatic
        override fun new(): RecursiveUnionShapeData {
            return RecursiveUnionShapeData(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionShapeData {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionShapeData {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionShapeData.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionShapeData.")
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
            return RecursiveUnionShapeData(
                width,
                height,
                color,
            )
        }
    }
}

sealed interface RecursiveUnionV2 : TestClientModel {
    companion object Factory : TestClientModelFactory<RecursiveUnionV2> {
        @JvmStatic
        override fun new(): RecursiveUnionV2 {
            return RecursiveUnionV2Children.new()
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionV2 {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionV2 {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionV2.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionV2.")
                return new()
            }
            return when {
                "child" in __input -> RecursiveUnionV2Child.fromJsonElement(__input, instancePath)
                "children" in __input -> RecursiveUnionV2Children.fromJsonElement(__input, instancePath)
                "text" in __input -> RecursiveUnionV2Text.fromJsonElement(__input, instancePath)
                "shape" in __input -> RecursiveUnionV2Shape.fromJsonElement(__input, instancePath)
                else -> new()
            }
        }
    }
}

data class RecursiveUnionV2Child(
    val value: RecursiveUnionV2,
) : RecursiveUnionV2 {
    override fun toJson(): String {
        var output = "{"
        output += "\"child\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionV2Child.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionV2Child> {
        @JvmStatic
        override fun new(): RecursiveUnionV2Child {
            return RecursiveUnionV2Child(
                value = RecursiveUnionV2.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionV2Child {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionV2Child {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionV2Child.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionV2Child.")
                return new()
            }
            val value: RecursiveUnionV2 = when (__input.jsonObject["child"]) {
                is JsonObject -> RecursiveUnionV2.fromJsonElement(
                    __input.jsonObject["child"]!!,
                    "$instancePath/child",
                )

                else -> RecursiveUnionV2.new()
            }
            return RecursiveUnionV2Child(
                value,
            )
        }
    }
}

data class RecursiveUnionV2Children(
    val value: MutableList<RecursiveUnionV2>,
) : RecursiveUnionV2 {
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
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionV2Children.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionV2Children> {
        @JvmStatic
        override fun new(): RecursiveUnionV2Children {
            return RecursiveUnionV2Children(
                value = mutableListOf(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionV2Children {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionV2Children {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionV2Children.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionV2Children.")
                return new()
            }
            val value: MutableList<RecursiveUnionV2> = when (__input.jsonObject["children"]) {
                is JsonArray -> {
                    val __value: MutableList<RecursiveUnionV2> = mutableListOf()
                    for (__element in __input.jsonObject["children"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonObject -> RecursiveUnionV2.fromJsonElement(
                                    __element!!,
                                    "$instancePath/undefined",
                                )

                                else -> RecursiveUnionV2.new()
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            return RecursiveUnionV2Children(
                value,
            )
        }
    }
}

data class RecursiveUnionV2Text(
    val value: String,
) : RecursiveUnionV2 {
    override fun toJson(): String {
        var output = "{"
        output += "\"text\":"
        output += buildString { printQuoted(value) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionV2Text.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionV2Text> {
        @JvmStatic
        override fun new(): RecursiveUnionV2Text {
            return RecursiveUnionV2Text(
                value = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionV2Text {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionV2Text {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionV2Text.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionV2Text.")
                return new()
            }
            val value: String = when (__input.jsonObject["text"]) {
                is JsonPrimitive -> __input.jsonObject["text"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return RecursiveUnionV2Text(
                value,
            )
        }
    }
}

data class RecursiveUnionV2Shape(
    val value: RecursiveUnionV2ShapeValue,
) : RecursiveUnionV2 {
    override fun toJson(): String {
        var output = "{"
        output += "\"shape\":"
        output += value.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionV2Shape.")
        return ""
    }

    companion object Factory : TestClientModelFactory<RecursiveUnionV2Shape> {
        @JvmStatic
        override fun new(): RecursiveUnionV2Shape {
            return RecursiveUnionV2Shape(
                value = RecursiveUnionV2ShapeValue.new(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionV2Shape {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionV2Shape {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionV2Shape.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionV2Shape.")
                return new()
            }
            val value: RecursiveUnionV2ShapeValue = when (__input.jsonObject["shape"]) {
                is JsonObject -> RecursiveUnionV2ShapeValue.fromJsonElement(
                    __input.jsonObject["shape"]!!,
                    "$instancePath/shape",
                )

                else -> RecursiveUnionV2ShapeValue.new()
            }
            return RecursiveUnionV2Shape(
                value,
            )
        }
    }
}

/**
 * Shape node
 */
data class RecursiveUnionV2ShapeValue(
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

    companion object Factory : TestClientModelFactory<RecursiveUnionV2ShapeValue> {
        @JvmStatic
        override fun new(): RecursiveUnionV2ShapeValue {
            return RecursiveUnionV2ShapeValue(
                width = 0.0,
                height = 0.0,
                color = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveUnionV2ShapeValue {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveUnionV2ShapeValue {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveUnionV2ShapeValue.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveUnionV2ShapeValue.")
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
            return RecursiveUnionV2ShapeValue(
                width,
                height,
                color,
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
                date = Instant.now(),
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
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                date = Instant.now(),
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
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                date = Instant.now(),
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
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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
                createdAt = Instant.now(),
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
                        Instant.parse(__input.jsonObject["createdAt"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
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