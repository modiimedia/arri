import com.sun.tools.javac.jvm.PoolConstant.Dynamic
import io.ktor.client.HttpClient
import io.ktor.client.call.*
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.head
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.headers
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
import java.time.Instant

enum class HttpMethod { GET, HEAD, POST, PUT, PATCH, DELETE }

class TestClient(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf()
) {
    val users = TestClientUsersService(httpClient, baseUrl, headers)

    suspend fun getStatus(): GetStatusResponse {
        val result = handleRequest(
            client = this.httpClient,
            url = "${this.baseUrl}/status",
            method = HttpMethod.GET,
            params = null,
            headers = this.headers,
        )
        return Json.decodeFromString<GetStatusResponse>(result.body())
    }
}

class TestClientUsersService(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf()
) {
    val settings = TestClientUsersSettingsService(httpClient, baseUrl, headers)

    suspend fun getUser(params: UserParams): User {
        val result = handleRequest(
            client = httpClient,
            url = "${baseUrl}/users/get-user",
            method = HttpMethod.GET,
            params = Json.encodeToJsonElement<UserParams>(params),
            headers = headers,
        )
        return Json.decodeFromString<User>(result.body())
    }

    suspend fun updateUser(params: UpdateUserParams): User {
        val result = handleRequest(
            client = httpClient,
            url = "${baseUrl}/users/update-user",
            method = HttpMethod.POST,
            params = Json.encodeToJsonElement(params),
            headers = headers,
        )
        return Json.decodeFromString<User>(result.body())
    }
}

class TestClientUsersSettingsService(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf(),
) {
    suspend fun getUserSettings(): Unit {
        handleRequest(
            client = httpClient,
            url = "${baseUrl}/users/settings/get-user-settings",
            method = HttpMethod.GET,
            params = null,
            headers = headers,
        )
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
) :
    UserRecentNotificationsItem("POST_COMMENT")

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
    val photo: UserPhoto?,
    val bio: String?
)

@Serializable
data class TestClientError(
    val statusCode: Int,
    val statusMessage: String,
    val data: Dynamic,
    val stack: String?
)


object InstantAsStringSerializer: KSerializer<Instant> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): Instant {
        return Instant.parse(decoder.decodeString())
    }

    override fun serialize(encoder: Encoder, value: Instant) {
        return encoder.encodeString(value.toString())
    }
}


private suspend fun handleRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: JsonElement?,
    headers: Map<String, String>?,
): HttpResponse {
    var finalUrl = url;
    var finalBody = ""
    when (method) {
        HttpMethod.GET, HttpMethod.HEAD -> {
            val queryParts = mutableListOf<String>()
            params?.jsonObject?.entries?.forEach {
                queryParts.add("${it.key}=${it.value.toString()}")
            }
            finalUrl = "$finalUrl?${queryParts.joinToString("&")}"
        }

        HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE -> {
            finalBody = params?.toString() ?: ""
        }
    }
    return when (method) {
        HttpMethod.GET -> client.get(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
        }

        HttpMethod.HEAD -> client.head(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
        }

        HttpMethod.POST -> client.post(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }

        HttpMethod.PUT -> client.put(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }

        HttpMethod.PATCH -> client.patch(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }

        HttpMethod.DELETE -> client.delete(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }
    }
}

