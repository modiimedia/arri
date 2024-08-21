import XCTest
import ArriClient
@testable import SwiftCodegenReference

final class RecursiveObjectTests: XCTestCase {
    let location = "../../../tests/test-files/RecursiveObject.json"
    let control = RecursiveObject(
        left: RecursiveObject(
            left: RecursiveObject(
                left: nil,
                right: RecursiveObject(
                    left: nil,
                    right: nil
                )
            ),
            right: nil
        ),
        right: RecursiveObject(
            left: nil,
            right: nil
        )
    )
    func testFromJSON() throws {
        let objectJson = try String(contentsOfFile: location, encoding: .utf8)
        let result = RecursiveObject(JSONString: objectJson)
        XCTAssertEqual(result, control)
        XCTAssertEqual(control.toJSONString(), objectJson)
        let clonedControl = control.clone()
        clonedControl.left?.left?.left = RecursiveObject(
            left: RecursiveObject(
                left: nil,
                right: nil
            ),
            right: RecursiveObject(
                left: nil, 
                right: nil
            )
        )
        XCTAssertNotEqual(clonedControl, control)
    }
}