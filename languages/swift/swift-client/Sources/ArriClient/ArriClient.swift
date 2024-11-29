import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import AsyncHTTPClient
import NIOHTTP1
import NIOCore
import NIOFoundationCompat

let jsonEncoder = JSONEncoder()
let jsonDecoder = JSONDecoder()

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public func parsedArriHttpRequest<TParams: ArriClientModel, TResponse: ArriClientModel>(
    delegate: ArriRequestDelegate,
    url: String,
    method: String,
    headers: () -> Dictionary<String, String>,
    clientVersion: String,
    params: TParams,
    timeoutSeconds: Int64 = 60,
    onError: (Error) -> Void
) async throws -> TResponse {
    do {
        var parsedURL = URLComponents(string: url)
        if parsedURL == nil {
            throw ArriRequestError.invalidUrl
        }
        var finalHeaders = headers()
        if !clientVersion.isEmpty {
            finalHeaders["client-version"] = clientVersion
        }
        var finalBody: String?
        switch method {
            case "GET":
                if !(params is EmptyArriModel) {
                    parsedURL!.queryItems = params.toURLQueryParts()
                }
                break;
            default:
                if !(params is EmptyArriModel) {
                    finalHeaders["Content-Type"] = "application/json"
                    finalBody = params.toJSONString()
                }
                break;
        }
        let request = ArriHTTPRequest(url: parsedURL!.url!, method: method, headers: finalHeaders, body: finalBody)
        let response = try await delegate.handleHTTPRequest(request: request)
        if response.statusCode >= 200 && response.statusCode < 300 {
            let result = TResponse.init(JSONData: response.body ?? Data())
            return result
        }
        var error = ArriResponseError(JSONData: response.body ?? Data())
        if error.code == 0 {
            error.code = response.statusCode
        }
        if error.message.isEmpty {
            error.message = response.statusMessage ?? "Unknown error"
        }
        throw error
    } catch (let e) {
        onError(e)
        throw e
    }
}

public enum ArriRequestError: Error {
    case invalidUrl
    case notImplemented
    case unableToConnect(Error)
}

