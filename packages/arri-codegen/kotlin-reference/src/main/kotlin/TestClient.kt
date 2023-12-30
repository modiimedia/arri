import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.*
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject
import java.nio.ByteBuffer
import java.time.Instant

val JsonInstance = Json { ignoreUnknownKeys = true }

class TestClient(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf(),
) {
    val users = TestClientUsersService(httpClient, baseUrl, headers)

    suspend fun getStatus(): GetStatusResponse {
        val response = prepareRequest(
            client = this.httpClient,
            url = "${this.baseUrl}/status",
            method = HttpMethod.Get,
            params = null,
            headers = this.headers,
        ).execute()
        return JsonInstance.decodeFromString<GetStatusResponse>(response.body())
    }
}

class TestClientUsersService(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf(),
) {
    val settings = TestClientUsersSettingsService(httpClient, baseUrl, headers)

    suspend fun getUser(params: UserParams): User {
        val response = prepareRequest(
            client = httpClient,
            url = "${baseUrl}/users/get-user",
            method = HttpMethod.Get,
            params = JsonInstance.encodeToJsonElement<UserParams>(params),
            headers = headers,
        ).execute()
        return JsonInstance.decodeFromString<User>(response.body())
    }

    suspend fun updateUser(params: UpdateUserParams): User {
        val response = prepareRequest(
            client = httpClient,
            url = "${baseUrl}/users/update-user",
            method = HttpMethod.Post,
            params = JsonInstance.encodeToJsonElement(params),
            headers = headers,
        ).execute()
        return JsonInstance.decodeFromString<User>(response.body())
    }

    fun watchUser(
        scope: CoroutineScope,
        params: UserParams,
        lastEventId: String? = null,
        onData: ((data: User) -> Unit) = {},
        onError: ((error: TestClientError) -> Unit) = {},
        onConnectionError: ((error: TestClientError) -> Unit) = {},
        onOpen: ((response: HttpResponse) -> Unit) = { },
        onClose: (() -> Unit) = { },
        bufferCapacity: Int = 1024
    ): Job {
        val finalHeaders = mutableMapOf<String, String>()
        for (item in headers.entries) {
            finalHeaders[item.key] = item.value
        }
        finalHeaders["Accept"] = "application/json, text/event-stream"
        val job = scope.launch {
            handleSseRequest(
                scope = scope,
                httpClient = httpClient,
                url = "$baseUrl/rpcs/users/watch-user",
                method = HttpMethod.Get,
                params = JsonInstance.encodeToJsonElement<UserParams>(params),
                headers = finalHeaders,
                backoffTime = 0,
                maxBackoffTime = 32000,
                lastEventId = lastEventId,
                bufferCapacity = bufferCapacity,
                onOpen = onOpen,
                onClose = onClose,
                onError = onError,
                onConnectionError = onConnectionError,
                onData = { str ->
                    val user = JsonInstance.decodeFromString<User>(str)
                    onData(user)
                }
            )
        }
        return job
    }

}

class TestClientUsersSettingsService(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf(),
) {
    suspend fun getUserSettings(): Unit {
        prepareRequest(
            client = httpClient,
            url = "${baseUrl}/users/settings/get-user-settings",
            method = HttpMethod.Get,
            params = null,
            headers = headers,
        ).execute()
    }
}

@Serializable
data class GetStatusResponse(val message: String)

@Serializable
data class User(
    val id: String,
    val role: UserRole,
    val photo: UserPhoto?,
    @Serializable(with = InstantAsStringSerializer::class)
    val createdAt: Instant,
    val numFollowers: Int,
    val settings: UserSettings,
    val recentNotifications: List<UserRecentNotificationsItem>,
    val bookmarks: Map<String, UserBookmarksValue>,
    val bio: String? = null,
    val metadata: Map<String, JsonElement>,
    val randomList: Array<JsonElement>,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as User

        if (id != other.id) return false
        if (role != other.role) return false
        if (photo != other.photo) return false
        if (createdAt != other.createdAt) return false
        if (numFollowers != other.numFollowers) return false
        if (settings != other.settings) return false
        if (recentNotifications != other.recentNotifications) return false
        if (bookmarks != other.bookmarks) return false
        if (bio != other.bio) return false
        if (metadata != other.metadata) return false
        if (!randomList.contentEquals(other.randomList)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + role.hashCode()
        result = 31 * result + (photo?.hashCode() ?: 0)
        result = 31 * result + createdAt.hashCode()
        result = 31 * result + numFollowers.hashCode()
        result = 31 * result + settings.hashCode()
        result = 31 * result + recentNotifications.hashCode()
        result = 31 * result + bookmarks.hashCode()
        result = 31 * result + (bio?.hashCode() ?: 0)
        result = 31 * result + metadata.hashCode()
        result = 31 * result + randomList.contentHashCode()
        return result
    }
}

