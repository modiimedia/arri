import XCTest
@testable import SwiftCodegenReference


final class NestedObjectTests: XCTestCase {
    let noSpecialCharsLocation = "../../../tests/test-files/NestedObject_NoSpecialChars.json"
    let specialCharsLocation = "../../../tests/test-files/NestedObject_SpecialChars.json"
    var noSpecialCharsControl: NestedObject = NestedObject(
        id: "1",
        content: "hello world"
    )
    var specialCharsControl = NestedObject(
        id: "1", 
        content: "double-quote: \" | backslash: \\ | backspace: \u{0008} | form-feed: \u{0c} | newline: \n | carriage-return: \r | tab: \t | unicode: \u{0000}"
    )

    func testFromJson() throws {
        let objectJson: String? = try? String(contentsOfFile: noSpecialCharsLocation, encoding: .utf8)
        let result1: NestedObject = NestedObject(JSONString: objectJson ?? "") ?? NestedObject()
        let result2: NestedObject = NestedObject(JSONString: noSpecialCharsControl.toJSONString() ?? "") ?? NestedObject()
        XCTAssertEqual(result1, noSpecialCharsControl)
        XCTAssertEqual(result2, noSpecialCharsControl)
        XCTAssertEqual(result1, result2)
        let specialCharsObjectJson = try? String(contentsOfFile: specialCharsLocation, encoding: .utf8)
        let specialCharsResult1 = NestedObject(JSONString: specialCharsObjectJson ?? "") ?? NestedObject()
        let specialCharsResult2 = NestedObject(JSONString: specialCharsControl.toJSONString() ?? "") ?? NestedObject()
        XCTAssertEqual(specialCharsResult1, specialCharsControl)
        XCTAssertEqual(specialCharsResult2, specialCharsControl)
        XCTAssertEqual(specialCharsResult1, specialCharsResult2)
    }
    func testToQueryString() throws {
        let expectedResult = "id=1&content=hello world"
        XCTAssertEqual(expectedResult, noSpecialCharsControl.toQueryString())
    }
}