public struct ArriResponseError: ArriClientModel, Error {
    public var code: UInt32 = 0
    public var message: String = ""
    public var data: JSON?
    public var stack: [String]?
    public init(
        code: UInt32,
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
        self.code = json["code"].uInt32 ?? 0
        self.message = json["message"].string ?? ""
        if json["data"].exists() {
            self.data = json["data"]
        }
        if json["stack"].exists() {
            self.stack = []
            for element in json["stack"].array ?? [] {
                self.stack!.append(element.string ?? "")
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
            let json = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
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
        __queryParts.append(URLQueryItem(name: "message", value: "\(self.message)"))
        return __queryParts
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





//// Serialize / Deserialize

public protocol ArriClientModel: Equatable {
    init()
    init(json: JSON)
    init(JSONData: Data)
    init(JSONString: String)
    func toJSONString() -> String
    // func toURLQueryString() -> String
    func toURLQueryParts() -> [URLQueryItem]
    func clone() -> Self
}
public struct EmptyArriModel: ArriClientModel {
    public init() {}
    public init(json: JSON) {}
    public init(JSONString: String) {}
    public init(JSONData: Data) {}
    public func toJSONString() -> String {
        return ""
    }
    // public func toURLQueryString() -> String {
    //     return ""
    // }
    public func toURLQueryParts() -> [URLQueryItem] {
        return []
    }

    public func clone() -> EmptyArriModel {
        return EmptyArriModel()        
    }

}
public protocol ArriClientEnum: Equatable {
    init()
    init(serialValue: String)
    func serialValue() -> String
}
@propertyWrapper
public enum Box<T> {
    indirect case next(T)
    init(_ wrappedValue: T) {
        self = .next(wrappedValue)
    }
    public var wrappedValue: T {
        switch self {
            case .next(let value): return value
        }
    }
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





//// Request Delegate ////
@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public protocol ArriRequestDelegate {
    func handleHTTPRequest(request: ArriHTTPRequest) async throws -> ArriHTTPResponse<Data>
    func handleHTTPEventStreamRequest(request: ArriHTTPRequest) async throws -> ArriSSEResponse
}
@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public struct DefaultRequestDelegate: ArriRequestDelegate {
    var maxBodyBytes: Int = 1024 * 1024
    public init() {}
    /// Accumulates `Body` of `ByteBuffer`s into a single `ByteBuffer`.
    /// - Parameters:
    ///   - maxBodyBytes: The maximum number of bytes that a single response body can take up. Default is 1048576 (1MB)
    public init(maxBodyBytes: Int) {
        self.maxBodyBytes = maxBodyBytes
    }
    public func handleHTTPRequest(request: ArriHTTPRequest) async throws -> ArriHTTPResponse<Data> {
        let httpRequest = self.prepareHttpRequest(request: request)
        let response = try await HTTPClient.shared.execute(httpRequest, timeout: .seconds(5))
        let responseBody = try? await response.body.collect(upTo: maxBodyBytes)
        var responseData: Data?
        if responseBody != nil {
            responseData = Data(buffer: responseBody!)
        }
        var responseHeaders: Dictionary<String, String> = Dictionary()
        for header in response.headers {
            responseHeaders[header.name] = header.value
        }
        return ArriHTTPResponse(
            statusCode: UInt32(response.status.code),
            statusMessage: response.status.reasonPhrase,
            body: responseData
        )
    }
    public func handleHTTPEventStreamRequest(request: ArriHTTPRequest) async throws -> ArriSSEResponse {
        let httpRequest = self.prepareHttpRequest(request: request)
        let response = try await HTTPClient.shared.execute(httpRequest, timeout: .minutes(10))
        if response.status.code >= 200 && response.status.code < 300 && response.headers["Content-Type"].contains("text/event-stream") {
            return .ok(ArriHTTPResponse(
                statusCode: UInt32(response.status.code),
                statusMessage: response.status.reasonPhrase,
                body: response.body
            ))
        }
        let responseBody = try? await response.body.collect(upTo: maxBodyBytes)
        var responseData: Data?
        if responseBody != nil {
            responseData = Data(buffer: responseBody!)
        }
        return .error(
            ArriHTTPResponse(
                statusCode: UInt32(response.status.code),
                statusMessage: response.status.reasonPhrase,
                body: responseData
            )
        )
    }
    func prepareHttpRequest(request: ArriHTTPRequest) -> HTTPClientRequest {
        var httpRequest = HTTPClientRequest(url: request.url.absoluteString)
        for (key, value) in request.headers {
            httpRequest.headers.add(name: key, value: value)
        }
        httpRequest.method = HTTPMethod(rawValue: request.method)
        if request.body != nil {
            httpRequest.body = .bytes(ByteBuffer(string: request.body!))
        }
        return httpRequest
    }
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public enum ArriSSEResponse {
    case ok(ArriHTTPResponse<HTTPClientResponse.Body>)
    case error(ArriHTTPResponse<Data>)
}

// Commenting this out. Need to figure out how to get streamed http responses using only the FoundationNetworking libs. (Cross-platform only)
// Linux doesn't have access to `await URLSession.data` or `await URLSession.asyncBytes` and I haven't yet figured out how to get around that
//
// public struct DefaultRequestDelegate: ArriRequestDelegate {
//     public init() {}
//     public func handleHTTPRequest(request: ArriHTTPRequest) async throws -> ArriHTTPResponse<String> {
//         var urlRequest = URLRequest(url: request.url)
//         urlRequest.httpMethod = request.method

//         for (key, value) in request.headers {
//             urlRequest.setValue(value, forHTTPHeaderField: key)
//         }
//         if request.body != nil {
//             let data = request.body!.data(using: .utf8)
//             urlRequest.httpBody = data
//         }
//         let (data, response) = try await URLSession.shared.asyncData(with: urlRequest)
//         let responseStatusCode = UInt(response.statusCode)
//         var responseBody: String?
//         if data != nil && !data!.isEmpty {
//             responseBody = String(data: data!, encoding: .utf8)
//         }
//         return ArriHTTPResponse(
//             statusCode: responseStatusCode,
//             statusMessage: nil,
//             body: responseBody
//         )
//     }
//     public func handleHTTPEventStreamRequest(request: ArriHTTPRequest) async throws {
//         var config = URLSessionConfiguration.default
//         let session = URLSession(configuration: config, delegate: nil, delegateQueue: OperationQueue.main)
//     }
// }

public struct ArriHTTPRequest {
    public var url: URL
    public var method: String
    public var headers: Dictionary<String, String>
    public var body: String?
    public init(
        url: URL,
        method: String,
        headers: Dictionary<String, String>,
        body: String?
    ) {
        self.url = url
        self.method = method
        self.headers = headers
        self.body = body
    }
}
public struct ArriHTTPResponse<T> {
    public var statusCode: UInt32
    public var statusMessage: String?
    public var body: T?
    public init(statusCode: UInt32) {
        self.statusCode = statusCode
    }
    public init(
        statusCode: UInt32,
        statusMessage: String?,
        body: T?
    ) {
        self.statusCode = statusCode
        self.statusMessage = statusMessage
        self.body = body
    }
}

public enum ArriResponseErrors: Error {
    case invalidUrlResponse
}

extension URLSession {
    @available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
    func asyncData(with: URLRequest) async throws -> (Data?, HTTPURLResponse) {
        return try await withCheckedThrowingContinuation { continuation in
            URLSession.shared.dataTask(with: with) {data, response, error in 
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                guard let response = response as? HTTPURLResponse else {
                    continuation.resume(throwing: ArriResponseErrors.invalidUrlResponse)                    
                    return
                }
                continuation.resume(returning: (data, response))
            }.resume()
        }
    }
}

//// Server Sent Events ////
public enum SSEEvent<T: ArriClientModel> {
    case message(SSEMessageEvent<T>)
    case ping
    case done

    init(rawEvent: RawSSEEvent) {
        switch (rawEvent.event) {
           
            case "ping":
                self = .ping
                break;
            case "done":
                self = .done
                break;
            case "message":
                self = .message(SSEMessageEvent<T>(
                    id: rawEvent.id,
                    data: T.init(JSONString: rawEvent.data),
                    retry: rawEvent.retry
                ))
                break;
            default:
                self = .message(SSEMessageEvent<T>(
                    id: rawEvent.id,
                    data: T.init(JSONString: rawEvent.data),
                    retry: rawEvent.retry
                ))
                break;
        }
    }
}

public struct SSEMessageEvent<T: Equatable>: Equatable {
    public var id: String?
    public let event: String = "message"
    public var data: T
    public var retry: UInt32?
    init(
        id: String?,
        data: T,
        retry: UInt32?
    ) {
        self.id = id
        self.data = data
        self.retry = retry
    }
}

public struct RawSSEEvent: Equatable {
    var id: String?
    var event: String = "message"
    var data: String = ""
    var retry: UInt32?
    init() {}
    init(
        id: String?,
        event: String,
        data: String,
        retry: UInt32?
    ) {
        self.id = id
        self.event = event
        self.data = data
        self.retry = retry
    }
}

public enum SSELineResult: Equatable {
    case id(String)
    case event(String)
    case data(String)
    case retry(UInt32)
    case none
   
    init(string: String) {
        if(string.starts(with: "id:")) {
            let index = string.index(string.startIndex, offsetBy: 3)
            let result = String(string.suffix(from: index)).trimmingCharacters(in: .whitespacesAndNewlines)
            if !result.isEmpty {
                self = .id(result)
                return
            }
        }
        if(string.starts(with: "event:")) {
            let index = string.index(string.startIndex, offsetBy: 6)
            let result = String(string.suffix(from: index)).trimmingCharacters(in: .whitespacesAndNewlines)
            if !result.isEmpty {
                self = .event(result)
                return
            }
        }
        if(string.starts(with: "data:")) {
            let index = string.index(string.startIndex, offsetBy: 5)
            self = .data(String(string.suffix(from: index)).trimmingCharacters(in: .whitespacesAndNewlines))
            return
        }
        if(string.starts(with: "retry:")) {
            let index = string.index(string.startIndex, offsetBy: 6)
            let result = UInt32(string.suffix(from: index).trimmingCharacters(in: .whitespacesAndNewlines))
            if result != nil {
                self = .retry(result!)
                return
            }
        }
        self = .none
    }
}

public func sseEventListFromString(input: String, debug: Bool) -> ([RawSSEEvent], String) {
    var events: [RawSSEEvent] = []
    var id: String?
    var event: String?
    var data: String?
    var retry: UInt32?
    var line = ""
    var leftoverIndex = 0
    var previousChar: Character?
    var ignoreNextNewLine = false
    func handleLineResult(_ result: SSELineResult) {
        switch (result) {
            case .id(let value):
                id = value
                break 
            case .event(let value):
                event = value
                break
            case .data(let value): 
                data = value
                break                    
            case .retry(let value):
                retry = value
                break; 
            case .none: 
                break
        }
        line = ""
    }
    func handleEnd() {
        if data != nil {
            events.append(RawSSEEvent(id: id, event: event ?? "message", data: data!, retry: retry))
        }
        id = nil
        event = nil
        data = nil
        retry = nil
    }
    for (index, char) in input.enumerated() {
        switch (char) {
            case Character("\r"):
                let isEnd = previousChar == Character("\n") || previousChar == Character("\r")
                ignoreNextNewLine = true
                handleLineResult(SSELineResult(string: line))
                if isEnd {
                    handleEnd()
                    let nextCharIndex = input.index(input.startIndex, offsetBy: index + 1)
                    let nextChar = input[nextCharIndex]
                    switch nextChar {
                        case Character("\n"):
                            leftoverIndex = index + 2
                            break;
                        case Character("\r"):
                            leftoverIndex = index + 2
                            break;
                        default:
                            leftoverIndex = index + 1
                            break;
                    }
                }
                break;
            case Character("\n"):
                if ignoreNextNewLine {
                    ignoreNextNewLine = false
                    break;
                }
                let isEnd = previousChar == Character("\n")
                handleLineResult(SSELineResult(string: line))
                if isEnd {
                   handleEnd()
                   leftoverIndex = index + 1
                }
                break;
            default:
                ignoreNextNewLine = false
                line.append(char)
                break;
        }
        previousChar = char
    }
    let leftover = input.suffix(from: input.index(input.startIndex, offsetBy: leftoverIndex))
    return (events, String(leftover))
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public protocol ArriCancellable {
    mutating func cancel() -> ()
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public struct EventSourceOptions<T: ArriClientModel> {
    public var onMessage: (T, inout EventSource<T>) -> ()
    public var onRequest: ((ArriHTTPRequest, inout EventSource<T>) -> ()) = { _, __ in }
    public var onRequestError: ((ArriRequestError, inout EventSource<T>) -> ()) = { _, __ in }
    public var onResponse: ((ArriSSEResponse, inout EventSource<T>) -> ()) = { _, __ in }
    public var onResponseError: ((ArriResponseError, inout EventSource<T>) -> ()) = { _, __ in }
    public var onClose: (() -> ()) = { }
    public var maxRetryCount: UInt32?
    public var maxRetryInterval: UInt32 = 30000
    public init(
        onMessage: @escaping (T, inout EventSource<T>) -> ()
    ) {
        self.onMessage = onMessage
    }
    public init(
        onMessage: @escaping (T, inout EventSource<T>) -> (),
        maxRetryCount: UInt32? = nil,
        maxRetryInterval: UInt32? = nil
    ) {
        self.onMessage = onMessage
        self.maxRetryCount = maxRetryCount
        self.maxRetryInterval = maxRetryInterval ?? self.maxRetryInterval
    }
    public init(
        onMessage: @escaping (T, inout EventSource<T>) -> (),
        onRequestError: ((ArriRequestError, inout EventSource<T>) -> ())? = nil,
        onResponseError: ((ArriResponseError, inout EventSource<T>) -> ())? = nil
    ) {
        self.onMessage = onMessage
        self.onRequestError = onRequestError ?? self.onRequestError
        self.onResponseError = onResponseError ?? self.onResponseError
    }
    public init(
        onMessage: @escaping (T, inout EventSource<T>) -> (),
        onRequestError: @escaping (ArriRequestError, inout EventSource<T>) -> (),
        onResponseError: @escaping (ArriResponseError, inout EventSource<T>) -> (),
        maxRetryCount: UInt32?,
        maxRetryInterval: UInt32?
    ) {
        self.onMessage = onMessage
        self.onRequestError = onRequestError
        self.onResponseError = onResponseError
        self.maxRetryCount = maxRetryCount
        self.maxRetryInterval = maxRetryInterval ?? self.maxRetryInterval
    }
    public init(
        onMessage: @escaping (T, inout EventSource<T>) -> (),
        onRequest: ((ArriHTTPRequest, inout EventSource<T>) -> ())?,
        onRequestError: ((ArriRequestError, inout EventSource<T>) -> ())?,
        onResponse: ((ArriSSEResponse, inout EventSource<T>) -> ())?,
        onResponseError: ((ArriResponseError, inout EventSource<T>) -> ())?,
        onClose: (() -> ())?,
        maxRetryCount: UInt32?,
        maxRetryInterval: UInt32?
    ) {
        self.onMessage = onMessage
        self.onRequest = onRequest ?? self.onRequest
        self.onRequestError = onRequestError ?? self.onRequestError
        self.onResponse = onResponse ?? self.onResponse
        self.onResponseError = onResponseError ?? self.onResponseError
        self.onClose = onClose ?? self.onClose
        self.maxRetryCount = maxRetryCount
        self.maxRetryInterval = maxRetryInterval ?? self.maxRetryInterval
    }
}

@available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
public struct EventSource<T: ArriClientModel>: ArriCancellable {
    var url: String
    var method: String
    var headers: () -> Dictionary<String, String>
    var params: (any ArriClientModel)?
    var clientVersion: String
    var lastEventId: String?
    var delegate: ArriRequestDelegate
    var options: EventSourceOptions<T>
    var retryCount: UInt32 = 0
    var retryInterval: UInt32 = 0
    var cancelled = false
    var pendingData = ""
    public init(
        url: String,
        method: String,
        headers: @escaping () -> Dictionary<String, String>,
        params: (any ArriClientModel)?,
        delegate: ArriRequestDelegate,
        clientVersion: String,
        options: EventSourceOptions<T>
    ) {
        self.url = url
        self.method = method
        self.headers = headers
        self.params = params
        self.delegate = delegate
        self.clientVersion = clientVersion
        self.options = options
    }

    mutating public func cancel() {
        self.cancelled = true
    }

    @available(macOS 10.15, iOS 13, tvOS 13, macCatalyst 13, *)
    public mutating func sendRequest() async {
        var urlComponents = URLComponents(string: self.url)
        if urlComponents == nil {
            options.onRequestError(ArriRequestError.invalidUrl, &self)
            if cancelled {
                return
            }
            return await handleRetry()
        }
        var headers = self.headers()
        headers["Accepts"] = "text/event-stream,application/json"
        if !self.clientVersion.isEmpty {
            headers["client-version"] = self.clientVersion
        }
        if self.lastEventId != nil && !self.lastEventId!.isEmpty {
            headers["Last-Event-Id"] = self.lastEventId!
        }
        var body: String?
        if self.params != nil {
            switch (self.method) {
                case "GET":
                    urlComponents!.queryItems = self.params!.toURLQueryParts()
                    break;
                default:
                    body = self.params!.toJSONString()
                    headers["Content-Type"] = "application/json"
                    break;
            }
        }
        let request = ArriHTTPRequest(url: urlComponents!.url!, method: self.method, headers: self.headers(), body: body)
        self.options.onRequest(request, &self)
        if cancelled {
            return
        }
        var response: ArriSSEResponse
        do {
            response = try await delegate.handleHTTPEventStreamRequest(request: request)
        } catch {
            if error is CancellationError {
                return
            }
            self.options.onRequestError(ArriRequestError.unableToConnect(error), &self)
            if cancelled {
                return
            }
            return await handleRetry()
        }
        self.options.onResponse(response, &self)
        if cancelled {
            self.options.onClose()
            return
        }
        switch (response) {        
            case .error(let errorResponse):
                var error = ArriResponseError(JSONData: errorResponse.body ?? Data())
                if error.code == 0 {
                    error.code = errorResponse.statusCode
                }
                if error.message.isEmpty {
                    error.message = errorResponse.statusMessage ?? ""
                }
                self.options.onResponseError(error, &self)
                if cancelled {
                    self.options.onClose()
                    return
                }
                return await handleRetry()
            case .ok(let okResponse):
                self.retryCount = 0
                if okResponse.body == nil {
                    options.onResponseError(
                        ArriResponseError(
                            code: 0,
                            message: "No response from server",
                            data: nil,
                            stack: nil
                        ),
                        &self
                    )
                    if cancelled {
                        self.options.onClose()
                        return
                    }
                    return await handleRetry()
                }
                
                do {
                    for try await buffer in okResponse.body! {
                        if cancelled {
                            self.options.onClose()
                            return
                        }
                        let chunk = String(buffer: buffer)
                        let (rawEvents, leftover) = sseEventListFromString(input: "\(pendingData)\(chunk)", debug: false)
                        pendingData = leftover
                        for rawEvent in rawEvents {
                            if rawEvent.id != nil && !rawEvent.id!.isEmpty {
                                lastEventId = rawEvent.id!
                            }
                            let event = SSEEvent<T>(rawEvent: rawEvent)
                            switch (event) {                        
                                case .done: 
                                    cancelled = true
                                    self.options.onClose()
                                    return
                                case .message(let messageEvent):
                                    self.options.onMessage(messageEvent.data, &self)
                                    if cancelled {
                                        self.options.onClose()
                                        return
                                    }
                                    break 
                                case .ping:
                                    break 
                            }
                        }
                    }
                } catch {
                    if error is CancellationError {
                        self.options.onClose()
                        return 
                    }
                    self.options.onResponseError(
                        ArriResponseError(
                            code: 0,
                            message: error.localizedDescription,
                            data: nil,
                            stack: nil
                        ),
                        &self
                    )
                    if cancelled {
                        self.options.onClose()
                        return
                    }
                    return await handleRetry()
                }
                break; 
        }
        if cancelled {
            self.options.onClose()
            return
        }        
        return await handleRetry()
    }

    mutating func handleRetry() async {
        if self.options.maxRetryCount != nil && self.retryCount > self.options.maxRetryCount! {
            return
        }
        if self.retryCount >= 5 && self.retryInterval == 0 {
            self.retryInterval = 10
        } else if self.retryInterval > 0 {
            self.retryInterval = self.retryInterval * 2
        }
        if self.retryInterval > self.options.maxRetryInterval {
            self.retryInterval = self.options.maxRetryInterval
        }
        if self.retryInterval > 0 {
            sleep(self.retryInterval / 1000)
        }
        self.retryCount += 1
        return await self.sendRequest()
    }
}