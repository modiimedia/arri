import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonPrimitive
import java.time.Instant

fun main() {
    val httpClient = HttpClient() {
        install(HttpTimeout)
    }
    val client = TestClient(
        httpClient = httpClient,
        baseUrl = "http://localhost:2020",
        headers = {
            mutableMapOf(Pair("x-test-header", "12345"))
        }
    )
    val unauthenticatedClient = TestClient(
        httpClient = httpClient,
        baseUrl = "http://localhost:2020",
        null
    )
    val targetDate = Instant.parse("2002-02-02T08:02:00.000Z")

    runBlocking {
        val tag = "EMPTY PARAM REQUESTS"
        val getResult = client.tests.emptyParamsGetRequest()
        val postResult = client.tests.emptyParamsPostRequest()
        expect(tag, getResult.message.isNotEmpty(), true)
        expect(tag, postResult.message.isNotEmpty(), true)
    }

    runBlocking {
        val tag = "EMPTY RESPONSE REQUESTS"
        client.tests.emptyResponseGetRequest(DefaultPayload(message = "Hello"))
        client.tests.emptyResponsePostRequest(DefaultPayload(message = "Hello"))
        expect(tag, true, result = true)
    }

    val objectInput = ObjectWithEveryType(
        any = JsonPrimitive("hello"),
        string = "hello world",
        boolean = false,
        timestamp = targetDate,
        int8 = 1,
        uint8 = 1u,
        int16 = 11,
        uint16 = 11u,
        int32 = 111,
        uint32 = 111u,
        int64 = 1111,
        uint64 = 1111u,
        float32 = 1.1F,
        float64 = 11.1,
        enumerator = ObjectWithEveryTypeEnumerator.B,
        array = mutableListOf(true, false, true),
        discriminator = ObjectWithEveryTypeDiscriminatorB(title = "Hello world", description = "hi"),
        nestedArray = mutableListOf(
            mutableListOf(
                ObjectWithEveryTypeNestedArrayElementElement(
                    id = "2",
                    timestamp = targetDate
                )
            )
        ),
        record = mutableMapOf(Pair("01", true), Pair("02", false)),
        nestedObject = ObjectWithEveryTypeNestedObject(
            id = "d1", timestamp = targetDate, data = ObjectWithEveryTypeNestedObjectData(
                id = "d2", timestamp = targetDate, data = ObjectWithEveryTypeNestedObjectDataData(
                    id = "d3", timestamp = targetDate
                )
            )
        ),
        `object` = ObjectWithEveryTypeObject(
            string = "hello world", boolean = false, timestamp = targetDate
        )
    )

    runBlocking {
        val tag = "SEND/RECEIVE OBJECT OF EVERY TYPE"
        val result = client.tests.sendObject(objectInput)
        expect(tag, result, objectInput)
        expect(tag, result.string, "hello world")
    }

    runBlocking {
        val tag = "UNAUTHENTICATED REQUEST RETURNS ERROR"
        try {
            unauthenticatedClient.tests.sendObject(objectInput)
            expect(tag, input = false, result = true)
        } catch (err: TestClientError) {
            expect(tag, err.code, 401)
        } catch (err: Exception) {
            // this should never be reached
            expect(tag, input = false, result = true)
        }
    }

    runBlocking {
        val tag = "SEND/RECEIVE OBJECT WITH NULLABLE FIELDS"
        val input = client.tests.sendObjectWithNullableFields(
            ObjectWithEveryNullableType(
                any = null,
                string = null,
                boolean = null,
                timestamp = null,
                int8 = null,
                uint8 = null,
                int16 = null,
                uint16 = null,
                int32 = null,
                uint32 = null,
                int64 = null,
                uint64 = null,
                float64 = null,
                float32 = null,
                enumerator = null,
                array = null,
                nestedArray = null,
                `object` = null,
                nestedObject = null,
                discriminator = null,
                record = null,
            )
        )
        val input2 = client.tests.sendObjectWithNullableFields(
            ObjectWithEveryNullableType(
                any = JsonPrimitive("Hello world"),
                string = "Hello world",
                boolean = true,
                timestamp = targetDate,
                int8 = 10,
                uint8 = 10u,
                int16 = 10,
                uint16 = 10u,
                int32 = 10,
                uint32 = 10u,
                int64 = 10L,
                uint64 = 10UL,
                float64 = 10.0,
                float32 = 10.0F,
                enumerator = ObjectWithEveryNullableTypeEnumerator.B,
                array = mutableListOf(true, false, true),
                nestedArray = mutableListOf(
                    mutableListOf(
                        ObjectWithEveryNullableTypeNestedArrayElementElement(
                            id = "1",
                            timestamp = targetDate
                        )
                    )
                ),
                `object` = ObjectWithEveryNullableTypeObject(
                    string = "Hello world",
                    boolean = true,
                    timestamp = targetDate,
                ),
                nestedObject = ObjectWithEveryNullableTypeNestedObject(
                    id = "1",
                    timestamp = targetDate,
                    data = ObjectWithEveryNullableTypeNestedObjectData(
                        id = "2",
                        timestamp = targetDate,
                        data = ObjectWithEveryNullableTypeNestedObjectDataData(
                            id = "3",
                            timestamp = targetDate,
                        ),
                    ),
                ),
                discriminator = ObjectWithEveryNullableTypeDiscriminatorB(
                    title = "Hello world",
                    description = ""
                ),
                record = mutableMapOf(Pair("A", true), Pair("B", false)),
            )
        )
        val result = client.tests.sendObjectWithNullableFields(input)
        val result2 = client.tests.sendObjectWithNullableFields(input2)
        expect(tag, result, input)
        expect(tag, result2, input2)
    }

    runBlocking {
        val tag = "SEND/RECEIVE OBJECT WITH OPTIONAL FIELDS"

        val input = ObjectWithEveryOptionalType()
        val inputResult = client.tests.sendPartialObject(input)
        expect(tag, input, inputResult)

        val partialInput = ObjectWithEveryOptionalType(string = "hello world")
        val partialInputResult = client.tests.sendPartialObject(partialInput)
        expect(tag, partialInput, partialInputResult)
        expect(tag, partialInput.string, partialInputResult.string)
    }

    runBlocking {
        val tag = "SEND/RECEIVE RECURSIVE OBJECT"
        val input = RecursiveObject(
            left = RecursiveObject(
                left = null,
                right = RecursiveObject(
                    left = null,
                    right = null,
                    value = "3",
                ),
                value = "2",
            ),
            right = null,
            value = "1",
        )
        val result = client.tests.sendRecursiveObject(input)
        expect(tag, input, result)
    }

    runBlocking {
        val tag = "SEND/RECEIVE RECURSIVE UNION"
        val input = RecursiveUnionChildren(
            data = mutableListOf(
                RecursiveUnionChild(
                    data = RecursiveUnionText(
                        data = "hello world"
                    )
                ),
                RecursiveUnionText(
                    data = "hello world"
                ),
                RecursiveUnionShape(
                    data = RecursiveUnionShapeData(
                        width = 10.0,
                        height = 10.0,
                        color = "red"
                    )
                ),
                RecursiveUnionChildren(
                    data = mutableListOf(
                        RecursiveUnionText(
                            data = "hello world 2"
                        )
                    )
                )
            )
        )
        val result = client.tests.sendRecursiveUnion(input)
        expect(tag, input, result)
    }

    val sseScope = CoroutineScope(CoroutineName("SSE Scope"))

    testSseSupport(sseScope, client)
    testSseParsesMessageAndErrorEvents(sseScope, client)
    testSseClosesOnDone(sseScope, client)

}

