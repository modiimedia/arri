import 'dart:convert';

import 'package:arri_client/parsing.dart';
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
    return ArriError(
      code: 400,
      message: "Unknown error",
    );
  }
  @override
  String toString() {
    if (stack == null) {
      return "{ code: $code, message: $message, data: ${data.toString()} }";
    }
    return "{ code: $code, message: $message, data: ${data.toString()}, stack: [${stack!.map((e) => "\"$e\"").join(",")}] }";
  }

  factory ArriError.fromJson(Map<String, dynamic> json) {
    return ArriError(
      code: intFromDynamic(json["code"], 0),
      message: typeFromDynamic<String>(json["message"], "Unknown Error"),
      data: json["data"],
      stack: json["stack"] is List
          ? (json["stack"] as List)
              .map((e) => e is String ? e : e.toString())
              .toList()
          : null,
    );
  }

  factory ArriError.fromString(String input) {
    try {
      final val = json.decode(input);
      return ArriError.fromJson(val);
    } catch (err) {
      return ArriError.unknown();
    }
  }
}

abstract class ArriErrorBuilder<T extends Exception> {
  T fromJson(Map<String, dynamic> json);
}
