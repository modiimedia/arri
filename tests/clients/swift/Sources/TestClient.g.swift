import Foundation
import ArriClient

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public class TestClient {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>
    let onError: (Error) -> Void
    public let tests: TestClientTestsService
    public let users: TestClientUsersService
    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>,
        onError: @escaping ((Error) -> Void) = { _ -> Void in }
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
        self.onError = onError
        self.tests = TestClientTestsService(
            baseURL: baseURL,
            delegate: delegate,
            headers: headers,
            onError: onError
        )
        self.users = TestClientUsersService(
            baseURL: baseURL,
            delegate: delegate,
            headers: headers,
            onError: onError
        )    
    }

        
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public class TestClientTestsService {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>
    let onError: (Error) -> Void
    public let nested: TestClientTestsNestedService
    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>,
        onError: @escaping ((Error) -> Void) = { _ -> Void in }
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
        self.onError = onError
        self.nested = TestClientTestsNestedService(
            baseURL: baseURL,
            delegate: delegate,
            headers: headers,
            onError: onError
        )    
    }
    /// If the target language supports it. Generated code should mark this procedure as deprecated.
    @available(*, deprecated)
    public func deprecatedRpc(_ params: DeprecatedRpcParams) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/deprecated-rpc",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        
    }
    public func sendDiscriminatorWithEmptyObject(_ params: DiscriminatorWithEmptyObject) async throws -> DiscriminatorWithEmptyObject {
        let result: DiscriminatorWithEmptyObject = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-discriminator-with-empty-object",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendError(_ params: SendErrorParams) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-error",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        
    }
    public func sendObject(_ params: ObjectWithEveryType) async throws -> ObjectWithEveryType {
        let result: ObjectWithEveryType = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-object",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendObjectWithKebabCaseKeys(_ params: ObjectWithKebabCaseKeys) async throws -> ObjectWithKebabCaseKeys {
        let result: ObjectWithKebabCaseKeys = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-object-with-kebab-case-keys",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendObjectWithNullableFields(_ params: ObjectWithEveryNullableType) async throws -> ObjectWithEveryNullableType {
        let result: ObjectWithEveryNullableType = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-object-with-nullable-fields",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendObjectWithPascalCaseKeys(_ params: ObjectWithPascalCaseKeys) async throws -> ObjectWithPascalCaseKeys {
        let result: ObjectWithPascalCaseKeys = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-object-with-pascal-case-keys",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendObjectWithSnakeCaseKeys(_ params: ObjectWithSnakeCaseKeys) async throws -> ObjectWithSnakeCaseKeys {
        let result: ObjectWithSnakeCaseKeys = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-object-with-snake-case-keys",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendPartialObject(_ params: ObjectWithEveryOptionalType) async throws -> ObjectWithEveryOptionalType {
        let result: ObjectWithEveryOptionalType = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-partial-object",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendRecursiveObject(_ params: RecursiveObject) async throws -> RecursiveObject {
        let result: RecursiveObject = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-recursive-object",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendRecursiveUnionAdjacent(_ params: RecursiveUnionAdjacent) async throws -> RecursiveUnionAdjacent {
        let result: RecursiveUnionAdjacent = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-recursive-union-adjacent",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendRecursiveUnionExternal(_ params: RecursiveUnionExternal) async throws -> RecursiveUnionExternal {
        let result: RecursiveUnionExternal = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-recursive-union-external",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func sendRecursiveUnionInternal(_ params: RecursiveUnionInternal) async throws -> RecursiveUnionInternal {
        let result: RecursiveUnionInternal = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-recursive-union-internal",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    /// GET requests send params through url query params. Only internally tagged unions can be represented this way.
    public func sendUnionInternalGetRequest(_ params: UnionInternalGetRequest) async throws -> UnionInternalGetRequest {
        let result: UnionInternalGetRequest = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-union-internal-get-request",
            method: "GET",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        return result
    }
    public func streamAutoReconnect(_ params: AutoReconnectParams, options: EventSourceOptions<AutoReconnectResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<AutoReconnectResponse>(
                url: "\(self.baseURL)/rpcs/tests/stream-auto-reconnect",
                method: "POST",
                headers: self.headers,
                params: params,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    /// This route will always return an error. The client should automatically retry with exponential backoff.
    public func streamConnectionErrorTest(_ params: StreamConnectionErrorTestParams, options: EventSourceOptions<StreamConnectionErrorTestResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<StreamConnectionErrorTestResponse>(
                url: "\(self.baseURL)/rpcs/tests/stream-connection-error-test",
                method: "POST",
                headers: self.headers,
                params: params,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    /// Sends 5 messages quickly then starts sending messages slowly (1s) after that.
    /// When heartbeat is enabled the client should keep the connection alive regardless of the slowdown of messages.
    /// When heartbeat is disabled the client should open a new connection sometime after receiving the 5th message.
    public func streamHeartbeatDetectionTest(_ params: StreamHeartbeatDetectionTestParams, options: EventSourceOptions<StreamHeartbeatDetectionTestResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<StreamHeartbeatDetectionTestResponse>(
                url: "\(self.baseURL)/rpcs/tests/stream-heartbeat-detection-test",
                method: "POST",
                headers: self.headers,
                params: params,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    /// Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message
    public func streamLargeObjects(options: EventSourceOptions<StreamLargeObjectsResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<StreamLargeObjectsResponse>(
                url: "\(self.baseURL)/rpcs/tests/stream-large-objects",
                method: "POST",
                headers: self.headers,
                params: nil,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    public func streamMessages(_ params: ChatMessageParams, options: EventSourceOptions<ChatMessage>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<ChatMessage>(
                url: "\(self.baseURL)/rpcs/tests/stream-messages",
                method: "POST",
                headers: self.headers,
                params: params,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    public func streamRetryWithNewCredentials(options: EventSourceOptions<TestsStreamRetryWithNewCredentialsResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<TestsStreamRetryWithNewCredentialsResponse>(
                url: "\(self.baseURL)/rpcs/tests/stream-retry-with-new-credentials",
                method: "POST",
                headers: self.headers,
                params: nil,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    /// When the client receives the 'done' event, it should close the connection and NOT reconnect
    public func streamTenEventsThenEnd(options: EventSourceOptions<ChatMessage>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<ChatMessage>(
                url: "\(self.baseURL)/rpcs/tests/stream-ten-events-then-end",
                method: "POST",
                headers: self.headers,
                params: nil,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
        
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public class TestClientTestsNestedService {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>
    let onError: (Error) -> Void

    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>,
        onError: @escaping ((Error) -> Void) = { _ -> Void in }
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
        self.onError = onError
    
    }
    public func emptyParamsGetRequest() async throws -> DefaultPayload {
        let result: DefaultPayload = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/nested/empty-params-get-request",
            method: "GET",
            headers: self.headers,
            clientVersion: "10",
            params: EmptyArriModel(),
            onError: onError
        )
        return result
    }
    public func emptyParamsPostRequest() async throws -> DefaultPayload {
        let result: DefaultPayload = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/nested/empty-params-post-request",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: EmptyArriModel(),
            onError: onError
        )
        return result
    }
    public func emptyResponseGetRequest(_ params: DefaultPayload) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/nested/empty-response-get-request",
            method: "GET",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        
    }
    public func emptyResponsePostRequest(_ params: DefaultPayload) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/nested/empty-response-post-request",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params,
            onError: onError
        )
        
    }
        
}


@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public class TestClientUsersService {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>
    let onError: (Error) -> Void

    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>,
        onError: @escaping ((Error) -> Void) = { _ -> Void in }
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
        self.onError = onError
    
    }
    public func watchUser(_ params: UsersWatchUserParams, options: EventSourceOptions<UsersWatchUserResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<UsersWatchUserResponse>(
                url: "\(self.baseURL)/rpcs/users/watch-user",
                method: "POST",
                headers: self.headers,
                params: params,
                delegate: self.delegate,
                clientVersion: "10",
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
        
}


public struct ManuallyAddedModel: ArriClientModel {
    public var hello: String = ""
    public init(
        hello: String
    ) {
            self.hello = hello
    }
    public init() {}
    public init(json: JSON) {
        self.hello = json["hello"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"hello\":"
        __json += serializeString(input: self.hello)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "hello", value: self.hello))
        return __queryParts
    }
    public func clone() -> ManuallyAddedModel {

        return ManuallyAddedModel(
            hello: self.hello
        )
    }
    
}
    

public struct DefaultPayload: ArriClientModel {
    public var message: String = ""
    public init(
        message: String
    ) {
            self.message = message
    }
    public init() {}
    public init(json: JSON) {
        self.message = json["message"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "message", value: self.message))
        return __queryParts
    }
    public func clone() -> DefaultPayload {

        return DefaultPayload(
            message: self.message
        )
    }
    
}
    

@available(*, deprecated)
public struct DeprecatedRpcParams: ArriClientModel {
    @available(*, deprecated)
    public var deprecatedField: String = ""
    public init(
        deprecatedField: String
    ) {
            self.deprecatedField = deprecatedField
    }
    public init() {}
    public init(json: JSON) {
        self.deprecatedField = json["deprecatedField"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"deprecatedField\":"
        __json += serializeString(input: self.deprecatedField)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "deprecatedField", value: self.deprecatedField))
        return __queryParts
    }
    public func clone() -> DeprecatedRpcParams {

        return DeprecatedRpcParams(
            deprecatedField: self.deprecatedField
        )
    }
    
}
    

public enum DiscriminatorWithEmptyObject: ArriClientModel {
    case empty(DiscriminatorWithEmptyObjectEmpty)
    case notEmpty(DiscriminatorWithEmptyObjectNotEmpty)
    public init() {
        self = .empty(DiscriminatorWithEmptyObjectEmpty())
    }
    public init(json: JSON) {
        let __tag = json["type"].string ?? ""
        switch (__tag) {
            case "EMPTY":
                self = .empty(DiscriminatorWithEmptyObjectEmpty(json: json))
                break
            case "NOT_EMPTY":
                self = .notEmpty(DiscriminatorWithEmptyObjectNotEmpty(json: json))
                break
            default:
                self = .empty(DiscriminatorWithEmptyObjectEmpty())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .empty(let __innerVal):
                return __innerVal.toJSONString()
            case .notEmpty(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .empty(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .notEmpty(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> DiscriminatorWithEmptyObject {
        switch(self) {
            case .empty(let __innerVal):
                return .empty(__innerVal.clone())
            case .notEmpty(let __innerVal):
                return .notEmpty(__innerVal.clone())
        }
    }
}

public struct DiscriminatorWithEmptyObjectEmpty: ArriClientModel {
    let type: String = "EMPTY"
    public init(

    ) {

    }
    
    public init(json: JSON) {

    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"type\":\"EMPTY\""
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "EMPTY"))
        return __queryParts
    }
    public func clone() -> DiscriminatorWithEmptyObjectEmpty {

        return DiscriminatorWithEmptyObjectEmpty(

        )
    }
    
}
    

public struct DiscriminatorWithEmptyObjectNotEmpty: ArriClientModel {
    let type: String = "NOT_EMPTY"
    public var foo: String = ""
    public var bar: Float64 = 0.0
    public var baz: Bool = false
    public init(
        foo: String,
        bar: Float64,
        baz: Bool
    ) {
            self.foo = foo
            self.bar = bar
            self.baz = baz
    }
    public init() {}
    public init(json: JSON) {
        self.foo = json["foo"].string ?? ""
        self.bar = json["bar"].double ?? 0.0
        self.baz = json["baz"].bool ?? false
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"type\":\"NOT_EMPTY\""
        __json += ",\"foo\":"
        __json += serializeString(input: self.foo)
        __json += ",\"bar\":"
        __json += "\(self.bar)"
        __json += ",\"baz\":"
        __json += "\(self.baz)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "NOT_EMPTY"))
        __queryParts.append(URLQueryItem(name: "foo", value: self.foo))
        __queryParts.append(URLQueryItem(name: "bar", value: "\(self.bar)"))
        __queryParts.append(URLQueryItem(name: "baz", value: "\(self.baz)"))
        return __queryParts
    }
    public func clone() -> DiscriminatorWithEmptyObjectNotEmpty {

        return DiscriminatorWithEmptyObjectNotEmpty(
            foo: self.foo,
            bar: self.bar,
            baz: self.baz
        )
    }
    
}
    

public struct SendErrorParams: ArriClientModel {
    public var code: UInt16 = 0
    public var message: String = ""
    public init(
        code: UInt16,
        message: String
    ) {
            self.code = code
            self.message = message
    }
    public init() {}
    public init(json: JSON) {
        self.code = json["code"].uInt16 ?? 0
        self.message = json["message"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"code\":"
        __json += "\(self.code)"
        __json += ",\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "code", value: "\(self.code)"))
        __queryParts.append(URLQueryItem(name: "message", value: self.message))
        return __queryParts
    }
    public func clone() -> SendErrorParams {

        return SendErrorParams(
            code: self.code,
            message: self.message
        )
    }
    
}
    

public struct ObjectWithEveryType: ArriClientModel {
    public var any: JSON = JSON()
    public var boolean: Bool = false
    public var string: String = ""
    public var timestamp: Date = Date()
    public var float32: Float32 = 0.0
    public var float64: Float64 = 0.0
    public var int8: Int8 = 0
    public var uint8: UInt8 = 0
    public var int16: Int16 = 0
    public var uint16: UInt16 = 0
    public var int32: Int32 = 0
    public var uint32: UInt32 = 0
    public var int64: Int64 = 0
    public var uint64: UInt64 = 0
    public var enumerator: ObjectWithEveryTypeEnumerator = ObjectWithEveryTypeEnumerator.a
    public var array: [Bool] = []
    public var object: ObjectWithEveryTypeObject = ObjectWithEveryTypeObject()
    public var record: Dictionary<String, UInt64> = Dictionary()
    public var unionExternal: ObjectWithEveryTypeUnionExternal = ObjectWithEveryTypeUnionExternal()
    public var unionInternal: ObjectWithEveryTypeUnionInternal = ObjectWithEveryTypeUnionInternal()
    public var unionAdjacent: ObjectWithEveryTypeUnionAdjacent = ObjectWithEveryTypeUnionAdjacent()
    public var nestedObject: ObjectWithEveryTypeNestedObject = ObjectWithEveryTypeNestedObject()
    public var nestedArray: [[ObjectWithEveryTypeNestedArrayElementElement]] = []
    public init(
        any: JSON,
        boolean: Bool,
        string: String,
        timestamp: Date,
        float32: Float32,
        float64: Float64,
        int8: Int8,
        uint8: UInt8,
        int16: Int16,
        uint16: UInt16,
        int32: Int32,
        uint32: UInt32,
        int64: Int64,
        uint64: UInt64,
        enumerator: ObjectWithEveryTypeEnumerator,
        array: [Bool],
        object: ObjectWithEveryTypeObject,
        record: Dictionary<String, UInt64>,
        unionExternal: ObjectWithEveryTypeUnionExternal,
        unionInternal: ObjectWithEveryTypeUnionInternal,
        unionAdjacent: ObjectWithEveryTypeUnionAdjacent,
        nestedObject: ObjectWithEveryTypeNestedObject,
        nestedArray: [[ObjectWithEveryTypeNestedArrayElementElement]]
    ) {
            self.any = any
            self.boolean = boolean
            self.string = string
            self.timestamp = timestamp
            self.float32 = float32
            self.float64 = float64
            self.int8 = int8
            self.uint8 = uint8
            self.int16 = int16
            self.uint16 = uint16
            self.int32 = int32
            self.uint32 = uint32
            self.int64 = int64
            self.uint64 = uint64
            self.enumerator = enumerator
            self.array = array
            self.object = object
            self.record = record
            self.unionExternal = unionExternal
            self.unionInternal = unionInternal
            self.unionAdjacent = unionAdjacent
            self.nestedObject = nestedObject
            self.nestedArray = nestedArray
    }
    public init() {}
    public init(json: JSON) {
        self.any = json["any"]
        self.boolean = json["boolean"].bool ?? false
        self.string = json["string"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
        self.float32 = json["float32"].float ?? 0.0
        self.float64 = json["float64"].double ?? 0.0
        self.int8 = json["int8"].int8 ?? 0
        self.uint8 = json["uint8"].uInt8 ?? 0
        self.int16 = json["int16"].int16 ?? 0
        self.uint16 = json["uint16"].uInt16 ?? 0
        self.int32 = json["int32"].int32 ?? 0
        self.uint32 = json["uint32"].uInt32 ?? 0
        self.int64 = Int64(json["int64"].string ?? "0") ?? 0
        self.uint64 = UInt64(json["uint64"].string ?? "0") ?? 0
        self.enumerator = ObjectWithEveryTypeEnumerator(serialValue: json["enumerator"].string ?? "")
        self.array = []
            for __arrayJsonElement in json["array"].array ?? [] {
                var __arrayJsonElementValue: Bool
                        __arrayJsonElementValue = __arrayJsonElement.bool ?? false
                self.array.append(__arrayJsonElementValue)
            }
        self.object = ObjectWithEveryTypeObject(json: json["object"])
        self.record = Dictionary()
            for (__key, __value) in json["record"].dictionary ?? Dictionary() {
                var __parsedValue: UInt64
                        __parsedValue = UInt64(__value.string ?? "0") ?? 0
                self.record[__key] = __parsedValue            
            }
        self.unionExternal = ObjectWithEveryTypeUnionExternal(json: json["unionExternal"])
        self.unionInternal = ObjectWithEveryTypeUnionInternal(json: json["unionInternal"])
        self.unionAdjacent = ObjectWithEveryTypeUnionAdjacent(json: json["unionAdjacent"])
        self.nestedObject = ObjectWithEveryTypeNestedObject(json: json["nestedObject"])
        self.nestedArray = []
            for __nestedArrayJsonElement in json["nestedArray"].array ?? [] {
                var __nestedArrayJsonElementValue: [ObjectWithEveryTypeNestedArrayElementElement]
                        __nestedArrayJsonElementValue = []
            for __elementJsonElement in __nestedArrayJsonElement.array ?? [] {
                var __elementJsonElementValue: ObjectWithEveryTypeNestedArrayElementElement
                        __elementJsonElementValue = ObjectWithEveryTypeNestedArrayElementElement(json: __elementJsonElement)
                __nestedArrayJsonElementValue.append(__elementJsonElementValue)
            }
                self.nestedArray.append(__nestedArrayJsonElementValue)
            }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"any\":"
        __json += serializeAny(input: self.any)
        __json += ",\"boolean\":"
        __json += "\(self.boolean)"
        __json += ",\"string\":"
        __json += serializeString(input: self.string)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += ",\"float32\":"
        __json += "\(self.float32)"
        __json += ",\"float64\":"
        __json += "\(self.float64)"
        __json += ",\"int8\":"
        __json += "\(self.int8)"
        __json += ",\"uint8\":"
        __json += "\(self.uint8)"
        __json += ",\"int16\":"
        __json += "\(self.int16)"
        __json += ",\"uint16\":"
        __json += "\(self.uint16)"
        __json += ",\"int32\":"
        __json += "\(self.int32)"
        __json += ",\"uint32\":"
        __json += "\(self.uint32)"
        __json += ",\"int64\":"
        __json += "\"\(self.int64)\""
        __json += ",\"uint64\":"
        __json += "\"\(self.uint64)\""
        __json += ",\"enumerator\":"
        __json += "\"\(self.enumerator.serialValue())\""
        __json += ",\"array\":"
       __json += "["
            for (__index, __element) in self.array.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += "\(__element)"
            }
            __json += "]"
        __json += ",\"object\":"
        __json += self.object.toJSONString()
        __json += ",\"record\":"
        __json += "{"
            for (__index, (__key, __value)) in self.record.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += "\(serializeString(input: __key)):"
                        __json += "\"\(__value)\""
            }
            __json += "}"
        __json += ",\"unionExternal\":"
        __json += self.unionExternal.toJSONString()
        __json += ",\"unionInternal\":"
        __json += self.unionInternal.toJSONString()
        __json += ",\"unionAdjacent\":"
        __json += self.unionAdjacent.toJSONString()
        __json += ",\"nestedObject\":"
        __json += self.nestedObject.toJSONString()
        __json += ",\"nestedArray\":"
       __json += "["
            for (__index, __element) in self.nestedArray.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                       __json += "["
            for (__index, __element) in __element.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += __element.toJSONString()
            }
            __json += "]"
            }
            __json += "]"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryType/any.")
        __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean)"))
        __queryParts.append(URLQueryItem(name: "string", value: self.string))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "float32", value: "\(self.float32)"))
        __queryParts.append(URLQueryItem(name: "float64", value: "\(self.float64)"))
        __queryParts.append(URLQueryItem(name: "int8", value: "\(self.int8)"))
        __queryParts.append(URLQueryItem(name: "uint8", value: "\(self.uint8)"))
        __queryParts.append(URLQueryItem(name: "int16", value: "\(self.int16)"))
        __queryParts.append(URLQueryItem(name: "uint16", value: "\(self.uint16)"))
        __queryParts.append(URLQueryItem(name: "int32", value: "\(self.int32)"))
        __queryParts.append(URLQueryItem(name: "uint32", value: "\(self.uint32)"))
        __queryParts.append(URLQueryItem(name: "int64", value: "\(self.int64)"))
        __queryParts.append(URLQueryItem(name: "uint64", value: "\(self.uint64)"))
        __queryParts.append(URLQueryItem(name: "enumerator", value: self.enumerator.serialValue()))
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionExternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionInternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionAdjacent.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedObject.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedArray.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryType {
var __arrayCloned: [Bool] = []
                for __arrayElement in self.array {
                    
                    __arrayCloned.append(__arrayElement)
                }

var __recordCloned: Dictionary<String, UInt64> = Dictionary()
                    for (__recordKey, __recordValue) in self.record {
                        
                        __recordCloned[__recordKey] = __recordValue
                    }




var __nestedArrayCloned: [[ObjectWithEveryTypeNestedArrayElementElement]] = []
                for __nestedArrayElement in self.nestedArray {
                    var __nestedArrayElementCloned: [ObjectWithEveryTypeNestedArrayElementElement] = []
                for __nestedArrayElementElement in __nestedArrayElement {
                    
                    __nestedArrayElementCloned.append(__nestedArrayElementElement.clone())
                }
                    __nestedArrayCloned.append(__nestedArrayElementCloned)
                }
        return ObjectWithEveryType(
            any: self.any,
            boolean: self.boolean,
            string: self.string,
            timestamp: self.timestamp,
            float32: self.float32,
            float64: self.float64,
            int8: self.int8,
            uint8: self.uint8,
            int16: self.int16,
            uint16: self.uint16,
            int32: self.int32,
            uint32: self.uint32,
            int64: self.int64,
            uint64: self.uint64,
            enumerator: self.enumerator,
            array: __arrayCloned,
            object: self.object.clone(),
            record: __recordCloned,
            unionExternal: self.unionExternal.clone(),
            unionInternal: self.unionInternal.clone(),
            unionAdjacent: self.unionAdjacent.clone(),
            nestedObject: self.nestedObject.clone(),
            nestedArray: __nestedArrayCloned
        )
    }
    
}
    
public enum ObjectWithEveryTypeEnumerator: ArriClientEnum {
    case a
    case b
    case c
    public init() {
        self = .a
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "A":
                self = .a
                break;
            case "B":
                self = .b
                break;
            case "C":
                self = .c
                break;
            default:
                self = .a
        }
    }
    public func serialValue() -> String {
        switch (self) {
            case .a:
                return "A"
            case .b:
                return "B"
            case .c:
                return "C"
        }
    }
}
public struct ObjectWithEveryTypeObject: ArriClientModel {
    public var string: String = ""
    public var boolean: Bool = false
    public var timestamp: Date = Date()
    public init(
        string: String,
        boolean: Bool,
        timestamp: Date
    ) {
            self.string = string
            self.boolean = boolean
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        self.string = json["string"].string ?? ""
        self.boolean = json["boolean"].bool ?? false
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"string\":"
        __json += serializeString(input: self.string)
        __json += ",\"boolean\":"
        __json += "\(self.boolean)"
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "string", value: self.string))
        __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean)"))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeObject {

        return ObjectWithEveryTypeObject(
            string: self.string,
            boolean: self.boolean,
            timestamp: self.timestamp
        )
    }
    
}
    

public enum ObjectWithEveryTypeUnionExternal: ArriClientModel {
    case object(ObjectWithEveryTypeUnionExternalObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(ObjectWithEveryTypeUnionExternalObject())
    }
    public init(json: JSON) {
        if json["object"].exists() {
                var __variantValue: ObjectWithEveryTypeUnionExternalObject
                __variantValue = ObjectWithEveryTypeUnionExternalObject(json: json["object"])
                self = .object(__variantValue)
        } else if json["array"].exists() {
                var __variantValue: [String]
                __variantValue = []
            for __variantValueJsonElement in json["array"].array ?? [] {
                var __variantValueJsonElementValue: String
                        __variantValueJsonElementValue = __variantValueJsonElement.string ?? ""
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .array(__variantValue)
        } else if json["boolean"].exists() {
                var __variantValue: Bool
                __variantValue = json["boolean"].bool ?? false
                self = .boolean(__variantValue)
        } else if json["nullable-timestamp"].exists() {
                var __variantValue: Date?
                if json["nullable-timestamp"].string != nil {
                    __variantValue = parseDate(json["nullable-timestamp"].string ?? "") ?? Date()
                }
                self = .nullableTimestamp(__variantValue)
        } else {
            self = .object(ObjectWithEveryTypeUnionExternalObject())
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .object(let __variantValue):
                __json += "\"object\":"
                __json += __variantValue.toJSONString()
                break
            case .array(let __variantValue):
                __json += "\"array\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeString(input: __element)
            }
            __json += "]"
                break
            case .boolean(let __variantValue):
                __json += "\"boolean\":"
                __json += "\(__variantValue)"
                break
            case .nullableTimestamp(let __variantValue):
                __json += "\"nullable-timestamp\":"
                if __variantValue != nil {
                    __json += serializeDate(__variantValue!)
                } else {
                    __json += "null" 
                }
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionExternal.")
        return []
    }
    public func clone() -> ObjectWithEveryTypeUnionExternal {
        switch(self) {
            case .object(let __variantValue):
                
                return .object(__variantValue.clone())
            case .array(let __variantValue):
                var __variantValueCloned: [String] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement)
                }
                return .array(__variantValueCloned)
            case .boolean(let __variantValue):
                
                return .boolean(__variantValue)
            case .nullableTimestamp(let __variantValue):
                
                return .nullableTimestamp(__variantValue)
        }
    }
}

public struct ObjectWithEveryTypeUnionExternalObject: ArriClientModel {
    public var id: String = ""
    public var content: String = ""
    public init(
        id: String,
        content: String
    ) {
            self.id = id
            self.content = content
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.content = json["content"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"content\":"
        __json += serializeString(input: self.content)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "content", value: self.content))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeUnionExternalObject {

        return ObjectWithEveryTypeUnionExternalObject(
            id: self.id,
            content: self.content
        )
    }
    
}
    

public enum ObjectWithEveryTypeUnionInternal: ArriClientModel {
    case rectangle(ObjectWithEveryTypeUnionInternalRectangle)
    case circle(ObjectWithEveryTypeUnionInternalCircle)
    public init() {
        self = .rectangle(ObjectWithEveryTypeUnionInternalRectangle())
    }
    public init(json: JSON) {
        let __tag = json["shape"].string ?? ""
        switch (__tag) {
            case "rectangle":
                self = .rectangle(ObjectWithEveryTypeUnionInternalRectangle(json: json))
                break
            case "circle":
                self = .circle(ObjectWithEveryTypeUnionInternalCircle(json: json))
                break
            default:
                self = .rectangle(ObjectWithEveryTypeUnionInternalRectangle())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .rectangle(let __innerVal):
                return __innerVal.toJSONString()
            case .circle(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .rectangle(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .circle(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ObjectWithEveryTypeUnionInternal {
        switch(self) {
            case .rectangle(let __innerVal):
                return .rectangle(__innerVal.clone())
            case .circle(let __innerVal):
                return .circle(__innerVal.clone())
        }
    }
}

public struct ObjectWithEveryTypeUnionInternalRectangle: ArriClientModel {
    let shape: String = "rectangle"
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public init(
        width: Float64,
        height: Float64
    ) {
            self.width = width
            self.height = height
    }
    public init() {}
    public init(json: JSON) {
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"shape\":\"rectangle\""
        __json += ",\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "shape", value: "rectangle"))
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeUnionInternalRectangle {

        return ObjectWithEveryTypeUnionInternalRectangle(
            width: self.width,
            height: self.height
        )
    }
    
}
    

public struct ObjectWithEveryTypeUnionInternalCircle: ArriClientModel {
    let shape: String = "circle"
    public var radius: Float64 = 0.0
    public init(
        radius: Float64
    ) {
            self.radius = radius
    }
    public init() {}
    public init(json: JSON) {
        self.radius = json["radius"].double ?? 0.0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"shape\":\"circle\""
        __json += ",\"radius\":"
        __json += "\(self.radius)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "shape", value: "circle"))
        __queryParts.append(URLQueryItem(name: "radius", value: "\(self.radius)"))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeUnionInternalCircle {

        return ObjectWithEveryTypeUnionInternalCircle(
            radius: self.radius
        )
    }
    
}
    

public enum ObjectWithEveryTypeUnionAdjacent: ArriClientModel {
    case object(ObjectWithEveryTypeUnionAdjacentObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(ObjectWithEveryTypeUnionAdjacentObject())
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "object":
                var __variantValue: ObjectWithEveryTypeUnionAdjacentObject
                __variantValue = ObjectWithEveryTypeUnionAdjacentObject(json: json["data"])
                self = .object(__variantValue)
                break
            case "array":
                var __variantValue: [String]
                __variantValue = []
            for __variantValueJsonElement in json["data"].array ?? [] {
                var __variantValueJsonElementValue: String
                        __variantValueJsonElementValue = __variantValueJsonElement.string ?? ""
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .array(__variantValue)
                break
            case "boolean":
                var __variantValue: Bool
                __variantValue = json["data"].bool ?? false
                self = .boolean(__variantValue)
                break
            case "nullable-timestamp":
                var __variantValue: Date?
                if json["data"].string != nil {
                    __variantValue = parseDate(json["data"].string ?? "") ?? Date()
                }
                self = .nullableTimestamp(__variantValue)
                break
            default:
                self = .object(ObjectWithEveryTypeUnionAdjacentObject())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .object(let __variantValue):
                __json += "\"kind\":\"object\",\"data\":"
                __json += __variantValue.toJSONString()
                break
            case .array(let __variantValue):
                __json += "\"kind\":\"array\",\"data\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeString(input: __element)
            }
            __json += "]"
                break
            case .boolean(let __variantValue):
                __json += "\"kind\":\"boolean\",\"data\":"
                __json += "\(__variantValue)"
                break
            case .nullableTimestamp(let __variantValue):
                __json += "\"kind\":\"nullable-timestamp\",\"data\":"
                if __variantValue != nil {
                    __json += serializeDate(__variantValue!)
                } else {
                    __json += "null" 
                }
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryTypeUnionAdjacent.")
        return []
    }
    public func clone() -> ObjectWithEveryTypeUnionAdjacent {
        switch(self) {
            case .object(let __variantValue):
                
                return .object(__variantValue.clone())
            case .array(let __variantValue):
                var __variantValueCloned: [String] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement)
                }
                return .array(__variantValueCloned)
            case .boolean(let __variantValue):
                
                return .boolean(__variantValue)
            case .nullableTimestamp(let __variantValue):
                
                return .nullableTimestamp(__variantValue)
        }
    }
}

public struct ObjectWithEveryTypeUnionAdjacentObject: ArriClientModel {
    public var id: String = ""
    public var content: String = ""
    public init(
        id: String,
        content: String
    ) {
            self.id = id
            self.content = content
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.content = json["content"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"content\":"
        __json += serializeString(input: self.content)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "content", value: self.content))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeUnionAdjacentObject {

        return ObjectWithEveryTypeUnionAdjacentObject(
            id: self.id,
            content: self.content
        )
    }
    
}
    

public struct ObjectWithEveryTypeNestedObject: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public var data: ObjectWithEveryTypeNestedObjectData = ObjectWithEveryTypeNestedObjectData()
    public init(
        id: String,
        timestamp: Date,
        data: ObjectWithEveryTypeNestedObjectData
    ) {
            self.id = id
            self.timestamp = timestamp
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
        self.data = ObjectWithEveryTypeNestedObjectData(json: json["data"])
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += ",\"data\":"
        __json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryTypeNestedObject/data.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeNestedObject {

        return ObjectWithEveryTypeNestedObject(
            id: self.id,
            timestamp: self.timestamp,
            data: self.data.clone()
        )
    }
    
}
    
public struct ObjectWithEveryTypeNestedObjectData: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public var data: ObjectWithEveryTypeNestedObjectDataData = ObjectWithEveryTypeNestedObjectDataData()
    public init(
        id: String,
        timestamp: Date,
        data: ObjectWithEveryTypeNestedObjectDataData
    ) {
            self.id = id
            self.timestamp = timestamp
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
        self.data = ObjectWithEveryTypeNestedObjectDataData(json: json["data"])
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += ",\"data\":"
        __json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryTypeNestedObjectData/data.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeNestedObjectData {

        return ObjectWithEveryTypeNestedObjectData(
            id: self.id,
            timestamp: self.timestamp,
            data: self.data.clone()
        )
    }
    
}
    
public struct ObjectWithEveryTypeNestedObjectDataData: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public init(
        id: String,
        timestamp: Date
    ) {
            self.id = id
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeNestedObjectDataData {

        return ObjectWithEveryTypeNestedObjectDataData(
            id: self.id,
            timestamp: self.timestamp
        )
    }
    
}
    

public struct ObjectWithEveryTypeNestedArrayElementElement: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public init(
        id: String,
        timestamp: Date
    ) {
            self.id = id
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeNestedArrayElementElement {

        return ObjectWithEveryTypeNestedArrayElementElement(
            id: self.id,
            timestamp: self.timestamp
        )
    }
    
}
    

public struct ObjectWithKebabCaseKeys: ArriClientModel {
    public var createdAt: Date = Date()
    public var displayName: String = ""
    public var phoneNumber: String?
    public var lastEvent: ObjectWithKebabCaseKeysLastEvent?
    public var emailAddress: String?
    public var isAdmin: Bool?
    public init(
        createdAt: Date,
        displayName: String,
        phoneNumber: String?,
        lastEvent: ObjectWithKebabCaseKeysLastEvent?,
        emailAddress: String?,
        isAdmin: Bool?
    ) {
            self.createdAt = createdAt
            self.displayName = displayName
            self.phoneNumber = phoneNumber
            self.lastEvent = lastEvent
            self.emailAddress = emailAddress
            self.isAdmin = isAdmin
    }
    public init() {}
    public init(json: JSON) {
        self.createdAt = parseDate(json["created-at"].string ?? "") ?? Date()
        self.displayName = json["display-name"].string ?? ""
        if json["phone-number"].string != nil {
            self.phoneNumber = json["phone-number"].string
        }
        if json["last-event"].dictionary != nil {
                    self.lastEvent = ObjectWithKebabCaseKeysLastEvent(json: json["last-event"])
                }
        if json["email-address"].exists() {
            self.emailAddress = json["email-address"].string    
        }
        if json["is-admin"].exists() {
                    self.isAdmin = json["is-admin"].bool
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"created-at\":"
        __json += serializeDate(self.createdAt)
        __json += ",\"display-name\":"
        __json += serializeString(input: self.displayName)
        __json += ",\"phone-number\":"
        if self.phoneNumber != nil {
                    __json += serializeString(input: self.phoneNumber!)
                } else {
                    __json += "null" 
                }
        __json += ",\"last-event\":"
        if self.lastEvent != nil {
                    __json += self.lastEvent!.toJSONString()
                } else {
                    __json += "null"
                }
        if self.emailAddress != nil {
                    __json += ",\"email-address\":"
        __json += serializeString(input: self.emailAddress!)
        }
        if self.isAdmin != nil {
                    __json += ",\"is-admin\":"
__json += "\(self.isAdmin!)"
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "created-at", value: serializeDate(self.createdAt, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "display-name", value: self.displayName))
        if self.phoneNumber != nil {
                    __queryParts.append(URLQueryItem(name: "phone-number", value: self.phoneNumber!))
                } else {
                    __queryParts.append(URLQueryItem(name: "phone-number", value: "null")) 
                }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithKebabCaseKeys/last-event.")
        if self.emailAddress != nil {
                    __queryParts.append(URLQueryItem(name: "email-address", value: self.emailAddress!))
                }
        if self.isAdmin != nil {
                    __queryParts.append(URLQueryItem(name: "is-admin", value: "\(self.isAdmin!)"))
                }
        return __queryParts
    }
    public func clone() -> ObjectWithKebabCaseKeys {

        return ObjectWithKebabCaseKeys(
            createdAt: self.createdAt,
            displayName: self.displayName,
            phoneNumber: self.phoneNumber,
            lastEvent: self.lastEvent?.clone(),
            emailAddress: self.emailAddress,
            isAdmin: self.isAdmin
        )
    }
    
}
    
public enum ObjectWithKebabCaseKeysLastEvent: ArriClientModel {
    case userCreated(ObjectWithKebabCaseKeysLastEventUserCreated)
    case userUpdated(ObjectWithKebabCaseKeysLastEventUserUpdated)
    case userDeleted(ObjectWithKebabCaseKeysLastEventUserDeleted)
    public init() {
        self = .userCreated(ObjectWithKebabCaseKeysLastEventUserCreated())
    }
    public init(json: JSON) {
        if json["user-created"].exists() {
                var __variantValue: ObjectWithKebabCaseKeysLastEventUserCreated
                __variantValue = ObjectWithKebabCaseKeysLastEventUserCreated(json: json["user-created"])
                self = .userCreated(__variantValue)
        } else if json["user-updated"].exists() {
                var __variantValue: ObjectWithKebabCaseKeysLastEventUserUpdated
                __variantValue = ObjectWithKebabCaseKeysLastEventUserUpdated(json: json["user-updated"])
                self = .userUpdated(__variantValue)
        } else if json["user-deleted"].exists() {
                var __variantValue: ObjectWithKebabCaseKeysLastEventUserDeleted
                __variantValue = ObjectWithKebabCaseKeysLastEventUserDeleted(json: json["user-deleted"])
                self = .userDeleted(__variantValue)
        } else {
            self = .userCreated(ObjectWithKebabCaseKeysLastEventUserCreated())
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .userCreated(let __variantValue):
                __json += "\"user-created\":"
                __json += __variantValue.toJSONString()
                break
            case .userUpdated(let __variantValue):
                __json += "\"user-updated\":"
                __json += __variantValue.toJSONString()
                break
            case .userDeleted(let __variantValue):
                __json += "\"user-deleted\":"
                __json += __variantValue.toJSONString()
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithKebabCaseKeysLastEvent.")
        return []
    }
    public func clone() -> ObjectWithKebabCaseKeysLastEvent {
        switch(self) {
            case .userCreated(let __variantValue):
                
                return .userCreated(__variantValue.clone())
            case .userUpdated(let __variantValue):
                
                return .userUpdated(__variantValue.clone())
            case .userDeleted(let __variantValue):
                
                return .userDeleted(__variantValue.clone())
        }
    }
}

public struct ObjectWithKebabCaseKeysLastEventUserCreated: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["user-id"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"user-id\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "user-id", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithKebabCaseKeysLastEventUserCreated {

        return ObjectWithKebabCaseKeysLastEventUserCreated(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithKebabCaseKeysLastEventUserUpdated: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["user-id"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"user-id\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "user-id", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithKebabCaseKeysLastEventUserUpdated {

        return ObjectWithKebabCaseKeysLastEventUserUpdated(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithKebabCaseKeysLastEventUserDeleted: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["user-id"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"user-id\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "user-id", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithKebabCaseKeysLastEventUserDeleted {

        return ObjectWithKebabCaseKeysLastEventUserDeleted(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithEveryNullableType: ArriClientModel {
    public var any: JSON = JSON(parseJSON: "null")
    public var boolean: Bool?
    public var string: String?
    public var timestamp: Date?
    public var float32: Float32?
    public var float64: Float64?
    public var int8: Int8?
    public var uint8: UInt8?
    public var int16: Int16?
    public var uint16: UInt16?
    public var int32: Int32?
    public var uint32: UInt32?
    public var int64: Int64?
    public var uint64: UInt64?
    public var enumerator: ObjectWithEveryNullableTypeEnumerator?
    public var array: [Bool?]?
    public var object: ObjectWithEveryNullableTypeObject?
    public var record: Dictionary<String, UInt64?>?
    public var unionExternal: ObjectWithEveryNullableTypeUnionExternal?
    public var unionInternal: ObjectWithEveryNullableTypeUnionInternal?
    public var unionAdjacent: ObjectWithEveryNullableTypeUnionAdjacent?
    public var nestedObject: ObjectWithEveryNullableTypeNestedObject?
    public var nestedArray: [[ObjectWithEveryNullableTypeNestedArrayElementElement?]?]?
    public init(
        any: JSON,
        boolean: Bool?,
        string: String?,
        timestamp: Date?,
        float32: Float32?,
        float64: Float64?,
        int8: Int8?,
        uint8: UInt8?,
        int16: Int16?,
        uint16: UInt16?,
        int32: Int32?,
        uint32: UInt32?,
        int64: Int64?,
        uint64: UInt64?,
        enumerator: ObjectWithEveryNullableTypeEnumerator?,
        array: [Bool?]?,
        object: ObjectWithEveryNullableTypeObject?,
        record: Dictionary<String, UInt64?>?,
        unionExternal: ObjectWithEveryNullableTypeUnionExternal?,
        unionInternal: ObjectWithEveryNullableTypeUnionInternal?,
        unionAdjacent: ObjectWithEveryNullableTypeUnionAdjacent?,
        nestedObject: ObjectWithEveryNullableTypeNestedObject?,
        nestedArray: [[ObjectWithEveryNullableTypeNestedArrayElementElement?]?]?
    ) {
            self.any = any
            self.boolean = boolean
            self.string = string
            self.timestamp = timestamp
            self.float32 = float32
            self.float64 = float64
            self.int8 = int8
            self.uint8 = uint8
            self.int16 = int16
            self.uint16 = uint16
            self.int32 = int32
            self.uint32 = uint32
            self.int64 = int64
            self.uint64 = uint64
            self.enumerator = enumerator
            self.array = array
            self.object = object
            self.record = record
            self.unionExternal = unionExternal
            self.unionInternal = unionInternal
            self.unionAdjacent = unionAdjacent
            self.nestedObject = nestedObject
            self.nestedArray = nestedArray
    }
    public init() {}
    public init(json: JSON) {
        if json["any"].exists() {
            self.any = json["any"]
        }
        if json["boolean"].bool != nil {
                    self.boolean = json["boolean"].bool
                }
        if json["string"].string != nil {
            self.string = json["string"].string
        }
        if json["timestamp"].string != nil {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
        if json["float32"].float != nil {
                    self.float32 = json["float32"].float
                }
        if json["float64"].double != nil {
                    self.float64 = json["float64"].double
                }
        if json["int8"].int8 != nil {
                    self.int8 = json["int8"].int8
                }
        if json["uint8"].uInt8 != nil {
                    self.uint8 = json["uint8"].uInt8
                }
        if json["int16"].int16 != nil {
                    self.int16 = json["int16"].int16
                }
        if json["uint16"].uInt16 != nil {
                    self.uint16 = json["uint16"].uInt16
                }
        if json["int32"].int32 != nil {
                    self.int32 = json["int32"].int32
                }
        if json["uint32"].uInt32 != nil {
                    self.uint32 = json["uint32"].uInt32
                }
        if json["int64"].string != nil {
                    self.int64 = Int64(json["int64"].string ?? "0")
                }
        if json["uint64"].string != nil {
                    self.uint64 = UInt64(json["uint64"].string ?? "0")
                }
        if json["enumerator"].string != nil {
                    self.enumerator = ObjectWithEveryNullableTypeEnumerator(serialValue: json["enumerator"].string ?? "")
                }
        if json["array"].array != nil {
        self.array = []
            for __arrayJsonElement in json["array"].array ?? [] {
                var __arrayJsonElementValue: Bool?
                        if __arrayJsonElement.bool != nil {
                    __arrayJsonElementValue = __arrayJsonElement.bool
                }
                self.array!.append(__arrayJsonElementValue)
            }
                }
        if json["object"].dictionary != nil {
                    self.object = ObjectWithEveryNullableTypeObject(json: json["object"])
                }
        if json["record"].dictionary != nil {
        self.record = Dictionary()
            for (__key, __value) in json["record"].dictionary ?? Dictionary() {
                var __parsedValue: UInt64?
                        if __value.string != nil {
                    __parsedValue = UInt64(__value.string ?? "0")
                }
                self.record![__key] = __parsedValue            
            }
                }
        if json["unionExternal"].dictionary != nil {
                    self.unionExternal = ObjectWithEveryNullableTypeUnionExternal(json: json["unionExternal"])
                }
        if json["unionInternal"].dictionary != nil {
                    self.unionInternal = ObjectWithEveryNullableTypeUnionInternal(json: json["unionInternal"])
                }
        if json["unionAdjacent"].dictionary != nil {
                    self.unionAdjacent = ObjectWithEveryNullableTypeUnionAdjacent(json: json["unionAdjacent"])
                }
        if json["nestedObject"].dictionary != nil {
                    self.nestedObject = ObjectWithEveryNullableTypeNestedObject(json: json["nestedObject"])
                }
        if json["nestedArray"].array != nil {
        self.nestedArray = []
            for __nestedArrayJsonElement in json["nestedArray"].array ?? [] {
                var __nestedArrayJsonElementValue: [ObjectWithEveryNullableTypeNestedArrayElementElement?]?
                        if __nestedArrayJsonElement.array != nil {
        __nestedArrayJsonElementValue = []
            for __elementJsonElement in __nestedArrayJsonElement.array ?? [] {
                var __elementJsonElementValue: ObjectWithEveryNullableTypeNestedArrayElementElement?
                        if __elementJsonElement.dictionary != nil {
                    __elementJsonElementValue = ObjectWithEveryNullableTypeNestedArrayElementElement(json: __elementJsonElement)
                }
                __nestedArrayJsonElementValue!.append(__elementJsonElementValue)
            }
                }
                self.nestedArray!.append(__nestedArrayJsonElementValue)
            }
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"any\":"
        __json += serializeAny(input: self.any)
        __json += ",\"boolean\":"
        if self.boolean != nil {
                    __json += "\(self.boolean!)"
                } else {
                    __json += "null" 
                }
        __json += ",\"string\":"
        if self.string != nil {
                    __json += serializeString(input: self.string!)
                } else {
                    __json += "null" 
                }
        __json += ",\"timestamp\":"
        if self.timestamp != nil {
                    __json += serializeDate(self.timestamp!)
                } else {
                    __json += "null" 
                }
        __json += ",\"float32\":"
        if self.float32 != nil {
                    __json += "\(self.float32!)"
                } else {
                    __json += "null"
                }
        __json += ",\"float64\":"
        if self.float64 != nil {
                    __json += "\(self.float64!)"
                } else {
                    __json += "null"
                }
        __json += ",\"int8\":"
        if self.int8 != nil {
                    __json += "\(self.int8!)"
                } else {
                    __json += "null"
                }
        __json += ",\"uint8\":"
        if self.uint8 != nil {
                    __json += "\(self.uint8!)"
                } else {
                    __json += "null"
                }
        __json += ",\"int16\":"
        if self.int16 != nil {
                    __json += "\(self.int16!)"
                } else {
                    __json += "null"
                }
        __json += ",\"uint16\":"
        if self.uint16 != nil {
                    __json += "\(self.uint16!)"
                } else {
                    __json += "null"
                }
        __json += ",\"int32\":"
        if self.int32 != nil {
                    __json += "\(self.int32!)"
                } else {
                    __json += "null"
                }
        __json += ",\"uint32\":"
        if self.uint32 != nil {
                    __json += "\(self.uint32!)"
                } else {
                    __json += "null"
                }
        __json += ",\"int64\":"
        if self.int64 != nil {
                    __json += "\"\(self.int64!)\""
                } else {
                    __json += "null" 
                }
        __json += ",\"uint64\":"
        if self.uint64 != nil {
                    __json += "\"\(self.uint64!)\""
                } else {
                    __json += "null" 
                }
        __json += ",\"enumerator\":"
        if self.enumerator != nil {
                    __json += "\"\(self.enumerator!.serialValue())\""
                } else {
                    __json += "null" 
                }
        __json += ",\"array\":"
        if self.array != nil {
                           __json += "["
            for (__index, __element) in self.array!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        if __element != nil {
                    __json += "\(__element!)"
                } else {
                    __json += "null" 
                }
            }
            __json += "]"
                } else {
                    __json += "null" 
                }
        __json += ",\"object\":"
        if self.object != nil {
                    __json += self.object!.toJSONString()
                } else {
                    __json += "null" 
                }
        __json += ",\"record\":"
if self.record != nil {
                            __json += "{"
            for (__index, (__key, __value)) in self.record!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += "\(serializeString(input: __key)):"
                        if __value != nil {
                    __json += "\"\(__value!)\""
                } else {
                    __json += "null" 
                }
            }
            __json += "}"
                } else {
                    __json += "null" 
                }
        __json += ",\"unionExternal\":"
        if self.unionExternal != nil {
                    __json += self.unionExternal!.toJSONString()
                } else {
                    __json += "null"
                }
        __json += ",\"unionInternal\":"
        if self.unionInternal != nil {
                    __json += self.unionInternal!.toJSONString()
                } else {
                    __json += "null"
                }
        __json += ",\"unionAdjacent\":"
        if self.unionAdjacent != nil {
                    __json += self.unionAdjacent!.toJSONString()
                } else {
                    __json += "null"
                }
        __json += ",\"nestedObject\":"
        if self.nestedObject != nil {
                    __json += self.nestedObject!.toJSONString()
                } else {
                    __json += "null" 
                }
        __json += ",\"nestedArray\":"
        if self.nestedArray != nil {
                           __json += "["
            for (__index, __element) in self.nestedArray!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        if __element != nil {
                           __json += "["
            for (__index, __element) in __element!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        if __element != nil {
                    __json += __element!.toJSONString()
                } else {
                    __json += "null" 
                }
            }
            __json += "]"
                } else {
                    __json += "null" 
                }
            }
            __json += "]"
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/any.")
        if self.boolean != nil {
                    __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "boolean", value: "null")) 
                }
        if self.string != nil {
                    __queryParts.append(URLQueryItem(name: "string", value: self.string!))
                } else {
                    __queryParts.append(URLQueryItem(name: "string", value: "null")) 
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                } else {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: "null")) 
                }
        if self.float32 != nil {
                    __queryParts.append(URLQueryItem(name: "float32", value: "\(self.float32!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "float32", value: "null")) 
                }
        if self.float64 != nil {
                    __queryParts.append(URLQueryItem(name: "float64", value: "\(self.float64!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "float64", value: "null")) 
                }
        if self.int8 != nil {
                    __queryParts.append(URLQueryItem(name: "int8", value: "\(self.int8!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "int8", value: "null")) 
                }
        if self.uint8 != nil {
                    __queryParts.append(URLQueryItem(name: "uint8", value: "\(self.uint8!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "uint8", value: "null")) 
                }
        if self.int16 != nil {
                    __queryParts.append(URLQueryItem(name: "int16", value: "\(self.int16!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "int16", value: "null")) 
                }
        if self.uint16 != nil {
                    __queryParts.append(URLQueryItem(name: "uint16", value: "\(self.uint16!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "uint16", value: "null")) 
                }
        if self.int32 != nil {
                    __queryParts.append(URLQueryItem(name: "int32", value: "\(self.int32!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "int32", value: "null")) 
                }
        if self.uint32 != nil {
                    __queryParts.append(URLQueryItem(name: "uint32", value: "\(self.uint32!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "uint32", value: "null")) 
                }
        if self.int64 != nil {
                    __queryParts.append(URLQueryItem(name: "int64", value: "\(self.int64!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "int64", value: "null")) 
                }
        if self.uint64 != nil {
                    __queryParts.append(URLQueryItem(name: "uint64", value: "\(self.uint64!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "uint64", value: "null")) 
                }
        if self.enumerator != nil {
                    __queryParts.append(URLQueryItem(name: "enumerator", value: self.enumerator!.serialValue()))
                } else {
                    __queryParts.append(URLQueryItem(name: "enumerator", value: "null")) 
                }
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/object.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionExternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionInternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/unionAdjacent.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/nestedObject.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/nestedArray.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableType {
var __arrayCloned: [Bool?]?
                if self.array != nil {
                    __arrayCloned = []
                    for __arrayElement in self.array! {
                        
                        __arrayCloned!.append(__arrayElement)
                    }
                }

var __recordCloned: Dictionary<String, UInt64?>?
                    if self.record != nil {
                        __recordCloned = Dictionary()
                        for (__recordKey, __recordValue) in self.record! {
                            
                            __recordCloned![__recordKey] = __recordValue
                        }          
                    }




var __nestedArrayCloned: [[ObjectWithEveryNullableTypeNestedArrayElementElement?]?]?
                if self.nestedArray != nil {
                    __nestedArrayCloned = []
                    for __nestedArrayElement in self.nestedArray! {
                        var __nestedArrayElementCloned: [ObjectWithEveryNullableTypeNestedArrayElementElement?]?
                if __nestedArrayElement != nil {
                    __nestedArrayElementCloned = []
                    for __nestedArrayElementElement in __nestedArrayElement! {
                        
                        __nestedArrayElementCloned!.append(__nestedArrayElementElement?.clone())
                    }
                }
                        __nestedArrayCloned!.append(__nestedArrayElementCloned)
                    }
                }
        return ObjectWithEveryNullableType(
            any: self.any,
            boolean: self.boolean,
            string: self.string,
            timestamp: self.timestamp,
            float32: self.float32,
            float64: self.float64,
            int8: self.int8,
            uint8: self.uint8,
            int16: self.int16,
            uint16: self.uint16,
            int32: self.int32,
            uint32: self.uint32,
            int64: self.int64,
            uint64: self.uint64,
            enumerator: self.enumerator,
            array: __arrayCloned,
            object: self.object?.clone(),
            record: __recordCloned,
            unionExternal: self.unionExternal?.clone(),
            unionInternal: self.unionInternal?.clone(),
            unionAdjacent: self.unionAdjacent?.clone(),
            nestedObject: self.nestedObject?.clone(),
            nestedArray: __nestedArrayCloned
        )
    }
    
}
    
public enum ObjectWithEveryNullableTypeEnumerator: ArriClientEnum {
    case a
    case b
    case c
    public init() {
        self = .a
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "A":
                self = .a
                break;
            case "B":
                self = .b
                break;
            case "C":
                self = .c
                break;
            default:
                self = .a
        }
    }
    public func serialValue() -> String {
        switch (self) {
            case .a:
                return "A"
            case .b:
                return "B"
            case .c:
                return "C"
        }
    }
}
public struct ObjectWithEveryNullableTypeObject: ArriClientModel {
    public var string: String?
    public var boolean: Bool?
    public var timestamp: Date?
    public init(
        string: String?,
        boolean: Bool?,
        timestamp: Date?
    ) {
            self.string = string
            self.boolean = boolean
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        if json["string"].string != nil {
            self.string = json["string"].string
        }
        if json["boolean"].bool != nil {
                    self.boolean = json["boolean"].bool
                }
        if json["timestamp"].string != nil {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"string\":"
        if self.string != nil {
                    __json += serializeString(input: self.string!)
                } else {
                    __json += "null" 
                }
        __json += ",\"boolean\":"
        if self.boolean != nil {
                    __json += "\(self.boolean!)"
                } else {
                    __json += "null" 
                }
        __json += ",\"timestamp\":"
        if self.timestamp != nil {
                    __json += serializeDate(self.timestamp!)
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        if self.string != nil {
                    __queryParts.append(URLQueryItem(name: "string", value: self.string!))
                } else {
                    __queryParts.append(URLQueryItem(name: "string", value: "null")) 
                }
        if self.boolean != nil {
                    __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean!)"))
                } else {
                    __queryParts.append(URLQueryItem(name: "boolean", value: "null")) 
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                } else {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: "null")) 
                }
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeObject {

        return ObjectWithEveryNullableTypeObject(
            string: self.string,
            boolean: self.boolean,
            timestamp: self.timestamp
        )
    }
    
}
    

public enum ObjectWithEveryNullableTypeUnionExternal: ArriClientModel {
    case object(ObjectWithEveryNullableTypeUnionExternalObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(ObjectWithEveryNullableTypeUnionExternalObject())
    }
    public init(json: JSON) {
        if json["object"].exists() {
                var __variantValue: ObjectWithEveryNullableTypeUnionExternalObject
                __variantValue = ObjectWithEveryNullableTypeUnionExternalObject(json: json["object"])
                self = .object(__variantValue)
        } else if json["array"].exists() {
                var __variantValue: [String]
                __variantValue = []
            for __variantValueJsonElement in json["array"].array ?? [] {
                var __variantValueJsonElementValue: String
                        __variantValueJsonElementValue = __variantValueJsonElement.string ?? ""
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .array(__variantValue)
        } else if json["boolean"].exists() {
                var __variantValue: Bool
                __variantValue = json["boolean"].bool ?? false
                self = .boolean(__variantValue)
        } else if json["nullable-timestamp"].exists() {
                var __variantValue: Date?
                if json["nullable-timestamp"].string != nil {
                    __variantValue = parseDate(json["nullable-timestamp"].string ?? "") ?? Date()
                }
                self = .nullableTimestamp(__variantValue)
        } else {
            self = .object(ObjectWithEveryNullableTypeUnionExternalObject())
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .object(let __variantValue):
                __json += "\"object\":"
                __json += __variantValue.toJSONString()
                break
            case .array(let __variantValue):
                __json += "\"array\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeString(input: __element)
            }
            __json += "]"
                break
            case .boolean(let __variantValue):
                __json += "\"boolean\":"
                __json += "\(__variantValue)"
                break
            case .nullableTimestamp(let __variantValue):
                __json += "\"nullable-timestamp\":"
                if __variantValue != nil {
                    __json += serializeDate(__variantValue!)
                } else {
                    __json += "null" 
                }
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionExternal.")
        return []
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionExternal {
        switch(self) {
            case .object(let __variantValue):
                
                return .object(__variantValue.clone())
            case .array(let __variantValue):
                var __variantValueCloned: [String] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement)
                }
                return .array(__variantValueCloned)
            case .boolean(let __variantValue):
                
                return .boolean(__variantValue)
            case .nullableTimestamp(let __variantValue):
                
                return .nullableTimestamp(__variantValue)
        }
    }
}

public struct ObjectWithEveryNullableTypeUnionExternalObject: ArriClientModel {
    public var id: String = ""
    public var content: String = ""
    public init(
        id: String,
        content: String
    ) {
            self.id = id
            self.content = content
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.content = json["content"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"content\":"
        __json += serializeString(input: self.content)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "content", value: self.content))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionExternalObject {

        return ObjectWithEveryNullableTypeUnionExternalObject(
            id: self.id,
            content: self.content
        )
    }
    
}
    

public enum ObjectWithEveryNullableTypeUnionInternal: ArriClientModel {
    case rectangle(ObjectWithEveryNullableTypeUnionInternalRectangle)
    case circle(ObjectWithEveryNullableTypeUnionInternalCircle)
    public init() {
        self = .rectangle(ObjectWithEveryNullableTypeUnionInternalRectangle())
    }
    public init(json: JSON) {
        let __tag = json["shape"].string ?? ""
        switch (__tag) {
            case "rectangle":
                self = .rectangle(ObjectWithEveryNullableTypeUnionInternalRectangle(json: json))
                break
            case "circle":
                self = .circle(ObjectWithEveryNullableTypeUnionInternalCircle(json: json))
                break
            default:
                self = .rectangle(ObjectWithEveryNullableTypeUnionInternalRectangle())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .rectangle(let __innerVal):
                return __innerVal.toJSONString()
            case .circle(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .rectangle(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .circle(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionInternal {
        switch(self) {
            case .rectangle(let __innerVal):
                return .rectangle(__innerVal.clone())
            case .circle(let __innerVal):
                return .circle(__innerVal.clone())
        }
    }
}

public struct ObjectWithEveryNullableTypeUnionInternalRectangle: ArriClientModel {
    let shape: String = "rectangle"
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public init(
        width: Float64,
        height: Float64
    ) {
            self.width = width
            self.height = height
    }
    public init() {}
    public init(json: JSON) {
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"shape\":\"rectangle\""
        __json += ",\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "shape", value: "rectangle"))
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionInternalRectangle {

        return ObjectWithEveryNullableTypeUnionInternalRectangle(
            width: self.width,
            height: self.height
        )
    }
    
}
    

public struct ObjectWithEveryNullableTypeUnionInternalCircle: ArriClientModel {
    let shape: String = "circle"
    public var radius: Float64 = 0.0
    public init(
        radius: Float64
    ) {
            self.radius = radius
    }
    public init() {}
    public init(json: JSON) {
        self.radius = json["radius"].double ?? 0.0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"shape\":\"circle\""
        __json += ",\"radius\":"
        __json += "\(self.radius)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "shape", value: "circle"))
        __queryParts.append(URLQueryItem(name: "radius", value: "\(self.radius)"))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionInternalCircle {

        return ObjectWithEveryNullableTypeUnionInternalCircle(
            radius: self.radius
        )
    }
    
}
    

public enum ObjectWithEveryNullableTypeUnionAdjacent: ArriClientModel {
    case object(ObjectWithEveryNullableTypeUnionAdjacentObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(ObjectWithEveryNullableTypeUnionAdjacentObject())
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "object":
                var __variantValue: ObjectWithEveryNullableTypeUnionAdjacentObject
                __variantValue = ObjectWithEveryNullableTypeUnionAdjacentObject(json: json["data"])
                self = .object(__variantValue)
                break
            case "array":
                var __variantValue: [String]
                __variantValue = []
            for __variantValueJsonElement in json["data"].array ?? [] {
                var __variantValueJsonElementValue: String
                        __variantValueJsonElementValue = __variantValueJsonElement.string ?? ""
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .array(__variantValue)
                break
            case "boolean":
                var __variantValue: Bool
                __variantValue = json["data"].bool ?? false
                self = .boolean(__variantValue)
                break
            case "nullable-timestamp":
                var __variantValue: Date?
                if json["data"].string != nil {
                    __variantValue = parseDate(json["data"].string ?? "") ?? Date()
                }
                self = .nullableTimestamp(__variantValue)
                break
            default:
                self = .object(ObjectWithEveryNullableTypeUnionAdjacentObject())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .object(let __variantValue):
                __json += "\"kind\":\"object\",\"data\":"
                __json += __variantValue.toJSONString()
                break
            case .array(let __variantValue):
                __json += "\"kind\":\"array\",\"data\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeString(input: __element)
            }
            __json += "]"
                break
            case .boolean(let __variantValue):
                __json += "\"kind\":\"boolean\",\"data\":"
                __json += "\(__variantValue)"
                break
            case .nullableTimestamp(let __variantValue):
                __json += "\"kind\":\"nullable-timestamp\",\"data\":"
                if __variantValue != nil {
                    __json += serializeDate(__variantValue!)
                } else {
                    __json += "null" 
                }
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryNullableTypeUnionAdjacent.")
        return []
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionAdjacent {
        switch(self) {
            case .object(let __variantValue):
                
                return .object(__variantValue.clone())
            case .array(let __variantValue):
                var __variantValueCloned: [String] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement)
                }
                return .array(__variantValueCloned)
            case .boolean(let __variantValue):
                
                return .boolean(__variantValue)
            case .nullableTimestamp(let __variantValue):
                
                return .nullableTimestamp(__variantValue)
        }
    }
}

public struct ObjectWithEveryNullableTypeUnionAdjacentObject: ArriClientModel {
    public var id: String = ""
    public var content: String = ""
    public init(
        id: String,
        content: String
    ) {
            self.id = id
            self.content = content
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.content = json["content"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"content\":"
        __json += serializeString(input: self.content)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "content", value: self.content))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeUnionAdjacentObject {

        return ObjectWithEveryNullableTypeUnionAdjacentObject(
            id: self.id,
            content: self.content
        )
    }
    
}
    

public struct ObjectWithEveryNullableTypeNestedObject: ArriClientModel {
    public var id: String?
    public var timestamp: Date?
    public var data: ObjectWithEveryNullableTypeNestedObjectData?
    public init(
        id: String?,
        timestamp: Date?,
        data: ObjectWithEveryNullableTypeNestedObjectData?
    ) {
            self.id = id
            self.timestamp = timestamp
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        if json["id"].string != nil {
            self.id = json["id"].string
        }
        if json["timestamp"].string != nil {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
        if json["data"].dictionary != nil {
                    self.data = ObjectWithEveryNullableTypeNestedObjectData(json: json["data"])
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        if self.id != nil {
                    __json += serializeString(input: self.id!)
                } else {
                    __json += "null" 
                }
        __json += ",\"timestamp\":"
        if self.timestamp != nil {
                    __json += serializeDate(self.timestamp!)
                } else {
                    __json += "null" 
                }
        __json += ",\"data\":"
        if self.data != nil {
                    __json += self.data!.toJSONString()
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        if self.id != nil {
                    __queryParts.append(URLQueryItem(name: "id", value: self.id!))
                } else {
                    __queryParts.append(URLQueryItem(name: "id", value: "null")) 
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                } else {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: "null")) 
                }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableTypeNestedObject/data.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeNestedObject {

        return ObjectWithEveryNullableTypeNestedObject(
            id: self.id,
            timestamp: self.timestamp,
            data: self.data?.clone()
        )
    }
    
}
    
public struct ObjectWithEveryNullableTypeNestedObjectData: ArriClientModel {
    public var id: String?
    public var timestamp: Date?
    public var data: ObjectWithEveryNullableTypeNestedObjectDataData?
    public init(
        id: String?,
        timestamp: Date?,
        data: ObjectWithEveryNullableTypeNestedObjectDataData?
    ) {
            self.id = id
            self.timestamp = timestamp
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        if json["id"].string != nil {
            self.id = json["id"].string
        }
        if json["timestamp"].string != nil {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
        if json["data"].dictionary != nil {
                    self.data = ObjectWithEveryNullableTypeNestedObjectDataData(json: json["data"])
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        if self.id != nil {
                    __json += serializeString(input: self.id!)
                } else {
                    __json += "null" 
                }
        __json += ",\"timestamp\":"
        if self.timestamp != nil {
                    __json += serializeDate(self.timestamp!)
                } else {
                    __json += "null" 
                }
        __json += ",\"data\":"
        if self.data != nil {
                    __json += self.data!.toJSONString()
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        if self.id != nil {
                    __queryParts.append(URLQueryItem(name: "id", value: self.id!))
                } else {
                    __queryParts.append(URLQueryItem(name: "id", value: "null")) 
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                } else {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: "null")) 
                }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableTypeNestedObjectData/data.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeNestedObjectData {

        return ObjectWithEveryNullableTypeNestedObjectData(
            id: self.id,
            timestamp: self.timestamp,
            data: self.data?.clone()
        )
    }
    
}
    
public struct ObjectWithEveryNullableTypeNestedObjectDataData: ArriClientModel {
    public var id: String?
    public var timestamp: Date?
    public init(
        id: String?,
        timestamp: Date?
    ) {
            self.id = id
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        if json["id"].string != nil {
            self.id = json["id"].string
        }
        if json["timestamp"].string != nil {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        if self.id != nil {
                    __json += serializeString(input: self.id!)
                } else {
                    __json += "null" 
                }
        __json += ",\"timestamp\":"
        if self.timestamp != nil {
                    __json += serializeDate(self.timestamp!)
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        if self.id != nil {
                    __queryParts.append(URLQueryItem(name: "id", value: self.id!))
                } else {
                    __queryParts.append(URLQueryItem(name: "id", value: "null")) 
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                } else {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: "null")) 
                }
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeNestedObjectDataData {

        return ObjectWithEveryNullableTypeNestedObjectDataData(
            id: self.id,
            timestamp: self.timestamp
        )
    }
    
}
    

public struct ObjectWithEveryNullableTypeNestedArrayElementElement: ArriClientModel {
    public var id: String?
    public var timestamp: Date?
    public init(
        id: String?,
        timestamp: Date?
    ) {
            self.id = id
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        if json["id"].string != nil {
            self.id = json["id"].string
        }
        if json["timestamp"].string != nil {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        if self.id != nil {
                    __json += serializeString(input: self.id!)
                } else {
                    __json += "null" 
                }
        __json += ",\"timestamp\":"
        if self.timestamp != nil {
                    __json += serializeDate(self.timestamp!)
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        if self.id != nil {
                    __queryParts.append(URLQueryItem(name: "id", value: self.id!))
                } else {
                    __queryParts.append(URLQueryItem(name: "id", value: "null")) 
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                } else {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: "null")) 
                }
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeNestedArrayElementElement {

        return ObjectWithEveryNullableTypeNestedArrayElementElement(
            id: self.id,
            timestamp: self.timestamp
        )
    }
    
}
    

public struct ObjectWithPascalCaseKeys: ArriClientModel {
    public var createdAt: Date = Date()
    public var displayName: String = ""
    public var phoneNumber: String?
    public var lastEvent: ObjectWithPascalCaseKeysLastEvent?
    public var emailAddress: String?
    public var isAdmin: Bool?
    public init(
        createdAt: Date,
        displayName: String,
        phoneNumber: String?,
        lastEvent: ObjectWithPascalCaseKeysLastEvent?,
        emailAddress: String?,
        isAdmin: Bool?
    ) {
            self.createdAt = createdAt
            self.displayName = displayName
            self.phoneNumber = phoneNumber
            self.lastEvent = lastEvent
            self.emailAddress = emailAddress
            self.isAdmin = isAdmin
    }
    public init() {}
    public init(json: JSON) {
        self.createdAt = parseDate(json["CreatedAt"].string ?? "") ?? Date()
        self.displayName = json["DisplayName"].string ?? ""
        if json["PhoneNumber"].string != nil {
            self.phoneNumber = json["PhoneNumber"].string
        }
        if json["LastEvent"].dictionary != nil {
                    self.lastEvent = ObjectWithPascalCaseKeysLastEvent(json: json["LastEvent"])
                }
        if json["EmailAddress"].exists() {
            self.emailAddress = json["EmailAddress"].string    
        }
        if json["IsAdmin"].exists() {
                    self.isAdmin = json["IsAdmin"].bool
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"CreatedAt\":"
        __json += serializeDate(self.createdAt)
        __json += ",\"DisplayName\":"
        __json += serializeString(input: self.displayName)
        __json += ",\"PhoneNumber\":"
        if self.phoneNumber != nil {
                    __json += serializeString(input: self.phoneNumber!)
                } else {
                    __json += "null" 
                }
        __json += ",\"LastEvent\":"
        if self.lastEvent != nil {
                    __json += self.lastEvent!.toJSONString()
                } else {
                    __json += "null"
                }
        if self.emailAddress != nil {
                    __json += ",\"EmailAddress\":"
        __json += serializeString(input: self.emailAddress!)
        }
        if self.isAdmin != nil {
                    __json += ",\"IsAdmin\":"
__json += "\(self.isAdmin!)"
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "CreatedAt", value: serializeDate(self.createdAt, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "DisplayName", value: self.displayName))
        if self.phoneNumber != nil {
                    __queryParts.append(URLQueryItem(name: "PhoneNumber", value: self.phoneNumber!))
                } else {
                    __queryParts.append(URLQueryItem(name: "PhoneNumber", value: "null")) 
                }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithPascalCaseKeys/LastEvent.")
        if self.emailAddress != nil {
                    __queryParts.append(URLQueryItem(name: "EmailAddress", value: self.emailAddress!))
                }
        if self.isAdmin != nil {
                    __queryParts.append(URLQueryItem(name: "IsAdmin", value: "\(self.isAdmin!)"))
                }
        return __queryParts
    }
    public func clone() -> ObjectWithPascalCaseKeys {

        return ObjectWithPascalCaseKeys(
            createdAt: self.createdAt,
            displayName: self.displayName,
            phoneNumber: self.phoneNumber,
            lastEvent: self.lastEvent?.clone(),
            emailAddress: self.emailAddress,
            isAdmin: self.isAdmin
        )
    }
    
}
    
public enum ObjectWithPascalCaseKeysLastEvent: ArriClientModel {
    case userCreated(ObjectWithPascalCaseKeysLastEventUserCreated)
    case userUpdated(ObjectWithPascalCaseKeysLastEventUserUpdated)
    case userDeleted(ObjectWithPascalCaseKeysLastEventUserDeleted)
    public init() {
        self = .userCreated(ObjectWithPascalCaseKeysLastEventUserCreated())
    }
    public init(json: JSON) {
        if json["UserCreated"].exists() {
                var __variantValue: ObjectWithPascalCaseKeysLastEventUserCreated
                __variantValue = ObjectWithPascalCaseKeysLastEventUserCreated(json: json["UserCreated"])
                self = .userCreated(__variantValue)
        } else if json["UserUpdated"].exists() {
                var __variantValue: ObjectWithPascalCaseKeysLastEventUserUpdated
                __variantValue = ObjectWithPascalCaseKeysLastEventUserUpdated(json: json["UserUpdated"])
                self = .userUpdated(__variantValue)
        } else if json["UserDeleted"].exists() {
                var __variantValue: ObjectWithPascalCaseKeysLastEventUserDeleted
                __variantValue = ObjectWithPascalCaseKeysLastEventUserDeleted(json: json["UserDeleted"])
                self = .userDeleted(__variantValue)
        } else {
            self = .userCreated(ObjectWithPascalCaseKeysLastEventUserCreated())
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .userCreated(let __variantValue):
                __json += "\"UserCreated\":"
                __json += __variantValue.toJSONString()
                break
            case .userUpdated(let __variantValue):
                __json += "\"UserUpdated\":"
                __json += __variantValue.toJSONString()
                break
            case .userDeleted(let __variantValue):
                __json += "\"UserDeleted\":"
                __json += __variantValue.toJSONString()
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithPascalCaseKeysLastEvent.")
        return []
    }
    public func clone() -> ObjectWithPascalCaseKeysLastEvent {
        switch(self) {
            case .userCreated(let __variantValue):
                
                return .userCreated(__variantValue.clone())
            case .userUpdated(let __variantValue):
                
                return .userUpdated(__variantValue.clone())
            case .userDeleted(let __variantValue):
                
                return .userDeleted(__variantValue.clone())
        }
    }
}

public struct ObjectWithPascalCaseKeysLastEventUserCreated: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["UserId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"UserId\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "UserId", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithPascalCaseKeysLastEventUserCreated {

        return ObjectWithPascalCaseKeysLastEventUserCreated(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithPascalCaseKeysLastEventUserUpdated: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["UserId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"UserId\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "UserId", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithPascalCaseKeysLastEventUserUpdated {

        return ObjectWithPascalCaseKeysLastEventUserUpdated(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithPascalCaseKeysLastEventUserDeleted: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["UserId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"UserId\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "UserId", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithPascalCaseKeysLastEventUserDeleted {

        return ObjectWithPascalCaseKeysLastEventUserDeleted(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithSnakeCaseKeys: ArriClientModel {
    public var createdAt: Date = Date()
    public var displayName: String = ""
    public var phoneNumber: String?
    public var lastEvent: ObjectWithSnakeCaseKeysLastEvent?
    public var emailAddress: String?
    public var isAdmin: Bool?
    public init(
        createdAt: Date,
        displayName: String,
        phoneNumber: String?,
        lastEvent: ObjectWithSnakeCaseKeysLastEvent?,
        emailAddress: String?,
        isAdmin: Bool?
    ) {
            self.createdAt = createdAt
            self.displayName = displayName
            self.phoneNumber = phoneNumber
            self.lastEvent = lastEvent
            self.emailAddress = emailAddress
            self.isAdmin = isAdmin
    }
    public init() {}
    public init(json: JSON) {
        self.createdAt = parseDate(json["created_at"].string ?? "") ?? Date()
        self.displayName = json["display_name"].string ?? ""
        if json["phone_number"].string != nil {
            self.phoneNumber = json["phone_number"].string
        }
        if json["last_event"].dictionary != nil {
                    self.lastEvent = ObjectWithSnakeCaseKeysLastEvent(json: json["last_event"])
                }
        if json["email_address"].exists() {
            self.emailAddress = json["email_address"].string    
        }
        if json["is_admin"].exists() {
                    self.isAdmin = json["is_admin"].bool
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"created_at\":"
        __json += serializeDate(self.createdAt)
        __json += ",\"display_name\":"
        __json += serializeString(input: self.displayName)
        __json += ",\"phone_number\":"
        if self.phoneNumber != nil {
                    __json += serializeString(input: self.phoneNumber!)
                } else {
                    __json += "null" 
                }
        __json += ",\"last_event\":"
        if self.lastEvent != nil {
                    __json += self.lastEvent!.toJSONString()
                } else {
                    __json += "null"
                }
        if self.emailAddress != nil {
                    __json += ",\"email_address\":"
        __json += serializeString(input: self.emailAddress!)
        }
        if self.isAdmin != nil {
                    __json += ",\"is_admin\":"
__json += "\(self.isAdmin!)"
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "created_at", value: serializeDate(self.createdAt, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "display_name", value: self.displayName))
        if self.phoneNumber != nil {
                    __queryParts.append(URLQueryItem(name: "phone_number", value: self.phoneNumber!))
                } else {
                    __queryParts.append(URLQueryItem(name: "phone_number", value: "null")) 
                }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithSnakeCaseKeys/last_event.")
        if self.emailAddress != nil {
                    __queryParts.append(URLQueryItem(name: "email_address", value: self.emailAddress!))
                }
        if self.isAdmin != nil {
                    __queryParts.append(URLQueryItem(name: "is_admin", value: "\(self.isAdmin!)"))
                }
        return __queryParts
    }
    public func clone() -> ObjectWithSnakeCaseKeys {

        return ObjectWithSnakeCaseKeys(
            createdAt: self.createdAt,
            displayName: self.displayName,
            phoneNumber: self.phoneNumber,
            lastEvent: self.lastEvent?.clone(),
            emailAddress: self.emailAddress,
            isAdmin: self.isAdmin
        )
    }
    
}
    
public enum ObjectWithSnakeCaseKeysLastEvent: ArriClientModel {
    case userCreated(ObjectWithSnakeCaseKeysLastEventUserCreated)
    case userUpdated(ObjectWithSnakeCaseKeysLastEventUserUpdated)
    case userDeleted(ObjectWithSnakeCaseKeysLastEventUserDeleted)
    public init() {
        self = .userCreated(ObjectWithSnakeCaseKeysLastEventUserCreated())
    }
    public init(json: JSON) {
        if json["user_created"].exists() {
                var __variantValue: ObjectWithSnakeCaseKeysLastEventUserCreated
                __variantValue = ObjectWithSnakeCaseKeysLastEventUserCreated(json: json["user_created"])
                self = .userCreated(__variantValue)
        } else if json["user_updated"].exists() {
                var __variantValue: ObjectWithSnakeCaseKeysLastEventUserUpdated
                __variantValue = ObjectWithSnakeCaseKeysLastEventUserUpdated(json: json["user_updated"])
                self = .userUpdated(__variantValue)
        } else if json["user_deleted"].exists() {
                var __variantValue: ObjectWithSnakeCaseKeysLastEventUserDeleted
                __variantValue = ObjectWithSnakeCaseKeysLastEventUserDeleted(json: json["user_deleted"])
                self = .userDeleted(__variantValue)
        } else {
            self = .userCreated(ObjectWithSnakeCaseKeysLastEventUserCreated())
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .userCreated(let __variantValue):
                __json += "\"user_created\":"
                __json += __variantValue.toJSONString()
                break
            case .userUpdated(let __variantValue):
                __json += "\"user_updated\":"
                __json += __variantValue.toJSONString()
                break
            case .userDeleted(let __variantValue):
                __json += "\"user_deleted\":"
                __json += __variantValue.toJSONString()
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithSnakeCaseKeysLastEvent.")
        return []
    }
    public func clone() -> ObjectWithSnakeCaseKeysLastEvent {
        switch(self) {
            case .userCreated(let __variantValue):
                
                return .userCreated(__variantValue.clone())
            case .userUpdated(let __variantValue):
                
                return .userUpdated(__variantValue.clone())
            case .userDeleted(let __variantValue):
                
                return .userDeleted(__variantValue.clone())
        }
    }
}

public struct ObjectWithSnakeCaseKeysLastEventUserCreated: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["user_id"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"user_id\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "user_id", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithSnakeCaseKeysLastEventUserCreated {

        return ObjectWithSnakeCaseKeysLastEventUserCreated(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithSnakeCaseKeysLastEventUserUpdated: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["user_id"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"user_id\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "user_id", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithSnakeCaseKeysLastEventUserUpdated {

        return ObjectWithSnakeCaseKeysLastEventUserUpdated(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithSnakeCaseKeysLastEventUserDeleted: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["user_id"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"user_id\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "user_id", value: self.userId))
        return __queryParts
    }
    public func clone() -> ObjectWithSnakeCaseKeysLastEventUserDeleted {

        return ObjectWithSnakeCaseKeysLastEventUserDeleted(
            userId: self.userId
        )
    }
    
}
    

public struct ObjectWithEveryOptionalType: ArriClientModel {
    public var any: JSON?
    public var boolean: Bool?
    public var string: String?
    public var timestamp: Date?
    public var float32: Float32?
    public var float64: Float64?
    public var int8: Int8?
    public var uint8: UInt8?
    public var int16: Int16?
    public var uint16: UInt16?
    public var int32: Int32?
    public var uint32: UInt32?
    public var int64: Int64?
    public var uint64: UInt64?
    public var enumerator: ObjectWithEveryOptionalTypeEnumerator?
    public var array: [Bool]?
    public var object: ObjectWithEveryOptionalTypeObject?
    public var record: Dictionary<String, UInt64>?
    public var unionExternal: ObjectWithEveryOptionalTypeUnionExternal?
    public var unionInternal: ObjectWithEveryOptionalTypeUnionInternal?
    public var unionAdjacent: ObjectWithEveryOptionalTypeUnionAdjacent?
    public var nestedObject: ObjectWithEveryOptionalTypeNestedObject?
    public var nestedArray: [[ObjectWithEveryOptionalTypeNestedArrayElementElement]]?
    public init(
        any: JSON?,
        boolean: Bool?,
        string: String?,
        timestamp: Date?,
        float32: Float32?,
        float64: Float64?,
        int8: Int8?,
        uint8: UInt8?,
        int16: Int16?,
        uint16: UInt16?,
        int32: Int32?,
        uint32: UInt32?,
        int64: Int64?,
        uint64: UInt64?,
        enumerator: ObjectWithEveryOptionalTypeEnumerator?,
        array: [Bool]?,
        object: ObjectWithEveryOptionalTypeObject?,
        record: Dictionary<String, UInt64>?,
        unionExternal: ObjectWithEveryOptionalTypeUnionExternal?,
        unionInternal: ObjectWithEveryOptionalTypeUnionInternal?,
        unionAdjacent: ObjectWithEveryOptionalTypeUnionAdjacent?,
        nestedObject: ObjectWithEveryOptionalTypeNestedObject?,
        nestedArray: [[ObjectWithEveryOptionalTypeNestedArrayElementElement]]?
    ) {
            self.any = any
            self.boolean = boolean
            self.string = string
            self.timestamp = timestamp
            self.float32 = float32
            self.float64 = float64
            self.int8 = int8
            self.uint8 = uint8
            self.int16 = int16
            self.uint16 = uint16
            self.int32 = int32
            self.uint32 = uint32
            self.int64 = int64
            self.uint64 = uint64
            self.enumerator = enumerator
            self.array = array
            self.object = object
            self.record = record
            self.unionExternal = unionExternal
            self.unionInternal = unionInternal
            self.unionAdjacent = unionAdjacent
            self.nestedObject = nestedObject
            self.nestedArray = nestedArray
    }
    public init() {}
    public init(json: JSON) {
        if json["any"].exists() {
            self.any = json["any"]
        }
        if json["boolean"].exists() {
                    self.boolean = json["boolean"].bool
                }
        if json["string"].exists() {
            self.string = json["string"].string    
        }
        if json["timestamp"].exists() {
                    self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
                }
        if json["float32"].exists() {
                    self.float32 = json["float32"].float
                }
        if json["float64"].exists() {
                    self.float64 = json["float64"].double
                }
        if json["int8"].exists() {
                    self.int8 = json["int8"].int8
                }
        if json["uint8"].exists() {
                    self.uint8 = json["uint8"].uInt8
                }
        if json["int16"].exists() {
                    self.int16 = json["int16"].int16
                }
        if json["uint16"].exists() {
                    self.uint16 = json["uint16"].uInt16
                }
        if json["int32"].exists() {
                    self.int32 = json["int32"].int32
                }
        if json["uint32"].exists() {
                    self.uint32 = json["uint32"].uInt32
                }
        if json["int64"].exists() {
                    self.int64 = Int64(json["int64"].string ?? "0")
                }
        if json["uint64"].exists() {
                    self.uint64 = UInt64(json["uint64"].string ?? "0")
                }
        if json["enumerator"].exists() {
                    self.enumerator = ObjectWithEveryOptionalTypeEnumerator(serialValue: json["enumerator"].string ?? "")
                }
        if json["array"].exists() {
        self.array = []
            for __arrayJsonElement in json["array"].array ?? [] {
                var __arrayJsonElementValue: Bool
                        __arrayJsonElementValue = __arrayJsonElement.bool ?? false
                self.array!.append(__arrayJsonElementValue)
            }
                }
         if json["object"].exists() {
                    self.object = ObjectWithEveryOptionalTypeObject(json: json["object"])
                }
        if json["record"].exists() {
        self.record = Dictionary()
            for (__key, __value) in json["record"].dictionary ?? Dictionary() {
                var __parsedValue: UInt64
                        __parsedValue = UInt64(__value.string ?? "0") ?? 0
                self.record![__key] = __parsedValue            
            }
                }
        if json["unionExternal"].exists() {
                    self.unionExternal = ObjectWithEveryOptionalTypeUnionExternal(json: json["unionExternal"])
                }
        if json["unionInternal"].exists() {
                    self.unionInternal = ObjectWithEveryOptionalTypeUnionInternal(json: json["unionInternal"])
                }
        if json["unionAdjacent"].exists() {
                    self.unionAdjacent = ObjectWithEveryOptionalTypeUnionAdjacent(json: json["unionAdjacent"])
                }
         if json["nestedObject"].exists() {
                    self.nestedObject = ObjectWithEveryOptionalTypeNestedObject(json: json["nestedObject"])
                }
        if json["nestedArray"].exists() {
        self.nestedArray = []
            for __nestedArrayJsonElement in json["nestedArray"].array ?? [] {
                var __nestedArrayJsonElementValue: [ObjectWithEveryOptionalTypeNestedArrayElementElement]
                        __nestedArrayJsonElementValue = []
            for __elementJsonElement in __nestedArrayJsonElement.array ?? [] {
                var __elementJsonElementValue: ObjectWithEveryOptionalTypeNestedArrayElementElement
                        __elementJsonElementValue = ObjectWithEveryOptionalTypeNestedArrayElementElement(json: __elementJsonElement)
                __nestedArrayJsonElementValue.append(__elementJsonElementValue)
            }
                self.nestedArray!.append(__nestedArrayJsonElementValue)
            }
                }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
      var __numKeys = 0
        if self.any != nil {
                        __json += "\"any\":"
        __json += serializeAny(input: self.any!)            
__numKeys += 1
        }
        if self.boolean != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"boolean\":"
__json += "\(self.boolean!)"            
__numKeys += 1
        }
        if self.string != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"string\":"
        __json += serializeString(input: self.string!)            
__numKeys += 1
        }
        if self.timestamp != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"timestamp\":"
        __json += serializeDate(self.timestamp!)            
__numKeys += 1
        }
        if self.float32 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"float32\":"
        __json += "\(self.float32!)"            
__numKeys += 1
        }
        if self.float64 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"float64\":"
        __json += "\(self.float64!)"            
__numKeys += 1
        }
        if self.int8 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"int8\":"
        __json += "\(self.int8!)"            
__numKeys += 1
        }
        if self.uint8 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"uint8\":"
        __json += "\(self.uint8!)"            
__numKeys += 1
        }
        if self.int16 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"int16\":"
        __json += "\(self.int16!)"            
__numKeys += 1
        }
        if self.uint16 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"uint16\":"
        __json += "\(self.uint16!)"            
__numKeys += 1
        }
        if self.int32 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"int32\":"
        __json += "\(self.int32!)"            
__numKeys += 1
        }
        if self.uint32 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"uint32\":"
        __json += "\(self.uint32!)"            
__numKeys += 1
        }
        if self.int64 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"int64\":"
        __json += "\"\(self.int64!)\""            
__numKeys += 1
        }
        if self.uint64 != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"uint64\":"
        __json += "\"\(self.uint64!)\""            
__numKeys += 1
        }
        if self.enumerator != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"enumerator\":"
        __json += "\"\(self.enumerator!.serialValue())\""            
__numKeys += 1
        }
        if self.array != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"array\":"
       __json += "["
            for (__index, __element) in self.array!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += "\(__element)"
            }
            __json += "]"            
__numKeys += 1
        }
        if self.object != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"object\":"
        __json += self.object!.toJSONString()            
__numKeys += 1
        }
        if self.record != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"record\":"
        __json += "{"
            for (__index, (__key, __value)) in self.record!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += "\(serializeString(input: __key)):"
                        __json += "\"\(__value)\""
            }
            __json += "}"            
__numKeys += 1
        }
        if self.unionExternal != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"unionExternal\":"
        __json += self.unionExternal!.toJSONString()            
__numKeys += 1
        }
        if self.unionInternal != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"unionInternal\":"
        __json += self.unionInternal!.toJSONString()            
__numKeys += 1
        }
        if self.unionAdjacent != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"unionAdjacent\":"
        __json += self.unionAdjacent!.toJSONString()            
__numKeys += 1
        }
        if self.nestedObject != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"nestedObject\":"
        __json += self.nestedObject!.toJSONString()            
__numKeys += 1
        }
        if self.nestedArray != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"nestedArray\":"
       __json += "["
            for (__index, __element) in self.nestedArray!.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                       __json += "["
            for (__index, __element) in __element.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += __element.toJSONString()
            }
            __json += "]"
            }
            __json += "]"            
__numKeys += 1
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/any.")
        if self.boolean != nil {
                    __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean!)"))
                }
        if self.string != nil {
                    __queryParts.append(URLQueryItem(name: "string", value: self.string!))
                }
        if self.timestamp != nil {
                    __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp!, withQuotes: false)))
                }
        if self.float32 != nil {
                    __queryParts.append(URLQueryItem(name: "float32", value: "\(self.float32!)"))
                }
        if self.float64 != nil {
                    __queryParts.append(URLQueryItem(name: "float64", value: "\(self.float64!)"))
                }
        if self.int8 != nil {
                    __queryParts.append(URLQueryItem(name: "int8", value: "\(self.int8!)"))
                }
        if self.uint8 != nil {
                    __queryParts.append(URLQueryItem(name: "uint8", value: "\(self.uint8!)"))
                }
        if self.int16 != nil {
                    __queryParts.append(URLQueryItem(name: "int16", value: "\(self.int16!)"))
                }
        if self.uint16 != nil {
                    __queryParts.append(URLQueryItem(name: "uint16", value: "\(self.uint16!)"))
                }
        if self.int32 != nil {
                    __queryParts.append(URLQueryItem(name: "int32", value: "\(self.int32!)"))
                }
        if self.uint32 != nil {
                    __queryParts.append(URLQueryItem(name: "uint32", value: "\(self.uint32!)"))
                }
        if self.int64 != nil {
                    __queryParts.append(URLQueryItem(name: "int64", value: "\(self.int64!)"))
                }
        if self.uint64 != nil {
                    __queryParts.append(URLQueryItem(name: "uint64", value: "\(self.uint64!)"))
                }
        if self.enumerator != nil {
                    __queryParts.append(URLQueryItem(name: "enumerator", value: self.enumerator!.serialValue()))
                }
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/object.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionExternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionInternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/unionAdjacent.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedObject.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/nestedArray.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalType {
var __arrayCloned: [Bool]?
                if self.array != nil {
                    __arrayCloned = []
                    for __arrayElement in self.array! {
                        
                        __arrayCloned!.append(__arrayElement)
                    }
                }

var __recordCloned: Dictionary<String, UInt64>?
                    if self.record != nil {
                        __recordCloned = Dictionary()
                        for (__recordKey, __recordValue) in self.record! {
                            
                            __recordCloned![__recordKey] = __recordValue
                        }          
                    }




var __nestedArrayCloned: [[ObjectWithEveryOptionalTypeNestedArrayElementElement]]?
                if self.nestedArray != nil {
                    __nestedArrayCloned = []
                    for __nestedArrayElement in self.nestedArray! {
                        var __nestedArrayElementCloned: [ObjectWithEveryOptionalTypeNestedArrayElementElement] = []
                for __nestedArrayElementElement in __nestedArrayElement {
                    
                    __nestedArrayElementCloned.append(__nestedArrayElementElement.clone())
                }
                        __nestedArrayCloned!.append(__nestedArrayElementCloned)
                    }
                }
        return ObjectWithEveryOptionalType(
            any: self.any,
            boolean: self.boolean,
            string: self.string,
            timestamp: self.timestamp,
            float32: self.float32,
            float64: self.float64,
            int8: self.int8,
            uint8: self.uint8,
            int16: self.int16,
            uint16: self.uint16,
            int32: self.int32,
            uint32: self.uint32,
            int64: self.int64,
            uint64: self.uint64,
            enumerator: self.enumerator,
            array: __arrayCloned,
            object: self.object?.clone(),
            record: __recordCloned,
            unionExternal: self.unionExternal?.clone(),
            unionInternal: self.unionInternal?.clone(),
            unionAdjacent: self.unionAdjacent?.clone(),
            nestedObject: self.nestedObject?.clone(),
            nestedArray: __nestedArrayCloned
        )
    }
    
}
    
public enum ObjectWithEveryOptionalTypeEnumerator: ArriClientEnum {
    case a
    case b
    case c
    public init() {
        self = .a
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "A":
                self = .a
                break;
            case "B":
                self = .b
                break;
            case "C":
                self = .c
                break;
            default:
                self = .a
        }
    }
    public func serialValue() -> String {
        switch (self) {
            case .a:
                return "A"
            case .b:
                return "B"
            case .c:
                return "C"
        }
    }
}
public struct ObjectWithEveryOptionalTypeObject: ArriClientModel {
    public var string: String = ""
    public var boolean: Bool = false
    public var timestamp: Date = Date()
    public init(
        string: String,
        boolean: Bool,
        timestamp: Date
    ) {
            self.string = string
            self.boolean = boolean
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        self.string = json["string"].string ?? ""
        self.boolean = json["boolean"].bool ?? false
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"string\":"
        __json += serializeString(input: self.string)
        __json += ",\"boolean\":"
        __json += "\(self.boolean)"
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "string", value: self.string))
        __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean)"))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeObject {

        return ObjectWithEveryOptionalTypeObject(
            string: self.string,
            boolean: self.boolean,
            timestamp: self.timestamp
        )
    }
    
}
    

public enum ObjectWithEveryOptionalTypeUnionExternal: ArriClientModel {
    case object(ObjectWithEveryOptionalTypeUnionExternalObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(ObjectWithEveryOptionalTypeUnionExternalObject())
    }
    public init(json: JSON) {
        if json["object"].exists() {
                var __variantValue: ObjectWithEveryOptionalTypeUnionExternalObject
                __variantValue = ObjectWithEveryOptionalTypeUnionExternalObject(json: json["object"])
                self = .object(__variantValue)
        } else if json["array"].exists() {
                var __variantValue: [String]
                __variantValue = []
            for __variantValueJsonElement in json["array"].array ?? [] {
                var __variantValueJsonElementValue: String
                        __variantValueJsonElementValue = __variantValueJsonElement.string ?? ""
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .array(__variantValue)
        } else if json["boolean"].exists() {
                var __variantValue: Bool
                __variantValue = json["boolean"].bool ?? false
                self = .boolean(__variantValue)
        } else if json["nullable-timestamp"].exists() {
                var __variantValue: Date?
                if json["nullable-timestamp"].string != nil {
                    __variantValue = parseDate(json["nullable-timestamp"].string ?? "") ?? Date()
                }
                self = .nullableTimestamp(__variantValue)
        } else {
            self = .object(ObjectWithEveryOptionalTypeUnionExternalObject())
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .object(let __variantValue):
                __json += "\"object\":"
                __json += __variantValue.toJSONString()
                break
            case .array(let __variantValue):
                __json += "\"array\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeString(input: __element)
            }
            __json += "]"
                break
            case .boolean(let __variantValue):
                __json += "\"boolean\":"
                __json += "\(__variantValue)"
                break
            case .nullableTimestamp(let __variantValue):
                __json += "\"nullable-timestamp\":"
                if __variantValue != nil {
                    __json += serializeDate(__variantValue!)
                } else {
                    __json += "null" 
                }
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionExternal.")
        return []
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionExternal {
        switch(self) {
            case .object(let __variantValue):
                
                return .object(__variantValue.clone())
            case .array(let __variantValue):
                var __variantValueCloned: [String] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement)
                }
                return .array(__variantValueCloned)
            case .boolean(let __variantValue):
                
                return .boolean(__variantValue)
            case .nullableTimestamp(let __variantValue):
                
                return .nullableTimestamp(__variantValue)
        }
    }
}

public struct ObjectWithEveryOptionalTypeUnionExternalObject: ArriClientModel {
    public var id: String = ""
    public var content: String = ""
    public init(
        id: String,
        content: String
    ) {
            self.id = id
            self.content = content
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.content = json["content"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"content\":"
        __json += serializeString(input: self.content)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "content", value: self.content))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionExternalObject {

        return ObjectWithEveryOptionalTypeUnionExternalObject(
            id: self.id,
            content: self.content
        )
    }
    
}
    

public enum ObjectWithEveryOptionalTypeUnionInternal: ArriClientModel {
    case rectangle(ObjectWithEveryOptionalTypeUnionInternalRectangle)
    case circle(ObjectWithEveryOptionalTypeUnionInternalCircle)
    public init() {
        self = .rectangle(ObjectWithEveryOptionalTypeUnionInternalRectangle())
    }
    public init(json: JSON) {
        let __tag = json["shape"].string ?? ""
        switch (__tag) {
            case "rectangle":
                self = .rectangle(ObjectWithEveryOptionalTypeUnionInternalRectangle(json: json))
                break
            case "circle":
                self = .circle(ObjectWithEveryOptionalTypeUnionInternalCircle(json: json))
                break
            default:
                self = .rectangle(ObjectWithEveryOptionalTypeUnionInternalRectangle())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .rectangle(let __innerVal):
                return __innerVal.toJSONString()
            case .circle(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .rectangle(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .circle(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionInternal {
        switch(self) {
            case .rectangle(let __innerVal):
                return .rectangle(__innerVal.clone())
            case .circle(let __innerVal):
                return .circle(__innerVal.clone())
        }
    }
}

public struct ObjectWithEveryOptionalTypeUnionInternalRectangle: ArriClientModel {
    let shape: String = "rectangle"
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public init(
        width: Float64,
        height: Float64
    ) {
            self.width = width
            self.height = height
    }
    public init() {}
    public init(json: JSON) {
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"shape\":\"rectangle\""
        __json += ",\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "shape", value: "rectangle"))
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionInternalRectangle {

        return ObjectWithEveryOptionalTypeUnionInternalRectangle(
            width: self.width,
            height: self.height
        )
    }
    
}
    

public struct ObjectWithEveryOptionalTypeUnionInternalCircle: ArriClientModel {
    let shape: String = "circle"
    public var radius: Float64 = 0.0
    public init(
        radius: Float64
    ) {
            self.radius = radius
    }
    public init() {}
    public init(json: JSON) {
        self.radius = json["radius"].double ?? 0.0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"shape\":\"circle\""
        __json += ",\"radius\":"
        __json += "\(self.radius)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "shape", value: "circle"))
        __queryParts.append(URLQueryItem(name: "radius", value: "\(self.radius)"))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionInternalCircle {

        return ObjectWithEveryOptionalTypeUnionInternalCircle(
            radius: self.radius
        )
    }
    
}
    

public enum ObjectWithEveryOptionalTypeUnionAdjacent: ArriClientModel {
    case object(ObjectWithEveryOptionalTypeUnionAdjacentObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(ObjectWithEveryOptionalTypeUnionAdjacentObject())
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "object":
                var __variantValue: ObjectWithEveryOptionalTypeUnionAdjacentObject
                __variantValue = ObjectWithEveryOptionalTypeUnionAdjacentObject(json: json["data"])
                self = .object(__variantValue)
                break
            case "array":
                var __variantValue: [String]
                __variantValue = []
            for __variantValueJsonElement in json["data"].array ?? [] {
                var __variantValueJsonElementValue: String
                        __variantValueJsonElementValue = __variantValueJsonElement.string ?? ""
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .array(__variantValue)
                break
            case "boolean":
                var __variantValue: Bool
                __variantValue = json["data"].bool ?? false
                self = .boolean(__variantValue)
                break
            case "nullable-timestamp":
                var __variantValue: Date?
                if json["data"].string != nil {
                    __variantValue = parseDate(json["data"].string ?? "") ?? Date()
                }
                self = .nullableTimestamp(__variantValue)
                break
            default:
                self = .object(ObjectWithEveryOptionalTypeUnionAdjacentObject())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .object(let __variantValue):
                __json += "\"kind\":\"object\",\"data\":"
                __json += __variantValue.toJSONString()
                break
            case .array(let __variantValue):
                __json += "\"kind\":\"array\",\"data\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeString(input: __element)
            }
            __json += "]"
                break
            case .boolean(let __variantValue):
                __json += "\"kind\":\"boolean\",\"data\":"
                __json += "\(__variantValue)"
                break
            case .nullableTimestamp(let __variantValue):
                __json += "\"kind\":\"nullable-timestamp\",\"data\":"
                if __variantValue != nil {
                    __json += serializeDate(__variantValue!)
                } else {
                    __json += "null" 
                }
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ObjectWithEveryOptionalTypeUnionAdjacent.")
        return []
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionAdjacent {
        switch(self) {
            case .object(let __variantValue):
                
                return .object(__variantValue.clone())
            case .array(let __variantValue):
                var __variantValueCloned: [String] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement)
                }
                return .array(__variantValueCloned)
            case .boolean(let __variantValue):
                
                return .boolean(__variantValue)
            case .nullableTimestamp(let __variantValue):
                
                return .nullableTimestamp(__variantValue)
        }
    }
}

public struct ObjectWithEveryOptionalTypeUnionAdjacentObject: ArriClientModel {
    public var id: String = ""
    public var content: String = ""
    public init(
        id: String,
        content: String
    ) {
            self.id = id
            self.content = content
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.content = json["content"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"content\":"
        __json += serializeString(input: self.content)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "content", value: self.content))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeUnionAdjacentObject {

        return ObjectWithEveryOptionalTypeUnionAdjacentObject(
            id: self.id,
            content: self.content
        )
    }
    
}
    

public struct ObjectWithEveryOptionalTypeNestedObject: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public var data: ObjectWithEveryOptionalTypeNestedObjectData = ObjectWithEveryOptionalTypeNestedObjectData()
    public init(
        id: String,
        timestamp: Date,
        data: ObjectWithEveryOptionalTypeNestedObjectData
    ) {
            self.id = id
            self.timestamp = timestamp
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
        self.data = ObjectWithEveryOptionalTypeNestedObjectData(json: json["data"])
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += ",\"data\":"
        __json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObject/data.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeNestedObject {

        return ObjectWithEveryOptionalTypeNestedObject(
            id: self.id,
            timestamp: self.timestamp,
            data: self.data.clone()
        )
    }
    
}
    
public struct ObjectWithEveryOptionalTypeNestedObjectData: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public var data: ObjectWithEveryOptionalTypeNestedObjectDataData = ObjectWithEveryOptionalTypeNestedObjectDataData()
    public init(
        id: String,
        timestamp: Date,
        data: ObjectWithEveryOptionalTypeNestedObjectDataData
    ) {
            self.id = id
            self.timestamp = timestamp
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
        self.data = ObjectWithEveryOptionalTypeNestedObjectDataData(json: json["data"])
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += ",\"data\":"
        __json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObjectData/data.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeNestedObjectData {

        return ObjectWithEveryOptionalTypeNestedObjectData(
            id: self.id,
            timestamp: self.timestamp,
            data: self.data.clone()
        )
    }
    
}
    
public struct ObjectWithEveryOptionalTypeNestedObjectDataData: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public init(
        id: String,
        timestamp: Date
    ) {
            self.id = id
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeNestedObjectDataData {

        return ObjectWithEveryOptionalTypeNestedObjectDataData(
            id: self.id,
            timestamp: self.timestamp
        )
    }
    
}
    

public struct ObjectWithEveryOptionalTypeNestedArrayElementElement: ArriClientModel {
    public var id: String = ""
    public var timestamp: Date = Date()
    public init(
        id: String,
        timestamp: Date
    ) {
            self.id = id
            self.timestamp = timestamp
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeNestedArrayElementElement {

        return ObjectWithEveryOptionalTypeNestedArrayElementElement(
            id: self.id,
            timestamp: self.timestamp
        )
    }
    
}
    

public final class RecursiveObject: ArriClientModel {
    public var left: RecursiveObject?
    public var right: RecursiveObject?
    public var value: String = ""
    public required init(
        left: RecursiveObject?,
        right: RecursiveObject?,
        value: String
    ) {
            self.left = left
            self.right = right
            self.value = value
    }
    public required init() {}
    public required init(json: JSON) {
if json["left"].dictionary != nil {
                    self.left = RecursiveObject(json: json["left"])
                }
if json["right"].dictionary != nil {
                    self.right = RecursiveObject(json: json["right"])
                }
        self.value = json["value"].string ?? ""
    }
    public required convenience init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public required convenience init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"left\":"
if self.left != nil {
                    __json += self.left!.toJSONString()
                } else {
                    __json += "null"
                }
        __json += ",\"right\":"
if self.right != nil {
                    __json += self.right!.toJSONString()
                } else {
                    __json += "null"
                }
        __json += ",\"value\":"
        __json += serializeString(input: self.value)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/left.")
print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/right.")
        __queryParts.append(URLQueryItem(name: "value", value: self.value))
        return __queryParts
    }
    public func clone() -> RecursiveObject {


        return RecursiveObject(
            left: self.left?.clone(),
            right: self.right?.clone(),
            value: self.value
        )
    }
    public static func == (lhs: RecursiveObject, rhs: RecursiveObject) -> Bool {
            return
               lhs.left == rhs.left &&
               lhs.right == rhs.right &&
               lhs.value == rhs.value
        }
}
    

public indirect enum RecursiveUnionAdjacent: ArriClientModel {
    case child(RecursiveUnionAdjacent)
    /// an array of child nodes
    case children([RecursiveUnionAdjacent])
    /// Text node
    case text(String)
    /// Shape node
    case shape(RecursiveUnionAdjacentShape)
    public init() {
        self = .children([])
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "child":
                var __variantValue: RecursiveUnionAdjacent
        __variantValue = RecursiveUnionAdjacent(json: json["data"])
                self = .child(__variantValue)
                break
            case "children":
                var __variantValue: [RecursiveUnionAdjacent]
                __variantValue = []
            for __variantValueJsonElement in json["data"].array ?? [] {
                var __variantValueJsonElementValue: RecursiveUnionAdjacent
                __variantValueJsonElementValue = RecursiveUnionAdjacent(json: __variantValueJsonElement)
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .children(__variantValue)
                break
            case "text":
                var __variantValue: String
                __variantValue = json["data"].string ?? ""
                self = .text(__variantValue)
                break
            case "shape":
                var __variantValue: RecursiveUnionAdjacentShape
                __variantValue = RecursiveUnionAdjacentShape(json: json["data"])
                self = .shape(__variantValue)
                break
            default:
                self = .children([])
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .child(let __variantValue):
                __json += "\"kind\":\"child\",\"data\":"
        __json += __variantValue.toJSONString()
                break
            case .children(let __variantValue):
                __json += "\"kind\":\"children\",\"data\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += __element.toJSONString()
            }
            __json += "]"
                break
            case .text(let __variantValue):
                __json += "\"kind\":\"text\",\"data\":"
                __json += serializeString(input: __variantValue)
                break
            case .shape(let __variantValue):
                __json += "\"kind\":\"shape\",\"data\":"
                __json += __variantValue.toJSONString()
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionAdjacent.")
        return []
    }
    public func clone() -> RecursiveUnionAdjacent {
        switch(self) {
            case .child(let __variantValue):
                
                return .child(__variantValue.clone())
            case .children(let __variantValue):
                var __variantValueCloned: [RecursiveUnionAdjacent] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement.clone())
                }
                return .children(__variantValueCloned)
            case .text(let __variantValue):
                
                return .text(__variantValue)
            case .shape(let __variantValue):
                
                return .shape(__variantValue.clone())
        }
    }
}

/// Shape node
public struct RecursiveUnionAdjacentShape: ArriClientModel {
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public var color: String = ""
    public init(
        width: Float64,
        height: Float64,
        color: String
    ) {
            self.width = width
            self.height = height
            self.color = color
    }
    public init() {}
    public init(json: JSON) {
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
        self.color = json["color"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += ",\"color\":"
        __json += serializeString(input: self.color)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        __queryParts.append(URLQueryItem(name: "color", value: self.color))
        return __queryParts
    }
    public func clone() -> RecursiveUnionAdjacentShape {

        return RecursiveUnionAdjacentShape(
            width: self.width,
            height: self.height,
            color: self.color
        )
    }
    
}
    

public indirect enum RecursiveUnionExternal: ArriClientModel {
    case child(RecursiveUnionExternal)
    /// an array of child nodes
    case children([RecursiveUnionExternal])
    /// Text node
    case text(String)
    /// Shape node
    case shape(RecursiveUnionExternalShape)
    public init() {
        self = .children([])
    }
    public init(json: JSON) {
        if json["child"].exists() {
                var __variantValue: RecursiveUnionExternal
        __variantValue = RecursiveUnionExternal(json: json["child"])
                self = .child(__variantValue)
        } else if json["children"].exists() {
                var __variantValue: [RecursiveUnionExternal]
                __variantValue = []
            for __variantValueJsonElement in json["children"].array ?? [] {
                var __variantValueJsonElementValue: RecursiveUnionExternal
                __variantValueJsonElementValue = RecursiveUnionExternal(json: __variantValueJsonElement)
                __variantValue.append(__variantValueJsonElementValue)
            }
                self = .children(__variantValue)
        } else if json["text"].exists() {
                var __variantValue: String
                __variantValue = json["text"].string ?? ""
                self = .text(__variantValue)
        } else if json["shape"].exists() {
                var __variantValue: RecursiveUnionExternalShape
                __variantValue = RecursiveUnionExternalShape(json: json["shape"])
                self = .shape(__variantValue)
        } else {
            self = .children([])
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
            case .child(let __variantValue):
                __json += "\"child\":"
        __json += __variantValue.toJSONString()
                break
            case .children(let __variantValue):
                __json += "\"children\":"
               __json += "["
            for (__index, __element) in __variantValue.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += __element.toJSONString()
            }
            __json += "]"
                break
            case .text(let __variantValue):
                __json += "\"text\":"
                __json += serializeString(input: __variantValue)
                break
            case .shape(let __variantValue):
                __json += "\"shape\":"
                __json += __variantValue.toJSONString()
                break
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping RecursiveUnionExternal.")
        return []
    }
    public func clone() -> RecursiveUnionExternal {
        switch(self) {
            case .child(let __variantValue):
                
                return .child(__variantValue.clone())
            case .children(let __variantValue):
                var __variantValueCloned: [RecursiveUnionExternal] = []
                for __variantValueElement in __variantValue {
                    
                    __variantValueCloned.append(__variantValueElement.clone())
                }
                return .children(__variantValueCloned)
            case .text(let __variantValue):
                
                return .text(__variantValue)
            case .shape(let __variantValue):
                
                return .shape(__variantValue.clone())
        }
    }
}

/// Shape node
public struct RecursiveUnionExternalShape: ArriClientModel {
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public var color: String = ""
    public init(
        width: Float64,
        height: Float64,
        color: String
    ) {
            self.width = width
            self.height = height
            self.color = color
    }
    public init() {}
    public init(json: JSON) {
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
        self.color = json["color"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += ",\"color\":"
        __json += serializeString(input: self.color)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        __queryParts.append(URLQueryItem(name: "color", value: self.color))
        return __queryParts
    }
    public func clone() -> RecursiveUnionExternalShape {

        return RecursiveUnionExternalShape(
            width: self.width,
            height: self.height,
            color: self.color
        )
    }
    
}
    

public enum RecursiveUnionInternal: ArriClientModel {
    case child(RecursiveUnionInternalChild)
    case children(RecursiveUnionInternalChildren)
    case text(RecursiveUnionInternalText)
    case shape(RecursiveUnionInternalShape)
    public init() {
        self = .children(RecursiveUnionInternalChildren())
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "child":
                self = .child(RecursiveUnionInternalChild(json: json))
                break
            case "children":
                self = .children(RecursiveUnionInternalChildren(json: json))
                break
            case "text":
                self = .text(RecursiveUnionInternalText(json: json))
                break
            case "shape":
                self = .shape(RecursiveUnionInternalShape(json: json))
                break
            default:
                self = .children(RecursiveUnionInternalChildren())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .child(let __innerVal):
                return __innerVal.toJSONString()
            case .children(let __innerVal):
                return __innerVal.toJSONString()
            case .text(let __innerVal):
                return __innerVal.toJSONString()
            case .shape(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .child(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .children(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .text(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .shape(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> RecursiveUnionInternal {
        switch(self) {
            case .child(let __innerVal):
                return .child(__innerVal.clone())
            case .children(let __innerVal):
                return .children(__innerVal.clone())
            case .text(let __innerVal):
                return .text(__innerVal.clone())
            case .shape(let __innerVal):
                return .shape(__innerVal.clone())
        }
    }
}

public final class RecursiveUnionInternalChild: ArriClientModel {
    let kind: String = "child"
    public var data: RecursiveUnionInternal = RecursiveUnionInternal()
    public required init(
        data: RecursiveUnionInternal
    ) {
            self.data = data
    }
    public required init() {}
    public required init(json: JSON) {
self.data = RecursiveUnionInternal(json: json["data"])
    }
    public required convenience init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public required convenience init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"kind\":\"child\""
        __json += ",\"data\":"
__json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "kind", value: "child"))
print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionInternalChild/data.")
        return __queryParts
    }
    public func clone() -> RecursiveUnionInternalChild {

        return RecursiveUnionInternalChild(
            data: self.data.clone()
        )
    }
    public static func == (lhs: RecursiveUnionInternalChild, rhs: RecursiveUnionInternalChild) -> Bool {
            return
               lhs.kind == rhs.kind &&
               lhs.data == rhs.data
        }
}
    

public struct RecursiveUnionInternalChildren: ArriClientModel {
    let kind: String = "children"
    /// an array of child nodes
    public var data: [RecursiveUnionInternal] = []
    public init(
        data: [RecursiveUnionInternal]
    ) {
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.data = []
            for __dataJsonElement in json["data"].array ?? [] {
                var __dataJsonElementValue: RecursiveUnionInternal
                __dataJsonElementValue = RecursiveUnionInternal(json: __dataJsonElement)
                self.data.append(__dataJsonElementValue)
            }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"kind\":\"children\""
        __json += ",\"data\":"
       __json += "["
            for (__index, __element) in self.data.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += __element.toJSONString()
            }
            __json += "]"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "kind", value: "children"))
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /RecursiveUnionInternalChildren/data.")
        return __queryParts
    }
    public func clone() -> RecursiveUnionInternalChildren {
var __dataCloned: [RecursiveUnionInternal] = []
                for __dataElement in self.data {
                    
                    __dataCloned.append(__dataElement.clone())
                }
        return RecursiveUnionInternalChildren(
            data: __dataCloned
        )
    }
    
}
    

public struct RecursiveUnionInternalText: ArriClientModel {
    let kind: String = "text"
    /// Text node
    public var data: String = ""
    public init(
        data: String
    ) {
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.data = json["data"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"kind\":\"text\""
        __json += ",\"data\":"
        __json += serializeString(input: self.data)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "kind", value: "text"))
        __queryParts.append(URLQueryItem(name: "data", value: self.data))
        return __queryParts
    }
    public func clone() -> RecursiveUnionInternalText {

        return RecursiveUnionInternalText(
            data: self.data
        )
    }
    
}
    

public struct RecursiveUnionInternalShape: ArriClientModel {
    let kind: String = "shape"
    /// Shape node
    public var data: RecursiveUnionInternalShapeData = RecursiveUnionInternalShapeData()
    public init(
        data: RecursiveUnionInternalShapeData
    ) {
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.data = RecursiveUnionInternalShapeData(json: json["data"])
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"kind\":\"shape\""
        __json += ",\"data\":"
        __json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "kind", value: "shape"))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionInternalShape/data.")
        return __queryParts
    }
    public func clone() -> RecursiveUnionInternalShape {

        return RecursiveUnionInternalShape(
            data: self.data.clone()
        )
    }
    
}
    
/// Shape node
public struct RecursiveUnionInternalShapeData: ArriClientModel {
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public var color: String = ""
    public init(
        width: Float64,
        height: Float64,
        color: String
    ) {
            self.width = width
            self.height = height
            self.color = color
    }
    public init() {}
    public init(json: JSON) {
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
        self.color = json["color"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += ",\"color\":"
        __json += serializeString(input: self.color)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        __queryParts.append(URLQueryItem(name: "color", value: self.color))
        return __queryParts
    }
    public func clone() -> RecursiveUnionInternalShapeData {

        return RecursiveUnionInternalShapeData(
            width: self.width,
            height: self.height,
            color: self.color
        )
    }
    
}
    

public enum UnionInternalGetRequest: ArriClientModel {
    case withFields(UnionInternalGetRequestWithFields)
    case empty(UnionInternalGetRequestEmpty)
    public init() {
        self = .withFields(UnionInternalGetRequestWithFields())
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "with-fields":
                self = .withFields(UnionInternalGetRequestWithFields(json: json))
                break
            case "empty":
                self = .empty(UnionInternalGetRequestEmpty(json: json))
                break
            default:
                self = .withFields(UnionInternalGetRequestWithFields())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .withFields(let __innerVal):
                return __innerVal.toJSONString()
            case .empty(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .withFields(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .empty(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> UnionInternalGetRequest {
        switch(self) {
            case .withFields(let __innerVal):
                return .withFields(__innerVal.clone())
            case .empty(let __innerVal):
                return .empty(__innerVal.clone())
        }
    }
}

public struct UnionInternalGetRequestWithFields: ArriClientModel {
    let kind: String = "with-fields"
    public var string: String = ""
    public var nullableString: String?
    public var float64: Float64 = 0.0
    public var int64: Int64 = 0
    public var boolean: Bool = false
    public var timestamp: Date = Date()
    public var nullableEnum: UnionInternalGetRequestWithFieldsNullableEnum?
    public var optionalString: String?
    public init(
        string: String,
        nullableString: String?,
        float64: Float64,
        int64: Int64,
        boolean: Bool,
        timestamp: Date,
        nullableEnum: UnionInternalGetRequestWithFieldsNullableEnum?,
        optionalString: String?
    ) {
            self.string = string
            self.nullableString = nullableString
            self.float64 = float64
            self.int64 = int64
            self.boolean = boolean
            self.timestamp = timestamp
            self.nullableEnum = nullableEnum
            self.optionalString = optionalString
    }
    public init() {}
    public init(json: JSON) {
        self.string = json["string"].string ?? ""
        if json["nullableString"].string != nil {
            self.nullableString = json["nullableString"].string
        }
        self.float64 = json["float64"].double ?? 0.0
        self.int64 = Int64(json["int64"].string ?? "0") ?? 0
        self.boolean = json["boolean"].bool ?? false
        self.timestamp = parseDate(json["timestamp"].string ?? "") ?? Date()
        if json["nullableEnum"].string != nil {
                    self.nullableEnum = UnionInternalGetRequestWithFieldsNullableEnum(serialValue: json["nullableEnum"].string ?? "")
                }
        if json["optionalString"].exists() {
            self.optionalString = json["optionalString"].string    
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"kind\":\"with-fields\""
        __json += ",\"string\":"
        __json += serializeString(input: self.string)
        __json += ",\"nullableString\":"
        if self.nullableString != nil {
                    __json += serializeString(input: self.nullableString!)
                } else {
                    __json += "null" 
                }
        __json += ",\"float64\":"
        __json += "\(self.float64)"
        __json += ",\"int64\":"
        __json += "\"\(self.int64)\""
        __json += ",\"boolean\":"
        __json += "\(self.boolean)"
        __json += ",\"timestamp\":"
        __json += serializeDate(self.timestamp)
        __json += ",\"nullableEnum\":"
        if self.nullableEnum != nil {
                    __json += "\"\(self.nullableEnum!.serialValue())\""
                } else {
                    __json += "null" 
                }
        if self.optionalString != nil {
                    __json += ",\"optionalString\":"
        __json += serializeString(input: self.optionalString!)
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "kind", value: "with-fields"))
        __queryParts.append(URLQueryItem(name: "string", value: self.string))
        if self.nullableString != nil {
                    __queryParts.append(URLQueryItem(name: "nullableString", value: self.nullableString!))
                } else {
                    __queryParts.append(URLQueryItem(name: "nullableString", value: "null")) 
                }
        __queryParts.append(URLQueryItem(name: "float64", value: "\(self.float64)"))
        __queryParts.append(URLQueryItem(name: "int64", value: "\(self.int64)"))
        __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean)"))
        __queryParts.append(URLQueryItem(name: "timestamp", value: serializeDate(self.timestamp, withQuotes: false)))
        if self.nullableEnum != nil {
                    __queryParts.append(URLQueryItem(name: "nullableEnum", value: self.nullableEnum!.serialValue()))
                } else {
                    __queryParts.append(URLQueryItem(name: "nullableEnum", value: "null")) 
                }
        if self.optionalString != nil {
                    __queryParts.append(URLQueryItem(name: "optionalString", value: self.optionalString!))
                }
        return __queryParts
    }
    public func clone() -> UnionInternalGetRequestWithFields {

        return UnionInternalGetRequestWithFields(
            string: self.string,
            nullableString: self.nullableString,
            float64: self.float64,
            int64: self.int64,
            boolean: self.boolean,
            timestamp: self.timestamp,
            nullableEnum: self.nullableEnum,
            optionalString: self.optionalString
        )
    }
    
}
    
public enum UnionInternalGetRequestWithFieldsNullableEnum: ArriClientEnum {
    case a
    case b
    public init() {
        self = .a
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "A":
                self = .a
                break;
            case "B":
                self = .b
                break;
            default:
                self = .a
        }
    }
    public func serialValue() -> String {
        switch (self) {
            case .a:
                return "A"
            case .b:
                return "B"
        }
    }
}
public struct UnionInternalGetRequestEmpty: ArriClientModel {
    let kind: String = "empty"
    public init(

    ) {

    }
    
    public init(json: JSON) {

    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"kind\":\"empty\""
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "kind", value: "empty"))
        return __queryParts
    }
    public func clone() -> UnionInternalGetRequestEmpty {

        return UnionInternalGetRequestEmpty(

        )
    }
    
}
    

public struct AutoReconnectParams: ArriClientModel {
    public var messageCount: UInt8 = 0
    public init(
        messageCount: UInt8
    ) {
            self.messageCount = messageCount
    }
    public init() {}
    public init(json: JSON) {
        self.messageCount = json["messageCount"].uInt8 ?? 0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"messageCount\":"
        __json += "\(self.messageCount)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "messageCount", value: "\(self.messageCount)"))
        return __queryParts
    }
    public func clone() -> AutoReconnectParams {

        return AutoReconnectParams(
            messageCount: self.messageCount
        )
    }
    
}
    

public struct AutoReconnectResponse: ArriClientModel {
    public var count: UInt8 = 0
    public var message: String = ""
    public init(
        count: UInt8,
        message: String
    ) {
            self.count = count
            self.message = message
    }
    public init() {}
    public init(json: JSON) {
        self.count = json["count"].uInt8 ?? 0
        self.message = json["message"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"count\":"
        __json += "\(self.count)"
        __json += ",\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "count", value: "\(self.count)"))
        __queryParts.append(URLQueryItem(name: "message", value: self.message))
        return __queryParts
    }
    public func clone() -> AutoReconnectResponse {

        return AutoReconnectResponse(
            count: self.count,
            message: self.message
        )
    }
    
}
    

public struct StreamConnectionErrorTestParams: ArriClientModel {
    public var statusCode: Int32 = 0
    public var statusMessage: String = ""
    public init(
        statusCode: Int32,
        statusMessage: String
    ) {
            self.statusCode = statusCode
            self.statusMessage = statusMessage
    }
    public init() {}
    public init(json: JSON) {
        self.statusCode = json["statusCode"].int32 ?? 0
        self.statusMessage = json["statusMessage"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"statusCode\":"
        __json += "\(self.statusCode)"
        __json += ",\"statusMessage\":"
        __json += serializeString(input: self.statusMessage)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "statusCode", value: "\(self.statusCode)"))
        __queryParts.append(URLQueryItem(name: "statusMessage", value: self.statusMessage))
        return __queryParts
    }
    public func clone() -> StreamConnectionErrorTestParams {

        return StreamConnectionErrorTestParams(
            statusCode: self.statusCode,
            statusMessage: self.statusMessage
        )
    }
    
}
    

public struct StreamConnectionErrorTestResponse: ArriClientModel {
    public var message: String = ""
    public init(
        message: String
    ) {
            self.message = message
    }
    public init() {}
    public init(json: JSON) {
        self.message = json["message"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "message", value: self.message))
        return __queryParts
    }
    public func clone() -> StreamConnectionErrorTestResponse {

        return StreamConnectionErrorTestResponse(
            message: self.message
        )
    }
    
}
    

public struct StreamHeartbeatDetectionTestParams: ArriClientModel {
    public var heartbeatEnabled: Bool = false
    public init(
        heartbeatEnabled: Bool
    ) {
            self.heartbeatEnabled = heartbeatEnabled
    }
    public init() {}
    public init(json: JSON) {
        self.heartbeatEnabled = json["heartbeatEnabled"].bool ?? false
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"heartbeatEnabled\":"
        __json += "\(self.heartbeatEnabled)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "heartbeatEnabled", value: "\(self.heartbeatEnabled)"))
        return __queryParts
    }
    public func clone() -> StreamHeartbeatDetectionTestParams {

        return StreamHeartbeatDetectionTestParams(
            heartbeatEnabled: self.heartbeatEnabled
        )
    }
    
}
    

public struct StreamHeartbeatDetectionTestResponse: ArriClientModel {
    public var message: String = ""
    public init(
        message: String
    ) {
            self.message = message
    }
    public init() {}
    public init(json: JSON) {
        self.message = json["message"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "message", value: self.message))
        return __queryParts
    }
    public func clone() -> StreamHeartbeatDetectionTestResponse {

        return StreamHeartbeatDetectionTestResponse(
            message: self.message
        )
    }
    
}
    

public struct StreamLargeObjectsResponse: ArriClientModel {
    public var numbers: [Float64] = []
    public var objects: [StreamLargeObjectsResponseObjectsElement] = []
    public init(
        numbers: [Float64],
        objects: [StreamLargeObjectsResponseObjectsElement]
    ) {
            self.numbers = numbers
            self.objects = objects
    }
    public init() {}
    public init(json: JSON) {
        self.numbers = []
            for __numbersJsonElement in json["numbers"].array ?? [] {
                var __numbersJsonElementValue: Float64
                        __numbersJsonElementValue = __numbersJsonElement.double ?? 0.0
                self.numbers.append(__numbersJsonElementValue)
            }
        self.objects = []
            for __objectsJsonElement in json["objects"].array ?? [] {
                var __objectsJsonElementValue: StreamLargeObjectsResponseObjectsElement
                        __objectsJsonElementValue = StreamLargeObjectsResponseObjectsElement(json: __objectsJsonElement)
                self.objects.append(__objectsJsonElementValue)
            }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"numbers\":"
       __json += "["
            for (__index, __element) in self.numbers.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += "\(__element)"
            }
            __json += "]"
        __json += ",\"objects\":"
       __json += "["
            for (__index, __element) in self.objects.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += __element.toJSONString()
            }
            __json += "]"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /StreamLargeObjectsResponse/numbers.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /StreamLargeObjectsResponse/objects.")
        return []
    }
    public func clone() -> StreamLargeObjectsResponse {
var __numbersCloned: [Float64] = []
                for __numbersElement in self.numbers {
                    
                    __numbersCloned.append(__numbersElement)
                }
var __objectsCloned: [StreamLargeObjectsResponseObjectsElement] = []
                for __objectsElement in self.objects {
                    
                    __objectsCloned.append(__objectsElement.clone())
                }
        return StreamLargeObjectsResponse(
            numbers: __numbersCloned,
            objects: __objectsCloned
        )
    }
    
}
    
public struct StreamLargeObjectsResponseObjectsElement: ArriClientModel {
    public var id: String = ""
    public var name: String = ""
    public var email: String = ""
    public init(
        id: String,
        name: String,
        email: String
    ) {
            self.id = id
            self.name = name
            self.email = email
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.name = json["name"].string ?? ""
        self.email = json["email"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"name\":"
        __json += serializeString(input: self.name)
        __json += ",\"email\":"
        __json += serializeString(input: self.email)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "name", value: self.name))
        __queryParts.append(URLQueryItem(name: "email", value: self.email))
        return __queryParts
    }
    public func clone() -> StreamLargeObjectsResponseObjectsElement {

        return StreamLargeObjectsResponseObjectsElement(
            id: self.id,
            name: self.name,
            email: self.email
        )
    }
    
}
    

public struct ChatMessageParams: ArriClientModel {
    public var channelId: String = ""
    public init(
        channelId: String
    ) {
            self.channelId = channelId
    }
    public init() {}
    public init(json: JSON) {
        self.channelId = json["channelId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"channelId\":"
        __json += serializeString(input: self.channelId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "channelId", value: self.channelId))
        return __queryParts
    }
    public func clone() -> ChatMessageParams {

        return ChatMessageParams(
            channelId: self.channelId
        )
    }
    
}
    

public enum ChatMessage: ArriClientModel {
    case text(ChatMessageText)
    case image(ChatMessageImage)
    case url(ChatMessageUrl)
    public init() {
        self = .text(ChatMessageText())
    }
    public init(json: JSON) {
        let __tag = json["messageType"].string ?? ""
        switch (__tag) {
            case "TEXT":
                self = .text(ChatMessageText(json: json))
                break
            case "IMAGE":
                self = .image(ChatMessageImage(json: json))
                break
            case "URL":
                self = .url(ChatMessageUrl(json: json))
                break
            default:
                self = .text(ChatMessageText())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .text(let __innerVal):
                return __innerVal.toJSONString()
            case .image(let __innerVal):
                return __innerVal.toJSONString()
            case .url(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .text(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .image(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .url(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ChatMessage {
        switch(self) {
            case .text(let __innerVal):
                return .text(__innerVal.clone())
            case .image(let __innerVal):
                return .image(__innerVal.clone())
            case .url(let __innerVal):
                return .url(__innerVal.clone())
        }
    }
}

public struct ChatMessageText: ArriClientModel {
    let messageType: String = "TEXT"
    public var id: String = ""
    public var channelId: String = ""
    public var userId: String = ""
    public var date: Date = Date()
    public var text: String = ""
    public init(
        id: String,
        channelId: String,
        userId: String,
        date: Date,
        text: String
    ) {
            self.id = id
            self.channelId = channelId
            self.userId = userId
            self.date = date
            self.text = text
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.channelId = json["channelId"].string ?? ""
        self.userId = json["userId"].string ?? ""
        self.date = parseDate(json["date"].string ?? "") ?? Date()
        self.text = json["text"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"messageType\":\"TEXT\""
        __json += ",\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"channelId\":"
        __json += serializeString(input: self.channelId)
        __json += ",\"userId\":"
        __json += serializeString(input: self.userId)
        __json += ",\"date\":"
        __json += serializeDate(self.date)
        __json += ",\"text\":"
        __json += serializeString(input: self.text)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "messageType", value: "TEXT"))
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "channelId", value: self.channelId))
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        __queryParts.append(URLQueryItem(name: "date", value: serializeDate(self.date, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "text", value: self.text))
        return __queryParts
    }
    public func clone() -> ChatMessageText {

        return ChatMessageText(
            id: self.id,
            channelId: self.channelId,
            userId: self.userId,
            date: self.date,
            text: self.text
        )
    }
    
}
    

public struct ChatMessageImage: ArriClientModel {
    let messageType: String = "IMAGE"
    public var id: String = ""
    public var channelId: String = ""
    public var userId: String = ""
    public var date: Date = Date()
    public var image: String = ""
    public init(
        id: String,
        channelId: String,
        userId: String,
        date: Date,
        image: String
    ) {
            self.id = id
            self.channelId = channelId
            self.userId = userId
            self.date = date
            self.image = image
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.channelId = json["channelId"].string ?? ""
        self.userId = json["userId"].string ?? ""
        self.date = parseDate(json["date"].string ?? "") ?? Date()
        self.image = json["image"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"messageType\":\"IMAGE\""
        __json += ",\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"channelId\":"
        __json += serializeString(input: self.channelId)
        __json += ",\"userId\":"
        __json += serializeString(input: self.userId)
        __json += ",\"date\":"
        __json += serializeDate(self.date)
        __json += ",\"image\":"
        __json += serializeString(input: self.image)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "messageType", value: "IMAGE"))
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "channelId", value: self.channelId))
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        __queryParts.append(URLQueryItem(name: "date", value: serializeDate(self.date, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "image", value: self.image))
        return __queryParts
    }
    public func clone() -> ChatMessageImage {

        return ChatMessageImage(
            id: self.id,
            channelId: self.channelId,
            userId: self.userId,
            date: self.date,
            image: self.image
        )
    }
    
}
    

public struct ChatMessageUrl: ArriClientModel {
    let messageType: String = "URL"
    public var id: String = ""
    public var channelId: String = ""
    public var userId: String = ""
    public var date: Date = Date()
    public var url: String = ""
    public init(
        id: String,
        channelId: String,
        userId: String,
        date: Date,
        url: String
    ) {
            self.id = id
            self.channelId = channelId
            self.userId = userId
            self.date = date
            self.url = url
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.channelId = json["channelId"].string ?? ""
        self.userId = json["userId"].string ?? ""
        self.date = parseDate(json["date"].string ?? "") ?? Date()
        self.url = json["url"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"messageType\":\"URL\""
        __json += ",\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"channelId\":"
        __json += serializeString(input: self.channelId)
        __json += ",\"userId\":"
        __json += serializeString(input: self.userId)
        __json += ",\"date\":"
        __json += serializeDate(self.date)
        __json += ",\"url\":"
        __json += serializeString(input: self.url)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "messageType", value: "URL"))
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "channelId", value: self.channelId))
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        __queryParts.append(URLQueryItem(name: "date", value: serializeDate(self.date, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "url", value: self.url))
        return __queryParts
    }
    public func clone() -> ChatMessageUrl {

        return ChatMessageUrl(
            id: self.id,
            channelId: self.channelId,
            userId: self.userId,
            date: self.date,
            url: self.url
        )
    }
    
}
    

public struct TestsStreamRetryWithNewCredentialsResponse: ArriClientModel {
    public var message: String = ""
    public init(
        message: String
    ) {
            self.message = message
    }
    public init() {}
    public init(json: JSON) {
        self.message = json["message"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "message", value: self.message))
        return __queryParts
    }
    public func clone() -> TestsStreamRetryWithNewCredentialsResponse {

        return TestsStreamRetryWithNewCredentialsResponse(
            message: self.message
        )
    }
    
}
    

public struct UsersWatchUserParams: ArriClientModel {
    public var userId: String = ""
    public init(
        userId: String
    ) {
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.userId = json["userId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"userId\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        return __queryParts
    }
    public func clone() -> UsersWatchUserParams {

        return UsersWatchUserParams(
            userId: self.userId
        )
    }
    
}
    

public struct UsersWatchUserResponse: ArriClientModel {
    public var id: String = ""
    public var role: UsersWatchUserResponseRole = UsersWatchUserResponseRole.standard
    /// A profile picture
    public var photo: UserPhoto?
    public var createdAt: Date = Date()
    public var numFollowers: Int32 = 0
    public var settings: UserSettings = UserSettings()
    public var recentNotifications: [UsersWatchUserResponseRecentNotificationsElement] = []
    public var bookmarks: Dictionary<String, UsersWatchUserResponseBookmarksValue> = Dictionary()
    public var metadata: Dictionary<String, JSON> = Dictionary()
    public var randomList: [JSON] = []
    public var bio: String?
    public init(
        id: String,
        role: UsersWatchUserResponseRole,
        photo: UserPhoto?,
        createdAt: Date,
        numFollowers: Int32,
        settings: UserSettings,
        recentNotifications: [UsersWatchUserResponseRecentNotificationsElement],
        bookmarks: Dictionary<String, UsersWatchUserResponseBookmarksValue>,
        metadata: Dictionary<String, JSON>,
        randomList: [JSON],
        bio: String?
    ) {
            self.id = id
            self.role = role
            self.photo = photo
            self.createdAt = createdAt
            self.numFollowers = numFollowers
            self.settings = settings
            self.recentNotifications = recentNotifications
            self.bookmarks = bookmarks
            self.metadata = metadata
            self.randomList = randomList
            self.bio = bio
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.role = UsersWatchUserResponseRole(serialValue: json["role"].string ?? "")
        if json["photo"].dictionary != nil {
                    self.photo = UserPhoto(json: json["photo"])
                }
        self.createdAt = parseDate(json["createdAt"].string ?? "") ?? Date()
        self.numFollowers = json["numFollowers"].int32 ?? 0
        self.settings = UserSettings(json: json["settings"])
        self.recentNotifications = []
            for __recentNotificationsJsonElement in json["recentNotifications"].array ?? [] {
                var __recentNotificationsJsonElementValue: UsersWatchUserResponseRecentNotificationsElement
                        __recentNotificationsJsonElementValue = UsersWatchUserResponseRecentNotificationsElement(json: __recentNotificationsJsonElement)
                self.recentNotifications.append(__recentNotificationsJsonElementValue)
            }
        self.bookmarks = Dictionary()
            for (__key, __value) in json["bookmarks"].dictionary ?? Dictionary() {
                var __parsedValue: UsersWatchUserResponseBookmarksValue
                        __parsedValue = UsersWatchUserResponseBookmarksValue(json: __value)
                self.bookmarks[__key] = __parsedValue            
            }
        self.metadata = Dictionary()
            for (__key, __value) in json["metadata"].dictionary ?? Dictionary() {
                var __parsedValue: JSON
                        __parsedValue = __value
                self.metadata[__key] = __parsedValue            
            }
        self.randomList = []
            for __randomListJsonElement in json["randomList"].array ?? [] {
                var __randomListJsonElementValue: JSON
                        __randomListJsonElementValue = __randomListJsonElement
                self.randomList.append(__randomListJsonElementValue)
            }
        if json["bio"].exists() {
            self.bio = json["bio"].string    
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"role\":"
        __json += "\"\(self.role.serialValue())\""
        __json += ",\"photo\":"
        if self.photo != nil {
                    __json += self.photo!.toJSONString()
                } else {
                    __json += "null" 
                }
        __json += ",\"createdAt\":"
        __json += serializeDate(self.createdAt)
        __json += ",\"numFollowers\":"
        __json += "\(self.numFollowers)"
        __json += ",\"settings\":"
        __json += self.settings.toJSONString()
        __json += ",\"recentNotifications\":"
       __json += "["
            for (__index, __element) in self.recentNotifications.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += __element.toJSONString()
            }
            __json += "]"
        __json += ",\"bookmarks\":"
        __json += "{"
            for (__index, (__key, __value)) in self.bookmarks.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += "\(serializeString(input: __key)):"
                        __json += __value.toJSONString()
            }
            __json += "}"
        __json += ",\"metadata\":"
        __json += "{"
            for (__index, (__key, __value)) in self.metadata.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += "\(serializeString(input: __key)):"
                        __json += serializeAny(input: __value)
            }
            __json += "}"
        __json += ",\"randomList\":"
       __json += "["
            for (__index, __element) in self.randomList.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                        __json += serializeAny(input: __element)
            }
            __json += "]"
        if self.bio != nil {
                    __json += ",\"bio\":"
        __json += serializeString(input: self.bio!)
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "role", value: self.role.serialValue()))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/photo.")
        __queryParts.append(URLQueryItem(name: "createdAt", value: serializeDate(self.createdAt, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "numFollowers", value: "\(self.numFollowers)"))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/settings.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/recentNotifications.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/bookmarks.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/metadata.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /UsersWatchUserResponse/randomList.")
        if self.bio != nil {
                    __queryParts.append(URLQueryItem(name: "bio", value: self.bio!))
                }
        return __queryParts
    }
    public func clone() -> UsersWatchUserResponse {


var __recentNotificationsCloned: [UsersWatchUserResponseRecentNotificationsElement] = []
                for __recentNotificationsElement in self.recentNotifications {
                    
                    __recentNotificationsCloned.append(__recentNotificationsElement.clone())
                }
var __bookmarksCloned: Dictionary<String, UsersWatchUserResponseBookmarksValue> = Dictionary()
                    for (__bookmarksKey, __bookmarksValue) in self.bookmarks {
                        
                        __bookmarksCloned[__bookmarksKey] = __bookmarksValue.clone()
                    }
var __metadataCloned: Dictionary<String, JSON> = Dictionary()
                    for (__metadataKey, __metadataValue) in self.metadata {
                        
                        __metadataCloned[__metadataKey] = __metadataValue
                    }
var __randomListCloned: [JSON] = []
                for __randomListElement in self.randomList {
                    
                    __randomListCloned.append(__randomListElement)
                }
        return UsersWatchUserResponse(
            id: self.id,
            role: self.role,
            photo: self.photo?.clone(),
            createdAt: self.createdAt,
            numFollowers: self.numFollowers,
            settings: self.settings.clone(),
            recentNotifications: __recentNotificationsCloned,
            bookmarks: __bookmarksCloned,
            metadata: __metadataCloned,
            randomList: __randomListCloned,
            bio: self.bio
        )
    }
    
}
    
public enum UsersWatchUserResponseRole: ArriClientEnum {
    case standard
    case admin
    public init() {
        self = .standard
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "standard":
                self = .standard
                break;
            case "admin":
                self = .admin
                break;
            default:
                self = .standard
        }
    }
    public func serialValue() -> String {
        switch (self) {
            case .standard:
                return "standard"
            case .admin:
                return "admin"
        }
    }
}
/// A profile picture
public struct UserPhoto: ArriClientModel {
    public var url: String = ""
    public var width: Float64 = 0.0
    public var height: Float64 = 0.0
    public var bytes: Int64 = 0
    /// When the photo was last updated in nanoseconds
    public var nanoseconds: UInt64 = 0
    public init(
        url: String,
        width: Float64,
        height: Float64,
        bytes: Int64,
        nanoseconds: UInt64
    ) {
            self.url = url
            self.width = width
            self.height = height
            self.bytes = bytes
            self.nanoseconds = nanoseconds
    }
    public init() {}
    public init(json: JSON) {
        self.url = json["url"].string ?? ""
        self.width = json["width"].double ?? 0.0
        self.height = json["height"].double ?? 0.0
        self.bytes = Int64(json["bytes"].string ?? "0") ?? 0
        self.nanoseconds = UInt64(json["nanoseconds"].string ?? "0") ?? 0
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"url\":"
        __json += serializeString(input: self.url)
        __json += ",\"width\":"
        __json += "\(self.width)"
        __json += ",\"height\":"
        __json += "\(self.height)"
        __json += ",\"bytes\":"
        __json += "\"\(self.bytes)\""
        __json += ",\"nanoseconds\":"
        __json += "\"\(self.nanoseconds)\""
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "url", value: self.url))
        __queryParts.append(URLQueryItem(name: "width", value: "\(self.width)"))
        __queryParts.append(URLQueryItem(name: "height", value: "\(self.height)"))
        __queryParts.append(URLQueryItem(name: "bytes", value: "\(self.bytes)"))
        __queryParts.append(URLQueryItem(name: "nanoseconds", value: "\(self.nanoseconds)"))
        return __queryParts
    }
    public func clone() -> UserPhoto {

        return UserPhoto(
            url: self.url,
            width: self.width,
            height: self.height,
            bytes: self.bytes,
            nanoseconds: self.nanoseconds
        )
    }
    
}
    

public struct UserSettings: ArriClientModel {
    public var notificationsEnabled: Bool = false
    public var preferredTheme: UserSettingsPreferredTheme = UserSettingsPreferredTheme.darkMode
    public init(
        notificationsEnabled: Bool,
        preferredTheme: UserSettingsPreferredTheme
    ) {
            self.notificationsEnabled = notificationsEnabled
            self.preferredTheme = preferredTheme
    }
    public init() {}
    public init(json: JSON) {
        self.notificationsEnabled = json["notificationsEnabled"].bool ?? false
        self.preferredTheme = UserSettingsPreferredTheme(serialValue: json["preferredTheme"].string ?? "")
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"notificationsEnabled\":"
        __json += "\(self.notificationsEnabled)"
        __json += ",\"preferredTheme\":"
        __json += "\"\(self.preferredTheme.serialValue())\""
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "notificationsEnabled", value: "\(self.notificationsEnabled)"))
        __queryParts.append(URLQueryItem(name: "preferredTheme", value: self.preferredTheme.serialValue()))
        return __queryParts
    }
    public func clone() -> UserSettings {

        return UserSettings(
            notificationsEnabled: self.notificationsEnabled,
            preferredTheme: self.preferredTheme
        )
    }
    
}
    
public enum UserSettingsPreferredTheme: ArriClientEnum {
    case darkMode
    case lightMode
    case system
    public init() {
        self = .darkMode
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "dark-mode":
                self = .darkMode
                break;
            case "light-mode":
                self = .lightMode
                break;
            case "system":
                self = .system
                break;
            default:
                self = .darkMode
        }
    }
    public func serialValue() -> String {
        switch (self) {
            case .darkMode:
                return "dark-mode"
            case .lightMode:
                return "light-mode"
            case .system:
                return "system"
        }
    }
}
public enum UsersWatchUserResponseRecentNotificationsElement: ArriClientModel {
    case postLike(UsersWatchUserResponseRecentNotificationsElementPostLike)
    case postComment(UsersWatchUserResponseRecentNotificationsElementPostComment)
    public init() {
        self = .postLike(UsersWatchUserResponseRecentNotificationsElementPostLike())
    }
    public init(json: JSON) {
        let __tag = json["notificationType"].string ?? ""
        switch (__tag) {
            case "POST_LIKE":
                self = .postLike(UsersWatchUserResponseRecentNotificationsElementPostLike(json: json))
                break
            case "POST_COMMENT":
                self = .postComment(UsersWatchUserResponseRecentNotificationsElementPostComment(json: json))
                break
            default:
                self = .postLike(UsersWatchUserResponseRecentNotificationsElementPostLike())
                break
        }
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
            case .postLike(let __innerVal):
                return __innerVal.toJSONString()
            case .postComment(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .postLike(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .postComment(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> UsersWatchUserResponseRecentNotificationsElement {
        switch(self) {
            case .postLike(let __innerVal):
                return .postLike(__innerVal.clone())
            case .postComment(let __innerVal):
                return .postComment(__innerVal.clone())
        }
    }
}

public struct UsersWatchUserResponseRecentNotificationsElementPostLike: ArriClientModel {
    let notificationType: String = "POST_LIKE"
    public var postId: String = ""
    public var userId: String = ""
    public init(
        postId: String,
        userId: String
    ) {
            self.postId = postId
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.postId = json["postId"].string ?? ""
        self.userId = json["userId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"notificationType\":\"POST_LIKE\""
        __json += ",\"postId\":"
        __json += serializeString(input: self.postId)
        __json += ",\"userId\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "notificationType", value: "POST_LIKE"))
        __queryParts.append(URLQueryItem(name: "postId", value: self.postId))
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        return __queryParts
    }
    public func clone() -> UsersWatchUserResponseRecentNotificationsElementPostLike {

        return UsersWatchUserResponseRecentNotificationsElementPostLike(
            postId: self.postId,
            userId: self.userId
        )
    }
    
}
    

public struct UsersWatchUserResponseRecentNotificationsElementPostComment: ArriClientModel {
    let notificationType: String = "POST_COMMENT"
    public var postId: String = ""
    public var userId: String = ""
    public var commentText: String = ""
    public init(
        postId: String,
        userId: String,
        commentText: String
    ) {
            self.postId = postId
            self.userId = userId
            self.commentText = commentText
    }
    public init() {}
    public init(json: JSON) {
        self.postId = json["postId"].string ?? ""
        self.userId = json["userId"].string ?? ""
        self.commentText = json["commentText"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"notificationType\":\"POST_COMMENT\""
        __json += ",\"postId\":"
        __json += serializeString(input: self.postId)
        __json += ",\"userId\":"
        __json += serializeString(input: self.userId)
        __json += ",\"commentText\":"
        __json += serializeString(input: self.commentText)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "notificationType", value: "POST_COMMENT"))
        __queryParts.append(URLQueryItem(name: "postId", value: self.postId))
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        __queryParts.append(URLQueryItem(name: "commentText", value: self.commentText))
        return __queryParts
    }
    public func clone() -> UsersWatchUserResponseRecentNotificationsElementPostComment {

        return UsersWatchUserResponseRecentNotificationsElementPostComment(
            postId: self.postId,
            userId: self.userId,
            commentText: self.commentText
        )
    }
    
}
    

public struct UsersWatchUserResponseBookmarksValue: ArriClientModel {
    public var postId: String = ""
    public var userId: String = ""
    public init(
        postId: String,
        userId: String
    ) {
            self.postId = postId
            self.userId = userId
    }
    public init() {}
    public init(json: JSON) {
        self.postId = json["postId"].string ?? ""
        self.userId = json["userId"].string ?? ""
    }
    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"

        __json += "\"postId\":"
        __json += serializeString(input: self.postId)
        __json += ",\"userId\":"
        __json += serializeString(input: self.userId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "postId", value: self.postId))
        __queryParts.append(URLQueryItem(name: "userId", value: self.userId))
        return __queryParts
    }
    public func clone() -> UsersWatchUserResponseBookmarksValue {

        return UsersWatchUserResponseBookmarksValue(
            postId: self.postId,
            userId: self.userId
        )
    }
    
}
    
