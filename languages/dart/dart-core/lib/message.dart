import 'dart:convert';
import 'package:http/http.dart' as http;
import './helpers.dart';
import './model.dart';
import './errors.dart';

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

class ClientMessage<TBody extends ArriModel?> {
  final String rpcName;
  final String? reqId;
  final String? path;
  final HttpMethods? method;
  final ContentType contentType;
  final String? clientVersion;
  final Map<String, String> customHeaders;
  final TBody? body;
  const ClientMessage({
    required this.rpcName,
    required this.reqId,
    required this.method,
    required this.path,
    required this.contentType,
    required this.clientVersion,
    required this.customHeaders,
    required this.body,
  });

  factory ClientMessage.empty() {
    return ClientMessage<TBody>(
      rpcName: "",
      reqId: null,
      path: null,
      method: null,
      contentType: ContentType.unknown,
      clientVersion: null,
      customHeaders: {},
      body: null,
    );
  }

  static Result<ClientMessage<TBody>, String>
      fromString<TBody extends ArriModel?>(
    String input,
    TBody Function(String) bodyParser,
  ) {
    String? rpcName;
    String? reqId;
    ContentType? contentType;
    String? clientVersion;
    final Map<String, String> customHeaders = {};
    int? bodyStartIndex;
    String currentLine = "";
    final processLine = () {
      if (rpcName == null) {
        if (!currentLine.startsWith("ARRIRPC/$arriVersion")) {
          return "Message must begin with \"ARRIRPC/{version}\"";
        }
        final parts = currentLine.split(" ");
        if (parts.length != 2) return null;
        rpcName = parts[1];
        currentLine = "";
        return null;
      }
      final (key, value) = parseHeaderLine(currentLine);
      switch (key) {
        case "client-version":
          clientVersion = value;
          break;
        case "req-id":
          reqId = value;
          break;
        case "content-type":
          contentType = ContentType.fromSerialValue(value);
          break;
        default:
          customHeaders[key] = value;
          break;
      }
      currentLine = "";
      return null;
    };
    for (var i = 0; i < input.length; i++) {
      final char = input[i];
      if (char == '\n' && input[i + 1] == '\n') {
        var err = processLine();
        if (err != null) return Err(err);
        bodyStartIndex = i + 2;
        break;
      }
      if (char == '\n') {
        var err = processLine();
        if (err != null) return Err(err);
        continue;
      }
      currentLine += char;
    }

    if (rpcName == null) {
      return Err("Invalid message. Didn't contain procedure name.");
    }
    if (bodyStartIndex == null) {
      return Err(
        "Invalid message. Missing \\n\\n delimiter indicating end of headers",
      );
    }
    if (contentType == null) {
      return Err("Invalid message. Missing content-type header.");
    }
    if (contentType == null || contentType == ContentType.unknown) {
      return Err("Invalid message. Unsupported content-type header.");
    }
    final bodyStr = input.substring(bodyStartIndex);
    if (bodyStr.isEmpty) {
      return Ok(
        ClientMessage<TBody>(
          rpcName: rpcName!,
          reqId: reqId,
          method: null,
          clientVersion: clientVersion,
          customHeaders: customHeaders,
          contentType: contentType!,
          path: null,
          body: null,
        ),
      );
    }
    return Ok(
      ClientMessage<TBody>(
        rpcName: rpcName!,
        reqId: reqId,
        path: null,
        method: null,
        contentType: contentType!,
        clientVersion: clientVersion,
        customHeaders: customHeaders,
        body: bodyParser(bodyStr),
      ),
    );
  }

  String encodeString() {
    var output = "ARRIRPC/$arriVersion $rpcName\n";
    output += "content-type: ${contentType.serialValue}\n";
    if (reqId != null) output += "req-id: $reqId\n";
    if (clientVersion != null) output += "client-version: $clientVersion\n";
    for (final entry in customHeaders.entries) {
      output += "${entry.key.toLowerCase()}: ${entry.value}\n";
    }
    output += "\n";
    if (body != null) {
      output += body!.toJsonString();
    }
    return output;
  }

  String toString() {
    return "ClientMessage { reqId: $reqId, rpcName: $rpcName, contentType: $contentType, clientVersion: $clientVersion, customHeaders: $customHeaders, body: ${body?.toString()} }";
  }

  http.Request toHttpRequest(String baseUrl) {
    final req = http.Request(
      method?.serialValue ?? "POST",
      Uri.parse(baseUrl + (path ?? "")),
    );
    req.headers['content-type'] = contentType.serialValue;
    if (reqId != null) req.headers["req-id"] = reqId!;
    if (clientVersion != null) req.headers["client-version"] = clientVersion!;
    for (final entry in customHeaders.entries) {
      req.headers[entry.key.toLowerCase()] = entry.value;
    }
    if (body != null) req.body = body!.toJsonString();
    return req;
  }

