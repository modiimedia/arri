import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.encodeToJsonElement
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals


internal class TestClientTest {
    private val httpClient = HttpClient() {
        install(HttpTimeout)
    }
    private val client = TestClient(
        httpClient = httpClient,
        headers = mutableMapOf(Pair("x-test-header", "test")),
        baseUrl = "http://127.0.0.1:2020",
    )
    @Test
    fun sendObject() {
        runBlocking {
            val now = Instant.now()
            val sendObjectResult = client.miscTests.sendObject(
                params = ObjectWithEveryType(
                    any = Json.encodeToJsonElement("Hello World"),
                    boolean = true,
                    string = "hello world",
                    timestamp = now,
                    float32 = 3.14f,
                    float64 = 3.14,
                    int8 = 1.toByte(),
                    int16 = 2.toShort(),
                    int32 = 3,
                    int64 = 4L,
                    uint8 = 1.toUByte(),
                    uint16 = 2.toUShort(),
                    uint32 = 3.toUInt(),
                    uint64 = 4.toULong(),
                    enumerator = ObjectWithEveryTypeEnumerator.B,
                    array = listOf(true, false, false),
                    _object = ObjectWithEveryTypeObject(string = "hello world", boolean = false, timestamp = Instant.now()),
                    record = mapOf(Pair("hello_world", true), Pair("goodbye_world", false)),
                    discriminator = ObjectWithEveryTypeDiscriminatorA(title = "Joe Johnson"),
                    nestedObject = ObjectWithEveryTypeNestedObject(
                        id = "1",
                        timestamp = now,
                        ObjectWithEveryTypeNestedObjectData(
                            id = "12",
                            timestamp = now,
                            data = ObjectWithEveryTypeNestedObjectDataData(id = "123", timestamp = now),
                        )
                    ),
                    nestedArray = listOf()
                )
            )
            assertEquals(false, true)
            assertEquals(true, sendObjectResult.boolean)
            assertEquals("hello world", sendObjectResult.string)
            assertEquals(3, sendObjectResult.array.size)
            assertEquals(true, sendObjectResult.array[0])
            assertEquals(false, sendObjectResult.array[1])
            assertEquals("123", sendObjectResult.nestedObject.data.data.id)
            assertEquals(4.toULong(), sendObjectResult.uint64)
        }
    }
}