fun testSseSupport(
    scope: CoroutineScope,
    client: TestClient,
) {
    val tag = "SSE Support"
    val messages: MutableList<ChatMessage> = mutableListOf()
    val errors: MutableList<TestClientError> = mutableListOf()
    val channelId = "12345"
    val job = client.tests.streamMessages(scope, ChatMessageParams(
        channelId = channelId
    ),
        onData = { message ->
            messages.add(message)
            when (message) {
                is ChatMessageImage -> {
                    expect(tag, message.channelId, channelId)
                    expect(tag, message.image.isNotEmpty(), true)
                }

                is ChatMessageText -> {
                    expect(tag, message.channelId, channelId)
                    expect(tag, message.text.isNotEmpty(), true)
                }

                is ChatMessageUrl -> {
                    expect(tag, message.channelId, channelId)
                    expect(tag, message.url.isNotEmpty(), true)
                }
            }
        },
        onConnectionError = { err ->
            println("ERROR $err")
            errors.add(err)
        },
        onError = { err ->
            println("ERROR $err")
            errors.add(err)
        })

    Thread.sleep(1000)
    job.cancel()
    expect(tag, messages.isNotEmpty(), true)
    expect(tag, errors.isEmpty(), true)
}

fun testSseParsesMessageAndErrorEvents(
    scope: CoroutineScope,
    client: TestClient,
) {
    val tag = "SSE parses both 'message' and 'error' events"
    var openCount = 0
    var messageCount = 0
    var errorReceived: TestClientError? = null
    var otherErrorCount = 0
    var closeCount = 0
    val job = client.tests.streamTenEventsThenError(
        scope = scope,
        onOpen = {
            openCount++
        },
        onData = { data ->
            messageCount++
        },
        onError = { err ->
            errorReceived = err
            throw CancellationException()
        },
        onConnectionError = { err ->
            println("ERROR: ${err.code} ${err.errorMessage}")
            otherErrorCount++
        },
        onClose = {
            closeCount++
        }
    )
    Thread.sleep(1000)
    println("OPEN: $openCount CLOSE: $closeCount MESSAGES: $messageCount ERROR: $errorReceived OTHER ERRORS: $otherErrorCount")
    expect(tag, openCount, 1)
    expect(tag, closeCount, 1)
    expect(tag, messageCount, 10)
    expect(tag, errorReceived is TestClientError, true)
    expect(tag, otherErrorCount, 0)
}

fun testSseClosesOnDone(
    scope: CoroutineScope,
    client: TestClient,
) {
    val tag = "SSE closes connection on 'done'"
    var openCount = 0
    var messageCount = 0
    var errorCount = 0
    var closeCount = 0
    val job = client.tests.streamTenEventsThenEnd(scope, onOpen = {
        openCount++
    }, onData = {
        messageCount++
    }, onError = {
        errorCount++
    }, onConnectionError = {
        errorCount++
    }, onClose = {
        closeCount++
    })
    Thread.sleep(1000)
    if (!job.isCancelled) job.cancel()
    expect(tag, openCount, 1)
    expect(tag, messageCount, 10)
    expect(tag, errorCount, 0)
    expect(tag, closeCount, 1)
}

fun <A, B> expect(tag: String?, input: A, result: B) {
    if (input != result) {
        throw Exception("[$tag] Expected $input to be $result")
    }
}