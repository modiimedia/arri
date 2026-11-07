import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.*
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import java.time.Instant
import java.util.*

fun main() {
    val httpClient = HttpClient() {
        install(HttpTimeout)
    }
    val baseUrl = "http://localhost:2020"
    val client = TestClient(
        httpClient = httpClient,
        baseUrl = baseUrl,
        headers = {
            mutableMapOf(Pair("x-test-header", "12345"))
        }
    )

    val targetDate = Instant.parse("2002-02-02T08:02:00.000Z")

    runBlocking {
        val tag = "EMPTY PARAM REQUESTS"
        val getResult = client.tests.nested.emptyParamsGetRequest()
        val postResult = client.tests.nested.emptyParamsPostRequest()
        expect(tag, getResult.message.isNotEmpty(), true)
        expect(tag, postResult.message.isNotEmpty(), true)
    }

    runBlocking {
        val tag = "EMPTY RESPONSE REQUESTS"
        client.tests.nested.emptyResponseGetRequest(DefaultPayload(message = "Hello"))
        client.tests.nested.emptyResponsePostRequest(DefaultPayload(message = "Hello"))
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
        unionExternal = ObjectWithEveryTypeUnionExternalArray(value = mutableListOf("foo", "bar", "baz")),
        unionInternal = ObjectWithEveryTypeUnionInternalCircle(radius = 15.5),
        unionAdjacent = ObjectWithEveryTypeUnionAdjacentBoolean(data = true),
        nestedArray = mutableListOf(
            mutableListOf(
                ObjectWithEveryTypeNestedArrayElementElement(
                    id = "2",
                    timestamp = targetDate
                )
            )
        ),
        record = mutableMapOf(Pair("01", 1UL), Pair("02", 0UL), Pair("\"03\"\t", 1UL)),
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
        val tag = "SEND/RECEIVE OBJECT WITH SNAKE_CASE KEYS"
        val input = ObjectWithSnakeCaseKeys(
            createdAt = targetDate,
            displayName = "john doe",
            phoneNumber = null,
            emailAddress = "johndoe@gmail.com",
            isAdmin = null,
            externalEvent = ObjectWithSnakeCaseKeysExternalEventUserCreated(
                value = ObjectWithSnakeCaseKeysExternalEventUserCreatedValue(userId = "1")
            ),
            internalEvent = ObjectWithSnakeCaseKeysInternalEventUserUpdated(userId = "1"),
            adjacentEvent = ObjectWithSnakeCaseKeysAdjacentEventUserCreated(
                eventData = ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData(userId = "1")
            ),
        )
        val result = client.tests.sendObjectWithSnakeCaseKeys(input)
        expect(tag, result, input)
    }

    runBlocking {
        val tag = "SEND/RECEIVE OBJECT WITH PASCAL CASE KEYS"
        var input = ObjectWithPascalCaseKeys(
            createdAt = targetDate,
            displayName = "john doe",
            phoneNumber = "211-211-2111",
            emailAddress = null,
            isAdmin = true,
            externalEvent = ObjectWithPascalCaseKeysExternalEventUserCreated(
                value = ObjectWithPascalCaseKeysExternalEventUserCreatedValue(userId = "1")
            ),
            internalEvent = ObjectWithPascalCaseKeysInternalEventUserUpdated(
                userId = "1",
                updatedAt = targetDate,
            ),
            adjacentEvent = ObjectWithPascalCaseKeysAdjacentEventUserUpdated(eventData = "hello"),
        )
        val result = client.tests.sendObjectWithPascalCaseKeys(input)
        expect(tag, result, input)
        input = input.copy(isAdmin = null)
        val result2 = client.tests.sendObjectWithPascalCaseKeys(input)
        expect(tag, result2, input)
    }

    runBlocking {
        val tag = "SEND/RECEIVE OBJECT WITH KEBAB CASE KEYS"
        var input = ObjectWithKebabCaseKeys(
            createdAt = targetDate,
            displayName = "john doe",
            phoneNumber = null,
            emailAddress = null,
            isAdmin = true,
            externalEvent = null,
            internalEvent = ObjectWithKebabCaseKeysInternalEventUserUpdated(
                userId = "1",
                updatedAt = targetDate,
            ),
            adjacentEvent = ObjectWithKebabCaseKeysAdjacentEventUserCreated(
                eventData = ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData(userId = "1")
            ),
        )
        val result = client.tests.sendObjectWithKebabCaseKeys(input)
        expect(tag, result, input)
        input = input.copy(
            externalEvent = ObjectWithKebabCaseKeysExternalEventUserDeleted(
                value = ObjectWithKebabCaseKeysExternalEventUserDeletedValue(userId = "1")
            ),
            adjacentEvent = ObjectWithKebabCaseKeysAdjacentEventUserUpdated(eventData = "hello"),
        )
        val result2 = client.tests.sendObjectWithKebabCaseKeys(input)
        expect(tag, result2, input)
    }

    runBlocking {
        var didCallOnErr = false
        val unauthenticatedClient = TestClient(
            httpClient = httpClient,
            baseUrl = "http://localhost:2020",
            null,
            onError = { _ ->
                didCallOnErr = true
            }
        )
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
        expect(tag, input = didCallOnErr, result = true)
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
                unionExternal = null,
                unionInternal = null,
                unionAdjacent = null,
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
                unionExternal = ObjectWithEveryNullableTypeUnionExternalBoolean(value = true),
                unionInternal = ObjectWithEveryNullableTypeUnionInternalCircle(radius = 15.5),
                unionAdjacent = ObjectWithEveryNullableTypeUnionAdjacentBoolean(data = true),
                record = mutableMapOf(Pair("A", 1UL), Pair("B", 0UL)),
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
        val tag = "SEND/RECEIVE RECURSIVE UNION (EXTERNAL)"
        val input = RecursiveUnionExternalChildren(
            value = mutableListOf(
                RecursiveUnionExternalChild(value = RecursiveUnionExternalText(value = "hello world")),
                RecursiveUnionExternalShape(
                    value = RecursiveUnionExternalShapeValue(width = 10.0, height = 10.0, color = "red")
                ),
                RecursiveUnionExternalChildren(
                    value = mutableListOf(RecursiveUnionExternalText(value = "hello world 2"))
                ),
            )
        )
        val result = client.tests.sendRecursiveUnionExternal(input)
        expect(tag, input, result)
    }

    runBlocking {
        val tag = "SEND/RECEIVE RECURSIVE UNION (INTERNAL)"
        val input = RecursiveUnionInternalChildren(
            data = mutableListOf(
                RecursiveUnionInternalChild(data = RecursiveUnionInternalText(data = "hello world")),
                RecursiveUnionInternalShape(
                    data = RecursiveUnionInternalShapeData(width = 10.0, height = 10.0, color = "red")
                ),
                RecursiveUnionInternalChildren(
                    data = mutableListOf(RecursiveUnionInternalText(data = "hello world 2"))
                ),
            )
        )
        val result = client.tests.sendRecursiveUnionInternal(input)
        expect(tag, input, result)
    }

    runBlocking {
        val tag = "SEND/RECEIVE RECURSIVE UNION (ADJACENT)"
        val input = RecursiveUnionAdjacentChildren(
            data = mutableListOf(
                RecursiveUnionAdjacentChild(data = RecursiveUnionAdjacentText(data = "hello world")),
                RecursiveUnionAdjacentShape(
                    data = RecursiveUnionAdjacentShapeData(width = 10.0, height = 10.0, color = "red")
                ),
                RecursiveUnionAdjacentChildren(
                    data = mutableListOf(RecursiveUnionAdjacentText(data = "hello world 2"))
                ),
            )
        )
        val result = client.tests.sendRecursiveUnionAdjacent(input)
        expect(tag, input, result)
    }

    runBlocking {
        val tag = "SEND/RECEIVE DISCRIMINATOR WITH EMPTY OBJECT"
        val inputs = listOf(
            DiscriminatorWithEmptyObjectEmpty(),
            DiscriminatorWithEmptyObjectNotEmpty(foo = "hello world", bar = 1.5, baz = true),
        )
        for (input in inputs) {
            expect(tag, client.tests.sendDiscriminatorWithEmptyObject(input), input)
        }
    }

    runBlocking {
        val tag = "SEND/RECEIVE INTERNALLY TAGGED UNION WITH GET REQUEST"
        val timestamp = Instant.parse("2001-01-01T16:00:00.000Z")
        val encodedString = "a b&c=d/é?#+"
        val inputs = listOf(
            UnionInternalGetRequestEmpty(),
            UnionInternalGetRequestWithFields(
                string = "hello world",
                nullableString = null,
                float64 = 1.5,
                int64 = -5,
                boolean = false,
                timestamp = timestamp,
                nullableEnum = null,
            ),
            UnionInternalGetRequestWithFields(
                string = "hello world",
                nullableString = "hello world",
                optionalString = "hello world",
                float64 = 1.5,
                int64 = 5,
                boolean = true,
                timestamp = timestamp,
                nullableEnum = UnionInternalGetRequestWithFieldsNullableEnum.B,
            ),
            UnionInternalGetRequestWithFields(
                string = encodedString,
                nullableString = encodedString,
                optionalString = encodedString,
                float64 = 1.5,
                int64 = 5,
                boolean = true,
                timestamp = timestamp,
                nullableEnum = UnionInternalGetRequestWithFieldsNullableEnum.A,
            ),
            UnionInternalGetRequestWithFields(
                string = "null",
                nullableString = null,
                float64 = 1.5,
                int64 = 5,
                boolean = true,
                timestamp = timestamp,
                nullableEnum = null,
            ),
        )
        for (input in inputs) {
            expect(tag, client.tests.sendUnionInternalGetRequest(input), input)
        }
    }

    runBlocking {
        val tag = "SEND/RECEIVE UNION VARIANT SHAPES"
        val internal = listOf(
            UnionVariantShapesInternalEmpty(),
            UnionVariantShapesInternalAllOptional(),
            UnionVariantShapesInternalAllOptional(second = 1),
            UnionVariantShapesInternalAllOptional(first = "a", second = 1),
            UnionVariantShapesInternalMixed(required = "a", nullable = null),
            UnionVariantShapesInternalMixed(required = "a", optional = "b", nullable = "c"),
            UnionVariantShapesInternalNested(
                array = mutableListOf(UnionVariantShapesInternalNestedArrayElement(id = "a")),
                record = mutableMapOf(Pair("a", -1L)),
                `object` = UnionVariantShapesInternalNestedObject(timestamp = targetDate),
            ),
        )
        val external = listOf(
            UnionVariantShapesExternalEmpty(value = UnionVariantShapesExternalEmptyValue()),
            UnionVariantShapesExternalAllOptional(value = UnionVariantShapesExternalAllOptionalValue()),
            UnionVariantShapesExternalAllOptional(value = UnionVariantShapesExternalAllOptionalValue(second = 1)),
            UnionVariantShapesExternalMixed(
                value = UnionVariantShapesExternalMixedValue(required = "a", nullable = null)
            ),
            UnionVariantShapesExternalMixed(
                value = UnionVariantShapesExternalMixedValue(required = "a", optional = "b", nullable = "c")
            ),
        )
        val adjacent = listOf(
            UnionVariantShapesAdjacentEmpty(data = UnionVariantShapesAdjacentEmptyData()),
            UnionVariantShapesAdjacentAllOptional(data = UnionVariantShapesAdjacentAllOptionalData()),
            UnionVariantShapesAdjacentAllOptional(data = UnionVariantShapesAdjacentAllOptionalData(second = 1)),
            UnionVariantShapesAdjacentMixed(
                data = UnionVariantShapesAdjacentMixedData(required = "a", nullable = null)
            ),
            UnionVariantShapesAdjacentMixed(
                data = UnionVariantShapesAdjacentMixedData(required = "a", optional = "b", nullable = "c")
            ),
        )
        val defaults = UnionVariantShapes(internal = internal[0], external = external[0], adjacent = adjacent[0])
        val inputs = internal.map { defaults.copy(internal = it) } +
            external.map { defaults.copy(external = it) } +
            adjacent.map { defaults.copy(adjacent = it) }
        for (input in inputs) {
            expect(tag, client.tests.sendUnionVariantShapes(input), input)
        }
    }

    runBlocking {
        val tag = "SEND/RECEIVE UNION VARIANT TYPES"
        val anyObject = JsonObject(mapOf(Pair("a", JsonPrimitive(1))))
        val external = listOf(
            UnionVariantTypesExternalString(value = "hello world"),
            UnionVariantTypesExternalInt64(value = -5),
            UnionVariantTypesExternalUint64(value = 5u),
            UnionVariantTypesExternalFloat64(value = 1.5),
            UnionVariantTypesExternalEnumerator(value = UnionVariantTypesExternalEnumeratorValue.B),
            UnionVariantTypesExternalRecord(value = mutableMapOf(Pair("a", "b"))),
            UnionVariantTypesExternalAny(value = anyObject),
            UnionVariantTypesExternalAny(value = JsonNull),
            UnionVariantTypesExternalNullableString(value = null),
            UnionVariantTypesExternalNullableString(value = "hello world"),
            UnionVariantTypesExternalNullableArray(value = null),
            UnionVariantTypesExternalNullableArray(value = mutableListOf("hello world")),
            UnionVariantTypesExternalExternalUnion(
                value = UnionVariantTypesExternalExternalUnionValueText(value = "hello")
            ),
            UnionVariantTypesExternalInternalUnion(
                value = UnionVariantTypesExternalInternalUnionValueCircle(radius = 1.5)
            ),
            UnionVariantTypesExternalAdjacentUnion(
                value = UnionVariantTypesExternalAdjacentUnionValueText(data = "hello")
            ),
            UnionVariantTypesExternalClass(value = "hello world"),
            UnionVariantTypesExternalDefault(value = "hello world"),
        )
        val adjacent = listOf(
            UnionVariantTypesAdjacentString(data = "hello world"),
            UnionVariantTypesAdjacentInt64(data = -5),
            UnionVariantTypesAdjacentUint64(data = 5u),
            UnionVariantTypesAdjacentFloat64(data = 1.5),
            UnionVariantTypesAdjacentEnumerator(data = UnionVariantTypesAdjacentEnumeratorData.B),
            UnionVariantTypesAdjacentRecord(data = mutableMapOf(Pair("a", "b"))),
            UnionVariantTypesAdjacentAny(data = anyObject),
            UnionVariantTypesAdjacentAny(data = JsonNull),
            UnionVariantTypesAdjacentNullableString(data = null),
            UnionVariantTypesAdjacentNullableString(data = "hello world"),
            UnionVariantTypesAdjacentNullableArray(data = null),
            UnionVariantTypesAdjacentNullableArray(data = mutableListOf("hello world")),
            UnionVariantTypesAdjacentExternalUnion(
                data = UnionVariantTypesAdjacentExternalUnionDataText(value = "hello")
            ),
            UnionVariantTypesAdjacentInternalUnion(
                data = UnionVariantTypesAdjacentInternalUnionDataCircle(radius = 1.5)
            ),
            UnionVariantTypesAdjacentAdjacentUnion(
                data = UnionVariantTypesAdjacentAdjacentUnionDataText(data = "hello")
            ),
            UnionVariantTypesAdjacentClass(data = "hello world"),
            UnionVariantTypesAdjacentDefault(data = "hello world"),
        )
        val internal = listOf(
            UnionVariantTypesInternalClass(`for` = "a", default = "b"),
            UnionVariantTypesInternalDefault(
                `class` = "a",
                internalUnion = UnionVariantTypesInternalDefaultInternalUnionCircle(radius = 1.5),
                adjacentUnion = UnionVariantTypesInternalDefaultAdjacentUnionText(data = "hello"),
                externalUnion = UnionVariantTypesInternalDefaultExternalUnionText(value = "hello"),
            ),
        )
        val defaults = UnionVariantTypes(external = external[0], adjacent = adjacent[0], internal = internal[0])
        val inputs = external.map { defaults.copy(external = it) } +
            adjacent.map { defaults.copy(adjacent = it) } +
            internal.map { defaults.copy(internal = it) }
        for (input in inputs) {
            expect(tag, client.tests.sendUnionVariantTypes(input), input)
        }
    }

    runBlocking {
        val tag = "PREFIXED CLIENT SEND/RECEIVE UNIONS"
        val prefixedClient = TestClientPrefixed(
            httpClient = httpClient,
            baseUrl = baseUrl,
            headers = {
                mutableMapOf(Pair("x-test-header", "12345"))
            }
        )
        val external = FooRecursiveUnionExternalChild(value = FooRecursiveUnionExternalText(value = "hello world"))
        expect(tag, prefixedClient.sendRecursiveUnionExternal(external), external)
        val internal = FooRecursiveUnionInternalChild(data = FooRecursiveUnionInternalText(data = "hello world"))
        expect(tag, prefixedClient.sendRecursiveUnionInternal(internal), internal)
        val adjacent = FooRecursiveUnionAdjacentChild(data = FooRecursiveUnionAdjacentText(data = "hello world"))
        expect(tag, prefixedClient.sendRecursiveUnionAdjacent(adjacent), adjacent)
        val getInput = FooUnionInternalGetRequestWithFields(
            string = "a b&c",
            nullableString = null,
            float64 = 1.5,
            int64 = 5,
            boolean = true,
            timestamp = targetDate,
            nullableEnum = FooUnionInternalGetRequestWithFieldsNullableEnum.A,
        )
        expect(tag, prefixedClient.sendUnionInternalGetRequest(getInput), getInput)
    }

    runBlocking {
        val tag = "SERVER ERRORS ARE RETURNED AS A CLIENT ERROR"
        try {
            client.tests.sendError(SendErrorParams(code = 418u, message = "this is a test error"))
            expect(tag, input = false, result = true)
        } catch (err: TestClientError) {
            expect(tag, err.code, 418)
            expect(tag, err.errorMessage, "this is a test error")
        }
    }

    testSseReceiveMessages(client)
    testAutoRetriesOnServerError(client)
    testSseClosesOnDone(client)
    testSseAutoReconnectsWhenClosedByServer(client)
    testSseStreamLargeObjects(client)
    testSseReconnectsWithNewCredentials(httpClient, baseUrl)
}

