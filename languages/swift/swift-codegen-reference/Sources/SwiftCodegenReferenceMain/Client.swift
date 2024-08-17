import ArriClient
import AsyncHTTPClient
import NIOHTTP1
import NIOCore
import SwiftCodegenReference

struct CustomRequestDelegate: ArriRequestDelegate {


    func handleHTTPRequest(request: ArriHTTPRequest) async throws -> ArriHTTPResponse<String> {
        var httpRequest = HTTPClientRequest(url: request.url.absoluteString)
        for (key, value) in request.headers {
            httpRequest.headers.add(name: key, value: value)
        }
        httpRequest.method = HTTPMethod(rawValue: request.method)
        if request.body != nil {
            httpRequest.body = .bytes(ByteBuffer(string: request.body!))
        }
        let response = try await HTTPClient.shared.execute(httpRequest, timeout: .seconds(5))
        let responseBody = try? await response.body.collect(upTo: 1024 * 1024)
        var responseString: String?
        if responseBody != nil {
            responseString = String(buffer: responseBody!)
        }
        var responseHeaders: Dictionary<String, String> = Dictionary()
        for header in response.headers {
            responseHeaders[header.name] = header.value
        }
        return ArriHTTPResponse(
            statusCode: UInt32(response.status.code),
            statusMessage: response.status.reasonPhrase,
            body: responseString
        )
    }
    
    func handleHTTPEventStreamRequest(request: ArriClient.ArriHTTPRequest) async throws -> ArriClient.ArriSSEResponse {
        throw ArriRequestError.notImplemented
    }

}