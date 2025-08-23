import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import './helpers.dart';

const arriVersion = "0.0.8";

enum HttpMethods {
  get("GET"),
  post("POST"),
  put("PUT"),
  patch("PATCH"),
  delete("DELETE");

  const HttpMethods(this.serialValue);
  final String serialValue;
}

bool isCurrentArriVersionPrefix(String input) {
  return input == "ARRIRPC/$arriVersion";
}

enum MessageType {
  unknown(""),
  invocation("INVOCATION"),
  ok("OK"),
  error("ERROR"),
  heartbeat("HEARTBEAT"),
  connectionStart("CONNECTION_START"),
  streamData("STREAM_DATA"),
  streamEnd("STREAM_END"),
  streamCancel("STREAM_CANCEL");

  const MessageType(this.serialValue);
  final String serialValue;

  factory MessageType.fromSerialValue(String input) {
    for (final val in values) {
      if (val == input) return val;
    }
    return unknown;
  }
}

sealed class Message {
  const Message();
  Uint8List encode();
  String encodeString();

  List<Object?> get props;

  String? get reqId;

  static Result<Message, String> fromBytes<TBody>(Uint8List bytes) {
    MessageType? type;
    String? reqId;
    String? msgId;
    String? rpcName;
    String? reason;
    String? clientVersion;
    int? errCode;
    String? errMsg;
    ContentType? contentType;
    final Map<String, String> customHeaders = {};
    int? heartbeatInterval;
    int? bodyStartIndex;

    int currentLineStart = 0;
    int currentLineEnd = 0;
    final endOfLineByte = 10;

    String? processLine() {
      final lineString = String.fromCharCodes(
        Uint8List.sublistView(bytes, currentLineStart, currentLineEnd),
      );
      if (type == null) {
        final parts = lineString.split(' ');
        if (parts.length < 2) {
          return "Invalid message. Message must begin with \"ARRIRPC/$arriVersion <msg-type>\"";
        }
        final [version, typeIndicator, ..._] = parts;
        if (!isCurrentArriVersionPrefix(version)) {
          return "Unsupported Arri version. Expected \"${arriVersion}\" got \"${version}\"";
        }
        switch (typeIndicator) {
          case "OK":
            type = MessageType.ok;
            break;
          case "ERROR":
            type = MessageType.error;
            break;
          case "HEARTBEAT":
            type = MessageType.heartbeat;
            break;
          case "CONNECTION_START":
            type = MessageType.connectionStart;
            break;
          case "STREAM_DATA":
            type = MessageType.streamData;
            break;
          case "STREAM_END":
            type = MessageType.streamEnd;
            break;
          case "STREAM_CANCEL":
            type = MessageType.streamCancel;
            break;
          default:
            type = MessageType.invocation;
            rpcName = typeIndicator;
            break;
        }
        currentLineStart = currentLineEnd + 1;
        return null;
      }
      final (key, value) = parseHeaderLine(lineString);
      switch (key) {
        case "content-type":
          contentType = ContentType.fromSerialValue(value);
          break;
        case 'req-id':
          reqId = value;
          break;
        case "msg-id":
          msgId = value;
          break;
        case "reason":
          reason = value;
          break;
        case 'heartbeat-interval':
          heartbeatInterval = int.tryParse(value);
          break;
        case "client-version":
          clientVersion = value;
          break;
        case "err-code":
          errCode = int.tryParse(value);
          break;
        case "err-msg":
          errMsg = value;
          break;
        default:
          customHeaders[key] = value;
          break;
      }
      currentLineStart = currentLineEnd + 1;
      return null;
    }

    for (var i = 0; i < bytes.length; i++) {
      final byte = bytes[i];
      if (byte == endOfLineByte && bytes[i + 1] == endOfLineByte) {
        currentLineEnd = i;
        final err = processLine();
        if (err != null) return Err(err);
        bodyStartIndex = i + 2;
        break;
      }
      if (byte == endOfLineByte) {
        currentLineEnd = i;
        final err = processLine();
        if (err != null) return Err(err);
        continue;
      }
    }
    if (type == null) return Err("Invalid message");
    if (bodyStartIndex == null) {
      return Err(
          "Invalid message. Missing \\n\\n delimiter indicating end of headers");
    }
    Uint8List? body;
    final bodyBytes = Uint8List.sublistView(bytes, bodyStartIndex);
    if (bodyBytes.isNotEmpty) body = bodyBytes;
    return _createMessage(
      type: type!,
      reqId: reqId,
      msgId: msgId,
      rpcName: rpcName,
      reason: reason,
      clientVersion: clientVersion,
      errCode: errCode,
      errMsg: errMsg,
      contentType: contentType,
      customHeaders: customHeaders,
      heartbeatInterval: heartbeatInterval,
      body: body,
    );
  }

