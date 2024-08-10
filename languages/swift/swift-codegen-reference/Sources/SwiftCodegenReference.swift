import Foundation

let jsonEncoder = JSONEncoder()

func serializeString(input: String) -> String {
    do {
        let inputValue = try jsonEncoder.encode(input)
        return String(data: inputValue, encoding: .utf8) ?? "\"\""
    } catch {
        return "\"\""
    }
}

func serializeAny(input: JSON) -> String {
    do {
        let inputValue = try jsonEncoder.encode(input)
        return String(data: inputValue, encoding: .utf8) ?? "null"
    } catch {
        return "null"
    }
}

public protocol ExampleClientModel: Equatable {
    init()
    init(json: JSON)
    init(JSONString: String)
    func toJSONString() -> String
    func toQueryString() -> String
    func clone() -> Self
}
public protocol ExampleClientEnum: Equatable {
    init()
    init(serialValue: String)
    func serialValue() -> String
}
public class ExampleClientDateFormatter {
    public let RFC3339DateFormatter: DateFormatter
    public init() {
        RFC3339DateFormatter   = DateFormatter()
        RFC3339DateFormatter.locale = Locale(identifier: "en_US_POSIX")
        RFC3339DateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        RFC3339DateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    }
    public func date(from: String) -> Date? {
        return RFC3339DateFormatter.date(from: from)
    }
    public func string(from: Date) -> String {
        return RFC3339DateFormatter.string(from: from)
    }    
}

private let __dateFormatter = ExampleClientDateFormatter()

public struct Book: ExampleClientModel, Equatable {
    public var id: String = ""
    public var name: String = ""
    public var createdAt: Date = Date.now
    public var updatedAt: Date = Date.now

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
        self.createdAt = __dateFormatter.date(from: json["createdAt"].string ?? "") ?? Date.now
        self.updatedAt = __dateFormatter.date(from: json["updatedAt"].string ?? "") ?? Date.now 
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
            self.init()
        }
    }

    public func toJSONString() -> String{
        var __json = "{"
        __json += "\"id\":"
        __json += serializeString(input: self.id)
        __json += ",\"name\":"
        __json += serializeString(input: self.name)
        __json += ",\"createdAt\":"
        __json += "\"\(__dateFormatter.string(from: self.createdAt))\""
        __json += ",\"updatedAt\":"
        __json += "\"\(__dateFormatter.string(from: self.updatedAt))\""
        __json += "}"
        return __json
    }
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        __queryParts.append("createdAt=\(__dateFormatter.string(from: self.createdAt))")
        __queryParts.append("updatedAt=\(__dateFormatter.string(from: self.updatedAt))")
        return __queryParts.joined(separator: "&")
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

public struct BookParams: ExampleClientModel {
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
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
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
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("bookId=\(self.bookId)")
        return __queryParts.joined(separator: "&")
    }
    public func clone() -> BookParams {
        return BookParams(
            bookId: self.bookId
        )
    }
}

public struct NestedObject: ExampleClientModel {
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
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
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
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("id=\(self.id)")
        __queryParts.append("content=\(self.content)")
        return __queryParts.joined(separator: "&")
    }
    public func clone() -> NestedObject {
        return NestedObject(
            id: self.id,
            content: self.content
        )
    }
}

