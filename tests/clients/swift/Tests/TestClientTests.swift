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
}