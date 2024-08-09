import Foundation
import ObjectMapper

public protocol ExampleClientModel: Mappable, Equatable {
    func toQueryString() -> String
}
public protocol ExampleClientEnum: Equatable {
    func toJsonString() -> String
    func toQueryString() -> String
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
private let __dateTransformer = TransformOf<Date, String>(
    fromJSON: {
        if($0 == nil) {
            return Date.now
        }
        return __dateFormatter.date(from: $0!)
    }, 
    toJSON: {
        return __dateFormatter.string(from: $0 ?? Date.now)
    }
)

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
    public init?(map: Map) {}

    public mutating func mapping(map: Map) {
       self.id <- map["id"]
       self.name <- map["name"]
       self.createdAt <- (map["createdAt"], __dateTransformer)
       self.updatedAt <- (map["updatedAt"], __dateTransformer)
    }

    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        __queryParts.append("createdAt=\(__dateFormatter.string(from: self.createdAt))")
        __queryParts.append("updatedAt=\(__dateFormatter.string(from: self.updatedAt))")
        return __queryParts.joined(separator: "&")
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
    public init?(map: ObjectMapper.Map) {}
    public mutating func mapping(map: Map) {
        self.bookId <- map["bookId"]
    }
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("bookId=\(self.bookId)")
        return __queryParts.joined(separator: "&")
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
    public init?(map: Map) {}
    public mutating func mapping(map: Map) {
        self.id <- map["id"]
        self.content <- map["content"]
    }
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("id=\(self.id)")
        __queryParts.append("content=\(self.content)")
        return __queryParts.joined(separator: "&")
    
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
    public var any: Any? = nil

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
        any: Any?
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
    public init?(map: Map) {}
    public mutating func mapping(map: Map) {
        self.string <- map["string"]
        self.boolean <- map["boolean"]
        self.timestamp <- (map["timestamp"], __dateTransformer)
        self.float32 <- map["float32"]
        self.float64 <- map["float64"]
        self.int8 <- map["int8"]
        self.uint8 <- map["uint8"]
        self.int16 <- map["int16"]
        self.uint16 <- map["uint16"]
        self.int32 <- map["int32"]
        self.uint32 <- map["uint32"]
        self.int64 <- map["int64"]
        self.uint64 <- map["uint64"]
        self.`enum` <- map["enum"] // TODO
        self.object <- map["object"] // TODO
        self.array <- map["array"] // TODO
        self.record <- map["record"] // TODO
        self.discriminator <- map["discriminator"] // TODO
        self.any <- map["any"] // TODO
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
    public static func == (left: ObjectWithEveryType, right: ObjectWithEveryType) -> Bool {
        return 
            left.string == right.string && 
            left.boolean == right.boolean && 
            left.timestamp == right.timestamp &&
            left.float32 == right.float32 &&
            left.float64 == right.float64 &&
            left.int8 == right.int8 &&
            left.uint8 == right.uint8 &&
            left.int16 == right.int16 &&
            left.uint16 == right.uint16 &&
            left.int32 == right.int32 &&
            left.uint32 == right.uint32 &&
            left.int64 == right.int64 &&
            left.uint64 == right.uint64 &&
            left.`enum` == right.`enum` &&
            left.object == right.object &&
            left.array == right.array && 
            left.record == right.record &&
            left.discriminator == right.discriminator &&
            left.any as? String == right.any as? String
    }
}

public enum Enumerator {
    case foo
    case bar
    case baz

    public init(string: String) {
       switch(string) {
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

public enum Discriminator: ExampleClientEnum {

    case a(DiscriminatorA)
    case b(DiscriminatorB)
    case c(DiscriminatorC)

    public func toJsonString() -> String {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toJSONString() ?? ""
            case .b(let __innerVal):
                return __innerVal.toJSONString() ?? ""
            case .c(let __innerVal):
                return __innerVal.toJSONString() ?? ""
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
    public init?(map: Map) {}

    public mutating func mapping(map: Map) {
        self.id <- map["id"]
    }

    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=A")
        __queryParts.append("id=\(self.id)")
       return __queryParts.joined(separator: "&")
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
    public init?(map: Map) {}

    public mutating func mapping(map: Map) {
        self.id <- map["id"]
        self.name <- map["name"]
    }

    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=B")
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        return __queryParts.joined(separator: "&")
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
    public init?(map: Map) {}

    public mutating func mapping(map: Map) {
        self.id <- map["id"]
        self.name <- map["name"]
        self.date <- (map["date"], __dateTransformer)
    }

    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=C")
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        __queryParts.append("date=\(__dateFormatter.string(from: self.date))")
        return __queryParts.joined(separator: "&")
    }
}