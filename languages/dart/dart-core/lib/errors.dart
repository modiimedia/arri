import 'dart:convert';

import 'package:arri_core/helpers.dart';
import 'package:http/http.dart' as http;

/// Serializable request error that can parse the error responses from an Arri RPC server.
class ArriError implements Exception {
  final int code;
  final String message;
  final dynamic data;
  final List<String>? stack;
  const ArriError({
    required this.code,
    required this.message,
    this.data,
    this.stack,
  });

  List<Object?> get props => [code, message, stack];

  @override
  bool operator ==(Object other) {
    return other is ArriError && listsAreEqual(props, other.props);
  }

  /// Create an ArriRequestError from an HTTP response
  factory ArriError.fromResponse(http.Response response) {
    try {
      final body = json.decode(response.body);
      return ArriError(
        code: body["code"] is int ? body["code"] : response.statusCode,
        message: body["message"] is String
            ? body["message"]
            : "Unknown error requesting ${response.request?.url.toString()}",
        data: body["data"],
        stack: body["stack"] is List
            ? (body["stack"] as List)
                .map((e) => e is String ? e : e.toString())
                .toList()
            : null,
      );
    } catch (err) {
      return ArriError.unknown();
    }
  }

  factory ArriError.unknown() {
    return ArriError(code: 400, message: "Unknown error");
  }
  @override
  String encodeString() {
    if (stack == null) {
      return "{ code: $code, message: $message, data: ${data.encodeString()} }";
    }
    return "{ code: $code, message: $message, data: ${data.encodeString()}, stack: [${stack!.map((e) => "\"$e\"").join(",")}] }";
  }

  factory ArriError.fromJson(Map<String, dynamic> json) {
    return ArriError(
      code: json["code"] is int ? json["code"] : 0,
      message: json["message"] is String ? json["message"] : "Unknown Error",
      data: json["data"],
      stack: json["stack"] is List
          ? (json["stack"] as List)
              .map((e) => e is String ? e : e.toString())
              .toList()
          : null,
    );
  }

  factory ArriError.fromJsonString(String input) {
    try {
      final val = json.decode(input);
      return ArriError.fromJson(val);
    } catch (err) {
      return ArriError.unknown();
    }
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{"code": code, "message": message};
    if (data != null) {
      result["data"] = data;
    }
    if (stack != null) {
      result["stack"] = stack;
    }
    return result;
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