  List<Object?> get props => [
        rpcName,
        reqId,
        path,
        method,
        contentType,
        clientVersion,
        customHeaders,
        body
      ];

  @override
  bool operator ==(Object other) {
    return other is ClientMessage<TBody> && listsAreEqual(props, other.props);
  }
}

enum _ServerMessageType {
  unknown(""),
  success("SUCCESS"),
  failure("FAILURE"),
  heartbeat("HEARTBEAT"),
  connectionStart("CONNECTION_START"),
  streamStart("ES_START"),
  streamData("ES_EVENT"),
  streamEnd("ES_END");

  const _ServerMessageType(this.serialValue);
  final String serialValue;

  // factory _ServerMessageType.fromSerialValue(String input) {
  //   for (final val in values) {
  //     if (val == input) return val;
  //   }
  //   return unknown;
  // }
}

sealed class ServerMessage {
  const ServerMessage();
  String encodeString();

  List<Object?> get props;

  String? get reqId;

  static Result<ServerMessage, String> fromString<TBody>(String input) {
    _ServerMessageType? type;
    String? reqId;
    String? msgId;
    String? reason;
    ContentType? contentType;
    final Map<String, String> customHeaders = {};
    int? heartbeatInterval;
    int? bodyStartIndex;
    String currentLine = "";

    final processLine = () {
      if (type == null) {
        switch (currentLine) {
          case "ARRIRPC/$arriVersion SUCCESS":
            type = _ServerMessageType.success;
            break;
          case "ARRIRPC/$arriVersion FAILURE":
            type = _ServerMessageType.failure;
            break;
          case "ARRIRPC/$arriVersion HEARTBEAT":
            type = _ServerMessageType.heartbeat;
            break;
          case "ARRIRPC/$arriVersion CONNECTION_START":
            type = _ServerMessageType.connectionStart;
            break;
          case "ARRIRPC/$arriVersion STREAM_START":
            type = _ServerMessageType.streamStart;
            break;
          case "ARRIRPC/$arriVersion STREAM_DATA":
            type = _ServerMessageType.streamData;
            break;
          case "ARRIRPC/$arriVersion STREAM_END":
            type = _ServerMessageType.streamEnd;
            break;
        }
        currentLine = "";
        return;
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
          reason = reason;
          break;
        case 'heartbeat-interval':
          heartbeatInterval = int.tryParse(value);
          break;

        default:
          customHeaders[key] = value;
          break;
      }
      currentLine = "";
    };

    for (var i = 0; i < input.length; i++) {
      final char = input[i];
      if (char == '\n' && input[i + 1] == '\n') {
        processLine();
        bodyStartIndex = i + 2;
        break;
      }
      if (char == '\n') {
        processLine();
        continue;
      }
      currentLine += char;
    }
    if (type == null) return Err("Invalid message");
    if (bodyStartIndex == null) {
      return Err(
          "Invalid message. Missing \\n\\n delimiter indicating end of headers");
    }
    switch (type!) {
      case _ServerMessageType.unknown:
        return Err(
          "Invalid message. Invalid message type or outdated ARRIRPC/{version}",
        );
      case _ServerMessageType.success:
        final bodyStr = input.substring(bodyStartIndex);
        final body = bodyStr.isEmpty ? null : bodyStr;
        return Ok(
          ServerSuccessMessage(
            reqId: reqId,
            contentType: contentType ?? ContentType.unknown,
            customHeaders: customHeaders,
            body: body,
          ),
        );
      case _ServerMessageType.failure:
        final errStr = input.substring(bodyStartIndex);
        final err = errStr.isEmpty ? null : ArriError.fromJsonString(errStr);
        return Ok(
          ServerFailureMessage(
            reqId: reqId,
            contentType: contentType ?? ContentType.unknown,
            customHeaders: customHeaders,
            error: err,
          ),
        );
      case _ServerMessageType.heartbeat:
        return Ok(HeartbeatMessage(heartbeatInterval: heartbeatInterval));
      case _ServerMessageType.connectionStart:
        return Ok(
          ServerConnectionStartMessage(
            heartbeatInterval: heartbeatInterval,
          ),
        );
      case _ServerMessageType.streamStart:
        return Ok(StreamStartMessage(
          reqId: reqId,
          contentType: contentType ?? ContentType.unknown,
          heartbeatInterval: heartbeatInterval,
          customHeaders: customHeaders,
        ));
      case _ServerMessageType.streamData:
        final bodyStr = input.substring(bodyStartIndex);
        final body = bodyStr.isEmpty ? null : bodyStr;
        return Ok(StreamDataMessage(
          reqId: reqId,
          msgId: msgId,
          body: body,
        ));
      case _ServerMessageType.streamEnd:
        return Ok(ServerEventStreamEndMessage(
          reqId: reqId,
          reason: reason ?? "",
        ));
    }
  }
}

