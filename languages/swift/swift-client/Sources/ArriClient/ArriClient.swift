// The Swift Programming Language
// https://docs.swift.org/swift-book
import Foundation
import AsyncHTTPClient
import NIOCore

let jsonEncoder = JSONEncoder()
let jsonDecoder = JSONDecoder()

public func parsedArriHttpRequest<TParams: ArriClientModel, TResponse: ArriClientModel>(
    url: String,
    method: ArriHTTPMethod,
    headers: () -> Dictionary<String, String>,
    clientVersion: String,
    params: TParams?
) async throws -> TResponse {
    var request = HTTPClientRequest(url: url)
    if !clientVersion.isEmpty {
        request.headers.add(name: "client-version", value: clientVersion)
    }
    let headerDict = headers()
    for (key, value) in headerDict {
        request.headers.add(name: key, value: value)
    }
    switch method {
        case .get: 
            request.method = .GET
            break;
        case .patch: 
            request.method = .PATCH
            break;
        case .post: 
            request.method = .POST
            break;
        case .put: 
            request.method = .PUT
            break;
        case .delete: 
            request.method = .DELETE
            break;
    }
    switch method {
        case .get:
            if params != nil {
                request.url = request.url + "?\(params!.toQueryString())"
            }
            break;
        default:
            if params != nil {
                request.headers.add(name: "Content-Type", value: "application/json")
                request.body = .bytes(ByteBuffer(string: params!.toJSONString()))
            }
            break;
    }
    let response = try await HTTPClient.shared.execute(request, timeout: .seconds(30))
    if response.status == .ok {
        let body = try await response.body.collect(upTo: 1024 * 1024)
        let jsonData = String(buffer: body)
        let result = TResponse.init(JSONString: jsonData)
        return result
    }
    let body = try await response.body.collect(upTo: 1024 * 1024)
    let jsonData = String(buffer: body)
    var error = ArriResponseError(JSONString: jsonData)
    if error.code == 0 {
        error.code = response.status.code
    }
    throw error
}

public enum ArriHTTPMethod {
    case get
    case post
    case put
    case patch
    case delete
}

public enum ArriRequestError: Error {
    case invalidUrl
}

public struct ArriResponseError: ArriClientModel, Error {
    var code: UInt = 0
    var message: String = ""
    var data: JSON?
    var stack: [String]?
    public init(
        code: UInt,
        message: String,
        data: JSON?,
        stack: [String]?
    ) {
        self.code = code
        self.message = message
        self.data = data
        self.stack = stack
    }
    public init() {}
    public init(json: JSON) {
    
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
        __json += "\"code\":"
        __json += "\(self.code)"
        __json += ",\"message\":"
        __json += serializeString(input: self.message)
        __json += "}"
        return __json
    
    }
    public func toQueryString() -> String {
        var __queryParts: [String] = []
        __queryParts.append("code=\(self.code)")
        __queryParts.append("message=\(self.message)")
        return __queryParts.joined(separator: "&")
    
    }
    public func clone() -> ArriResponseError {
        return ArriResponseError(
            code: self.code,
            message: self.message,
            data: self.data,
            stack: self.stack
        )
    }
}


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
public struct EmptyArriModel {}
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
