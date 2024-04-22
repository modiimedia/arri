import org.junit.jupiter.api.Assertions.assertEquals

class ExampleObjectTest {

    @org.junit.jupiter.api.Test
    fun toJson() {
        val input = ExampleObject(id = "1", content = "hello world\nHow are you?\t\n")
        val expectedOutput = "{\"id\":\"1\",\"content\":\"hello world\\nHow are you?\\t\\n\"}"
        assertEquals(input.toJsonString(), expectedOutput)
        assertEquals(input, ExampleObject.fromJson(expectedOutput))
    }
}