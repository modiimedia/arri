import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertEquals

class ObjectWithEveryFieldTest {
    private val `val` = ObjectWithEveryField(
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
        array = listOf(true, false, false),
        record = mapOf(Pair("A", true), Pair("B", false)),
        discriminator = DiscriminatorC(id = "", name = "", date = Instant.parse("2001-01-01T16:00:00.000Z")),
        any = JsonPrimitive("hello world")
    )

    private val json =
        File("../../../../tests/test-files/ObjectWithEveryField.json").bufferedReader().use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(json, `val`.toJson())
    }

    @Test
    fun toUrlQueryParams() {
    }

    @Test
    fun fromJson() {
        val actualResult = ObjectWithEveryField.fromJson(json)
        assertEquals(actualResult, `val`)

        val badDataResult = ObjectWithEveryField.fromJson("false")
        assertEquals(badDataResult, ObjectWithEveryField.new().copy(timestamp = badDataResult.timestamp))
    }

}