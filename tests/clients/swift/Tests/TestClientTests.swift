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
    let unauthenticatedClient = TestClient(
        baseURL: "http://localhost:2020",
        delegate: DefaultRequestDelegate(),
        headers: {
            return Dictionary()
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
            record: Dictionary(dictionaryLiteral: ("A", 1), ("B", 0)),
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
            record: Dictionary(dictionaryLiteral: ("A", 1), ("B", 0), ("C", 4)),
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
    
    func testSendPartialObject() async throws {
        let input = ObjectWithEveryOptionalType(
            any: nil,
            boolean: nil,
            string: nil,
            timestamp: nil,
            float32: nil,
            float64: nil,
            int8: nil,
            uint8: nil,
            int16: nil,
            uint16: nil,
            int32: nil,
            uint32: nil,
            int64: nil,
            uint64: nil,
            enumerator: nil,
            array: nil,
            object: nil,
            record: nil,
            discriminator: nil,
            nestedObject: nil,
            nestedArray: [
                [ObjectWithEveryOptionalTypeNestedArrayElementElement(id: "1", timestamp: testDate)],
                [],
            ]
        )
        let result = try await client.tests.sendPartialObject(input)
        XCTAssertEqual(input, result)
        var clonedInput = input.clone()
        XCTAssertEqual(input, clonedInput)
        clonedInput.int8 = -10
        XCTAssertNotEqual(input, clonedInput)
    }

    func testSendUnauthenticatedRequest() async {
        var didError = false
        do {
            let _ = try await unauthenticatedClient.tests.sendObject(ObjectWithEveryType())
        } catch {
            didError = true
            XCTAssert(error is ArriResponseError)
            if error is ArriResponseError {
                let e = error as! ArriResponseError
                XCTAssertEqual(e.code, 401)
            }
        }
        XCTAssert(didError)
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

    func testSendRecursiveObject() async throws {
        let input = RecursiveObject(
            left: RecursiveObject(
                left: nil, 
                right: nil, 
                value: "A"
            ), 
            right: RecursiveObject(
                left: nil, 
                right: RecursiveObject(
                    left: nil,
                    right: nil,
                    value: "B"
                ),
                value: "AA"
            ),
            value: "1"
        )
        let result = try await client.tests.sendRecursiveObject(input)
        XCTAssertEqual(input, result)
    }

    func testSendRecursiveUnion() async throws {
        let input = RecursiveUnion.children(RecursiveUnionChildren(data: [
            RecursiveUnion.child(
                RecursiveUnionChild(
                    data: RecursiveUnion.text(
                        RecursiveUnionText(data: "hello world")
                    )
                )
            ),
            RecursiveUnion.shape(
                RecursiveUnionShape(
                    data: RecursiveUnionShapeData(
                        width: 1,
                        height: 1.5,
                        color: "blue"
                    )
                )
            ),
            RecursiveUnion.children(
                RecursiveUnionChildren(
                    data: []
                )
            )
        ]))
        let result = try await client.tests.sendRecursiveUnion(input)
        XCTAssertEqual(input, result)
    }

    func testStreamMessages() async {
        let input = ChatMessageParams(channelId: "12345")
        var msgCount = 0
        var errorCount = 0
        let _ = await client.tests.streamMessages(input, options: EventSourceOptions(
            onMessage: { msg, controller in 
                switch (msg) {
                    case .text(let msg):
                        XCTAssertEqual(msg.channelId, "12345")
                        break;
                    case .image(let msg):
                        XCTAssertEqual(msg.channelId, "12345")
                        break;
                    case .url(let msg):
                        XCTAssertEqual(msg.channelId, "12345")
                        break;
                }
                msgCount += 1
                if msgCount >= 10 {
                    controller.cancel()
                }
            },
            onRequestError: { error, controller in
                errorCount += 1
                print("UNEXPECTED REQUEST_ERROR \(error)")
                controller.cancel()
            },
            onResponseError: { error, controller in 
                errorCount += 1
                print("UNEXPECTED RESPONSE_ERROR: \(error)")
                controller.cancel()
            }
        )).result
        XCTAssertEqual(errorCount, 0)
        XCTAssertEqual(msgCount, 10)
    }
    func testStreamLargeObject() async {
        var msgCount = 0
        var errorCount = 0
        let _ = await client.tests.streamLargeObjects(options: EventSourceOptions(
            onMessage: { msg, es in 
                msgCount += 1
                if msgCount >= 5 {
                    es.cancel()
                }
            },
            onRequestError: {err, es in 
                errorCount += 1
                print("UNEXPECTED REQUEST_ERROR: \(err)")
                es.cancel()
            },
            onResponseError: { err, es in 
                errorCount += 1
                print("UNEXPECTED RESPONSE_ERROR: \(err)")
                es.cancel()
            })
        ).result
        XCTAssertEqual(errorCount, 0)
        XCTAssertEqual(msgCount, 5)
    }
    func testStreamAutoReconnect() async throws {
        var msgCount = 0
        var openCount = 0
        var errorCount = 0
        let _ = await client.tests.streamAutoReconnect(AutoReconnectParams(messageCount: 5), options: EventSourceOptions(
            onMessage: { msg, es in 
                msgCount += 1
                if msgCount >= 100 {
                    es.cancel()
                }
            },
            onRequest: nil,
            onRequestError: {err, es in 
                errorCount += 1
                print("UNEXPECTED REQUEST_ERROR: \(err)")
                es.cancel()
            },
            onResponse: { _, es in 
                openCount += 1
                if openCount >= 3 {
                    es.cancel()
                }
            },
            onResponseError: { err, es in 
                errorCount += 1
                print("UNEXPECTED RESPONSE_ERROR: \(err)")
                es.cancel()
            },
            onClose: nil,
            maxRetryCount: nil,
            maxRetryInterval: nil
            )
        ).result
        XCTAssertEqual(errorCount, 0)
        XCTAssertEqual(openCount, 3)
        XCTAssertEqual(msgCount, 10)
    }
    func testStreamConnectionError() async throws {
        var msgCount = 0
        var openCount = 0
        var reqErrorCount = 0
        var resErrorCount = 0
        let _ = await client.tests.streamConnectionErrorTest(StreamConnectionErrorTestParams(statusCode: 411, statusMessage: "This is a test"), options: EventSourceOptions(
            onMessage: {_, es in 
                msgCount += 1
                es.cancel()
            },
            onRequest: nil,
            onRequestError: { err, es in
                print("UNEXPECTED REQUEST_ERROR: \(err)")
                reqErrorCount += 1
                es.cancel()
            },
            onResponse: { _, es in 
                openCount += 1
                if openCount >= 10 {
                    es.cancel()
                }
            },
            onResponseError: { err, es in 
                resErrorCount += 1
                XCTAssertEqual(err.code, 411)
                XCTAssertEqual(err.message, "This is a test")
                if resErrorCount >= 5 {
                    es.cancel()
                }
            },
            onClose: nil,
            maxRetryCount: nil,
            maxRetryInterval: nil
        )).result
        XCTAssertEqual(msgCount, 0)
        XCTAssertEqual(reqErrorCount, 0)
        XCTAssertEqual(openCount, resErrorCount)
        XCTAssert(resErrorCount > 1)
    }
    func testStreamRetryWithNewCredentials() async throws {
        let customClient = TestClient(
            baseURL: "http://localhost:2020",
            delegate: DefaultRequestDelegate(),
            headers: {
                var headers: Dictionary<String, String> = Dictionary()
                headers["x-test-header"] = "test-client-swift-\(UUID())"
                return headers
            }
        )
        var msgCount = 0
        var errorCount = 0
        var openCount = 0
        let task = customClient.tests.streamRetryWithNewCredentials(
            options: EventSourceOptions(
                onMessage: {_, __ in 
                    msgCount += 1
                },
                onRequest: nil,
                onRequestError: { err, __ in 
                    print("UNEXPECTED_REQUEST_ERROR: \(err)")
                    errorCount += 1
                },
                onResponse: { _, __ in 
                    openCount += 1
                },
                onResponseError: { err, __ in 
                    print("UNEXPECTED_RESPONSE_ERROR: \(err)")
                    errorCount += 1
                },
                onClose: nil,
                maxRetryCount: nil,
                maxRetryInterval: nil
            )
        )
        try await Task.sleep(for: .seconds(1))
        if !task.isCancelled {
            task.cancel()
        }
        XCTAssert(msgCount > 0)
        XCTAssert(openCount > 0)
        XCTAssertEqual(errorCount, 0)
    }
    func testStreamTenEventsThenEnd() async {
        var msgCount = 0
        var errorCount = 0
        var openCount = 0
        var closeCount = 0
        let _ = await client.tests.streamTenEventsThenEnd(options: EventSourceOptions(onMessage: { _, es in 
            msgCount += 1
        },
            onRequest: nil,
            onRequestError: { err, es in 
                print("UNEXPECTED_REQUEST_ERROR: \(err)")
                errorCount += 1
                es.cancel()
            },
            onResponse: { _, __ in 
                openCount += 1
            },
            onResponseError: { err, es in 
                print("UNEXPECTED_RESPONSE_ERROR: \(err)")
                errorCount += 1
                es.cancel()
            },
            onClose: {
                closeCount += 1
            },
            maxRetryCount: nil,
            maxRetryInterval: nil
        )).result
        XCTAssertEqual(msgCount, 10)
        XCTAssertEqual(errorCount, 0)
        XCTAssertEqual(openCount, 1)
        XCTAssertEqual(closeCount, 1)
    }
}