  static Result<Message, String> _createMessage<T>({
    required MessageType type,
    required String? reqId,
    required String? msgId,
    required String? rpcName,
    required String? reason,
    required String? clientVersion,
    required int? errCode,
    required String? errMsg,
    required ContentType? contentType,
    required Map<String, String> customHeaders,
    required int? heartbeatInterval,
    required Uint8List? body,
  }) {
    switch (type) {
      case MessageType.unknown:
        return Err(
          "Invalid message. Invalid message type or outdated ARRIRPC/{version}",
        );
      case MessageType.invocation:
        if (reqId == null) {
          return Err("req-id is required for invocation messages");
        }
        if (rpcName == null) {
          return Err("Invalid message. Unable to determine RPC name.");
        }
        return Ok(InvocationMessage(
          reqId: reqId,
          rpcName: rpcName,
          contentType: contentType ?? ContentType.json,
          clientVersion: clientVersion,
          customHeaders: customHeaders,
          method: null,
          path: null,
          body: body,
        ));
      case MessageType.ok:
        if (reqId == null) {
          return Err("req-id is required for OK messages");
        }
        return Ok(
          OkMessage(
            reqId: reqId,
            contentType: contentType ?? ContentType.json,
            customHeaders: customHeaders,
            body: body,
          ),
        );
      case MessageType.error:
        if (reqId == null) {
          return Err("req-id is required for ERROR messages");
        }
        if (errCode == null) {
          return Err("err-code is a required header for ERROR messages");
        }
        if (errMsg == null) {
          return Err("err-msg is a required header for ERROR messages");
        }
        return Ok(
          ErrorMessage(
            reqId: reqId,
            contentType: contentType ?? ContentType.json,
            code: errCode,
            message: errMsg,
            customHeaders: customHeaders,
            body: body,
          ),
        );
      case MessageType.heartbeat:
        return Ok(HeartbeatMessage(heartbeatInterval: heartbeatInterval));
      case MessageType.connectionStart:
        return Ok(ConnectionStartMessage(heartbeatInterval: heartbeatInterval));
      case MessageType.streamData:
        if (reqId == null) {
          return Err("req-id is required for STREAM_DATA messages");
        }
        return Ok(StreamDataMessage(reqId: reqId, msgId: msgId, body: body));
      case MessageType.streamEnd:
        if (reqId == null) {
          return Err("req-id is required for STREAM_END messages");
        }
        return Ok(StreamEndMessage(
          reqId: reqId,
          reason: reason,
        ));
      case MessageType.streamCancel:
        if (reqId == null) {
          return Err("req-id is required for STREAM_CANCEL messages");
        }
        return Ok(StreamCancelMessage(reqId: reqId, reason: reason));
    }
  }

