import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.*
import kotlinx.coroutines.test.TestScope
import kotlinx.serialization.encodeToString
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
    fun sendObject() = runBlocking {
        val now = Instant.now()
        val result = client.miscTests.sendObject(
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
                _object = ObjectWithEveryTypeObject(
                    string = "hello world",
                    boolean = false,
                    timestamp = Instant.now()
                ),
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
        assertEquals(true, result.boolean)
        assertEquals("hello world", result.string)
        assertEquals(now.epochSecond, result.timestamp.epochSecond)
        assertEquals(3.14f, result.float32)
        assertEquals(3.14, result.float64)
        assertEquals(1.toByte(), result.int8)
        assertEquals(2.toShort(), result.int16)
        assertEquals(3, result.int32)
        assertEquals(4L, result.int64)
        assertEquals(1.toUByte(), result.uint8)
        assertEquals(2.toUShort(), result.uint16)
        assertEquals(3.toUInt(), result.uint32)
        assertEquals(4.toULong(), result.uint64)
        assertEquals(ObjectWithEveryTypeEnumerator.B, result.enumerator)
        assertEquals(3, result.array.size)
        assertEquals(true, result.array[0])
        assertEquals(false, result.array[1])
        assertEquals(false, result.array[2])
        assertEquals(true, result.record["hello_world"])
        assertEquals(false, result.record["goodbye_world"])
        when (val discriminatorResult = result.discriminator) {
            is ObjectWithEveryTypeDiscriminatorA -> assertEquals("Joe Johnson", discriminatorResult.title)
            is ObjectWithEveryTypeDiscriminatorB -> throw Exception("Expected type to be ObjectWithEveryTypeDiscriminatorA")
        }
        assertEquals(now.epochSecond, result.nestedObject.data.timestamp.epochSecond)
        assertEquals("123", result.nestedObject.data.data.id)
    }

    @Test
    fun sendPartialObject() = runBlocking {
        val result = client.miscTests.sendPartialObject(
            ObjectWithEveryOptionalType(
                array = listOf(true, false, false),
                uint64 = 10.toULong()
            )
        )
        assertEquals(null, result.any)
        assertEquals(null, result.float32)
        assertEquals(null, result.float64)
        assertEquals(null, result.int8)
        assertEquals(null, result.int16)
        assertEquals(null, result.int32)
        assertEquals(null, result.int64)
        assertEquals(null, result.uint8)
        assertEquals(null, result.uint16)
        assertEquals(null, result.uint32)
        assertEquals(10.toULong(), result.uint64)
        assertEquals(3, result.array?.size)
        assertEquals(true, result.array!![0])
        assertEquals(false, result.array!![1])
        assertEquals(false, result.array!![2])
    }

    @Test
    fun streamMessages() = runBlocking {
        var openCount = 0
        var errorCount = 0
        val messages = mutableListOf<ChatMessage>()
        val job = client.miscTests.streamMessages(
            TestScope(),
            params = ChatMessageParams(channelId = "6"),
            onOpen = { _ ->
                openCount++
            },
            onError = { _ ->
                errorCount++
            },
            onData = { message ->
                messages.add(message)
            },
        )
        delay(1000)
        job.cancel()
        assert(messages.size > 1)
        assertEquals(1, openCount)
        assertEquals(0, errorCount)
        for (message in messages) {
            when (message) {
                is ChatMessageText -> {
                    assertEquals("6", message.channelId)
                }

                is ChatMessageImage -> {
                    assertEquals("6", message.channelId)
                }

                is ChatMessageUrl -> {
                    assertEquals("6", message.channelId)
                }
            }
        }
    }
}
