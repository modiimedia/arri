import org.junit.jupiter.api.Test
import java.io.File
import kotlin.test.assertEquals

class NestedObjectTest {

    private val input = NestedObject(id = "1", content = "hello world")
    private val inputWithSpecialChars = NestedObject(
        id = "1",
        content = "double-quote: \" | backslash: \\ | backspace: \b | form-feed: \u000c | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000"
    )
    private val nestedObjectReader =
        File("../../../tests/test-files/NestedObject_NoSpecialChars.json").bufferedReader()
    private val nestedObjectSpecialCharsReader =
        File("../../../tests/test-files/NestedObject_SpecialChars.json").bufferedReader()

    @Test
    fun toJson() {
        val expectedResult = nestedObjectReader.use { it.readText() }
        assertEquals(input.toJson(), expectedResult)
        val expectedResultWithSpecialChars = nestedObjectSpecialCharsReader.use { it.readText() }
        assertEquals(inputWithSpecialChars.toJson(), expectedResultWithSpecialChars)
    }

    @Test
    fun toUrlQueryParams() {
    }

    @Test
    fun fromJson() {
        val standardResult = NestedObject.fromJson(nestedObjectReader.use { it.readText() })
        assertEquals(input, standardResult)
        val specialCharsResult = NestedObject.fromJson(nestedObjectSpecialCharsReader.use { it.readText() })
        assertEquals(inputWithSpecialChars, specialCharsResult)
    }
}