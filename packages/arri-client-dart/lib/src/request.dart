import 'dart:convert';

import 'package:http/http.dart' as http;

enum HttpMethod { get, post, put, patch, head, delete }

Future<T> parsedRequest<T>(
  String url, {
  HttpMethod httpMethod = HttpMethod.get,
  Map<String, dynamic>? params,
  Map<String, String>? headers,
  required T Function(String) parser,
}) async {
  http.Response? result;
  String? body;
  if (httpMethod != HttpMethod.get && params != null) {
    body = json.encode(body);
  }
  switch (httpMethod) {
    case HttpMethod.get:
      if (params != null) {
        final queryParts = <String>[];
        for (final entry in params.entries) {
          queryParts.add("${entry.key}=${entry.value.toString()}");
        }
        final uri = Uri.parse("$url?${queryParts.join("&")}");
        result = await http.get(uri, headers: headers);
      }
      break;
    case HttpMethod.patch:
      result = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: body,
      );
      break;
    case HttpMethod.put:
      result = await http.put(
        Uri.parse(url),
        headers: headers,
        body: body,
      );
      break;
    case HttpMethod.post:
      result = await http.post(Uri.parse(url), headers: headers, body: body);
      break;
    case HttpMethod.head:
      result = await http.head(Uri.parse(url), headers: headers);
      break;
    case HttpMethod.delete:
      result = await http.delete(Uri.parse(url), headers: headers);
      break;
    default:
      throw ArriRequestError(
          statusCode: 500,
          statusMessage: "Unsupported HTTP method \"$httpMethod\"");
  }
  if (result?.statusCode == 200) {
    return parser(result!.body);
  }
  throw ArriRequestError.fromResponse(result!);
}

Future<ArriRequestResult<T>> parsedRequestSafe<T>(
  String url, {
  HttpMethod httpMethod = HttpMethod.get,
  Map<String, dynamic>? params,
  Map<String, String>? headers,
  required T Function(String) parser,
}) async {
  try {
    final result = await parsedRequest(url, parser: parser);
    return ArriRequestResult(value: result);
  } catch (err) {
    return ArriRequestResult(
        error: err is ArriRequestError
            ? err
            : ArriRequestError(
                statusCode: 500,
                statusMessage: err.toString(),
                data: err,
              ));
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

class ArriRequestError implements Exception {
  final int statusCode;
  final String statusMessage;
  final dynamic data;
  const ArriRequestError({
    required this.statusCode,
    required this.statusMessage,
    this.data,
  });
  factory ArriRequestError.fromResponse(http.Response response) {
    try {
      final body = json.decode(response.body);
      return ArriRequestError(
          statusCode: response.statusCode,
          statusMessage: body["statusMessage"] is String
              ? body["statusMessage"]
              : "Unknown error",
          data: body["data"]);
    } catch (err) {
      return ArriRequestError(
        statusCode: response.statusCode,
        statusMessage: "Unknown error",
        data: null,
      );
    }
  }
}
