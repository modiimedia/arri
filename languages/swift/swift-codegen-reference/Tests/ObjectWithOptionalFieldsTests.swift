import XCTest
@testable import SwiftCodegenReference

final class ObjectWithOptionalFieldsTests: XCTestCase {
    let allUndefLocation = "../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json"
    let allUndefControl = ObjectWithOptionalFields()
    let noUndefLocation = "../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json"
    let noUndefControl = ObjectWithOptionalFields(
        string: "",
        boolean: false,
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
        object: NestedObject(
            id: "1",
            content: "hello world"
        ),
        array: [true, false, false],
        record: Dictionary(dictionaryLiteral: ("A", true), ("B", false)),
        discriminator: Discriminator.c(
            DiscriminatorC(
                id: "",
                name: "",
                date: targetDate
            )
        ),
        any: "hello world"
    )
    func testFromJSON() throws {
        let allUndefJson = try String(contentsOfFile: allUndefLocation, encoding: .utf8)
        let allUndefResult = ObjectWithOptionalFields(JSONString: allUndefJson)
        XCTAssertEqual(allUndefResult, allUndefControl)
        XCTAssertEqual(allUndefControl.toJSONString(), allUndefJson)
        let noUndefJson = try String(contentsOfFile: noUndefLocation, encoding: .utf8)
        let noUndefResult = ObjectWithOptionalFields(JSONString: noUndefJson)
        XCTAssertEqual(noUndefResult, noUndefControl)
        // We cannot compare JSON strings because Swift dictionaries do not preserve ordering
        XCTAssertEqual(ObjectWithOptionalFields(JSONString: noUndefResult.toJSONString()), noUndefControl)
    }
}