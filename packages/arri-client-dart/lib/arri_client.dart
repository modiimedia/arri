library;

import 'dart:convert';
import 'package:arri_client/example.dart';
import 'package:http/http.dart' as http;

enum HttpMethod { get, post, put, patch, head, delete }

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
  String? bodyInput;
  if (method != HttpMethod.get && params != null) {
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
          name: "UNSUPPORTED_METHOD",
          statusCode: 400,
          statusMessage: "Client has not implemented HTTP method \"$method\"",
          message: "Client has not implemented HTTP method \"$method\"");
  }
  return result;
}

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

class ArriRequestResult<T> {
  final T? value;
  final ArriRequestError? error;
  const ArriRequestResult({this.value, this.error});
}

class Client {
  final String baseUrl;
  final Map<String, String> headers;
  const Client({this.baseUrl = "", this.headers = const {}});

  Client withHeaders(Map<String, String> headers) {
    return Client(baseUrl: baseUrl, headers: headers);
  }
}

abstract class ArriEndpoint {
  final String path;
  final HttpMethod method;
  const ArriEndpoint({required this.path, required this.method});
}

class ArriRequestError implements Exception {
  final String name;
  final int statusCode;
  final String statusMessage;
  final String message;
  final dynamic data;
  const ArriRequestError({
    required this.name,
    required this.statusCode,
    required this.statusMessage,
    required this.message,
    this.data,
  });
  factory ArriRequestError.fromResponse(http.Response response) {
    try {
      final body = json.decode(response.body);
      return ArriRequestError(
          name: body["name"] is String ? body["name"] : "UNKNOWN",
          statusCode: response.statusCode,
          statusMessage: body["statusMessage"] is String
              ? body["statusMessage"]
              : "Unknown error",
          message:
              body["message"] is String ? body["message"] : "Unknown error",
          data: body["data"]);
    } catch (err) {
      return ArriRequestError.unknown();
    }
  }
  factory ArriRequestError.unknown() {
    return ArriRequestError(
        name: "UNKNOWN",
        statusCode: 400,
        statusMessage: "Unknown error",
        message: "Unknown error");
  }
}

main() async {
  final client = Backend();
  final result = await client.v1.users
      .getUser(BackendUserParams(id: "id", email: "email"));
  final deleteResult =
      await client.v1.posts.deletePost(BackendPostParams(postId: "12345"));
}
