import Foundation
import ArriClient

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public class ExampleClient {
    let baseURL: String
    let delegate: ArriRequestDelegate
    let headers: () -> Dictionary<String, String>
    let onError: (Error) -> Void 
    public let books: ExampleClientBooksService

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
        self.books = ExampleClientBooksService(
            baseURL: baseURL,
            delegate: delegate,
            headers: headers,
            onError: onError
        )
    }

    public func sendObject(_ params: NestedObject) async throws -> NestedObject {
        let result: NestedObject = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/send-object",
            method: "POST",
            headers: self.headers,
            clientVersion: "20",
            params: params,
            onError: onError
        )
        return result
    }
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public class ExampleClientBooksService {
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
    /// Get a book
    public func getBook(_ params: BookParams) async throws -> Book {
        let result: Book = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/books/get-book",
            method: "GET",
            headers: self.headers,
            clientVersion: "20",
            params: params,
            onError: onError
        )
        return result
    }
    /// Create a book
    @available(*, deprecated)
    public func createBook(_ params: Book) async throws -> Book {
        let result: Book = try await parsedArriHttpRequest(
            delegate: self.delegate,
            url: "\(self.baseURL)/books/create-book",
            method: "POST",
            headers: self.headers,
            clientVersion: "20",
            params: params,
            onError: onError
        )
        return result
    }
    @available(*, deprecated)
    public func watchBook(_ params: BookParams, options: EventSourceOptions<Book>) -> Task<(), Never> {
        let task = Task {
            var eventSource = EventSource<Book>(
                url: "\(self.baseURL)/books/watch-book",
                method: "GET",
                headers: self.headers,
                params: params,
                delegate: self.delegate,
                clientVersion: "20", 
                options: options
            )
            await eventSource.sendRequest()
        }
        return task
    }
    public func createConnection(_ params: BookParams) async throws -> Book {
        throw ArriRequestError.notImplemented
    }
}

public struct EmptyObject: ArriClientModel {
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
        var __numKeys = 0
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
       return []
    }
    public func clone() -> EmptyObject {
        return EmptyObject(
        )
    }
}

/// This is a book
public struct Book: ArriClientModel {
    /// The book ID
    public var id: String = ""
    /// The book title
    public var name: String = ""
    /// When the book was created
    @available(*, deprecated)
    public var createdAt: Date = Date()
    @available(*, deprecated)
    public var updatedAt: Date = Date()

    public init(
        id: String,
        name: String,
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.name = name
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.name = json["name"].string ?? ""
        self.createdAt = parseDate(json["createdAt"].string ?? "") ?? Date()
        self.updatedAt = parseDate(json["updatedAt"].string ?? "") ?? Date()
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
        __json += ",\"createdAt\":"
        __json += serializeDate(self.createdAt)
        __json += ",\"updatedAt\":"
        __json += serializeDate(self.updatedAt)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "name", value: self.name))
        __queryParts.append(URLQueryItem(name: "createdAt", value: serializeDate(self.createdAt, withQuotes: false)))
        __queryParts.append(URLQueryItem(name: "updatedAt", value: serializeDate(self.updatedAt, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> Book {
        return Book(
            id: self.id,
            name: self.name,
            createdAt: self.createdAt,
            updatedAt: self.updatedAt
        )
    }
}

public struct BookParams: ArriClientModel {
    public var bookId: String = ""

    public init(
        bookId: String
    ) {
        self.bookId = bookId
    }
    public init() {}
    public init(json: JSON) {
        self.bookId = json["bookId"].string ?? ""
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
        __json += "\"bookId\":"
        __json += serializeString(input: self.bookId)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "bookId", value: self.bookId))
        return __queryParts
    }
    public func clone() -> BookParams {
        return BookParams(
            bookId: self.bookId
        )
    }
}

public struct NestedObject: ArriClientModel {
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
    public func clone() -> NestedObject {
        return NestedObject(
            id: self.id,
            content: self.content
        )
    }
}

public struct ObjectWithEveryType: ArriClientModel {
    public var string: String = ""
    public var boolean: Bool = false
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
    public var `enum`: Enumerator = Enumerator.foo
    public var object: NestedObject = NestedObject()
    public var array: [Bool] = []
    public var record: Dictionary<String, Bool> = Dictionary()
    public var unionExternal: UnionExternal = UnionExternal()
    public var unionInternal: UnionInternal = UnionInternal()
    public var unionAdjacent: UnionAdjacent = UnionAdjacent()
    public var any: JSON = JSON()

