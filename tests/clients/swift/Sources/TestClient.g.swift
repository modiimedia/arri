import Foundation
import ArriClient

public class TestClient {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>
    public let tests: TestClientTestsService
    public let users: TestClientUsersService
    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
        self.tests = TestClientTestsService(
            baseURL: baseURL,
            delegate: delegate,
            headers: headers
        )
        self.users = TestClientUsersService(
            baseURL: baseURL,
            delegate: delegate,
            headers: headers
        )    
    }

        
}

public class TestClientTestsService {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>

    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
    
    }
    public func emptyParamsGetRequest() async throws -> DefaultPayload {
        let result: DefaultPayload = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/empty-params-get-request",
            method: "GET",
            headers: self.headers,
            clientVersion: "10",
            params: EmptyArriModel()
        )
        return result
    }
    public func emptyParamsPostRequest() async throws -> DefaultPayload {
        let result: DefaultPayload = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/empty-params-post-request",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: EmptyArriModel()
        )
        return result
    }
    public func emptyResponseGetRequest(_ params: DefaultPayload) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/empty-response-get-request",
            method: "GET",
            headers: self.headers,
            clientVersion: "10",
            params: params
        )
        
    }
    public func emptyResponsePostRequest(_ params: DefaultPayload) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/empty-response-post-request",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params
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
            params: params
        )
        
    }
    public func sendError(_ params: SendErrorParams) async throws -> () {
        let _: EmptyArriModel = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-error",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params
        )
        
    }
    public func sendObject(_ params: ObjectWithEveryType) async throws -> ObjectWithEveryType {
        let result: ObjectWithEveryType = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-object",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params
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
            params: params
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
            params: params
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
            params: params
        )
        return result
    }
    public func sendRecursiveUnion(_ params: RecursiveUnion) async throws -> RecursiveUnion {
        let result: RecursiveUnion = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/rpcs/tests/send-recursive-union",
            method: "POST",
            headers: self.headers,
            clientVersion: "10",
            params: params
        )
        return result
    }
    public func streamAutoReconnect(_ params: AutoReconnectParams, options: EventSourceOptions<AutoReconnectResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<AutoReconnectResponse>(
                url: "\(self.baseURL)/rpcs/tests/stream-auto-reconnect",
                method: "GET",
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
                method: "GET",
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
                method: "GET",
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
                method: "GET",
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
                method: "GET",
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
                method: "GET",
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
    public func websocketRpc(_ params: WsMessageParams) async throws -> WsMessageResponse {
        throw ArriRequestError.notImplemented
    }
    public func websocketRpcSendTenLargeMessages() async throws -> StreamLargeObjectsResponse {
        throw ArriRequestError.notImplemented
    }
        
}


public class TestClientUsersService {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>

    public init(
        baseURL: String,
        delegate: ArriRequestDelegate,
        headers: @escaping () -> Dictionary<String, String>
    ) {
        self.baseURL = baseURL
        self.delegate = delegate
        self.headers = headers
    
    }
    public func watchUser(_ params: UsersWatchUserParams, options: EventSourceOptions<UsersWatchUserResponse>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<UsersWatchUserResponse>(
                url: "\(self.baseURL)/rpcs/users/watch-user",
                method: "GET",
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
    public var record: Dictionary<String, Bool> = Dictionary()
    public var discriminator: ObjectWithEveryTypeDiscriminator = ObjectWithEveryTypeDiscriminator()
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
        record: Dictionary<String, Bool>,
        discriminator: ObjectWithEveryTypeDiscriminator,
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
            self.discriminator = discriminator
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
                var __parsedValue: Bool
                        __parsedValue = __value.bool ?? false
                self.record[__key] = __parsedValue            
            }
        self.discriminator = ObjectWithEveryTypeDiscriminator(json: json["discriminator"])
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
                __json += "\"\(__key)\":"
                        __json += "\(__value)"
            }
            __json += "}"
        __json += ",\"discriminator\":"
        __json += self.discriminator.toJSONString()
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
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/discriminator.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedObject.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/nestedArray.")
        return __queryParts
    }
    public func clone() -> ObjectWithEveryType {
var __arrayCloned: [Bool] = []
                for __arrayElement in self.array {
                    
                    __arrayCloned.append(__arrayElement)
                }

var __recordCloned: Dictionary<String, Bool> = Dictionary()
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
            discriminator: self.discriminator.clone(),
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
    

public enum ObjectWithEveryTypeDiscriminator: ArriClientModel {
    case a(ObjectWithEveryTypeDiscriminatorA)
    case b(ObjectWithEveryTypeDiscriminatorB)
    public init() {
        self = .a(ObjectWithEveryTypeDiscriminatorA())
    }
    public init(json: JSON) {
        let discriminator = json["type"].string ?? ""
        switch (discriminator) {
            case "A":
                self = .a(ObjectWithEveryTypeDiscriminatorA(json: json))
                break
            case "B":
                self = .b(ObjectWithEveryTypeDiscriminatorB(json: json))
                break
            default:
                self = .a(ObjectWithEveryTypeDiscriminatorA())
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
            case .a(let __innerVal):
                return __innerVal.toJSONString()
            case .b(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .b(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ObjectWithEveryTypeDiscriminator {
        switch(self) {
            case .a(let __innerVal):
                return .a(__innerVal.clone())
            case .b(let __innerVal):
                return .b(__innerVal.clone())
        }
    }
}
    
public struct ObjectWithEveryTypeDiscriminatorA: ArriClientModel {
    let type: String = "A"
    public var title: String = ""
    public init(
        title: String
    ) {
            self.title = title
    }
    public init() {}
    public init(json: JSON) {
        self.title = json["title"].string ?? ""
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

        __json += "\"type\":\"A\""
        __json += ",\"title\":"
        __json += serializeString(input: self.title)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "A"))
        __queryParts.append(URLQueryItem(name: "title", value: self.title))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeDiscriminatorA {

        return ObjectWithEveryTypeDiscriminatorA(
            title: self.title
        )
    }
    
}
    

public struct ObjectWithEveryTypeDiscriminatorB: ArriClientModel {
    let type: String = "B"
    public var title: String = ""
    public var description: String = ""
    public init(
        title: String,
        description: String
    ) {
            self.title = title
            self.description = description
    }
    public init() {}
    public init(json: JSON) {
        self.title = json["title"].string ?? ""
        self.description = json["description"].string ?? ""
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

        __json += "\"type\":\"B\""
        __json += ",\"title\":"
        __json += serializeString(input: self.title)
        __json += ",\"description\":"
        __json += serializeString(input: self.description)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "B"))
        __queryParts.append(URLQueryItem(name: "title", value: self.title))
        __queryParts.append(URLQueryItem(name: "description", value: self.description))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryTypeDiscriminatorB {

        return ObjectWithEveryTypeDiscriminatorB(
            title: self.title,
            description: self.description
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
    public var record: Dictionary<String, Bool?>?
    public var discriminator: ObjectWithEveryNullableTypeDiscriminator?
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
        record: Dictionary<String, Bool?>?,
        discriminator: ObjectWithEveryNullableTypeDiscriminator?,
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
            self.discriminator = discriminator
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
                var __parsedValue: Bool?
                        if __value.bool != nil {
                    __parsedValue = __value.bool
                }
                self.record![__key] = __parsedValue            
            }
                }
        if json["discriminator"].dictionary != nil {
                    self.discriminator = ObjectWithEveryNullableTypeDiscriminator(json: json["discriminator"])
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
                __json += "\"\(__key)\":"
                        if __value != nil {
                    __json += "\(__value!)"
                } else {
                    __json += "null" 
                }
            }
            __json += "}"
                } else {
                    __json += "null" 
                }
        __json += ",\"discriminator\":"
        if self.discriminator != nil {
                    __json += self.discriminator!.toJSONString()
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
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryNullableType/discriminator.")
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

var __recordCloned: Dictionary<String, Bool?>?
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
            discriminator: self.discriminator?.clone(),
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
    

public enum ObjectWithEveryNullableTypeDiscriminator: ArriClientModel {
    case a(ObjectWithEveryNullableTypeDiscriminatorA)
    case b(ObjectWithEveryNullableTypeDiscriminatorB)
    public init() {
        self = .a(ObjectWithEveryNullableTypeDiscriminatorA())
    }
    public init(json: JSON) {
        let discriminator = json["type"].string ?? ""
        switch (discriminator) {
            case "A":
                self = .a(ObjectWithEveryNullableTypeDiscriminatorA(json: json))
                break
            case "B":
                self = .b(ObjectWithEveryNullableTypeDiscriminatorB(json: json))
                break
            default:
                self = .a(ObjectWithEveryNullableTypeDiscriminatorA())
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
            case .a(let __innerVal):
                return __innerVal.toJSONString()
            case .b(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .b(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ObjectWithEveryNullableTypeDiscriminator {
        switch(self) {
            case .a(let __innerVal):
                return .a(__innerVal.clone())
            case .b(let __innerVal):
                return .b(__innerVal.clone())
        }
    }
}
    
public struct ObjectWithEveryNullableTypeDiscriminatorA: ArriClientModel {
    let type: String = "A"
    public var title: String?
    public init(
        title: String?
    ) {
            self.title = title
    }
    public init() {}
    public init(json: JSON) {
        if json["title"].string != nil {
            self.title = json["title"].string
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

        __json += "\"type\":\"A\""
        __json += ",\"title\":"
        if self.title != nil {
                    __json += serializeString(input: self.title!)
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "A"))
        if self.title != nil {
                    __queryParts.append(URLQueryItem(name: "title", value: self.title!))
                } else {
                    __queryParts.append(URLQueryItem(name: "title", value: "null")) 
                }
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeDiscriminatorA {

        return ObjectWithEveryNullableTypeDiscriminatorA(
            title: self.title
        )
    }
    
}
    

public struct ObjectWithEveryNullableTypeDiscriminatorB: ArriClientModel {
    let type: String = "B"
    public var title: String?
    public var description: String?
    public init(
        title: String?,
        description: String?
    ) {
            self.title = title
            self.description = description
    }
    public init() {}
    public init(json: JSON) {
        if json["title"].string != nil {
            self.title = json["title"].string
        }
        if json["description"].string != nil {
            self.description = json["description"].string
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

        __json += "\"type\":\"B\""
        __json += ",\"title\":"
        if self.title != nil {
                    __json += serializeString(input: self.title!)
                } else {
                    __json += "null" 
                }
        __json += ",\"description\":"
        if self.description != nil {
                    __json += serializeString(input: self.description!)
                } else {
                    __json += "null" 
                }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "B"))
        if self.title != nil {
                    __queryParts.append(URLQueryItem(name: "title", value: self.title!))
                } else {
                    __queryParts.append(URLQueryItem(name: "title", value: "null")) 
                }
        if self.description != nil {
                    __queryParts.append(URLQueryItem(name: "description", value: self.description!))
                } else {
                    __queryParts.append(URLQueryItem(name: "description", value: "null")) 
                }
        return __queryParts
    }
    public func clone() -> ObjectWithEveryNullableTypeDiscriminatorB {

        return ObjectWithEveryNullableTypeDiscriminatorB(
            title: self.title,
            description: self.description
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
    public var record: Dictionary<String, Bool>?
    public var discriminator: ObjectWithEveryOptionalTypeDiscriminator?
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
        record: Dictionary<String, Bool>?,
        discriminator: ObjectWithEveryOptionalTypeDiscriminator?,
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
            self.discriminator = discriminator
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
                var __parsedValue: Bool
                        __parsedValue = __value.bool ?? false
                self.record![__key] = __parsedValue            
            }
                }
        if json["discriminator"].exists() {
                    self.discriminator = ObjectWithEveryOptionalTypeDiscriminator(json: json["discriminator"])
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
                __json += "\"\(__key)\":"
                        __json += "\(__value)"
            }
            __json += "}"            
__numKeys += 1
        }
        if self.discriminator != nil {
                        if __numKeys > 0 {
                    __json += ","
                }
            __json += "\"discriminator\":"
        __json += self.discriminator!.toJSONString()            
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
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryOptionalType/discriminator.")
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

var __recordCloned: Dictionary<String, Bool>?
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
            discriminator: self.discriminator?.clone(),
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
    

public enum ObjectWithEveryOptionalTypeDiscriminator: ArriClientModel {
    case a(ObjectWithEveryOptionalTypeDiscriminatorA)
    case b(ObjectWithEveryOptionalTypeDiscriminatorB)
    public init() {
        self = .a(ObjectWithEveryOptionalTypeDiscriminatorA())
    }
    public init(json: JSON) {
        let discriminator = json["type"].string ?? ""
        switch (discriminator) {
            case "A":
                self = .a(ObjectWithEveryOptionalTypeDiscriminatorA(json: json))
                break
            case "B":
                self = .b(ObjectWithEveryOptionalTypeDiscriminatorB(json: json))
                break
            default:
                self = .a(ObjectWithEveryOptionalTypeDiscriminatorA())
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
            case .a(let __innerVal):
                return __innerVal.toJSONString()
            case .b(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .b(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> ObjectWithEveryOptionalTypeDiscriminator {
        switch(self) {
            case .a(let __innerVal):
                return .a(__innerVal.clone())
            case .b(let __innerVal):
                return .b(__innerVal.clone())
        }
    }
}
    
public struct ObjectWithEveryOptionalTypeDiscriminatorA: ArriClientModel {
    let type: String = "A"
    public var title: String = ""
    public init(
        title: String
    ) {
            self.title = title
    }
    public init() {}
    public init(json: JSON) {
        self.title = json["title"].string ?? ""
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

        __json += "\"type\":\"A\""
        __json += ",\"title\":"
        __json += serializeString(input: self.title)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "A"))
        __queryParts.append(URLQueryItem(name: "title", value: self.title))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeDiscriminatorA {

        return ObjectWithEveryOptionalTypeDiscriminatorA(
            title: self.title
        )
    }
    
}
    

public struct ObjectWithEveryOptionalTypeDiscriminatorB: ArriClientModel {
    let type: String = "B"
    public var title: String = ""
    public var description: String = ""
    public init(
        title: String,
        description: String
    ) {
            self.title = title
            self.description = description
    }
    public init() {}
    public init(json: JSON) {
        self.title = json["title"].string ?? ""
        self.description = json["description"].string ?? ""
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

        __json += "\"type\":\"B\""
        __json += ",\"title\":"
        __json += serializeString(input: self.title)
        __json += ",\"description\":"
        __json += serializeString(input: self.description)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "B"))
        __queryParts.append(URLQueryItem(name: "title", value: self.title))
        __queryParts.append(URLQueryItem(name: "description", value: self.description))
        return __queryParts
    }
    public func clone() -> ObjectWithEveryOptionalTypeDiscriminatorB {

        return ObjectWithEveryOptionalTypeDiscriminatorB(
            title: self.title,
            description: self.description
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
    

public enum RecursiveUnion: ArriClientModel {
    case child(RecursiveUnionChild)
    case children(RecursiveUnionChildren)
    case text(RecursiveUnionText)
    case shape(RecursiveUnionShape)
    public init() {
        self = .children(RecursiveUnionChildren())
    }
    public init(json: JSON) {
        let discriminator = json["type"].string ?? ""
        switch (discriminator) {
            case "CHILD":
                self = .child(RecursiveUnionChild(json: json))
                break
            case "CHILDREN":
                self = .children(RecursiveUnionChildren(json: json))
                break
            case "TEXT":
                self = .text(RecursiveUnionText(json: json))
                break
            case "SHAPE":
                self = .shape(RecursiveUnionShape(json: json))
                break
            default:
                self = .children(RecursiveUnionChildren())
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
    public func clone() -> RecursiveUnion {
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
    
/// Child node
public final class RecursiveUnionChild: ArriClientModel {
    let type: String = "CHILD"
    public var data: RecursiveUnion = RecursiveUnion()
    public required init(
        data: RecursiveUnion
    ) {
            self.data = data
    }
    public required init() {}
    public required init(json: JSON) {
self.data = RecursiveUnion(json: json["data"])
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

        __json += "\"type\":\"CHILD\""
        __json += ",\"data\":"
__json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "CHILD"))
print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionChild/data.")
        return __queryParts
    }
    public func clone() -> RecursiveUnionChild {

        return RecursiveUnionChild(
            data: self.data.clone()
        )
    }
    public static func == (lhs: RecursiveUnionChild, rhs: RecursiveUnionChild) -> Bool {
            return
               lhs.type == rhs.type &&
               lhs.data == rhs.data
        }
}
    

/// List of children node
public struct RecursiveUnionChildren: ArriClientModel {
    let type: String = "CHILDREN"
    public var data: [RecursiveUnion] = []
    public init(
        data: [RecursiveUnion]
    ) {
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.data = []
            for __dataJsonElement in json["data"].array ?? [] {
                var __dataJsonElementValue: RecursiveUnion
                __dataJsonElementValue = RecursiveUnion(json: __dataJsonElement)
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

        __json += "\"type\":\"CHILDREN\""
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
        __queryParts.append(URLQueryItem(name: "type", value: "CHILDREN"))
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /RecursiveUnionChildren/data.")
        return __queryParts
    }
    public func clone() -> RecursiveUnionChildren {
var __dataCloned: [RecursiveUnion] = []
                for __dataElement in self.data {
                    
                    __dataCloned.append(__dataElement.clone())
                }
        return RecursiveUnionChildren(
            data: __dataCloned
        )
    }
    
}
    

/// Text node
public struct RecursiveUnionText: ArriClientModel {
    let type: String = "TEXT"
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

        __json += "\"type\":\"TEXT\""
        __json += ",\"data\":"
        __json += serializeString(input: self.data)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "TEXT"))
        __queryParts.append(URLQueryItem(name: "data", value: self.data))
        return __queryParts
    }
    public func clone() -> RecursiveUnionText {

        return RecursiveUnionText(
            data: self.data
        )
    }
    
}
    

/// Shape node
public struct RecursiveUnionShape: ArriClientModel {
    let type: String = "SHAPE"
    public var data: RecursiveUnionShapeData = RecursiveUnionShapeData()
    public init(
        data: RecursiveUnionShapeData
    ) {
            self.data = data
    }
    public init() {}
    public init(json: JSON) {
        self.data = RecursiveUnionShapeData(json: json["data"])
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

        __json += "\"type\":\"SHAPE\""
        __json += ",\"data\":"
        __json += self.data.toJSONString()
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "SHAPE"))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveUnionShape/data.")
        return __queryParts
    }
    public func clone() -> RecursiveUnionShape {

        return RecursiveUnionShape(
            data: self.data.clone()
        )
    }
    
}
    
public struct RecursiveUnionShapeData: ArriClientModel {
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
    public func clone() -> RecursiveUnionShapeData {

        return RecursiveUnionShapeData(
            width: self.width,
            height: self.height,
            color: self.color
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
        let discriminator = json["messageType"].string ?? ""
        switch (discriminator) {
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
    

public enum WsMessageParams: ArriClientModel {
    case createEntity(WsMessageParamsCreateEntity)
    case updateEntity(WsMessageParamsUpdateEntity)
    case disconnect(WsMessageParamsDisconnect)
    public init() {
        self = .createEntity(WsMessageParamsCreateEntity())
    }
    public init(json: JSON) {
        let discriminator = json["type"].string ?? ""
        switch (discriminator) {
            case "CREATE_ENTITY":
                self = .createEntity(WsMessageParamsCreateEntity(json: json))
                break
            case "UPDATE_ENTITY":
                self = .updateEntity(WsMessageParamsUpdateEntity(json: json))
                break
            case "DISCONNECT":
                self = .disconnect(WsMessageParamsDisconnect(json: json))
                break
            default:
                self = .createEntity(WsMessageParamsCreateEntity())
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
            case .createEntity(let __innerVal):
                return __innerVal.toJSONString()
            case .updateEntity(let __innerVal):
                return __innerVal.toJSONString()
            case .disconnect(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .createEntity(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .updateEntity(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .disconnect(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> WsMessageParams {
        switch(self) {
            case .createEntity(let __innerVal):
                return .createEntity(__innerVal.clone())
            case .updateEntity(let __innerVal):
                return .updateEntity(__innerVal.clone())
            case .disconnect(let __innerVal):
                return .disconnect(__innerVal.clone())
        }
    }
}
    
public struct WsMessageParamsCreateEntity: ArriClientModel {
    let type: String = "CREATE_ENTITY"
    public var entityId: String = ""
    public var x: Float64 = 0.0
    public var y: Float64 = 0.0
    public init(
        entityId: String,
        x: Float64,
        y: Float64
    ) {
            self.entityId = entityId
            self.x = x
            self.y = y
    }
    public init() {}
    public init(json: JSON) {
        self.entityId = json["entityId"].string ?? ""
        self.x = json["x"].double ?? 0.0
        self.y = json["y"].double ?? 0.0
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

        __json += "\"type\":\"CREATE_ENTITY\""
        __json += ",\"entityId\":"
        __json += serializeString(input: self.entityId)
        __json += ",\"x\":"
        __json += "\(self.x)"
        __json += ",\"y\":"
        __json += "\(self.y)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "CREATE_ENTITY"))
        __queryParts.append(URLQueryItem(name: "entityId", value: self.entityId))
        __queryParts.append(URLQueryItem(name: "x", value: "\(self.x)"))
        __queryParts.append(URLQueryItem(name: "y", value: "\(self.y)"))
        return __queryParts
    }
    public func clone() -> WsMessageParamsCreateEntity {

        return WsMessageParamsCreateEntity(
            entityId: self.entityId,
            x: self.x,
            y: self.y
        )
    }
    
}
    

public struct WsMessageParamsUpdateEntity: ArriClientModel {
    let type: String = "UPDATE_ENTITY"
    public var entityId: String = ""
    public var x: Float64 = 0.0
    public var y: Float64 = 0.0
    public init(
        entityId: String,
        x: Float64,
        y: Float64
    ) {
            self.entityId = entityId
            self.x = x
            self.y = y
    }
    public init() {}
    public init(json: JSON) {
        self.entityId = json["entityId"].string ?? ""
        self.x = json["x"].double ?? 0.0
        self.y = json["y"].double ?? 0.0
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

        __json += "\"type\":\"UPDATE_ENTITY\""
        __json += ",\"entityId\":"
        __json += serializeString(input: self.entityId)
        __json += ",\"x\":"
        __json += "\(self.x)"
        __json += ",\"y\":"
        __json += "\(self.y)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "UPDATE_ENTITY"))
        __queryParts.append(URLQueryItem(name: "entityId", value: self.entityId))
        __queryParts.append(URLQueryItem(name: "x", value: "\(self.x)"))
        __queryParts.append(URLQueryItem(name: "y", value: "\(self.y)"))
        return __queryParts
    }
    public func clone() -> WsMessageParamsUpdateEntity {

        return WsMessageParamsUpdateEntity(
            entityId: self.entityId,
            x: self.x,
            y: self.y
        )
    }
    
}
    

public struct WsMessageParamsDisconnect: ArriClientModel {
    let type: String = "DISCONNECT"
    public var reason: String = ""
    public init(
        reason: String
    ) {
            self.reason = reason
    }
    public init() {}
    public init(json: JSON) {
        self.reason = json["reason"].string ?? ""
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

        __json += "\"type\":\"DISCONNECT\""
        __json += ",\"reason\":"
        __json += serializeString(input: self.reason)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "DISCONNECT"))
        __queryParts.append(URLQueryItem(name: "reason", value: self.reason))
        return __queryParts
    }
    public func clone() -> WsMessageParamsDisconnect {

        return WsMessageParamsDisconnect(
            reason: self.reason
        )
    }
    
}
    

public enum WsMessageResponse: ArriClientModel {
    case entityCreated(WsMessageResponseEntityCreated)
    case entityUpdated(WsMessageResponseEntityUpdated)
    public init() {
        self = .entityCreated(WsMessageResponseEntityCreated())
    }
    public init(json: JSON) {
        let discriminator = json["type"].string ?? ""
        switch (discriminator) {
            case "ENTITY_CREATED":
                self = .entityCreated(WsMessageResponseEntityCreated(json: json))
                break
            case "ENTITY_UPDATED":
                self = .entityUpdated(WsMessageResponseEntityUpdated(json: json))
                break
            default:
                self = .entityCreated(WsMessageResponseEntityCreated())
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
            case .entityCreated(let __innerVal):
                return __innerVal.toJSONString()
            case .entityUpdated(let __innerVal):
                return __innerVal.toJSONString()
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .entityCreated(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .entityUpdated(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> WsMessageResponse {
        switch(self) {
            case .entityCreated(let __innerVal):
                return .entityCreated(__innerVal.clone())
            case .entityUpdated(let __innerVal):
                return .entityUpdated(__innerVal.clone())
        }
    }
}
    
public struct WsMessageResponseEntityCreated: ArriClientModel {
    let type: String = "ENTITY_CREATED"
    public var entityId: String = ""
    public var x: Float64 = 0.0
    public var y: Float64 = 0.0
    public init(
        entityId: String,
        x: Float64,
        y: Float64
    ) {
            self.entityId = entityId
            self.x = x
            self.y = y
    }
    public init() {}
    public init(json: JSON) {
        self.entityId = json["entityId"].string ?? ""
        self.x = json["x"].double ?? 0.0
        self.y = json["y"].double ?? 0.0
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

        __json += "\"type\":\"ENTITY_CREATED\""
        __json += ",\"entityId\":"
        __json += serializeString(input: self.entityId)
        __json += ",\"x\":"
        __json += "\(self.x)"
        __json += ",\"y\":"
        __json += "\(self.y)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "ENTITY_CREATED"))
        __queryParts.append(URLQueryItem(name: "entityId", value: self.entityId))
        __queryParts.append(URLQueryItem(name: "x", value: "\(self.x)"))
        __queryParts.append(URLQueryItem(name: "y", value: "\(self.y)"))
        return __queryParts
    }
    public func clone() -> WsMessageResponseEntityCreated {

        return WsMessageResponseEntityCreated(
            entityId: self.entityId,
            x: self.x,
            y: self.y
        )
    }
    
}
    

public struct WsMessageResponseEntityUpdated: ArriClientModel {
    let type: String = "ENTITY_UPDATED"
    public var entityId: String = ""
    public var x: Float64 = 0.0
    public var y: Float64 = 0.0
    public init(
        entityId: String,
        x: Float64,
        y: Float64
    ) {
            self.entityId = entityId
            self.x = x
            self.y = y
    }
    public init() {}
    public init(json: JSON) {
        self.entityId = json["entityId"].string ?? ""
        self.x = json["x"].double ?? 0.0
        self.y = json["y"].double ?? 0.0
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

        __json += "\"type\":\"ENTITY_UPDATED\""
        __json += ",\"entityId\":"
        __json += serializeString(input: self.entityId)
        __json += ",\"x\":"
        __json += "\(self.x)"
        __json += ",\"y\":"
        __json += "\(self.y)"
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "type", value: "ENTITY_UPDATED"))
        __queryParts.append(URLQueryItem(name: "entityId", value: self.entityId))
        __queryParts.append(URLQueryItem(name: "x", value: "\(self.x)"))
        __queryParts.append(URLQueryItem(name: "y", value: "\(self.y)"))
        return __queryParts
    }
    public func clone() -> WsMessageResponseEntityUpdated {

        return WsMessageResponseEntityUpdated(
            entityId: self.entityId,
            x: self.x,
            y: self.y
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
                __json += "\"\(__key)\":"
                        __json += __value.toJSONString()
            }
            __json += "}"
        __json += ",\"metadata\":"
        __json += "{"
            for (__index, (__key, __value)) in self.metadata.enumerated() {
                if __index > 0 {
                    __json += ","
                }
                __json += "\"\(__key)\":"
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
        let discriminator = json["notificationType"].string ?? ""
        switch (discriminator) {
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
    
