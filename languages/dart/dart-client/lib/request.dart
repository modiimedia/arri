import 'dart:async';
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
  http.Client? httpClient,
  HttpMethod method = HttpMethod.get,
  Map<String, dynamic>? params,
  FutureOr<Map<String, String>> Function()? headers,

  /// manually specify specific url query parameters
  Map<String, String>? query,

  /// manually specify a specific encoding
  Encoding? encoding,
  String? clientVersion,
}) async {
  String defaultErrorMsg =
      "Placeholder request. If you see this that means a request was never sent to the server.";
  http.Response result = http.Response(
    """{"statusCode": 400,"statusMessage":"$defaultErrorMsg"}""",
    400,
  );

  final finalHeaders = await headers?.call() ?? {};
  if (clientVersion != null && clientVersion.isNotEmpty) {
    finalHeaders["client-version"] = clientVersion;
  }
  final client = httpClient ?? http.Client();
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
        result = await client.get(
          uri,
          headers: finalHeaders,
        );
        break;
      }
      final uri = Uri.parse(url);
      result = await client.get(uri, headers: finalHeaders);
      break;
    case HttpMethod.patch:
      result = await client.patch(
        Uri.parse(url),
        headers: finalHeaders,
        body: bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.put:
      result = await client.put(
        Uri.parse(url),
        headers: finalHeaders,
        body: bodyInput,
        encoding: encoding,
      );
      break;
    case HttpMethod.post:
      result = await client.post(
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
        result = await client.head(
          uri,
          headers: finalHeaders,
        );
      }
      break;
    case HttpMethod.delete:
      result = await client.delete(Uri.parse(url),
          headers: finalHeaders, encoding: encoding, body: bodyInput);
      break;
    // ignore: unreachable_switch_default
    default:
      throw ArriError.fromResponse(result);
  }
  return result;
}

/// Helper function for performing raw HTTP request to an Arri RPC server
/// This function will throw an ArriRequestError if it fails
Future<T> parsedArriRequest<T, E extends Exception>(
  String url, {
  http.Client? httpClient,
  HttpMethod method = HttpMethod.post,
  Map<String, dynamic>? params,
  FutureOr<Map<String, String>> Function()? headers,
  Function(Object)? onError,
  String? clientVersion,
  required T Function(String) parser,
}) async {
  final http.Response result;

  try {
    result = await arriRequest(
      url,
      httpClient: httpClient,
      method: method,
      params: params,
      headers: headers,
      clientVersion: clientVersion,
    );
    if (result.statusCode >= 200 && result.statusCode <= 299) {
      return parser(utf8.decode(result.bodyBytes));
    }
  } catch (err) {
    onError?.call(err);
    rethrow;
  }
  final err = ArriError.fromResponse(result);
  onError?.call(err);
  throw err;
}

/// Perform a raw HTTP request to an Arri RPC server. This function does not thrown an error. Instead it returns a request result
/// in which both value and the error can be null.
Future<ArriResult<T>> parsedArriRequestSafe<T>(
  String url, {
  http.Client? httpClient,
  HttpMethod httpMethod = HttpMethod.get,
  Map<String, dynamic>? params,
  FutureOr<Map<String, String>> Function()? headers,
  required T Function(String) parser,
  String? clientVersion,
}) async {
  try {
    final result = await parsedArriRequest(
      url,
      parser: parser,
      headers: headers,
      params: params,
      clientVersion: clientVersion,
      method: httpMethod,
      httpClient: httpClient,
    );
    return ArriResultOk(result);
  } catch (err) {
    return ArriResultErr(
      err is ArriError
          ? err
          : ArriError(
              code: 0,
              message: err.toString(),
              data: err,
            ),
    );
  }
}

/// Container for holding a request data or a request error
sealed class ArriResult<T> {
  bool get isOk;
  bool get isErr;
  T? get unwrap;
  T unwrapOr(T fallback);
  ArriError? get unwrapErr;
}

class ArriResultOk<T> implements ArriResult<T> {
  final T _data;
  const ArriResultOk(this._data);

  @override
  bool get isOk => true;

  @override
  bool get isErr => false;

  @override
  T get unwrap => _data;

  @override
  T unwrapOr(T fallback) => _data;

  @override
  ArriError? get unwrapErr => null;
}

class ArriResultErr<T> implements ArriResult<T> {
  final ArriError _err;
  const ArriResultErr(this._err);

  @override
  bool get isErr => true;

  @override
  bool get isOk => false;

  @override
  T? get unwrap => null;

  @override
  ArriError get unwrapErr => _err;

  @override
  T unwrapOr(T fallback) => fallback;
}
