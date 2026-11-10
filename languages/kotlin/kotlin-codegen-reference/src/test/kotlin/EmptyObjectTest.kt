import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals

class EmptyObjectTest {
    private val jsonReference =
        File("../../../tests/test-files/EmptyObject.json").bufferedReader().use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(jsonReference, EmptyObject().toJson())
    }

    @Test
    fun fromJson() {
        assertEquals(EmptyObject(), EmptyObject.fromJson(jsonReference))
    }

    @Test
    fun toUrlQueryParams() {
        assertEquals("", EmptyObject().toUrlQueryParams())
    }
}