public struct ObjectWithEveryType: ExampleClientModel {
    public var string: String = ""
    public var boolean: Bool = false
    public var timestamp: Date = Date.now
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
    public var discriminator: Discriminator = Discriminator.a(DiscriminatorA())
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
        discriminator: Discriminator,
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
        self.discriminator = discriminator
        self.any = any
    }
    public init() {}
    public init(json: JSON) {
        self.string = json["string"].string ?? ""
        self.boolean = json["boolean"].bool ?? false
        self.timestamp = __dateFormatter.date(from: json["timestamp"].string ?? "") ?? Date.now
        self.float32 = json["float32"].number?.floatValue ?? 0.0
        self.float64 = json["float64"].number?.doubleValue ?? 0.0
        self.int8 = json["int8"].number?.int8Value ?? 0
        self.uint8 = json["uint8"].number?.uint8Value ?? 0
        self.int16 = json["int16"].number?.int16Value ?? 0
        self.uint16 = json["uint16"].number?.uint16Value ?? 0
        self.int32 = json["int32"].number?.int32Value ?? 0
        self.uint32 = json["uint32"].number?.uint32Value ?? 0
        self.int64 = Int64(json["int64"].string ?? "0") ?? 0
        self.uint64 = UInt64(json["uint64"].string ?? "0") ?? 0
        self.`enum` = Enumerator(serialValue: json["enum"].string ?? "")
        self.object = NestedObject(json: json["object"])
        self.array = []
        let __arrayJson = json["array"].array ?? []
        for __arrayJsonElement in __arrayJson {
            self.array.append(contentsOf: [__arrayJsonElement.bool ?? false])
        }
        self.record = Dictionary()
        let __recordJson = json["record"].dictionary ?? Dictionary()
        for __recordJsonKey in __recordJson.keys {
            let __recordJsonValue = __recordJson[__recordJsonKey]?.bool ?? false
            self.record[__recordJsonKey] = __recordJsonValue
        }
        self.discriminator = Discriminator(json: json["discriminator"])
        self.any = json["any"]
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
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
        __json += "\"\(__dateFormatter.string(from: self.timestamp))\""
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
        __json += "\"\(self.enum.serialValue())\""
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
        for (__index, __key) in self.record.keys.enumerated() {
            if __index > 0 {
                __json += ","
            }
            __json += "\"\(__key)\":"
            __json += "\(self.record[__key]!)"
        }
        __json += "}"
        __json += ",\"discriminator\":"
        __json += self.discriminator.toJSONString()
        __json += ",\"any\":"
        __json += serializeAny(input: self.any)
        __json += "}"
        return __json
    }
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("string=\(self.string)")
        __queryParts.append("boolean=\(self.boolean)")
        __queryParts.append("timestamp=\(__dateFormatter.string(from: self.timestamp))")
        __queryParts.append("float32=\(self.float32)")
        __queryParts.append("float64=\(self.float64)")
        __queryParts.append("int8=\(self.int8)")
        __queryParts.append("uint8=\(self.uint8)")
        __queryParts.append("int16=\(self.int16)")
        __queryParts.append("uint16=\(self.uint16)")
        __queryParts.append("int32=\(self.int32)")
        __queryParts.append("uint32=\(self.uint32)")
        __queryParts.append("int64=\(self.int64)")
        __queryParts.append("uint64=\(self.uint64)")
        __queryParts.append("enum=\(self.`enum`.serialValue())")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/discriminator")
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryType/any")
        return __queryParts.joined(separator: "&")
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
            enum: self.enum,
            object: self.object.clone(),
            array: __arrayCloned,
            record: __recordCloned,
            discriminator: self.discriminator.clone(),
            any: self.any
        )
    }
}

public enum Enumerator: ExampleClientEnum {
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

public enum Discriminator: ExampleClientModel {
    case a(DiscriminatorA)
    case b(DiscriminatorB)
    case c(DiscriminatorC)

    public init() {
        self = .a(DiscriminatorA())
    }
    public init(json: JSON) {
        let typeName = json["typeName"].string ?? ""
        switch (typeName) {
            case "A":
                self = .a(DiscriminatorA(json: json))
                break
            case "B":
                self = .b(DiscriminatorB(json: json))
                break
            case "C":
                self = .c(DiscriminatorC(json: json))
                break;
            default:
                self = .a(DiscriminatorA())
                break;
        }
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
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
    public func toQueryString() -> String {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toQueryString()
            case .b(let __innerVal):
                return __innerVal.toQueryString()
            case .c(let __innerVal):
                return __innerVal.toQueryString()
        }
    }
    public func clone() -> Discriminator {
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

public struct DiscriminatorA: ExampleClientModel {
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
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
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
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=A")
        __queryParts.append("id=\(self.id)")
       return __queryParts.joined(separator: "&")
    }
    public func clone() -> DiscriminatorA {
        return DiscriminatorA(
            id: self.id
        )
    }
}

public struct DiscriminatorB: ExampleClientModel {
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
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
            self.init()
        }
    }
    public func toJSONString() -> String {
    var __json = "{"
    __json += "\"typeName\":\"B\""
    __json += "\"id\":"
    __json += serializeString(input: self.id)
    __json += ",\"name\":"
    __json += serializeString(input: self.name)
    __json += "}"
    return __json
    }

    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=B")
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        return __queryParts.joined(separator: "&")
    }
    public func clone() -> DiscriminatorB {
        return DiscriminatorB(
            id: self.id,
            name: self.name
        )
    }
}

public struct DiscriminatorC: ExampleClientModel {
    let typeName: String = "C"
    public var id: String = ""
    public var name: String = ""
    public var date: Date = Date.now

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
        self.date = __dateFormatter.date(from: json["date"].string ?? "") ?? Date.now
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data) 
        } catch {
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
        __json += "\"\(__dateFormatter.string(from: self.date))\""
        __json += "}"
        return __json
    }
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=C")
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        __queryParts.append("date=\(__dateFormatter.string(from: self.date))")
        return __queryParts.joined(separator: "&")
    }
    public func clone() -> DiscriminatorC {
        return DiscriminatorC(
            id: self.id,
            name: self.name,
            date: self.date
        )
    }
}