  static Result<Message, String> fromString<TBody>(String input) {
    MessageType? type;
    String? reqId;
    String? msgId;
    String? rpcName;
    String? reason;
    String? clientVersion;
    int? errCode;
    String? errMsg;
    ContentType? contentType;
    final Map<String, String> customHeaders = {};
    int? heartbeatInterval;
    int? bodyStartIndex;
    String currentLine = "";

    String? processLine() {
      if (type == null) {
        final parts = currentLine.split(' ');
        if (parts.length < 2) {
          return "Invalid message. Message must begin with \"ARRIRPC/$arriVersion <msg-type>\"";
        }
        final [version, typeIndicator, ..._] = parts;
        if (!isCurrentArriVersionPrefix(version)) {
          return "Unsupported Arri version. Expected \"${arriVersion}\" got \"${version}\"";
        }
        switch (typeIndicator) {
          case "OK":
            type = MessageType.ok;
            break;
          case "ERROR":
            type = MessageType.error;
            break;
          case "HEARTBEAT":
            type = MessageType.heartbeat;
            break;
          case "CONNECTION_START":
            type = MessageType.connectionStart;
            break;
          case "STREAM_DATA":
            type = MessageType.streamData;
            break;
          case "STREAM_END":
            type = MessageType.streamEnd;
            break;
          case "STREAM_CANCEL":
            type = MessageType.streamCancel;
            break;
          default:
            type = MessageType.invocation;
            rpcName = typeIndicator;
            break;
        }
        currentLine = "";
        return null;
      }
      final (key, value) = parseHeaderLine(currentLine);
      switch (key) {
        case "content-type":
          contentType = ContentType.fromSerialValue(value);
          break;
        case 'req-id':
          reqId = value;
          break;
        case "msg-id":
          msgId = value;
          break;
        case "reason":
          reason = value;
          break;
        case 'heartbeat-interval':
          heartbeatInterval = int.tryParse(value);
          break;
        case "client-version":
          clientVersion = value;
          break;
        case "err-code":
          errCode = int.tryParse(value);
          break;
        case "err-msg":
          errMsg = value;
          break;
        default:
          customHeaders[key] = value;
          break;
      }
      currentLine = "";
      return null;
    }

    for (var i = 0; i < input.length; i++) {
      final char = input[i];
      if (char == '\n' && input[i + 1] == '\n') {
        final err = processLine();
        if (err != null) return Err(err);
        bodyStartIndex = i + 2;
        break;
      }
      if (char == '\n') {
        final err = processLine();
        if (err != null) return Err(err);
        continue;
      }
      currentLine += char;
    }
    if (type == null) return Err("Invalid message");
    if (bodyStartIndex == null) {
      return Err(
          "Invalid message. Missing \\n\\n delimiter indicating end of headers");
    }
    Uint8List? body;
    final bodyView = input.substring(bodyStartIndex);
    if (bodyView.isNotEmpty) body = Uint8List.fromList(utf8.encode(bodyView));
    return _createMessage(
      type: type!,
      reqId: reqId,
      msgId: msgId,
      rpcName: rpcName,
      reason: reason,
      clientVersion: clientVersion,
      errCode: errCode,
      errMsg: errMsg,
      contentType: contentType,
      customHeaders: customHeaders,
      heartbeatInterval: heartbeatInterval,
      body: body,
    );
  }
}

class InvocationMessage implements Message {
  final String reqId;
  final String rpcName;
  final ContentType contentType;
  final String? clientVersion;
  final Map<String, String> customHeaders;
  final HttpMethods? method;
  final String? path;
  final Uint8List? body;
  InvocationMessage({
    required this.reqId,
    required this.rpcName,
    required this.contentType,
    required this.clientVersion,
    required this.customHeaders,
    required this.method,
    required this.path,
    required this.body,
  });

  @override
  bool operator ==(Object other) {
    return other is InvocationMessage && listsAreEqual(props, other.props);
  }

  @override
  Uint8List encode() {
    BytesBuilder builder = BytesBuilder();
    builder.add(utf8.encode("ARRIRPC/$arriVersion $rpcName\n"));
    builder.add(utf8.encode("content-type: ${contentType.serialValue}\n"));
    builder.add(utf8.encode("req-id: $reqId\n"));
    if (clientVersion != null) {
      builder.add(utf8.encode("client-version: $clientVersion\n"));
    }
    customHeaders.forEach((key, value) {
      builder.add(utf8.encode("$key: $value\n"));
    });
    builder.addByte(10);
    if (body != null) builder.add(body!);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    return utf8.decode(encode());
  }

