import XCTest
import ArriClient
@testable import TestClientSwift

final class TestSwiftClientTests: XCTestCase {
    let client = TestClient(
        baseURL: "http://localhost:2020",
        delegate: DefaultRequestDelegate(),
        headers: {
            var headers: Dictionary<String, String> = Dictionary()
            headers["x-test-header"] = "test-client-swift"
            return headers
        }
    )
    let testDate = Date(timeIntervalSince1970: 500000)
    func testSendObject() async throws {
        let input = ObjectWithEveryType(
            any: JSON("hello world"),
            boolean: false,
            string: "hello world",
            timestamp: testDate,
            float32: 1.5,
            float64: 2.5,
            int8: 10,
            uint8: 10,
            int16: 150,
            uint16: 150,
            int32: -1555,
            uint32: 1555,
            int64: 150000,
            uint64: 1500000,
            enumerator: ObjectWithEveryTypeEnumerator.b,
            array: [true, false, false],
            object: ObjectWithEveryTypeObject(
                string: "hello object",
                boolean: true,
                timestamp: testDate
            ),
            record: Dictionary(dictionaryLiteral: ("A", true), ("B", false)),
            discriminator: ObjectWithEveryTypeDiscriminator.b(
                ObjectWithEveryTypeDiscriminatorB(
                    title: "this is a title",
                    description: "this is a description"
                )
            ),
            nestedObject: ObjectWithEveryTypeNestedObject(
                id: "d1",
                timestamp: testDate,
                data: ObjectWithEveryTypeNestedObjectData(
                    id: "d2",
                    timestamp: testDate,
                    data: ObjectWithEveryTypeNestedObjectDataData(
                        id: "d3", 
                        timestamp: testDate
                    )
                )
            ),
            nestedArray: [
                [ObjectWithEveryTypeNestedArrayElementElement(id: "b", timestamp: testDate)],
                [ObjectWithEveryTypeNestedArrayElementElement(id: "b", timestamp: testDate), ObjectWithEveryTypeNestedArrayElementElement(id: "c", timestamp: testDate)]
            ]
        )
        let result = try await client.tests.sendObject(input)
        XCTAssertEqual(input, result)
    }
    func testSendObjectWithNullableFields() async throws {
        let input = ObjectWithEveryNullableType(
            any: JSON("null"),
            boolean: nil,
            string: nil,
            timestamp: testDate,
            float32: 1.5,
            float64: 515.5,
            int8: 0,
            uint8: nil,
            int16: nil,
            uint16: nil,
            int32: 1513,
            uint32: 451,
            int64: 1351,
            uint64: 1513,
            enumerator: ObjectWithEveryNullableTypeEnumerator.a,
            array: [nil, true, false],
            object: ObjectWithEveryNullableTypeObject(string: nil, boolean: true, timestamp: nil),
            record: Dictionary(dictionaryLiteral: ("A", nil), ("B", true), ("C", false)),
            discriminator: ObjectWithEveryNullableTypeDiscriminator.a(
                ObjectWithEveryNullableTypeDiscriminatorA(title: nil)
            ),
            nestedObject: ObjectWithEveryNullableTypeNestedObject(
                id: nil,
                timestamp: testDate,
                data: ObjectWithEveryNullableTypeNestedObjectData(
                    id: "d2",
                    timestamp: testDate,
                    data: ObjectWithEveryNullableTypeNestedObjectDataData(
                        id: nil,
                        timestamp: nil
                    )
                )
            ),
            nestedArray: [
                nil,
                [ObjectWithEveryNullableTypeNestedArrayElementElement(id: "1", timestamp: testDate), nil, ObjectWithEveryNullableTypeNestedArrayElementElement(id: "2", timestamp: nil)],
                [],
                nil
            ]
        )
        let result = try await client.tests.sendObjectWithNullableFields(input)
        XCTAssertEqual(input, result)
        var clonedInput = input.clone()
        clonedInput.nestedObject?.data?.id = "I have been changed"
        XCTAssertNotEqual(input, clonedInput)
    }

    func testRpcWithNoParams() async throws {
        let getReqResult = try await client.tests.emptyParamsGetRequest()
        let postReqResult = try await client.tests.emptyParamsPostRequest()
        XCTAssert(getReqResult.message.count > 0)
        XCTAssert(postReqResult.message.count > 0)
    }

    func testRpcWithNoResponse() async throws {
        let getReqResult: () = try await client.tests.emptyResponseGetRequest(DefaultPayload(message: "Hello world"))
        let postReqResult: () = try await client.tests.emptyResponsePostRequest(DefaultPayload(message: "Hello world"))
        XCTAssert(getReqResult as Any is Void)
        XCTAssert(postReqResult as Any is Void)
    }
}