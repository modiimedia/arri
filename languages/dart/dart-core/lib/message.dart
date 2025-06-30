import 'package:arri_core/helpers.dart';

import './model.dart';

const arriVersion = "0.0.8";

class ClientMessage<TBody extends ArriModel?> {
  final String rpcName;
  final String? reqId;
  final String? path;
  final ContentType contentType;
  final String? clientVersion;
  final Map<String, String> customHeaders;
  final TBody? body;
  const ClientMessage({
    required this.rpcName,
    required this.reqId,
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
        final parts = currentLine.split(" ");
        if (parts.length < 2) return;
        rpcName = parts[1];
        currentLine = "";
        return;
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
        contentType: contentType!,
        clientVersion: clientVersion,
        customHeaders: customHeaders,
        body: bodyParser(bodyStr),
      ),
    );
  }

  String toString() {
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
}

sealed class ServerMessage {}

class ServerSuccessMessage {}

class ServerFailureMessage {}

class ServerHeartbeatMessage {}

class ServerConnectionStartMessage {}

enum ContentType {
  unknown(""),
  json("application/json");

  const ContentType(this.serialValue);

  final String serialValue;

  factory ContentType.fromSerialValue(String input) {
    for (final val in values) {
      if (val == input) return val;
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
