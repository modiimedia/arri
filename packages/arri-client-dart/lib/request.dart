import 'dart:convert';

import 'package:arri_client/errors.dart';
import 'package:http/http.dart' as http;

/// Enum of available HTTP methods
enum HttpMethod implements Comparable<HttpMethod> {
  get("GET"),
  post("POST"),
  put("PUT"),
  patch("PATCH"),
  head("HEAD"),
  delete("DELETE");

  const HttpMethod(this.value);
  final String value;

  @override
  compareTo(HttpMethod other) => value.compareTo(other.value);
}

/// Perform a raw http request
Future<http.Response> arriRequest(
  String url, {
  HttpMethod method = HttpMethod.get,
  Map<String, dynamic>? params,
  Map<String, String>? headers,

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
    bodyInput = json.encode(params);
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
          headers: finalHeaders,
        );
      }
      break;
    case HttpMethod.patch:
      result = await http.patch(
        Uri.parse(url),
        headers: finalHeaders,
        body: bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.put:
      result = await http.put(
        Uri.parse(url),
        headers: finalHeaders,
        body: bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.post:
      result = await http.post(
        Uri.parse(url),
        headers: finalHeaders,
        body: bodyInput,
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
          headers: finalHeaders,
        );
      }
      break;
    case HttpMethod.delete:
      result = await http.delete(Uri.parse(url),
          headers: finalHeaders, encoding: encoding, body: bodyInput);
      break;
    default:
      throw ArriRequestError.fromResponse(result);
  }
  return result;
}

/// Helper function for performing raw HTTP request to an Arri RPC server
/// This function will throw an ArriRequestError if it fails
Future<T> parsedArriRequest<T, E extends Exception>(
  String url, {
  HttpMethod method = HttpMethod.post,
  Map<String, dynamic>? params,
  Map<String, String>? headers,
  required T Function(String) parser,
}) async {
  final result =
      await arriRequest(url, method: method, params: params, headers: headers);
  if (result.statusCode >= 200 && result.statusCode <= 299) {
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
    final result = await parsedArriRequest(
      url,
      parser: parser,
    );
    return ArriRequestResult(value: result);
  } catch (err) {
    return ArriRequestResult(error: err is ArriRequestError ? err : null);
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
