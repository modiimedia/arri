import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

class ObjectWithNullableFieldsTest {

    private val allNullValue = ObjectWithNullableFields(
        string = null,
        boolean = null,
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
        enum = null,
        `object` = null,
        array = null,
        record = null,
        discriminator = null,
        any = null,
    )
    private val noNullValue = ObjectWithNullableFields(
        string = "",
        boolean = true,
        timestamp = Instant.parse("2001-01-01T16:00:00.000Z"),
        float32 = 1.5F,
        float64 = 1.5,
        int8 = 1,
        uint8 = 1u,
        int16 = 10,
        uint16 = 10u,
        int32 = 100,
        uint32 = 100u,
        int64 = 1000L,
        uint64 = 1000UL,
        enum = Enumerator.Baz,
        `object` = NestedObject(
            id = "",
            content = "",
        ),
        array = listOf(true, false, false),
        record = mapOf(Pair("A", true), Pair("B", false)),
        discriminator = DiscriminatorC(
            id = "",
            name = "",
            date = Instant.parse("2001-01-01T16:00:00.000Z")
        ),
        any = JsonObject(mapOf(Pair("message", JsonPrimitive("hello world"))))
    )

    private val allNullReference =
        File("../../../../tests/test-files/ObjectWithNullableFields_AllNull.json")
            .bufferedReader()
            .use { it.readText() }
    private val noNullReference =
        File("../../../../tests/test-files/ObjectWithNullableFields_NoNull.json")
            .bufferedReader()
            .use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(allNullValue.toJson(), allNullReference)
        assertEquals(noNullValue.toJson(), noNullReference)
    }

    @Test
    fun toUrlQueryParams() {
    }

    @Test
    fun fromJson() {
        val result = ObjectWithNullableFields.fromJson(allNullReference);
        println("EXPECTED: ${result.any}, ACTUAL: ${allNullValue.any}")
        assertContentEquals(
            listOf(
                result.string,
                result.boolean,
                result.timestamp,
                result.float32,
                result.float64,
                result.int8,
                result.uint8,
                result.int16,
                result.uint16,
                result.int32,
                result.uint32,
                result.int64,
                result.uint64,
                result.enum,
                result.`object`,
                result.array,
                result.record,
                result.discriminator,
                result.any,
            ),
            listOf(
                allNullValue.string,
                allNullValue.boolean,
                allNullValue.timestamp,
                allNullValue.float32,
                allNullValue.float64,
                allNullValue.int8,
                allNullValue.uint8,
                allNullValue.int16,
                allNullValue.uint16,
                allNullValue.int32,
                allNullValue.uint32,
                allNullValue.int64,
                allNullValue.uint64,
                allNullValue.enum,
                allNullValue.`object`,
                allNullValue.array,
                allNullValue.record,
                allNullValue.discriminator,
                allNullValue.any,
            ),
        )
        assertEquals(ObjectWithNullableFields.fromJson(noNullReference), noNullValue)
    }
}