public struct ObjectWithOptionalFields: ExampleClientModel {
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
    public var discriminator: Discriminator?
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
        discriminator: Discriminator?,
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
        self.discriminator = discriminator
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
            self.timestamp = __dateFormatter.date(from: json["timestamp"].string ?? "")
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
                self.array!.append(contentsOf: [__arrayJsonElement.bool ?? false])
            }
        }
        if json["record"].exists() {
            self.record = Dictionary()
            for (__recordKey, __recordValue) in json["record"].dictionary ?? Dictionary() {
                self.record![__recordKey] = __recordValue.bool ?? false
            }
        }
        if json["discriminator"].exists() {
            self.discriminator = Discriminator(json: json["discriminator"])
        }
        if json["any"].exists() {
            self.any = json["any"]
        }
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data) 
        } catch {
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
            __json += "\"\(__dateFormatter.string(from: self.timestamp!))\""
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
        if self.enum != nil {
            if __numKeys > 0 {
                __json += ","
            }
            __json += "\"enum\":"
            __json += "\"\(self.enum!.serialValue())\""
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
    public func toQueryString() -> String {
       var __queryParts: [String] = []
       if self.string != nil {
        __queryParts.append("string=\(self.string!)")
       }
       if self.boolean != nil {
        __queryParts.append("boolean=\(self.boolean!)")
       }
       if self.timestamp != nil {
        __queryParts.append("timestamp=\(__dateFormatter.string(from: self.timestamp!))")
       }
       return __queryParts.joined(separator: "&")
    }
    public func clone() -> ObjectWithOptionalFields {
        var __arrayCloned: [Bool]?
        if (self.array != nil) {
            __arrayCloned = []
            for __arrayElement in self.array! {
                __arrayCloned!.append(__arrayElement)
            }
        }
        var __recordCloned: Dictionary<String, Bool>?
        if (self.record != nil) {
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
            enum: self.enum,
            object: self.object?.clone(),
            array: __arrayCloned,
            record: __recordCloned,
            discriminator: self.discriminator?.clone(),
            any: self.any
        )
    }
}

public struct ObjectWithNullableFields: ExampleClientModel {
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
    public var discriminator: Discriminator?
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
        discriminator: Discriminator?,
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
        self.discriminator = discriminator
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
            self.timestamp = __dateFormatter.date(from: json["timestamp"].string ?? "")
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
                self.array!.append(contentsOf: [__arrayJsonElement.bool ?? false])
            }
        }
        if json["record"].dictionary != nil {
            self.record = Dictionary()
            for (__recordKey, __recordValue) in json["record"].dictionary ?? Dictionary() {
                self.record![__recordKey] = __recordValue.bool ?? false
            }
        }
        if json["discriminator"].dictionary != nil {
            self.discriminator = Discriminator(json: json["discriminator"])
        }
        if json["any"].exists() {
            self.any = json["any"]
        }
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data) 
        } catch {
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
            __json += "\"\(__dateFormatter.string(from: self.timestamp!))\""
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
        if self.enum != nil {
            __json += "\"\(self.enum!.serialValue())\""
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
                __json += "\"\(__key)\":"
                __json += "\(__value)"
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
        __json += ",\"any\":"
        __json += serializeAny(input: self.any)
        __json += "}"
        return __json
    }
    public func toQueryString() -> String {
       var __queryParts: [String] = []
       if self.string != nil {
        __queryParts.append("string=\(self.string!)")
       } else {
        __queryParts.append("string=null")
       }
       if self.boolean != nil {
        __queryParts.append("boolean=\(self.boolean!)")
       } else {
        __queryParts.append("boolean=null")
       }
       if self.timestamp != nil {
        __queryParts.append("timestamp=\(__dateFormatter.string(from: self.timestamp!))")
       } else {
        __queryParts.append("timestamp=null")
       }
       return __queryParts.joined(separator: "&")
    }
    public func clone() -> ObjectWithNullableFields {
        var __arrayCloned: [Bool]?
        if (self.array != nil) {
            __arrayCloned = []
            for __arrayElement in self.array! {
                __arrayCloned!.append(__arrayElement)
            }
        }
        var __recordCloned: Dictionary<String, Bool>?
        if (self.record != nil) {
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
            enum: self.enum,
            object: self.object?.clone(),
            array: __arrayCloned,
            record: __recordCloned,
            discriminator: self.discriminator?.clone(),
            any: self.any
        )
    }
}