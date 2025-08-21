import 'dart:convert';
import 'dart:typed_data';

import 'package:arri_core/helpers.dart';
import 'package:arri_core/message.dart';
import 'package:http/http.dart' as http;

/// Serializable request error that can parse the error responses from an Arri RPC server.
class ArriError implements Exception {
  final String? reqId;
  final int code;
  final String message;
  late final Uint8List? _body;
  final ContentType contentType;
  bool _bodyParsed = false;

  late List<String>? _trace;
  late dynamic _data;

  ArriError({
    required this.code,
    required this.message,
    this.reqId,
    this.contentType = ContentType.json,
    Uint8List? body,
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
      final result = json.decode(String.fromCharCodes(_body));
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
  factory ArriError.fromHttpResponse(http.Response response) {
    final reqId = response.headers["req-id"];
    final code = int.tryParse(response.headers["err-code"] ?? "0") ?? 0;
    final message = response.headers["err-msg"] ?? "unknown error";
    return ArriError(
      code: code,
      message: message,
      reqId: reqId,
      body: response.bodyBytes,
      data: null,
      trace: null,
    );
  }

  static Future<ArriError> fromHttpStreamedResponse(
      http.StreamedResponse response) async {
    final reqId = response.headers["req-id"];
    final code = int.tryParse(response.headers["err-code"] ?? "0");
    final message = response.headers["err-msg"] ?? "unknown error";
    final body = await byteStreamToUint8List(response.stream).tryCatch();
    return ArriError(
      reqId: reqId,
      code: code ?? 0,
      message: message,
      body: body.unwrap(),
    );
  }

  factory ArriError.fromErrorMessage(ErrorMessage msg) {
    return ArriError(
      code: msg.code,
      message: msg.message,
      contentType: msg.contentType,
      body: msg.body,
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

  Message toMessage(String reqId, {Map<String, String>? headers}) {
    Uint8List? body;
    if (_trace != null || _data != null) {
      body = Uint8List.fromList(
          json.encode({"data": _data, "trace": _trace}).codeUnits);
    } else if (_body != null) {
      body = _body;
    }
    return ErrorMessage(
      reqId: reqId,
      code: code,
      message: message,
      contentType: contentType,
      customHeaders: headers ?? {},
      body: body,
    );
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

Future<Uint8List> byteStreamToUint8List(http.ByteStream stream) async {
  List<int> allBytes = [];
  await for (var chunk in stream) {
    allBytes.addAll(chunk);
  }
  return Uint8List.fromList(allBytes);
}
