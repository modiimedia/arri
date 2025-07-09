import 'dart:async';
import 'package:arri_core/arri_core.dart';

class RpcRequest<T extends ArriModel?> {
  final String procedure;
  String? reqId;
  final String path;
  final HttpMethod? method;
  final String? clientVersion;
  final FutureOr<Map<String, String>> Function()? customHeaders;
  final T data;

  RpcRequest({
    required this.procedure,
    required this.reqId,
    required this.path,
    required this.method,
    required this.clientVersion,
    required this.customHeaders,
    required this.data,
  });
}

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
