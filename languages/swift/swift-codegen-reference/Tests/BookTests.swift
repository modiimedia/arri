import XCTest
@testable import SwiftCodegenReference

let location = "../../../tests/test-files/Book.json"
let targetDateStr = "2001-01-01T16:00:00.000Z"
let formatter: ExampleClientDateFormatter = ExampleClientDateFormatter()

final class BookTests: XCTestCase {
    var control: Book = Book(
            id: "1",
            name: "The Adventures of Tom Sawyer",
            createdAt: formatter.date(from: targetDateStr) ?? Date.now,
            updatedAt: formatter.date(from: targetDateStr) ?? Date.now
        )

    func testFromJson() throws {
        let bookJson: String? = try? NSString(contentsOfFile: location, encoding: NSUTF8StringEncoding) as String?
        let result1 = Book(JSONString: bookJson ?? "") ?? Book()
        let result2: Book = Book(JSONString: control.toJSONString() ?? "") ?? Book()
        XCTAssertEqual(result1, control)
        XCTAssertEqual(result2, control)
        XCTAssertEqual(result1, result2)
    }
    func testToQueryString() throws {
        let expectedResult = "id=1&name=The Adventures of Tom Sawyer&createdAt=2001-01-01T16:00:00.000Z&updatedAt=2001-01-01T16:00:00.000Z"
        XCTAssertEqual(expectedResult, control.toQueryString())
    }
}