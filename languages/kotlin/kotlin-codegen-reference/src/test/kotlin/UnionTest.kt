import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertEquals

private fun testFile(filename: String): String =
    File("../../../tests/test-files/$filename").bufferedReader().use { it.readText() }

class UnionExternalTest {
    private val values = mapOf(
        "UnionExternal_Object.json" to UnionExternalObject(value = NestedObject(id = "1", content = "hello world")),
        "UnionExternal_Array.json" to UnionExternalArray(value = mutableListOf("hello", "world")),
        "UnionExternal_Boolean.json" to UnionExternalBoolean(value = true),
        "UnionExternal_Timestamp.json" to UnionExternalNullableTimestamp(
            value = Instant.parse("2001-01-01T16:00:00.000Z")
        ),
        "UnionExternal_TimestampNull.json" to UnionExternalNullableTimestamp(value = null),
    )

    @Test
    fun toJson() {
        for ((filename, value) in values) {
            assertEquals(testFile(filename), value.toJson())
        }
    }

    @Test
    fun fromJson() {
        for ((filename, value) in values) {
            assertEquals(value, UnionExternal.fromJson(testFile(filename)))
        }
    }

    @Test
    fun fromJsonFallback() {
        assertEquals(UnionExternalObject(value = NestedObject.new()), UnionExternal.new())
        assertEquals(UnionExternal.new(), UnionExternal.fromJson("{\"triangle\":{\"base\":10}}"))
        assertEquals(UnionExternal.new(), UnionExternal.fromJson("false"))
    }
}

class UnionInternalTest {
    private val value = UnionInternalRectangle(width = 10.7, height = 5.3)
    private val reference = testFile("UnionInternal_Rectangle.json")

    @Test
    fun toJson() {
        assertEquals(reference, value.toJson())
    }

    @Test
    fun fromJson() {
        assertEquals(value, UnionInternal.fromJson(reference))
    }

    @Test
    fun toUrlQueryParams() {
        assertEquals("shape=rectangle&width=10.7&height=5.3", value.toUrlQueryParams())
    }

    @Test
    fun fromJsonFallback() {
        assertEquals(UnionInternalRectangle.new(), UnionInternal.new())
        assertEquals(
            UnionInternal.new(),
            UnionInternal.fromJson("{\"shape\":\"triangle\",\"base\":10,\"height\":5}")
        )
        assertEquals(UnionInternal.new(), UnionInternal.fromJson("{\"width\":10}"))
    }
}

class UnionAdjacentTest {
    private val values = mapOf(
        "UnionAdjacent_Object.json" to UnionAdjacentObject(data = NestedObject(id = "1", content = "hello world")),
        "UnionAdjacent_TimestampNull.json" to UnionAdjacentNullableTimestamp(data = null),
    )

    @Test
    fun toJson() {
        for ((filename, value) in values) {
            assertEquals(testFile(filename), value.toJson())
        }
    }

    @Test
    fun fromJson() {
        for ((filename, value) in values) {
            assertEquals(value, UnionAdjacent.fromJson(testFile(filename)))
        }
    }

    @Test
    fun kind() {
        assertEquals("boolean", UnionAdjacentBoolean(data = true).kind)
        assertEquals("nullable-timestamp", UnionAdjacentNullableTimestamp(data = null).kind)
    }

    @Test
    fun fromJsonFallback() {
        assertEquals(UnionAdjacentObject(data = NestedObject.new()), UnionAdjacent.new())
        assertEquals(UnionAdjacent.new(), UnionAdjacent.fromJson("{\"kind\":\"triangle\",\"data\":{\"base\":10}}"))
        assertEquals(UnionAdjacent.new(), UnionAdjacent.fromJson("{\"data\":true}"))
    }
}
