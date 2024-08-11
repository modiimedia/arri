// The Swift Programming Language
// https://docs.swift.org/swift-book
import Foundation
import HTTPTypes

let jsonEncoder = JSONEncoder()
let jsonDecoder = JSONDecoder()

extension HTTPField.Name {
    static let clientVersionHeader = Self("client-version")!
}


public func parsedArriHttpRequest<TParams: ArriClientModel, TResponse: ArriClientModel>(
    http: ArriHTTPClient,
    url: String,
    method: HTTPRequest.Method,
    headers: () -> Dictionary<String, String>,
    clientVersion: String,
    params: TParams?,
    timeoutSeconds: Int64 = 60
) async throws -> TResponse {
    let parsedURL = URL(string: url)
    if parsedURL == nil {
        throw ArriRequestError.invalidURLError
    }
    var request = HTTPRequest(method: method, scheme: parsedURL!.scheme, authority: parsedURL!.host, path: parsedURL!.path)
    if !clientVersion.isEmpty {
        request.headerFields[.clientVersionHeader] = clientVersion
    }
    let headerDict = headers()
    for (key, value) in headerDict {
        let headerName = HTTPField.Name(key)
        if headerName != nil {
            request.headerFields[headerName!] = value
        }
    }
    var body: String?
    switch method {
        case .get:
            if params != nil {
                request.path = request.path! + "?\(params!.toQueryString())"
            }
            break;
        default:
            if params != nil {
                request.headerFields[.contentType] = "application/json"
                body = params!.toJSONString()
            }
            break;
    }
    let (response, bodyResponse) = try await http.handleHTTPRequest(request: request, body: body)
    if response.status == .ok {
        let result = TResponse.init(JSONString: bodyResponse ?? "")
        return result
    }
    var error = ArriResponseError(JSONString: bodyResponse ?? "")
    if error.code == 0 {
        error.code = UInt(response.status.code)
    }
    throw error
}

public enum ArriRequestError: Error {
    case invalidURLError
    case notImplementedError
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
public protocol ArriHTTPClient {
    func handleHTTPRequest(request: HTTPRequest, body: String?) async throws -> (response: HTTPResponse, body: String?)
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
