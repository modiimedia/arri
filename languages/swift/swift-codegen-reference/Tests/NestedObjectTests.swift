import XCTest
import ArriClient
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

    func testFromJSON() throws {
        let objectJson: String = try String(contentsOfFile: noSpecialCharsLocation, encoding: .utf8)
        let result: NestedObject = NestedObject(JSONString: objectJson)
        XCTAssertEqual(result, noSpecialCharsControl)
        XCTAssertEqual(noSpecialCharsControl.toJSONString(), objectJson)
        let specialCharsObjectJson: String = try String(contentsOfFile: specialCharsLocation, encoding: .utf8)
        let specialCharsResult = NestedObject(JSONString: specialCharsObjectJson)
        XCTAssertEqual(specialCharsResult, specialCharsControl)
        XCTAssertEqual(specialCharsControl.toJSONString(), specialCharsObjectJson)
    }
    func testToQueryString() throws {
        let expectedResult = [URLQueryItem(name: "id", value: "1"), URLQueryItem(name: "content", value: "hello world")]
        XCTAssertEqual(expectedResult, noSpecialCharsControl.toURLQueryParts())
    }
}