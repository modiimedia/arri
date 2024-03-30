import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import java.time.Instant

fun main() {
    val httpClient = HttpClient() {
        install(HttpTimeout)
    }
    val client = TestClient(
        httpClient = httpClient,
        baseUrl = "http://localhost:2020",
        headers = mutableMapOf(Pair("x-test-header", "12345"))
    )
    val unauthenticatedClient = TestClient(httpClient = httpClient, baseUrl = "http://localhost:2020")

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
        timestamp = Instant.now(),
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
        array = listOf(true, false, true),
        discriminator = ObjectWithEveryTypeDiscriminatorB(title = "Hello world", description = "hi"),
        nestedArray = listOf(listOf(ObjectWithEveryTypeNestedArrayItemItem(id = "2", timestamp = Instant.now()))),
        record = mutableMapOf(Pair("01", true), Pair("02", false)),
        nestedObject = ObjectWithEveryTypeNestedObject(
            id = "d1", timestamp = Instant.now(), data = ObjectWithEveryTypeNestedObjectData(
                id = "d2", timestamp = Instant.now(), data = ObjectWithEveryTypeNestedObjectDataData(
                    id = "d3", timestamp = Instant.now()
                )
            )
        ),
        _object = ObjectWithEveryTypeObject(
            string = "hello world", boolean = false, timestamp = Instant.now()
        )
    )
    // SEND/RECEIVE OBJECT OF EVERY TYPE
    runBlocking {
        val tag = "SEND/RECEIVE OBJECT OF EVERY TYPE"
        val result = client.tests.sendObject(objectInput)
        expect(tag, result, objectInput)
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
                _object = null,
                nestedObject = null,
                discriminator = null,
                record = null,
            )
        )
        val result = client.tests.sendObjectWithNullableFields(input)
        expect(tag, result, input)
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
        // val tag = "SEND/RECEIVE RECURSIVE UNION"
        // val input = RecursiveUnionChildren(
        //    data = listOf(
        //        JsonObject(
        //            content = mapOf(Pair("data", JsonPrimitive("data")))
        //        )
        //    )
        // )
        // val result = client.tests.sendRecursiveUnion(input)
        // expect(tag, input, result)
    }
}


fun <A, B> expect(tag: String?, input: A, result: B) {
    if (input != result) {
        throw Exception("[$tag] Expected $input to be $result")
    }
}