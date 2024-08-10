// The Swift Programming Language
// https://docs.swift.org/swift-book
import Foundation

let jsonEncoder = JSONEncoder()

public func serializeString(input: String) -> String {
    do {
        let inputValue = try jsonEncoder.encode(input)
        return String(data: inputValue, encoding: .utf8) ?? "\"\""
    } catch {
        return "\"\""
    }
}

public func serializeAny(input: JSON) -> String {
    do {
        let inputValue = try jsonEncoder.encode(input)
        return String(data: inputValue, encoding: .utf8) ?? "null"
    } catch {
        return "null"
    }
}

public protocol ArriClientModel: Equatable {
    init()
    init(json: JSON)
    init(JSONString: String)
    func toJSONString() -> String
    func toQueryString() -> String
    func clone() -> Self
}
public protocol ArriClientEnum: Equatable {
    init()
    init(serialValue: String)
    func serialValue() -> String
}
public class ArriClientDateFormatter {
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
private let __dateFormatter = ArriClientDateFormatter()
public func parseDate(_ input: String) -> Date? {
    return __dateFormatter.date(from: input)
}
public func serializeDate(_ input: Date, withQuotes: Bool = true) -> String {
    if withQuotes {
        return "\"\(__dateFormatter.string(from: input))\""
    }
    return __dateFormatter.string(from: input)
}
