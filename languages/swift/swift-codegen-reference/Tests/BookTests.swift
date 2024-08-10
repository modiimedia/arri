import XCTest
@testable import SwiftCodegenReference

let dateFormatter: ExampleClientDateFormatter = ExampleClientDateFormatter()
let targetDateStr = "2001-01-01T16:00:00.000Z"
let targetDate = dateFormatter.date(from: targetDateStr) ?? Date.now

final class BookTests: XCTestCase {
    let location = "../../../tests/test-files/Book.json"
    var control: Book = Book(
            id: "1",
            name: "The Adventures of Tom Sawyer",
            createdAt: targetDate,
            updatedAt: targetDate
        )

    func testFromJson() throws {
        let bookJson: String? = try? String(contentsOfFile: location, encoding: .utf8)
        let result = Book(JSONString: bookJson ?? "") ?? Book()
        XCTAssertEqual(result, control)
        XCTAssertEqual(control.toJSONString(), bookJson)
    }
    func testToQueryString() throws {
        let expectedResult = "id=1&name=The Adventures of Tom Sawyer&createdAt=2001-01-01T16:00:00.000Z&updatedAt=2001-01-01T16:00:00.000Z"
        XCTAssertEqual(expectedResult, control.toQueryString())
    }
}