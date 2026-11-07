import java.io.File
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

class BookTest {
    private val date = Instant.parse("2001-01-01T16:00:00.000Z")
    private val input = Book(
        id = "1",
        name = "The Adventures of Tom Sawyer",
        createdAt = date,
        updatedAt = date,
    )
    private val jsonReference =
        File("../../../tests/test-files/Book.json").bufferedReader().use { it.readText() }

    @Test
    fun toJson() {
        assertEquals(jsonReference, input.toJson())
    }

    @Test
    fun fromJson() {
        assertEquals(input, Book.fromJson(jsonReference))
    }

    @Test
    fun toUrlQueryParams() {
        assertEquals(
            "id=1&name=The+Adventures+of+Tom+Sawyer&createdAt=2001-01-01T16%3A00%3A00.000Z&updatedAt=2001-01-01T16%3A00%3A00.000Z",
            input.toUrlQueryParams(),
        )
    }

    @Test
    fun invalidTimestampsFallBack() {
        val result = Book.fromJson("""{"id":"1","name":"foo","createdAt":"hello world","updatedAt":""}""")
        assertEquals("1", result.id)
        assertEquals("foo", result.name)
        assertEquals(Instant.EPOCH, result.createdAt)
        assertEquals(Instant.EPOCH, result.updatedAt)
    }
}
