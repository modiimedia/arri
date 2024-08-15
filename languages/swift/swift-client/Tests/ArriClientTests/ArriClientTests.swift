import XCTest
@testable import ArriClient

final class ArriClientTests: XCTestCase {
    func testSseLineResult() {
        let idInput = "id: 1"
        let idInput2 = "id:12345"
        XCTAssertEqual(SseLineResult(string: idInput), SseLineResult.id("1"))
        XCTAssertEqual(SseLineResult(string: idInput2), SseLineResult.id("12345"))
        let dataInput = "data: hello world "
        let dataInput2 = "data:hello world"
        XCTAssertEqual(SseLineResult(string: dataInput), SseLineResult.data("hello world"))
        XCTAssertEqual(SseLineResult(string: dataInput2), SseLineResult.data("hello world"))
        let retryInput = "retry: 100"
        let retryInput2 = "retry:150 "
        XCTAssertEqual(SseLineResult(string: retryInput), SseLineResult.retry(100))
        XCTAssertEqual(SseLineResult(string: retryInput2), SseLineResult.retry(150))
    }
    func testParsingBasicSseStream() {
        let input = """
id: 1
data: hello world

data: hello world

id: 1
event: ping
"""
        let (events, leftover) = sseEventListFromString(input: input, debug: false)
        XCTAssertEqual(
            events, 
            [
                SseEvent(id: "1", event: "message", data: "hello world", retry: nil),
                SseEvent(id: nil, event: "message", data: "hello world", retry: nil)
            ]
        )
        XCTAssertEqual(leftover, """
id: 1
event: ping
""")
    }
    func testIgnoringInvalidSseEvents() {
        let input = """
:

hello world

data: hello world 2

id: 12355
retry: 1

id: 13
data: hello world
retry: 150

:

"""
        let (events, leftover) = sseEventListFromString(input: input, debug: false)
        XCTAssertEqual(events, 
        [
            SseEvent(id: nil, event: "message", data: "hello world 2", retry: nil),
            SseEvent(id: "13", event: "message", data: "hello world", retry: 150)    
        ])
        XCTAssertEqual(leftover, """
:

""")
    }
}
