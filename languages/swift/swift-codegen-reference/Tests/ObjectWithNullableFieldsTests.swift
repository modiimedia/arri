import XCTest
import ArriClient
@testable import SwiftCodegenReference

final class ObjectWithNullableFieldsTests: XCTestCase {
    let allNullLocation = "../../../tests/test-files/ObjectWithNullableFields_AllNull.json"
    let allNullControl = ObjectWithNullableFields()
    let noNullLocation = "../../../tests/test-files/ObjectWithNullableFields_NoNull.json"
    let noNullControl = ObjectWithNullableFields(
        string: "",
        boolean: true,
        timestamp: targetDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000,
        uint64: 1000,
        enum: Enumerator.baz,
        object: NestedObject(id: "", content: ""),
        array: [true, false, false],
        record: Dictionary(dictionaryLiteral: ("A", true), ("B", false)),
        discriminator: Discriminator.c(DiscriminatorC(id: "", name: "", date: targetDate)),
        any: JSON(parseJSON: "{\"message\":\"hello world\"}")
    )
    func testFromJSON() throws {
        let allNullJson = try String(contentsOfFile: allNullLocation, encoding: .utf8)
        let allNullResult = ObjectWithNullableFields(JSONString: allNullJson)
        XCTAssertEqual(allNullResult, allNullControl)
        XCTAssertEqual(ObjectWithNullableFields(JSONString: allNullControl.toJSONString()), allNullControl)
        let noNullJson = try String(contentsOfFile: noNullLocation, encoding: .utf8)
        let noNullResult = ObjectWithNullableFields(JSONString: noNullJson)
        XCTAssertEqual(noNullResult, noNullControl)
        // We cannot compare JSON strings because Swift dictionaries do not preserve ordering
        XCTAssertEqual(ObjectWithNullableFields(JSONString: noNullResult.toJSONString()), noNullControl)
    }
}