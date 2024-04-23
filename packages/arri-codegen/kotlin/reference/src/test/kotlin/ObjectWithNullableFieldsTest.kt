import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
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
        assertEquals(
            allNullValue.toUrlQueryParams(),
            "string=null&boolean=null&timestamp=null&float32=null&float64=null&int8=null&uint8=null&int16=null&uint16=null&int32=null&uint32=null&int64=null&uint64=null&enum=null"
        )
        assertEquals(
            noNullValue.toUrlQueryParams(),
            "string=&boolean=true&timestamp=2001-01-01T16:00:00.000Z&float32=1.5&float64=1.5&int8=1&uint8=1&int16=10&uint16=10&int32=100&uint32=100&int64=1000&uint64=1000&enum=BAZ"
        )
    }

    @Test
    fun fromJson() {
        val result = ObjectWithNullableFields.fromJson(allNullReference);
        assertEquals(result, allNullValue)
        assertEquals(ObjectWithNullableFields.fromJson(noNullReference), noNullValue)
    }
}