class ServerSuccessMessage implements ServerMessage {
  final String? reqId;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  final String? body;
  const ServerSuccessMessage({
    required this.reqId,
    required this.contentType,
    required this.customHeaders,
    required this.body,
  });

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion SUCCESS\n";
    output += "content-type: ${contentType.serialValue}\n";
    if (reqId != null) output += "req-id: $reqId\n";
    for (final entry in customHeaders.entries) {
      output += "${entry.key.toLowerCase()}: ${entry.value}\n";
    }
    output += "\n";
    if (body != null) output += body!;
    return output;
  }

  List<Object?> get props => [reqId, contentType, customHeaders, body];

  @override
  bool operator ==(Object other) {
    return other is ServerSuccessMessage && listsAreEqual(props, other.props);
  }
}

class ServerFailureMessage implements ServerMessage {
  final String? reqId;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  final ArriError? error;
  const ServerFailureMessage({
    required this.reqId,
    required this.contentType,
    required this.customHeaders,
    required this.error,
  });

  @override
  List<Object?> get props => [reqId, contentType, customHeaders, error];

  @override
  bool operator ==(Object other) {
    return other is ServerFailureMessage && listsAreEqual(props, other.props);
  }

  @override
  String toString() {
    return "ServerFailureMessage { reqId: $reqId, contentType: $contentType, customHeaders: $customHeaders, error: $error }";
  }

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion FAILURE\n";
    output += "content-type: ${contentType.serialValue}\n";
    if (reqId != null) output += "req-id: $reqId\n";
    for (final entry in customHeaders.entries) {
      output += "${entry.key.toLowerCase()}: ${entry.value}\n";
    }
    output += "\n";
    if (error != null) {
      output += json.encode(error!.toJson());
    } else {
      output += json.encode(ArriError.unknown().toJson());
    }
    return output;
  }
}

class HeartbeatMessage implements ServerMessage {
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
  String encodeString() {
    String output = "ARRIRPC/$arriVersion HEARTBEAT\n";
    if (heartbeatInterval != null) {
      output += "heartbeat-interval: $heartbeatInterval\n";
    }
    output += "\n";
    return output;
  }
}

class ServerConnectionStartMessage implements ServerMessage {
  final int? heartbeatInterval;
  const ServerConnectionStartMessage({
    required this.heartbeatInterval,
  });

  @override
  String? get reqId => null;

  @override
  List<Object?> get props => [heartbeatInterval];

  @override
  bool operator ==(Object other) {
    return other is ServerConnectionStartMessage &&
        listsAreEqual(props, other.props);
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

class StreamStartMessage implements ServerMessage {
  final String? reqId;
  final int? heartbeatInterval;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  const StreamStartMessage({
    required this.reqId,
    required this.heartbeatInterval,
    required this.customHeaders,
    required this.contentType,
  });

  @override
  List<Object?> get props =>
      [reqId, heartbeatInterval, customHeaders, contentType];

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion STREAM_START\n";
    output += "content-type: ${contentType.serialValue}\n";
    if (reqId != null) output += "req-id: ${reqId}\n";
    if (heartbeatInterval != null) {
      output += "heartbeat-interval: $heartbeatInterval\n";
    }
    for (final entry in customHeaders.entries) {
      output += "${entry.key.toLowerCase()}: ${entry.value}\n";
    }
    output += "\n";
    return output;
  }
}

class StreamDataMessage implements ServerMessage {
  final String? reqId;
  final String? msgId;
  final String? body;
  StreamDataMessage({
    required this.reqId,
    required this.msgId,
    required this.body,
  });

  @override
  List<Object?> get props => [reqId, msgId, body];

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion STREAM_DATA\n";
    if (reqId != null) output += "req-id: ${reqId}\n";
    if (msgId != null) output += "msg-id: ${msgId}\n";
    output += "\n";
    if (body != null) output += body!;
    return output;
  }
}

class ServerEventStreamEndMessage implements ServerMessage {
  final String? reqId;
  final String reason;
  ServerEventStreamEndMessage({required this.reqId, required this.reason});

  @override
  List<Object?> get props => [reqId, reason];

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion STREAM_END\n";
    if (reqId != null) output += "req-id: $reqId\n";
    output += "reason: $reason\n";
    output += "\n";
    return output;
  }
}

enum ContentType {
  unknown(""),
  json("application/json");

  const ContentType(this.serialValue);

  final String serialValue;

  factory ContentType.fromSerialValue(String input) {
    for (final val in values) {
      if (val.serialValue == input) return val;
    }
    return unknown;
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
