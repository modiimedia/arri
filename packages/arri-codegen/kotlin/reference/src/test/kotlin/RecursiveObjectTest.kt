import org.junit.jupiter.api.Test
import java.io.File
import kotlin.test.assertEquals

class RecursiveObjectTest {
    private val input = RecursiveObject(
        left = RecursiveObject(
            left = RecursiveObject(
                left = null,
                right = RecursiveObject(
                    left = null,
                    right = null,
                )
            ),
            right = null,
        ),
        right = RecursiveObject(
            left = null,
            right = null,
        )
    )

    private val jsonReference =
        File("../../../../tests/test-files/RecursiveObject.json").bufferedReader().use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(input.toJson(), jsonReference)
    }

    @Test
    fun toUrlQueryParams() {
    }

    @Test
    fun fromJson() {
        assertEquals(RecursiveObject.fromJson(jsonReference), input)
    }
}