  @override
  List<Object?> get props => [
        reqId,
        rpcName,
        contentType,
        clientVersion,
        customHeaders,
        body,
      ];

  http.Request toHttpRequest(String baseUrl) {
    final req = http.Request(
      method?.serialValue ?? "POST",
      Uri.parse(baseUrl + (path ?? "")),
    );
    req.headers['content-type'] = contentType.serialValue;
    req.headers["req-id"] = reqId;
    for (final entry in customHeaders.entries) {
      req.headers[entry.key.toLowerCase()] = entry.value;
    }
    return req;
  }
}

class OkMessage implements Message {
  final String reqId;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  final Uint8List? body;
  const OkMessage({
    required this.reqId,
    required this.contentType,
    required this.customHeaders,
    required this.body,
  });

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder.add(utf8.encode("ARRIRPC/$arriVersion OK\n"));
    builder.add(utf8.encode("content-type: ${contentType.serialValue}\n"));
    builder.add(utf8.encode("req-id: $reqId\n"));
    customHeaders.forEach((key, val) {
      builder.add(utf8.encode("$key: $val\n"));
    });
    builder.addByte(10);
    if (body != null) builder.add(body!);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    return utf8.decode(encode());
  }

  List<Object?> get props => [reqId, contentType, customHeaders, body];

  @override
  bool operator ==(Object other) {
    return other is OkMessage && listsAreEqual(props, other.props);
  }
}

class ErrorMessage implements Message {
  final String reqId;
  final int code;
  final String message;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  final Uint8List? body;
  const ErrorMessage({
    required this.reqId,
    required this.code,
    required this.message,
    required this.contentType,
    required this.customHeaders,
    required this.body,
  });

  @override
  List<Object?> get props => [
        reqId,
        code,
        message,
        contentType,
        customHeaders,
        body,
      ];

  @override
  bool operator ==(Object other) {
    return other is ErrorMessage && listsAreEqual(props, other.props);
  }

  @override
  String toString() {
    return "ErrorMessage { reqId: $reqId, code: $code, message: $message, contentType: $contentType, customHeaders: $customHeaders, body: $body }";
  }

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder.add(utf8.encode("ARRIRPC/$arriVersion ERROR\n"));
    builder.add(utf8.encode("content-type: ${contentType.serialValue}\n"));
    builder.add(
        utf8.encode("req-id: $reqId\nerr-code: $code\nerr-msg: $message\n"));
    customHeaders.forEach((key, val) {
      builder.add(utf8.encode("$key: $val\n"));
    });
    builder.addByte(10);
    if (body != null) builder.add(body!);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    return utf8.decode(encode());
  }
}

class HeartbeatMessage implements Message {
  final int? heartbeatInterval;
  const HeartbeatMessage({
    required this.heartbeatInterval,
  });

  @override
  String? get reqId => null;

  @override
  List<Object?> get props => [heartbeatInterval];

  @override
  bool operator ==(Object other) {
    return other is HeartbeatMessage && listsAreEqual(props, other.props);
  }

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder.add(utf8.encode("ARRIRPC/$arriVersion HEARTBEAT"));
    if (heartbeatInterval != null) {
      builder.add(utf8.encode("heartbeat-interval: $heartbeatInterval\n"));
    }
    builder.addByte(10);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion HEARTBEAT\n";
    if (heartbeatInterval != null) {
      output += "heartbeat-interval: $heartbeatInterval\n";
    }
    output += "\n";
    return output;
  }
}

class ConnectionStartMessage implements Message {
  final int? heartbeatInterval;
  const ConnectionStartMessage({
    required this.heartbeatInterval,
  });

  @override
  String? get reqId => null;