fun testSseReceiveMessages(client: TestClient) {
    runBlocking {
        val tag = "SSE Support"
        val messages: MutableList<ChatMessage> = mutableListOf()
        val errors: MutableList<Exception> = mutableListOf()
        val channelId = "12345"
        withTimeout(5000) {
            client.tests.streamMessages(
                ChatMessageParams(
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
                    if (messages.size >= 10) {
                        throw CancellationException()
                    }
                },
                onResponseError = { err ->
                    errors.add(err)
                },
                onRequestError = { err ->
                    errors.add(err)
                })
        }
        expect(tag, messages.isNotEmpty(), true)
        expect(tag, errors.isEmpty(), true)
    }
}

fun testAutoRetriesOnServerError(
    client: TestClient,
) {
    runBlocking {
        val tag = "SSE retries on server error response"
        var openCount = 0
        var messageCount = 0
        var errorCount = 0
        withTimeout(5000) {
            client.tests.streamConnectionErrorTest(
                params = StreamConnectionErrorTestParams(400, "There was an error"),
                onOpen = {
                    openCount++
                },
                onData = {
                    messageCount++
                    if (messageCount > 0) {
                        throw CancellationException()
                    }
                },
                onResponseError = { err ->
                    expect("$tag > error code matches", err.code, 400)
                    errorCount++
                    if (errorCount >= 3) {
                        throw CancellationException()
                    }
                }
            )
        }
        expect("$tag > opens more than once", openCount > 0, true)
        expect("$tag > messages are zero", messageCount, 0)
        expect("$tag > errors more than once", errorCount > 0, true)
    }
}

