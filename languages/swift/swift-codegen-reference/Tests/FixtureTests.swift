import XCTest
import ArriClient
@testable import SwiftCodegenReference

final class FixtureTests: XCTestCase {
    private func readFile(_ name: String) throws -> String {
        return try String(contentsOfFile: "../../../tests/test-files/\(name)", encoding: .utf8)
    }

    func testEmptyObject() throws {
        let json = try readFile("EmptyObject.json")
        XCTAssertEqual(EmptyObject(JSONString: json), EmptyObject())
        XCTAssertEqual(EmptyObject().toJSONString(), json)
        XCTAssertEqual(EmptyObject().toURLQueryParts(), [])
    }

    func testRecordOrderDoesNotAffectEquality() throws {
        XCTAssertEqual(
            ObjectWithEveryType(JSONString: try readFile("ObjectWithEveryType.json")),
            ObjectWithEveryType(JSONString: try readFile("ObjectWithEveryType_ReversedRecord.json"))
        )
        XCTAssertEqual(
            ObjectWithOptionalFields(JSONString: try readFile("ObjectWithOptionalFields_NoUndefined.json")),
            ObjectWithOptionalFields(JSONString: try readFile("ObjectWithOptionalFields_NoUndefined_ReversedRecord.json"))
        )
        XCTAssertEqual(
            ObjectWithNullableFields(JSONString: try readFile("ObjectWithNullableFields_NoNull.json")),
            ObjectWithNullableFields(JSONString: try readFile("ObjectWithNullableFields_NoNull_ReversedRecord.json"))
        )
    }
}
