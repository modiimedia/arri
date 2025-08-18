import 'dart:convert';

import 'package:arri_core/helpers.dart';
import 'package:http/http.dart' as http;

/// Serializable request error that can parse the error responses from an Arri RPC server.
class ArriError implements Exception {
  final int code;
  final String message;
  late final String? _body;
  bool _bodyParsed = false;

  late List<String>? _trace;
  late dynamic _data;

  ArriError({
    required this.code,
    required this.message,
    String? body,
    dynamic data,
    List<String>? trace,
  }) {
    this._body = body;
    this._data = data;
    this._trace = trace;
  }

  _parseBody() {
    if (_bodyParsed) return;
    if (_body == null || _body.isEmpty) {
      _bodyParsed = true;
      return;
    }
    if (_data != null || _trace != null) {
      _bodyParsed = true;
      return;
    }
    try {
      final result = json.decode(_body);
      this._data = result["data"];
      this._trace = result["trace"] is List &&
              (result["trace"] as List).every((el) => el is String)
          ? result["trace"] as List<String>
          : null;
    } catch (_) {}
    _bodyParsed = true;
  }

  dynamic get data {
    _parseBody();
    return _body;
  }

  List<String>? get trace {
    _parseBody();
    return _trace;
  }

  List<Object?> get props => [code, message, data, trace];

  @override
  bool operator ==(Object other) {
    return other is ArriError && listsAreEqual(props, other.props);
  }

  /// Create an ArriRequestError from an HTTP response
  factory ArriError.fromResponse(http.Response response) {
    final code = int.tryParse(response.headers["err-code"] ?? "0") ?? 0;
    final message = response.headers["err-msg"] ?? "unknown error";
    return ArriError(
      code: code,
      message: message,
      body: response.body,
      data: null,
      trace: null,
    );
  }

  factory ArriError.unknown() {
    return ArriError(code: 400, message: "Unknown error");
  }

  @override
  String toString() {
    if (trace == null) {
      return "ArriError { code: $code, message: $message, data: ${data} }";
    }
    return "ArriError { code: $code, message: $message, data: ${data}, stack: [${trace!.map((e) => "\"$e\"").join(",")}] }";
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{"code": code, "message": message};
    if (data != null) {
      result["data"] = data;
    }
    if (trace != null) {
      result["stack"] = trace;
    }
    return result;
  }

  String toJsonString() {
    return json.encode(toJson());
  }
}

abstract class ArriErrorBuilder<T extends Exception> {
  T fromJson(Map<String, dynamic> json);
}

class MissingDispatcherError extends ArriError {
  MissingDispatcherError(String transport)
      : super(
          code: 0,
          message:
              "Missing dispatcher for the following transport: \"$transport\"",
        );
}
