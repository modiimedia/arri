import 'dart:convert';

import 'package:arri_client/parsing.dart';
import 'package:http/http.dart' as http;

/// Serializable request error that can parse the error responses from an Arri RPC server.
class ArriRequestError implements Exception {
  final int statusCode;
  final String statusMessage;
  final dynamic data;
  final String? stack;
  const ArriRequestError({
    required this.statusCode,
    required this.statusMessage,
    this.data,
    this.stack,
  });

  /// Create an ArriRequestError from an HTTP response
  factory ArriRequestError.fromResponse(http.Response response) {
    try {
      final body = json.decode(response.body);
      return ArriRequestError(
        statusCode: body["statusCode"] is int
            ? body["statusCode"]
            : response.statusCode,
        statusMessage: body["statusMessage"] is String
            ? body["statusMessage"]
            : "Unknown error requesting ${response.request?.url.toString()}",
        data: body["data"],
        stack: body["stack"] is String ? body["stack"] : null,
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
    return "{ statusCode: $statusCode, statusMessage: $statusMessage, data: ${data.toString()}, stack: $stack }";
  }

  factory ArriRequestError.fromJson(Map<String, dynamic> json) {
    return ArriRequestError(
      statusCode: intFromDynamic(json["statusCode"], 0),
      statusMessage:
          typeFromDynamic<String>(json["statusMessage"], "Unknown Error"),
      data: json["data"],
      stack: nullableTypeFromDynamic<String>(json["stack"]),
    );
  }

  factory ArriRequestError.fromString(String input) {
    try {
      final val = json.decode(input);
      return ArriRequestError.fromJson(val);
    } catch (err) {
      return ArriRequestError.unknown();
    }
  }
}

abstract class ArriErrorBuilder<T extends Exception> {
  T fromJson(Map<String, dynamic> json);
}
