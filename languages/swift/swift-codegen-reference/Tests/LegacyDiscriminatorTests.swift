import XCTest
import ArriClient
@testable import SwiftCodegenReference

final class LegacyDiscriminatorTests: XCTestCase {
    let location = "../../../tests/test-files/LegacyDiscriminator.json"
    let value = LegacyDiscriminator.c(
        LegacyDiscriminatorC(
            id: "1",
            name: "John Doe",
            date: targetDate
        )
    )

    func testToJSON() throws {
        let reference = try String(contentsOfFile: location, encoding: .utf8)
        XCTAssertEqual(value.toJSONString(), reference)
    }

    func testFromJSON() throws {
        let reference = try String(contentsOfFile: location, encoding: .utf8)
        XCTAssertEqual(LegacyDiscriminator(JSONString: reference), value)
    }
}