enum class UserRole() {
    @SerialName("standard")
    Standard,

    @SerialName("admin")
    Admin,
}

@Serializable
data class UserPhoto(
    val url: String,
    val width: Double,
    val height: Double,
    val bytes: Long,
    val nanoseconds: ULong,
)

@Serializable
data class UserSettings(
    val notificationsEnabled: Boolean,
    val preferredTheme: UserSettingsPreferredTheme,
)

enum class UserSettingsPreferredTheme() {
    @SerialName("dark-mode")
    DarkMode,

    @SerialName("light-mode")
    LightMode,

    @SerialName("system")
    System,
}

@Serializable
sealed class UserRecentNotificationsItem()

@Serializable
@SerialName("POST_LIKE")
data class UserRecentNotificationsItemPostList(
    val postId: String,
    val userId: String,
) : UserRecentNotificationsItem()

@Serializable
@SerialName("POST_COMMENT")
data class UserRecentNotificationsItemPostComment(
    val postId: String,
    val userId: String,
    val commentText: String,
) : UserRecentNotificationsItem()

@Serializable
data class UserBookmarksValue(
    val postId: String,
    val userId: String,
)

@Serializable
data class UserParams(
    val userId: String,
)

@Serializable
data class UpdateUserParams(
    val id: String,
)

@Serializable
data class TestClientError(
    val statusCode: Int,
    val statusMessage: String,
    val data: JsonElement,
    val stack: String?
)

object InstantAsStringSerializer : KSerializer<Instant> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): Instant {
        return Instant.parse(decoder.decodeString())
    }

    override fun serialize(encoder: Encoder, value: Instant) {
        return encoder.encodeString(value.toString())
    }
}

private suspend fun prepareRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: JsonElement?,
    headers: Map<String, String>?,
): HttpStatement {
    var finalUrl = url
    var finalBody = ""
    when (method) {
        HttpMethod.Get, HttpMethod.Head -> {
            val queryParts = mutableListOf<String>()
            params?.jsonObject?.entries?.forEach {
                queryParts.add("${it.key}=${it.value}")
            }
            finalUrl = "$finalUrl?${queryParts.joinToString("&")}"
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
    builder.headers["client-version"] = "11"
    if (headers != null) {
        for (entry in headers.entries) {
            builder.headers[entry.key] = entry.value
        }
    }
    if (method != HttpMethod.Get && method != HttpMethod.Head) {
        builder.setBody(finalBody)
    }
    return client.prepareRequest(builder)
}

private fun parseSseEvent(input: String): SseEvent {
    val lines = input.split("\n")
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
    val inputs = input.split("\n\n")
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
    params: JsonElement?,
    headers: Map<String, String> = mutableMapOf(),
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onError: ((error: TestClientError) -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onConnectionError: ((error: TestClientError) -> Unit) = {},
    bufferCapacity: Int,
) {
    val finalHeaders = mutableMapOf<String, String>();
    for (entry in headers.entries) {
        finalHeaders[entry.key] = entry.value
    }
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
        params = JsonInstance.encodeToJsonElement(params),
        headers = finalHeaders,
    )
    try {
        request.execute { httpResponse ->

            onOpen(httpResponse)
            if (httpResponse.status.value != 200) {

                onConnectionError(
                    TestClientError(
                        statusCode = httpResponse.status.value,
                        statusMessage = "Error fetching stream",
                        data = JsonInstance.encodeToJsonElement(httpResponse),
                        stack = ""
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
                    onConnectionError = onConnectionError
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
                            val error = JsonInstance.decodeFromString<TestClientError>(event.data)
                            onError(error)
                        }

                        else -> {}
                    }
                }
            }
        }
    } catch (e: java.net.ConnectException) {
        onConnectionError(
            TestClientError(
                statusCode = 503,
                statusMessage = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonInstance.encodeToJsonElement(e),
                stack = e.stackTraceToString()
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
            onConnectionError = onConnectionError
        )
        return
    } catch (e: Exception) {
        onConnectionError(
            TestClientError(
                statusCode = 503,
                statusMessage = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonInstance.encodeToJsonElement(e),
                stack = e.stackTraceToString()
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
            onConnectionError = onConnectionError
        )
    }
}