    public init(
        string: String,
        boolean: Bool,
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
        `enum`: Enumerator,
        object: NestedObject,
        array: [Bool],
        record: Dictionary<String, Bool>,
        unionExternal: UnionExternal,
        unionInternal: UnionInternal,
        unionAdjacent: UnionAdjacent,
        any: JSON
    ) {
        self.string = string
        self.boolean = boolean
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
        self.`enum` = `enum`
        self.object = object
        self.array = array
        self.record = record
        self.unionExternal = unionExternal
        self.unionInternal = unionInternal
        self.unionAdjacent = unionAdjacent
        self.any = any
    }
    public init() {}
    public init(json: JSON) {
        self.string = json["string"].string ?? ""
        self.boolean = json["boolean"].bool ?? false
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
        self.`enum` = Enumerator(serialValue: json["enum"].string ?? "")
        self.object = NestedObject(json: json["object"])
        self.array = []
        for __arrayJsonElement in json["array"].array ?? [] {
            var __arrayJsonElementValue: Bool
            __arrayJsonElementValue = __arrayJsonElement.bool ?? false
            self.array.append(__arrayJsonElementValue)
        }
        self.record = Dictionary()
        for (__key, __value) in json["record"].dictionary ?? Dictionary() {
            var __parsedValue: Bool
            __parsedValue = __value.bool ?? false
            self.record[__key] = __parsedValue
        }
        self.unionExternal = UnionExternal(json: json["unionExternal"])
        self.unionInternal = UnionInternal(json: json["unionInternal"])
        self.unionAdjacent = UnionAdjacent(json: json["unionAdjacent"])
        self.any = json["any"]
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
        __json += ",\"enum\":"
        __json += "\"\(self.`enum`.serialValue())\""
        __json += ",\"object\":"
        __json += self.object.toJSONString()
        __json += ",\"array\":"
        __json += "["
        for (__index, __element) in self.array.enumerated() {
            if __index > 0 {
                __json += ","
            }
            __json += "\(__element)"
        }
        __json += "]"
        __json += ",\"record\":"
        __json += "{"
        for (__index, (__key, __value)) in self.record.enumerated() {
            if __index > 0 {
                __json += ","
            }
            __json += "\(serializeString(input: __key)):"
            __json += "\(__value)"
        }
        __json += "}"
        __json += ",\"unionExternal\":"
        __json += self.unionExternal.toJSONString()
        __json += ",\"unionInternal\":"
        __json += self.unionInternal.toJSONString()
        __json += ",\"unionAdjacent\":"
        __json += self.unionAdjacent.toJSONString()
        __json += ",\"any\":"
        __json += serializeAny(input: self.any)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "string", value: self.string))
        __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean)"))
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
        __queryParts.append(URLQueryItem(name: "enum", value: self.`enum`.serialValue()))
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionExternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionInternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/unionAdjacent.")
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryType/any.")
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
        return ObjectWithEveryType(
            string: self.string,
            boolean: self.boolean,
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
            enum: self.`enum`,
            object: self.object.clone(),
            array: __arrayCloned,
            record: __recordCloned,
            unionExternal: self.unionExternal.clone(),
            unionInternal: self.unionInternal.clone(),
            unionAdjacent: self.unionAdjacent.clone(),
            any: self.any
        )
    }
}

public enum Enumerator: ArriClientEnum {
    case foo
    case bar
    case baz

    public init() {
        self = .foo
    }
    public init(serialValue: String) {
        switch(serialValue) {
            case "FOO":
                self = .foo
                break;
            case "BAR":
                self = .bar
                break;
            case "BAZ":
                self = .baz
                break;
            default:
                self = .foo
       }
    }
    public func serialValue() -> String {
        switch (self) {
            case .foo:
                return "FOO"
            case .bar:
                return "BAR"
            case .baz:
                return "BAZ"
        }
    }
}

