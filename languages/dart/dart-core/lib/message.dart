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
  String encodeString();

  List<Object?> get props;

  String? get reqId;

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
        final [version, typeIndicator] = parts;
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
          reason = reason;
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

    ;

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
    String? body;
    final bodyStr = input.substring(bodyStartIndex);
    if (bodyStr.length > 0) body = bodyStr;
    switch (type!) {
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
        if (contentType == null || contentType == ContentType.unknown) {
          return Err("content-type is a required header for invocation RPCs");
        }
        return Ok(InvocationMessage(
          reqId: reqId!,
          rpcName: rpcName!,
          contentType: contentType!,
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
            reqId: reqId!,
            contentType: contentType ?? ContentType.unknown,
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
            reqId: reqId!,
            contentType: contentType ?? ContentType.unknown,
            code: errCode!,
            message: errMsg!,
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
        return Ok(StreamDataMessage(reqId: reqId!, msgId: msgId, body: body));
      case MessageType.streamEnd:
        if (reqId == null) {
          return Err("req-id is required for STREAM_END messages");
        }
        return Ok(StreamEndMessage(
          reqId: reqId!,
          reason: reason,
        ));
      case MessageType.streamCancel:
        if (reqId == null) {
          return Err("req-id is required for STREAM_CANCEL messages");
        }
        return Ok(StreamCancelMessage(reqId: reqId!, reason: reason));
    }
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
  final String? body;
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
  String encodeString() {
    String output = "ARRIRPC/$arriVersion $rpcName\n";
    output += "content-type: ${contentType.serialValue}\n";
    output += "req-id: $reqId\n";
    if (clientVersion != null) output += "client-version: $clientVersion\n";
    for (final entry in customHeaders.entries) {
      output += "${entry.key}: ${entry.value}\n";
    }
    output += "\n";
    if (body != null) output += body!;
    return output;
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
    if (clientVersion != null) req.headers["client-version"] = clientVersion!;
    for (final entry in customHeaders.entries) {
      req.headers[entry.key.toLowerCase()] = entry.value;
    }
    if (body != null) req.body = body!;
    return req;
  }
}

class OkMessage implements Message {
  final String reqId;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  final String? body;
  const OkMessage({
    required this.reqId,
    required this.contentType,
    required this.customHeaders,
    required this.body,
  });

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion OK\n";
    output += "content-type: ${contentType.serialValue}\n";
    output += "req-id: $reqId\n";
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
    return other is OkMessage && listsAreEqual(props, other.props);
  }
}

class ErrorMessage implements Message {
  final String reqId;
  final int code;
  final String message;
  final ContentType contentType;
  final Map<String, String> customHeaders;
  final String? body;
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
  String encodeString() {
    String output = "ARRIRPC/$arriVersion ERROR\n";
    output += "content-type: ${contentType.serialValue}\n";
    output += "req-id: $reqId\n";
    output += "err-code: $code\n";
    output += "err-msg: $message\n";
    for (final entry in customHeaders.entries) {
      output += "${entry.key.toLowerCase()}: ${entry.value}\n";
    }
    output += "\n";
    if (body != null) output += body!;
    return output;
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
    output += "req-id: ${reqId}\n";
    if (msgId != null) output += "msg-id: ${msgId}\n";
    output += "\n";
    if (body != null) output += body!;
    return output;
  }
}

class StreamEndMessage implements Message {
  final String reqId;
  final String? reason;
  StreamEndMessage({required this.reqId, required this.reason});

  @override
  List<Object?> get props => [reqId, reason];

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion STREAM_END\n";
    output += "req-id: $reqId\n";
    output += "reason: $reason\n";
    output += "\n";
    return output;
  }
}

class StreamCancelMessage implements Message {
  final String reqId;
  final String? reason;
  StreamCancelMessage({required this.reqId, required this.reason});

  @override
  List<Object?> get props => [reqId, reason];

  @override
  String encodeString() {
    String output = "ARRIRPC/$arriVersion STREAM_CANCEL\n";
    output += "req-id: $reqId\n";
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
