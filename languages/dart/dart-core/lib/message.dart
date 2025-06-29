import './model.dart';

const arriVersion = "0.0.8";

class ClientMessage<TBody extends ArriModel?> {
  final String rpcName;
  final String? reqId;
  final String? path;
  final ContentType contentType;
  final String? clientVersion;
  final Map<String, String> customHeaders;
  final TBody body;
  const ClientMessage({
    required this.rpcName,
    required this.reqId,
    required this.path,
    required this.contentType,
    required this.clientVersion,
    required this.customHeaders,
    required this.body,
  });

  factory ClientMessage.fromString(String input) {
    throw UnimplementedError();
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