public enum UnionExternal: ArriClientModel {
    case object(NestedObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(NestedObject())
    }
    public init(json: JSON) {
        if json["object"].exists() {
            var __variantValue: NestedObject
            __variantValue = NestedObject(json: json["object"])
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
            self = .object(NestedObject())
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
        print("[WARNING] unions cannot be serialized to query params. Skipping UnionExternal.")
        return []
    }
    public func clone() -> UnionExternal {
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

public enum UnionInternal: ArriClientModel {
    case rectangle(UnionInternalRectangle)
    case circle(UnionInternalCircle)
    public init() {
        self = .rectangle(UnionInternalRectangle())
    }
    public init(json: JSON) {
        let __tag = json["shape"].string ?? ""
        switch (__tag) {
            case "rectangle":
                self = .rectangle(UnionInternalRectangle(json: json))
                break
            case "circle":
                self = .circle(UnionInternalCircle(json: json))
                break
            default:
                self = .rectangle(UnionInternalRectangle())
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
    public func clone() -> UnionInternal {
        switch(self) {
            case .rectangle(let __innerVal):
                return .rectangle(__innerVal.clone())
            case .circle(let __innerVal):
                return .circle(__innerVal.clone())
        }
    }
}

public struct UnionInternalRectangle: ArriClientModel {
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
    public func clone() -> UnionInternalRectangle {
        return UnionInternalRectangle(
        width: self.width,
        height: self.height
        )
    }
}

public struct UnionInternalCircle: ArriClientModel {
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
    public func clone() -> UnionInternalCircle {
        return UnionInternalCircle(
        radius: self.radius
        )
    }
}

public enum UnionAdjacent: ArriClientModel {
    case object(NestedObject)
    case array([String])
    case boolean(Bool)
    case nullableTimestamp(Date?)
    public init() {
        self = .object(NestedObject())
    }
    public init(json: JSON) {
        let __tag = json["kind"].string ?? ""
        switch (__tag) {
            case "object":
                var __variantValue: NestedObject
                __variantValue = NestedObject(json: json["data"])
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
                self = .object(NestedObject())
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
        print("[WARNING] unions cannot be serialized to query params. Skipping UnionAdjacent.")
        return []
    }
    public func clone() -> UnionAdjacent {
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

public struct ObjectWithOptionalFields: ArriClientModel {
    public var string: String?
    public var boolean: Bool?
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
    public var `enum`: Enumerator?
    public var object: NestedObject?
    public var array: [Bool]?
    public var record: Dictionary<String, Bool>?
    public var unionExternal: UnionExternal?
    public var unionInternal: UnionInternal?
    public var unionAdjacent: UnionAdjacent?
    public var any: JSON?

    public init(
        string: String?,
        boolean: Bool?,
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
        `enum`: Enumerator?,
        object: NestedObject?,
        array: [Bool]?,
        record: Dictionary<String, Bool>?,
        unionExternal: UnionExternal?,
        unionInternal: UnionInternal?,
        unionAdjacent: UnionAdjacent?,
        any: JSON?
    ) {
        self.string = string
        self.boolean = boolean
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
        self.`enum` = `enum`
        self.object = object
        self.array = array
        self.record = record
        self.unionExternal = unionExternal
        self.unionInternal = unionInternal
        self.unionAdjacent = unionAdjacent
        self.any = any
    }
    public init() {}
    public init(json: JSON) {
        if json["string"].exists() {
            self.string = json["string"].string
        }
        if json["boolean"].exists() {
            self.boolean = json["boolean"].bool
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
        if json["enum"].exists() {
            self.`enum` = Enumerator(serialValue: json["enum"].string ?? "")
        }
        if json["object"].exists() {
            self.object = NestedObject(json: json["object"])
        }
        if json["array"].exists() {
            self.array = []
            for __arrayJsonElement in json["array"].array ?? [] {
                var __arrayJsonElementValue: Bool
                __arrayJsonElementValue = __arrayJsonElement.bool ?? false
                self.array!.append(__arrayJsonElementValue)
            }
        }
        if json["record"].exists() {
            self.record = Dictionary()
            for (__key, __value) in json["record"].dictionary ?? Dictionary() {
                var __parsedValue: Bool
                __parsedValue = __value.bool ?? false
                self.record![__key] = __parsedValue
            }
        }
        if json["unionExternal"].exists() {
            self.unionExternal = UnionExternal(json: json["unionExternal"])
        }
        if json["unionInternal"].exists() {
            self.unionInternal = UnionInternal(json: json["unionInternal"])
        }
        if json["unionAdjacent"].exists() {
            self.unionAdjacent = UnionAdjacent(json: json["unionAdjacent"])
        }
        if json["any"].exists() {
            self.any = json["any"]
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
        if self.string != nil {
            __json += "\"string\":"
            __json += serializeString(input: self.string!)
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
        if self.`enum` != nil {
            if __numKeys > 0 {
                __json += ","
            }
            __json += "\"enum\":"
            __json += "\"\(self.`enum`!.serialValue())\""
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
                __json += "\(__value)"
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
        if self.any != nil {
            if __numKeys > 0 {
                __json += ","
            }
            __json += "\"any\":"
            __json += serializeAny(input: self.any!)
            __numKeys += 1
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
var __queryParts: [URLQueryItem] = []
        if self.string != nil {
            __queryParts.append(URLQueryItem(name: "string", value: self.string!))
        }
        if self.boolean != nil {
            __queryParts.append(URLQueryItem(name: "boolean", value: "\(self.boolean!)"))
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
        if self.`enum` != nil {
            __queryParts.append(URLQueryItem(name: "enum", value: self.`enum`!.serialValue()))
        }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/object.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/unionExternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/unionInternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/unionAdjacent.")
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/any.")
        return __queryParts
    }
    public func clone() -> ObjectWithOptionalFields {
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
        return ObjectWithOptionalFields(
            string: self.string,
            boolean: self.boolean,
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
            enum: self.`enum`,
            object: self.object?.clone(),
            array: __arrayCloned,
            record: __recordCloned,
            unionExternal: self.unionExternal?.clone(),
            unionInternal: self.unionInternal?.clone(),
            unionAdjacent: self.unionAdjacent?.clone(),
            any: self.any
        )
    }
}

public struct ObjectWithNullableFields: ArriClientModel {
    public var string: String?
    public var boolean: Bool?
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
    public var `enum`: Enumerator?
    public var object: NestedObject?
    public var array: [Bool]?
    public var record: Dictionary<String, Bool>?
    public var unionExternal: UnionExternal?
    public var unionInternal: UnionInternal?
    public var unionAdjacent: UnionAdjacent?
    public var any: JSON = JSON(parseJSON: "null")

    public init(
        string: String?,
        boolean: Bool?,
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
        `enum`: Enumerator?,
        object: NestedObject?,
        array: [Bool]?,
        record: Dictionary<String, Bool>?,
        unionExternal: UnionExternal?,
        unionInternal: UnionInternal?,
        unionAdjacent: UnionAdjacent?,
        any: JSON
    ) {
        self.string = string
        self.boolean = boolean
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
        self.`enum` = `enum`
        self.object = object
        self.array = array
        self.record = record
        self.unionExternal = unionExternal
        self.unionInternal = unionInternal
        self.unionAdjacent = unionAdjacent
        self.any = any
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
        if json["enum"].string != nil {
            self.`enum` = Enumerator(serialValue: json["enum"].string ?? "")
        }
        if json["object"].dictionary != nil {
            self.object = NestedObject(json: json["object"])
        }
        if json["array"].array != nil {
            self.array = []
            for __arrayJsonElement in json["array"].array ?? [] {
                var __arrayJsonElementValue: Bool
                __arrayJsonElementValue = __arrayJsonElement.bool ?? false
                self.array!.append(__arrayJsonElementValue)
            }
        }
        if json["record"].dictionary != nil {
            self.record = Dictionary()
            for (__key, __value) in json["record"].dictionary ?? Dictionary() {
                var __parsedValue: Bool
                __parsedValue = __value.bool ?? false
                self.record![__key] = __parsedValue
            }
        }
        if json["unionExternal"].dictionary != nil {
            self.unionExternal = UnionExternal(json: json["unionExternal"])
        }
        if json["unionInternal"].dictionary != nil {
            self.unionInternal = UnionInternal(json: json["unionInternal"])
        }
        if json["unionAdjacent"].dictionary != nil {
            self.unionAdjacent = UnionAdjacent(json: json["unionAdjacent"])
        }
        if json["any"].exists() {
            self.any = json["any"]
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
        __json += ",\"enum\":"
        if self.`enum` != nil {
            __json += "\"\(self.`enum`!.serialValue())\""
        } else {
            __json += "null"
        }
        __json += ",\"object\":"
        if self.object != nil {
            __json += self.object!.toJSONString()
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
                __json += "\(__element)"
            }
            __json += "]"
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
                __json += "\(__value)"
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
        __json += ",\"any\":"
        __json += serializeAny(input: self.any)
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
        if self.`enum` != nil {
            __queryParts.append(URLQueryItem(name: "enum", value: self.`enum`!.serialValue()))
        } else {
            __queryParts.append(URLQueryItem(name: "enum", value: "null"))
        }
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/object.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/unionExternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/unionInternal.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/unionAdjacent.")
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/any.")
        return __queryParts
    }
    public func clone() -> ObjectWithNullableFields {
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
        return ObjectWithNullableFields(
            string: self.string,
            boolean: self.boolean,
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
            enum: self.`enum`,
            object: self.object?.clone(),
            array: __arrayCloned,
            record: __recordCloned,
            unionExternal: self.unionExternal?.clone(),
            unionInternal: self.unionInternal?.clone(),
            unionAdjacent: self.unionAdjacent?.clone(),
            any: self.any
        )
    }
}

public final class RecursiveObject: ArriClientModel {
    public var left: RecursiveObject?
    public var right: RecursiveObject?
    public required init(
        left: RecursiveObject?,
        right: RecursiveObject?
    ) {
        self.left = left
        self.right = right
    }
    public required init() {}
    public required init(json: JSON) {
        if json["left"].dictionary != nil {
            self.left = RecursiveObject(json: json["left"])
        }
        if json["right"].dictionary != nil {
            self.right = RecursiveObject(json: json["right"])
        }
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
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/left.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/right.")
        return []
    }
    public func clone() -> RecursiveObject {
        return RecursiveObject(
            left: self.left?.clone(),
            right: self.right?.clone()
        )
    }
    public static func == (lhs: RecursiveObject, rhs: RecursiveObject) -> Bool {
        return 
            lhs.left == rhs.left &&
            lhs.right == rhs.right
    }
}

public enum LegacyDiscriminator: ArriClientModel {
    case a(LegacyDiscriminatorA)
    case b(LegacyDiscriminatorB)
    case c(LegacyDiscriminatorC)

    public init() {
        self = .a(LegacyDiscriminatorA())
    }
    public init(json: JSON) {
        let __tag = json["typeName"].string ?? ""
        switch (__tag) {
            case "A":
                self = .a(LegacyDiscriminatorA(json: json))
                break
            case "B":
                self = .b(LegacyDiscriminatorB(json: json))
                break
            case "C":
                self = .c(LegacyDiscriminatorC(json: json))
                break
            default:
                self = .a(LegacyDiscriminatorA())
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
            case .c(let __innerVal):
                return __innerVal.toJSONString()
        }        
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .b(let __innerVal):
                return __innerVal.toURLQueryParts()
            case .c(let __innerVal):
                return __innerVal.toURLQueryParts()
        }
    }
    public func clone() -> LegacyDiscriminator {
        switch(self) {
            case .a(let __innerVal):
                return .a(__innerVal.clone()) 
            case .b(let __innerVal):
                return .b(__innerVal.clone()) 
            case .c(let __innerVal): 
                return .c(__innerVal.clone())
        }
    }
}

public struct LegacyDiscriminatorA: ArriClientModel {
    let typeName: String = "A"
    public var id: String = ""

    public init(
        id: String
    ) {
        self.id = id
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
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
        __json += "\"typeName\":\"A\""
        __json += ",\"id\":"
        __json += serializeString(input: self.id)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "typeName", value: "A"))
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
       return __queryParts
    }
    public func clone() -> LegacyDiscriminatorA {
        return LegacyDiscriminatorA(
            id: self.id
        )
    }
}

public struct LegacyDiscriminatorB: ArriClientModel {
    let typeName: String = "B"
    public var id: String = ""
    public var name: String = ""

    public init(
        id: String,
        name: String
    ) {
        self.id = id
        self.name = name
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.name = json["name"].string ?? ""
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
    __json += "\"typeName\":\"B\""
    __json += ",\"id\":"
    __json += serializeString(input: self.id)
    __json += ",\"name\":"
    __json += serializeString(input: self.name)
    __json += "}"
    return __json
    }

    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "typeName", value: "B"))
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "name", value: self.name))
        return __queryParts
    }
    public func clone() -> LegacyDiscriminatorB {
        return LegacyDiscriminatorB(
            id: self.id,
            name: self.name
        )
    }
}

public struct LegacyDiscriminatorC: ArriClientModel {
    let typeName: String = "C"
    public var id: String = ""
    public var name: String = ""
    public var date: Date = Date()

    public init(
        id: String,
        name: String,
        date: Date
    ) {
        self.id = id
        self.name = name
        self.date = date
    }
    public init() {}
    public init(json: JSON) {
        self.id = json["id"].string ?? ""
        self.name = json["name"].string ?? ""
        self.date = parseDate(json["date"].string ?? "") ?? Date()
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
        __json += "\"typeName\":\"C\""
        __json += ",\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"name\":"
        __json += serializeString(input: self.name)
        __json += ",\"date\":"
        __json += serializeDate(self.date)
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        var __queryParts: [URLQueryItem] = []
        __queryParts.append(URLQueryItem(name: "typeName", value: "C"))
        __queryParts.append(URLQueryItem(name: "id", value: self.id))
        __queryParts.append(URLQueryItem(name: "name", value: self.name))
        __queryParts.append(URLQueryItem(name: "date", value: serializeDate(self.date, withQuotes: false)))
        return __queryParts
    }
    public func clone() -> LegacyDiscriminatorC {
        return LegacyDiscriminatorC(
            id: self.id,
            name: self.name,
            date: self.date
        )
    }
}
