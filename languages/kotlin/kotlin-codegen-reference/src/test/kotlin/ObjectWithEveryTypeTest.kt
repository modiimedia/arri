import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertTrue

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
        unionExternal = UnionExternalArray(value = mutableListOf("hello", "world")),
        unionInternal = UnionInternalCircle(radius = 2.5),
        unionAdjacent = UnionAdjacentNullableTimestamp(data = Instant.parse("2001-01-01T16:00:00.000Z")),
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
        val params = value.toUrlQueryParams().split("&")
        assertTrue("timestamp=2001-01-01T16%3A00%3A00.000Z" in params)
        assertTrue("float32=1.5" in params)
        assertTrue("int64=1000" in params)
        assertTrue("uint64=1000" in params)
        assertTrue("enum=BAZ" in params)
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

    @Test
    fun recordOrderDoesNotAffectEquality() {
        val normal = ObjectWithEveryType.fromJson(
            File("../../../tests/test-files/ObjectWithEveryType.json").bufferedReader().use { it.readText() }
        )
        val reversed = ObjectWithEveryType.fromJson(
            File("../../../tests/test-files/ObjectWithEveryType_ReversedRecord.json").bufferedReader().use { it.readText() }
        )
        assertEquals(normal, reversed)
        assertEquals(normal.hashCode(), reversed.hashCode())
    }

    @Test
    fun invalidTimestampsFallBack() {
        for (input in listOf("hello world", "", "-1")) {
            val result = ObjectWithEveryType.fromJson("""{"timestamp":"$input"}""")
            assertEquals(ObjectWithEveryType.new().copy(timestamp = result.timestamp), result)
        }
    }
}
