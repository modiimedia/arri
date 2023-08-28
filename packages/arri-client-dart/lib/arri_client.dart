library;

import 'dart:convert';
import 'package:http/http.dart' as http;

/// Enum of available HTTP methods
enum HttpMethod { get, post, put, patch, head, delete }

/// Perform a raw http request
Future<http.Response> arriRequest(
  String url, {
  HttpMethod method = HttpMethod.get,
  Map<String, dynamic>? params,
  Map<String, String>? headers,

  /// manually send a specific body
  dynamic body,

  /// manually specify specific url query parameters
  Map<String, String>? query,

  /// manually specify a specific encoding
  Encoding? encoding,
}) async {
  http.Response result = http.Response(
    "Placeholder request. If you see this that means a request was never sent to the server.",
    400,
  );
  final finalHeaders = {...headers ?? {}};
  String? bodyInput;
  if (method != HttpMethod.get && method != HttpMethod.head && params != null) {
    finalHeaders["Content-Type"] = "application/json";
    bodyInput = json.encode(bodyInput);
  }
  switch (method) {
    case HttpMethod.get:
      final paramsInput = query ?? params;
      if (paramsInput != null) {
        final queryParts = <String>[];
        for (final entry in paramsInput.entries) {
          queryParts.add("${entry.key}=${entry.value.toString()}");
        }
        final uri = Uri.parse("$url?${queryParts.join("&")}");
        result = await http.get(
          uri,
          headers: headers,
        );
      }
      break;
    case HttpMethod.patch:
      result = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: body ?? bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.put:
      result = await http.put(
        Uri.parse(url),
        headers: headers,
        body: body ?? bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.post:
      result = await http.post(
        Uri.parse(url),
        headers: headers,
        body: body ?? bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.head:
      final paramsInput = query ?? params;
      if (paramsInput != null) {
        final queryParts = <String>[];
        for (final entry in paramsInput.entries) {
          queryParts.add("${entry.key}=${entry.value.toString()}");
        }
        final uri = Uri.parse("$url?${queryParts.join("&")}");
        result = await http.head(
          uri,
          headers: headers,
        );
      }
      break;
    case HttpMethod.delete:
      result = await http.delete(Uri.parse(url),
          headers: headers, encoding: encoding, body: bodyInput);
      break;
    default:
      throw ArriRequestError(
        statusCode: 400,
        statusMessage: "Client has not implemented HTTP method \"$method\"",
      );
  }
  return result;
}

/// Helper function for performing raw HTTP request to an Arri RPC server
/// This function will throw an ArriRequestError if it fails
Future<T> parsedArriRequest<T>(
  String url, {
  HttpMethod method = HttpMethod.get,
  Map<String, dynamic>? params,
  Map<String, String>? headers,
  required T Function(String) parser,
}) async {
  final result =
      await arriRequest(url, method: method, params: params, headers: headers);
  if (result.statusCode == 200) {
    return parser(result.body);
  }
  throw ArriRequestError.fromResponse(result);
}

/// Perform a raw HTTP request to an Arri RPC server. This function does not thrown an error. Instead it returns a request result
/// in which both value and the error can be null.
Future<ArriRequestResult<T>> parsedArriRequestSafe<T>(
  String url, {
  HttpMethod httpMethod = HttpMethod.get,
  Map<String, dynamic>? params,
  Map<String, String>? headers,
  required T Function(String) parser,
}) async {
  try {
    final result = await parsedArriRequest(url, parser: parser);
    return ArriRequestResult(value: result);
  } catch (err) {
    return ArriRequestResult(
        error: err is ArriRequestError ? err : ArriRequestError.unknown());
  }
}

/// Container for holding a request result or a request error
class ArriRequestResult<T> {
  final T? value;
  final ArriRequestError? error;
  const ArriRequestResult({this.value, this.error});
}

/// Abstract endpoint to use as a base for generated client route enums
abstract class ArriEndpoint {
  final String path;
  final HttpMethod method;
  const ArriEndpoint({required this.path, required this.method});
}

/// Serializable request error that can parse the error responses from an Arri RPC server.
class ArriRequestError implements Exception {
  final int statusCode;
  final String statusMessage;
  final dynamic data;
  final String? stackTrace;
  const ArriRequestError(
      {required this.statusCode,
      required this.statusMessage,
      this.data,
      this.stackTrace});

  /// Create an ArriRequestError from an HTTP response
  factory ArriRequestError.fromResponse(http.Response response) {
    try {
      final body = json.decode(response.body);
      return ArriRequestError(
        statusCode: response.statusCode,
        statusMessage: body["statusMessage"] is String
            ? body["statusMessage"]
            : "Unknown error",
        data: body["data"],
        stackTrace: body["stackTrack"] is String ? body["stackTrack"] : null,
      );
    } catch (err) {
      return ArriRequestError.unknown();
    }
  }
  factory ArriRequestError.unknown() {
    return ArriRequestError(
      statusCode: 400,
      statusMessage: "Unknown error",
    );
  }
  @override
  String toString() {
    return "{ statusCode: $statusCode, statusMessage: $statusMessage, data: ${data.toString()}, stackTrack: $stackTrace }";
  }
}
