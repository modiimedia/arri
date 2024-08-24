import kotlin.test.Test
import kotlin.test.assertEquals

// SSE_FN_START
private enum class SseEventLineType {
    Id,
    Event,
    Data,
    Retry,
    None,
}

private fun __parseSseEventLine(line: String): Pair<SseEventLineType, String> {
    if (line.startsWith("id:")) {
        return Pair(SseEventLineType.Id, line.substring(3).trim())
    }
    if (line.startsWith("event:")) {
        return Pair(SseEventLineType.Event, line.substring(6).trim())
    }
    if (line.startsWith("data:")) {
        return Pair(SseEventLineType.Data, line.substring(5).trim())
    }
    if (line.startsWith("retry:")) {
        return Pair(SseEventLineType.Retry, line.substring(6).trim())
    }
    return Pair(SseEventLineType.None, "")
}

private data class __SseEvent(
    val id: String? = null,
    val event: String,
    val data: String,
    val retry: Int? = null
)

private class __SseEventParsingResult(val events: List<__SseEvent>, val leftover: String)

private fun __parseSseEvents(input: String): __SseEventParsingResult {
    val events = mutableListOf<__SseEvent>()
    val lines = input.lines()
    if (lines.isEmpty()) {
        return __SseEventParsingResult(events = listOf(), leftover = "")
    }
    var id: String? = null
    var event: String? = null
    var data: String? = null
    var retry: Int? = null
    var lastIndex: Int? = 0
    lines.forEachIndexed { index, line ->
        if (line.isNotEmpty()) {
            val (type, value) = __parseSseEventLine(line)
            when (type) {
                SseEventLineType.Id -> id = value
                SseEventLineType.Event -> event = value
                SseEventLineType.Data -> data = value
                SseEventLineType.Retry -> retry = value.toInt()
                SseEventLineType.None -> {}
            }
        }
        val isEnd = line == ""
        if (isEnd) {
            if (data != null) {
                events.add(
                    __SseEvent(
                        id = id,
                        event = event ?: "message",
                        data = data!!,
                        retry = retry,
                    )
                )
            }
            id = null
            event = null
            data = null
            retry = null
            lastIndex = if (index + 1 < lines.size) index + 1 else null
        }
    }
    return __SseEventParsingResult(
        events = events,
        leftover = if (lastIndex != null) lines.subList(lastIndex!!, lines.size).joinToString(separator = "\n") else ""
    )
}
// SSE_FN_END

class SseEventTests {

    @Test
    fun parseSseLine() {
        val idInputs = listOf("id:1", "id: 1")
        idInputs.forEach {
            val (type, value) = __parseSseEventLine(it)
            assertEquals(type, SseEventLineType.Id)
            assertEquals(value, "1")
        }
        val eventInputs = listOf("event:foo", "event: foo")
        eventInputs.forEach {
            val (type, value) = __parseSseEventLine(it)
            assertEquals(type, SseEventLineType.Event)
            assertEquals(value, "foo")
        }
        val dataInputs = listOf("data:foo", "data: foo")
        dataInputs.forEach {
            val (type, value) = __parseSseEventLine(it)
            assertEquals(type, SseEventLineType.Data)
            assertEquals(value, "foo")
        }
        val retryInputs = listOf("retry:150", "retry: 150")
        retryInputs.forEach {
            val (type, value) = __parseSseEventLine(it)
            assertEquals(type, SseEventLineType.Retry)
            assertEquals(value, "150")
        }
    }

    @Test
    fun parseStandardEvents() {
        val lines = listOf(
            "id: 1",
            "data: hello world",
            "",
            "data: hello world",
            "",
            "id: 2",
            "event: foo",
            "data: hello world",
            "retry: 150",
            "",
            "id: 3",
            "data: hello world"
        )
        val expectedOutput = listOf(
            __SseEvent(id = "1", event = "message", data = "hello world"),
            __SseEvent(event = "message", data = "hello world"),
            __SseEvent(id = "2", event = "foo", data = "hello world", retry = 150)
        )
        val expectedLeftover = "id: 3\ndata: hello world"


        val newlineInput = lines.joinToString("\n")
        val newlineResult = __parseSseEvents(newlineInput)
        assertEquals(newlineResult.events, expectedOutput)
        assertEquals(newlineResult.leftover, expectedLeftover)

        val crLineInput = lines.joinToString("\r")
        val crLineResult = __parseSseEvents(crLineInput)
        assertEquals(crLineResult.events, expectedOutput)
        assertEquals(crLineResult.leftover, expectedLeftover)

        val crlfLineInput = lines.joinToString("\r\n")
        val crlfLineResult = __parseSseEvents(crlfLineInput)
        assertEquals(crlfLineResult.events, expectedOutput)
        assertEquals(crlfLineResult.leftover, expectedLeftover)
    }

    @Test
    fun parsePartialEvents() {
        val lines = listOf(
            ":",
            " :",
            "hello world",
            "",
            "data: foo",
            "",
            "id: 1",
            "data: {\"id\":\"foo"
        )
        val expectedOutput = listOf(__SseEvent(event = "message", data = "foo"))
        val expectedLeftover = "id: 1\ndata: {\"id\":\"foo"

        val newLineResult = __parseSseEvents(lines.joinToString("\n"))
        assertEquals(newLineResult.events, expectedOutput)
        assertEquals(newLineResult.leftover, expectedLeftover)

        val crResult = __parseSseEvents(lines.joinToString("\r"))
        assertEquals(crResult.events, expectedOutput)
        assertEquals(crResult.leftover, expectedLeftover)

        val crlfResult = __parseSseEvents(lines.joinToString("\r\n"))
        assertEquals(crlfResult.events, expectedOutput)
        assertEquals(crlfResult.leftover, expectedLeftover)
    }
}