fun testSseClosesOnDone(
    client: TestClient,
) {
    val scope = CoroutineScope(CoroutineName("SSE Scope"))
    val tag = "SSE closes connection on 'done'"
    var openCount = 0
    var messageCount = 0
    var errorCount = 0
    var closeCount = 0
    val job = scope.launch {
        client.tests.streamTenEventsThenEnd(onOpen = {
            openCount++
        }, onData = {
            messageCount++
        }, onRequestError = {
            errorCount++
        }, onResponseError = {
            errorCount++
        }, onClose = {
            closeCount++
        })
    }
    Thread.sleep(1000)
    job.cancel()
    expect(tag, openCount, 1)
    expect(tag, messageCount, 10)
    expect(tag, errorCount, 0)
    expect(tag, closeCount, 1)
}

fun testSseAutoReconnectsWhenClosedByServer(client: TestClient) {
    runBlocking {
        val tag = "SSE auto-reconnects when closed by server"
        var openCount = 0;
        var messageCount = 0;
        withTimeout(5000) {
            client.tests.streamAutoReconnect(
                params = AutoReconnectParams(messageCount = 10u),
                onOpen = {
                    openCount++
                    if (openCount >= 3) {
                        throw CancellationException()
                    }
                },
                onData = { msg ->
                    messageCount++
                    expect(tag, msg.count, 10u)
                },
            )
        }
        expect(tag, openCount > 1, true)
        expect(tag, messageCount > 1, true)
    }
}

