import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertEquals

class ObjectWithEveryTypeTest {
    private val value = ObjectWithEveryType(
        string = "",
        boolean = false,
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
            id = "1",
            content = "hello world"
        ),
        array = mutableListOf(true, false, false),
        record = mutableMapOf(Pair("A", true), Pair("B", false)),
        discriminator = DiscriminatorC(id = "", name = "", date = Instant.parse("2001-01-01T16:00:00.000Z")),
        any = JsonPrimitive("hello world")
    )

    private val json =
        File("../../../tests/test-files/ObjectWithEveryType.json").bufferedReader().use { it.readText() }
    private val mismatchedJson =
        File("../../../tests/test-files/ObjectWithNullableFields_AllNull.json").bufferedReader()
            .use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(json, value.toJson())
    }

    @Test
    fun toUrlQueryParams() {
    }

    @Test
    fun fromJson() {
        val actualResult = ObjectWithEveryType.fromJson(json)
        assertEquals(actualResult, value)

        val badDataResult = ObjectWithEveryType.fromJson("false")
        val badDataResult2 = ObjectWithEveryType.fromJson(mismatchedJson)
        assertEquals(badDataResult, ObjectWithEveryType.new().copy(timestamp = badDataResult.timestamp))
        assertEquals(badDataResult2, ObjectWithEveryType.new().copy(timestamp = badDataResult2.timestamp))
    }

}