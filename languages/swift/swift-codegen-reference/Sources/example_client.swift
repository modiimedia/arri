import Foundation
import ObjectMapper

public protocol ExampleClientModel: Mappable {
    init()
    func toQueryString() -> String
}

public protocol ExampleClientEnum {
    func toJsonString() -> String
    func toQueryString() -> String
}


private class __DateFormatter {
    let RFC3339DateFormatter: DateFormatter
    init() {
        RFC3339DateFormatter   = DateFormatter()
        RFC3339DateFormatter.locale = Locale(identifier: "en_US_POSIX")
        RFC3339DateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        RFC3339DateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    }
    func date(from: String) -> Date? {
        return RFC3339DateFormatter.date(from: from)
    }
    func string(from: Date) -> String {
        return RFC3339DateFormatter.string(from: from)
    }    
}

private let __dateFormatter = __DateFormatter()


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

struct Book: ExampleClientModel {

    var id: String = ""
    var name: String = ""
    var createdAt: Date = Date.now
    var updatedAt: Date = Date.now

    init() {}
    init(map: Map) {}

    mutating func mapping(map: Map) {
       self.id <- map["id"]
       self.name <- map["name"]
       self.createdAt <- (map["createdAt"], __dateTransformer)
       self.updatedAt <- (map["updatedAt"], __dateTransformer)
    }

    func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        __queryParts.append("createdAt=\(__dateFormatter.string(from: self.createdAt))")
        __queryParts.append("updatedAt=\(__dateFormatter.string(from: self.updatedAt))")
        return __queryParts.joined(separator: "&")
    }
}



struct BookParams: ExampleClientModel {
    var bookId: String = ""

    init() {}
    init?(map: ObjectMapper.Map) {}

    mutating func mapping(map: Map) {
        self.bookId <- map["bookId"]
    }

    func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("bookId=\(self.bookId)")
        return __queryParts.joined(separator: "&")
    }
}

struct NestedObject: ExampleClientModel {
    var id: String = ""
    var content: String = ""

    init() {}
    init?(map: Map) {}

    mutating func mapping(map: Map) {
        self.id <- map["id"]
        self.content <- map["content"]
    }
    func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("id=\(self.id)")
        __queryParts.append("content=\(self.content)")
        return __queryParts.joined(separator: "&")
    
    }
}

struct ObjectWithEveryType: ExampleClientModel {
    var string: String = ""
    var boolean: Bool = false
    var timestamp: Date = Date.now
    var float32: Float32 = 0.0
    var float64: Float64 = 0.0
    var int8: Int8 = 0
    var uint8: UInt8 = 0
    var int16: Int16 = 0
    var uint16: UInt16 = 0
    var int32: Int32 = 0
    var uint32: UInt32 = 0
    var int64: Int64 = 0
    var uint64: UInt64 = 0
    var `enum`: Enumerator = Enumerator.foo
    var object: NestedObject = NestedObject()
    var array: [Bool] = []
    var record: Dictionary<String, Bool> = Dictionary()
    var discriminator: Discriminator = Discriminator.a(DiscriminatorA())
    var any: Any? = nil

    init() {}
    init?(map: Map) {}

    mutating func mapping(map: Map) {
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
        self.enum <- map["enum"] // TODO
        self.object <- map["object"] // TODO
        self.array <- map["array"] // TODO
        self.record <- map["record"] // TODO
        self.discriminator <- map["discriminator"] // TODO
    }

    func toQueryString() -> String {
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
        __queryParts.append("enum=\(self.enum.serialValue())")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
        print("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/discriminator")
        print("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryType/any")
        return __queryParts.joined(separator: "&")
    }
}

enum Enumerator {
    case foo
    case bar
    case baz

    func serialValue() -> String {
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

enum Discriminator: ExampleClientEnum {

    case a(DiscriminatorA)
    case b(DiscriminatorB)
    case c(DiscriminatorC)

    func toJsonString() -> String {
        switch(self) {
            case .a(let __innerVal):
                return __innerVal.toJSONString() ?? ""
            case .b(let __innerVal):
                return __innerVal.toJSONString() ?? ""
            case .c(let __innerVal):
                return __innerVal.toJSONString() ?? ""
        }        
    }


    func toQueryString() -> String {
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

struct DiscriminatorA: ExampleClientModel {
    let typeName: String = "A"
    var id: String = ""

    init() {}
    init?(map: Map) {}

    mutating func mapping(map: Map) {
        self.id <- map["id"]
    }

    func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=A")
        __queryParts.append("id=\(self.id)")
       return __queryParts.joined(separator: "&")
    }
}

struct DiscriminatorB: ExampleClientModel {
    let typeName: String = "B"
    var id: String = ""
    var name: String = ""

    init() {}
    init?(map: Map) {}

    mutating func mapping(map: Map) {
        self.id <- map["id"]
        self.name <- map["name"]
    }

    func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=B")
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        return __queryParts.joined(separator: "&")
    }
}

struct DiscriminatorC: ExampleClientModel {
    let typeName: String = "C"
    var id: String = ""
    var name: String = ""
    var date: Date = Date.now

    init() {}
    init?(map: Map) {}

    mutating func mapping(map: Map) {
        self.id <- map["id"]
        self.name <- map["name"]
        self.date <- (map["date"], __dateTransformer)
    }

    func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("type=C")
        __queryParts.append("id=\(self.id)")
        __queryParts.append("name=\(self.name)")
        __queryParts.append("date=\(__dateFormatter.string(from: self.date))")
        return __queryParts.joined(separator: "&")
    }
}