  @override
  List<Object?> get props => [heartbeatInterval];

  @override
  bool operator ==(Object other) {
    return other is ConnectionStartMessage && listsAreEqual(props, other.props);
  }

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder.add(utf8.encode("ARRIRPC/$arriVersion CONNECTION_START\n"));
    if (heartbeatInterval != null) {
      builder.add(utf8.encode("heartbeat-interval: $heartbeatInterval\n"));
    }
    builder.addByte(10);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion CONNECTION_START\n";
    if (heartbeatInterval != null) {
      output += "heartbeat-interval: $heartbeatInterval\n";
    }
    output += "\n";
    return output;
  }
}

class StreamDataMessage implements Message {
  final String reqId;
  final String? msgId;
  final Uint8List? body;
  StreamDataMessage({
    required this.reqId,
    required this.msgId,
    required this.body,
  });

  @override
  List<Object?> get props => [reqId, msgId, body];

  @override
  bool operator ==(Object other) {
    return other is StreamDataMessage && listsAreEqual(props, other.props);
  }

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder.add(utf8.encode("ARRIRPC/$arriVersion STREAM_DATA\n"));
    builder.add(utf8.encode("req-id: $reqId\n"));
    if (msgId != null) builder.add(utf8.encode("msg-id: $msgId\n"));
    builder.addByte(10);
    if (body != null) builder.add(body!);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    return utf8.decode(encode());
  }
}

class StreamEndMessage implements Message {
  final String reqId;
  final String? reason;
  StreamEndMessage({required this.reqId, required this.reason});

  @override
  List<Object?> get props => [reqId, reason];

  @override
  bool operator ==(Object other) {
    return other is StreamEndMessage && listsAreEqual(props, other.props);
  }

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder
        .add(utf8.encode("ARRIRPC/$arriVersion STREAM_END\nreq-id: $reqId\n"));
    if (reason != null) builder.add(utf8.encode("reason: $reason\n"));
    builder.addByte(10);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    return utf8.decode(encode());
  }

  @override
  String toString() {
    return "StreamEndMessage { reqId: $reqId, reason: $reason }";
  }
}

class StreamCancelMessage implements Message {
  final String reqId;
  final String? reason;
  StreamCancelMessage({required this.reqId, required this.reason});

  @override
  List<Object?> get props => [reqId, reason];

  @override
  bool operator ==(Object other) {
    return other is StreamCancelMessage && listsAreEqual(props, other.props);
  }

  @override
  Uint8List encode() {
    final builder = BytesBuilder();
    builder.add(
        utf8.encode("ARRIRPC/$arriVersion STREAM_CANCEL\nreq-id: $reqId\n"));
    if (reason != null) builder.add(utf8.encode("reason: $reason\n"));
    builder.addByte(10);
    return builder.toBytes();
  }

  @override
  String encodeString() {
    return utf8.decode(encode());
  }

  @override
  String toString() {
    return "StreamCancelMessage { reqId: $reqId, reason: $reason }";
  }
}

enum ContentType {
  json("application/json");

  const ContentType(this.serialValue);

  final String serialValue;

  static ContentType? fromSerialValue(String input) {
    for (final val in values) {
      if (val.serialValue == input) return val;
    }
    return null;
  }
}

(String key, String val) parseHeaderLine(String input) {
  var keyFinished = false;
  var keyIndexEnd = -1;
  var valueIndexStart = -1;
  for (var i = 0; i < input.length; i++) {
    if (!keyFinished) {
      if (input[i] == ":") {
        keyIndexEnd = i;
        keyFinished = true;
        continue;
      }
      continue;
    }
    if (input[i] == " ") continue;
    valueIndexStart = i;
    break;
  }
  if (keyIndexEnd < 0) return (input, "");
  if (valueIndexStart < 0) return (input.substring(0, keyIndexEnd), "");
  return (input.substring(0, keyIndexEnd), input.substring(valueIndexStart));
}
