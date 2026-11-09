import XCTest
import ArriClient
@testable import SwiftCodegenReference

private func testFile(_ filename: String) -> String {
    return (try? String(contentsOfFile: "../../../tests/test-files/\(filename)", encoding: .utf8)) ?? ""
}

final class UnionExternalTests: XCTestCase {
    let values: [(String, UnionExternal)] = [
        ("UnionExternal_Object.json", UnionExternal.object(NestedObject(id: "1", content: "hello world"))),
        ("UnionExternal_Array.json", UnionExternal.array(["hello", "world"])),
        ("UnionExternal_Boolean.json", UnionExternal.boolean(true)),
        ("UnionExternal_Timestamp.json", UnionExternal.nullableTimestamp(targetDate)),
        ("UnionExternal_TimestampNull.json", UnionExternal.nullableTimestamp(nil)),
    ]

    func testToJSON() throws {
        for (filename, value) in values {
            XCTAssertEqual(value.toJSONString(), testFile(filename), filename)
        }
    }

    func testFromJSON() throws {
        for (filename, value) in values {
            XCTAssertEqual(UnionExternal(JSONString: testFile(filename)), value, filename)
        }
    }

    func testClone() throws {
        for (filename, value) in values {
            XCTAssertEqual(value.clone(), value, filename)
        }
    }

    func testFromJSONFallback() throws {
        XCTAssertEqual(UnionExternal(), UnionExternal.object(NestedObject()))
        XCTAssertEqual(UnionExternal(JSONString: "{\"triangle\":{\"base\":10}}"), UnionExternal())
        XCTAssertEqual(UnionExternal(JSONString: "false"), UnionExternal())
    }
}

final class UnionInternalTests: XCTestCase {
    let value = UnionInternal.rectangle(UnionInternalRectangle(width: 10.7, height: 5.3))
    let reference = testFile("UnionInternal_Rectangle.json")

    func testToJSON() throws {
        XCTAssertEqual(value.toJSONString(), reference)
    }

    func testFromJSON() throws {
        XCTAssertEqual(UnionInternal(JSONString: reference), value)
    }

    func testToURLQueryParts() throws {
        XCTAssertEqual(
            value.toURLQueryParts(),
            [
                URLQueryItem(name: "shape", value: "rectangle"),
                URLQueryItem(name: "width", value: "10.7"),
                URLQueryItem(name: "height", value: "5.3"),
            ]
        )
    }

    func testFromJSONFallback() throws {
        XCTAssertEqual(UnionInternal(), UnionInternal.rectangle(UnionInternalRectangle()))
        XCTAssertEqual(
            UnionInternal(JSONString: "{\"shape\":\"triangle\",\"base\":10,\"height\":5}"),
            UnionInternal()
        )
        XCTAssertEqual(UnionInternal(JSONString: "{\"width\":10}"), UnionInternal())
    }
}

final class UnionAdjacentTests: XCTestCase {
    let values: [(String, UnionAdjacent)] = [
        ("UnionAdjacent_Object.json", UnionAdjacent.object(NestedObject(id: "1", content: "hello world"))),
        ("UnionAdjacent_TimestampNull.json", UnionAdjacent.nullableTimestamp(nil)),
    ]

    func testToJSON() throws {
        for (filename, value) in values {
            XCTAssertEqual(value.toJSONString(), testFile(filename), filename)
        }
    }

    func testFromJSON() throws {
        for (filename, value) in values {
            XCTAssertEqual(UnionAdjacent(JSONString: testFile(filename)), value, filename)
        }
    }

    func testClone() throws {
        let value = UnionAdjacent.array(["hello", "world"])
        XCTAssertEqual(value.clone(), value)
    }

    func testFromJSONFallback() throws {
        XCTAssertEqual(UnionAdjacent(), UnionAdjacent.object(NestedObject()))
        XCTAssertEqual(
            UnionAdjacent(JSONString: "{\"kind\":\"triangle\",\"data\":{\"base\":10}}"),
            UnionAdjacent()
        )
        XCTAssertEqual(UnionAdjacent(JSONString: "{\"data\":true}"), UnionAdjacent())
    }
}
