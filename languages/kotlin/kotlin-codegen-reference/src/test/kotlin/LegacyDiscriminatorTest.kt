import org.junit.jupiter.api.Test
import java.io.File
import java.time.Instant
import kotlin.test.assertEquals

class LegacyDiscriminatorTest {
    private val value = LegacyDiscriminatorC(
        id = "1",
        name = "John Doe",
        date = Instant.parse("2001-01-01T16:00:00.000Z"),
    )
    private val reference =
        File("../../../tests/test-files/LegacyDiscriminator.json").bufferedReader().use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(reference, value.toJson())
    }

    @Test
    fun fromJson() {
        assertEquals(value, LegacyDiscriminator.fromJson(reference))
    }
}