fun testSseStreamLargeObjects(
    client: TestClient,
) {
    runBlocking {
        val tag = "SSE stream large objects"
        var msgCount = 0
        var errorCount = 0
        var openCount = 0
        withTimeout(60000) {
            client.tests.streamLargeObjects(
                onOpen = {
                    openCount++
                },
                onData = { msg ->
                    msgCount++
                    expect("$tag > validate msg", msg.objects.size, 10000)
                    expect("$tag > validate msg", msg.numbers.size, 10000)
                    if (msgCount >= 2) {
                        throw CancellationException()
                    }
                },
                onRequestError = {
                    errorCount++
                    throw CancellationException()
                },
                onResponseError = {
                    errorCount++
                    throw CancellationException()
                },
            )
        }
        expect("$tag > open count", openCount, 1)
        expect("$tag > err count", errorCount, 0)
        expect("$tag > msg count", msgCount > 1, true)
    }
}


fun testSseReconnectsWithNewCredentials(httpClient: HttpClient, baseUrl: String) {
    runBlocking {
        val tag = "SSE reconnects with new credentials"
        val headers = mutableListOf<String>()
        val dynamicClient = TestClient(
            httpClient = httpClient,
            baseUrl = baseUrl,
            headers = {
                val newHeader = "kt_${UUID.randomUUID().toString()}"
                headers.add(newHeader)
                mutableMapOf(Pair("x-test-header", newHeader))
            }
        )
        var msgCount = 0
        var openCount = 0
        withTimeout(10000) {
            dynamicClient.tests.streamRetryWithNewCredentials(
                onData = {
                    msgCount++
                },
                onOpen = {
                    openCount++
                    if (openCount >= 3) {
                        throw CancellationException()
                    }
                },
            )
        }
        expect(tag, msgCount > 1, true)
        expect(tag, openCount > 1, true)
        expect(tag, headers.size > 1, true)
    }
}

fun <A, B> expect(tag: String?, input: A, result: B) {
    if (input != result) {
        throw Exception("[$tag] Expected $input to be $result")
    }
}
