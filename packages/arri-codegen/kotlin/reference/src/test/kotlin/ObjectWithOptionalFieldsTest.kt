import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertEquals

class ObjectWithOptionalFieldsTest {

    private val emptyValue = ObjectWithOptionalFields()
    private val nonEmptyValue = ObjectWithOptionalFields(
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
            content = "hello world",
        ),
        array = mutableListOf(true, false, false),
        record = mutableMapOf(Pair("A", true), Pair("B", false)),
        discriminator = DiscriminatorC(
            id = "",
            name = "",
            date = Instant.parse("2001-01-01T16:00:00.000Z")
        ),
        any = JsonPrimitive("hello world")
    )

    private val expectedEmptyOutput =
        File("../../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json").bufferedReader()
            .use { it.readText() }
    private val expectedNonEmptyOutput =
        File("../../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json").bufferedReader()
            .use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(emptyValue.toJson(), expectedEmptyOutput)
        assertEquals(nonEmptyValue.toJson(), expectedNonEmptyOutput)
    }

    @Test
    fun toUrlQueryParams() {
    }

    @Test
    fun fromJson() {
        assertEquals(ObjectWithOptionalFields.fromJson(expectedEmptyOutput), emptyValue)
        assertEquals(ObjectWithOptionalFields.fromJson(expectedNonEmptyOutput), nonEmptyValue)
    }
}