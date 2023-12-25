import io.ktor.client.HttpClient
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runInterruptible
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


class TestClient(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf()
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
    private val headers: Map<String, String> = mutableMapOf()
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

    suspend fun watchUser(
        params: UserParams,
        lastEventId: String? = null,
        onData: ((data: User) -> Unit)? = null,
        onError: ((error: TestClientError) -> Unit)? = null,
        onConnectionError: ((error: TestClientError) -> Unit)? = null,
        onOpen: ((response: HttpResponse) -> Unit)? = null,
        onClose: (() -> Unit)? = null,
        bufferCapacity: Int = 1024
    ) {
        var lastId = lastEventId
        val finalHeaders = mutableMapOf<String, String>()
        for (item in headers.entries) {
            finalHeaders[item.key] = item.value
        }
        finalHeaders["Accept"] = "application/json, text/event-stream"
        suspend fun handleSseRequest() {
            if(lastId != null) {
                finalHeaders["Last-Event-ID"] = lastId.toString()
            }
            val request = prepareRequest(
                client = httpClient,
                url = "${baseUrl}/rpcs/users/watch-user",
                method = HttpMethod.Get,
                params = JsonInstance.encodeToJsonElement(params),
                headers = finalHeaders,
            )
            try {
                request.execute { httpResponse ->
                    if (onOpen != null) {
                        onOpen(httpResponse)
                    }
                    if (httpResponse.status.value != 200) {
                        if (onConnectionError != null) {
                            onConnectionError(
                                TestClientError(
                                    statusCode = httpResponse.status.value,
                                    statusMessage = "Error fetching stream",
                                    data = httpResponse.toString(),
                                    stack = ""
                                )
                            )
                        }
                        handleSseRequest()
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
                            if(event.id != null) {
                                lastId = event.id
                            }
                            when (event.event) {
                                "message" -> {
                                    val data = JsonInstance.decodeFromString<User>(event.data)
                                    if (onData != null) {
                                        onData(data)
                                    }
                                }

                                "done" -> {
                                    if (onClose != null) {
                                        onClose()
                                    }
//                                    httpResponse.cancel()
                                    return@execute
                                }

                                "error" -> {
                                    val error = JsonInstance.decodeFromString<TestClientError>(event.data)
                                    if (onError != null) {
                                        onError(error)
                                    }
                                }
                                else -> {}
                            }
                        }
                    }
                }
            } catch(e: Exception) {
                handleSseRequest()
            }
        }
        handleSseRequest()
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
    @Serializable(with = InstantAsStringSerializer::class) val createdAt: Instant,
    val numFollowers: Int,
    val settings: UserSettings,
    val recentNotifications: List<UserRecentNotificationsItem>,
    val bookmarks: Map<String, UserBookmarksValue>,
    val bio: String?,
    val metadata: Map<String, Unit>,
    val randomList: Array<Unit>
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
        result = 31 * result + numFollowers
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
sealed class UserRecentNotificationsItem(val notificationType: String) {}

@Serializable
data class UserRecentNotificationsItemPostList(
    val postId: String,
    val userId: String,
) : UserRecentNotificationsItem("POST_LIKE")

@Serializable
data class UserRecentNotificationsItemPostComment(
    val postId: String,
    val userId: String,
    val commentText: String,
) : UserRecentNotificationsItem("POST_COMMENT")

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
    val id: String, val photo: UserPhoto?, val bio: String?
)

@Serializable
data class TestClientError(
    val statusCode: Int,
    val statusMessage: String,
    @Serializable(with = AnyAsStringSerializer::class) val data: Any,
    val stack: String?
)

object AnyAsStringSerializer : KSerializer<Any> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor("Any", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): Any {
        TODO("Not yet implemented")
    }

    override fun serialize(encoder: Encoder, value: Any) {
        TODO("Not yet implemented")
    }

}

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


private class RequestPayload(val url: String, val method: HttpMethod, val body: String)

private fun getRequestPayload(url: String, method: HttpMethod, params: JsonElement?): RequestPayload {
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
    return RequestPayload(finalUrl, method, finalBody)
}

private suspend fun prepareRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: JsonElement?,
    headers: Map<String, String>?,
): HttpStatement {
    val payload = getRequestPayload(url = url, method = method, params = params)
    val builder = HttpRequestBuilder(payload.url)
    builder.method = method
    builder.url(payload.url)
    builder.timeout {
        requestTimeoutMillis = 10 * 60 * 1000
    }
    if (headers != null) {
        for (entry in headers.entries) {
            builder.headers[entry.key] = entry.value
        }
    }
    if (method != HttpMethod.Get && method != HttpMethod.Head) {
        builder.setBody(payload.body)
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

val JsonInstance = Json { ignoreUnknownKeys = true }

private class SseEvent(val id: String? = null, val event: String? = null, val data: String)
