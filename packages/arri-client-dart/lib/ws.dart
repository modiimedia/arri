import 'dart:async';

import 'package:arri_client/arri_client.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

Future<ArriWebsocketController<TServerMessage, TClientMessage>>
    arriWebsocketRequest<TServerMessage, TClientMessage>(
  String url, {
  Map<String, String> Function()? headers,
  required TServerMessage Function(String msg) parser,
  required String Function(TClientMessage msg) serializer,
  String? clientVersion,
}) async {
  var finalUrl =
      url.replaceAll("http://", "ws://").replaceAll("https://", "wss://");

  if (headers != null || clientVersion != null) {
    final queryParts = <String>[];
    for (final entry
        in headers?.call().entries ?? <MapEntry<String, String>>[]) {
      queryParts.add("${entry.key}=${entry.value}");
    }
    if (clientVersion != null) {
      queryParts.add("client-version=$clientVersion");
    }
    finalUrl = "$finalUrl?${queryParts.join("&")}";
  }
  final uri = Uri.parse(finalUrl);
  final channel = WebSocketChannel.connect(uri);
  await channel.ready;
  return ArriWebsocketController<TServerMessage, TClientMessage>(
    channel: channel,
    parser: parser,
    serializer: serializer,
  );
}

typedef WsMessageHandler<T> = Function(T data);
typedef MessageParser<T> = T Function(String data);
typedef MessageSerializer<T> = String Function(T data);

class ArriWebsocketController<TIncoming, TOutgoing> {
  final WebSocketChannel channel;
  final MessageParser<TIncoming> parser;
  final MessageSerializer<TOutgoing> serializer;

  bool isClosed = false;
  ArriWebsocketController({
    required this.channel,
    required this.parser,
    required this.serializer,
  });

  void send(TOutgoing msg) {
    channel.sink.add(serializer(msg));
  }

  void close([int? statusCode = status.goingAway, String? reason]) {
    channel.sink.close(statusCode, reason);
  }

  StreamSubscription listen({
    required Function(TIncoming data) onData,
    Function(WsEvent<TIncoming> event)? onEvent,
    Function(ArriError error)? onError,
    Function(Object?)? onConnectionError,
    Function()? onDone,
    bool? cancelOnError,
  }) {
    return channel.stream.listen(
      (message) {
        if (message is! String) {
          return;
        }
        final event = WsEvent.fromString(message, parser);
        onEvent?.call(event);
        switch (event) {
          case WsMessageEvent<TIncoming>():
            onData(event.data);
            break;
          case WsErrorEvent<TIncoming>():
            onError?.call(event.data);
            break;
          case WsRawEvent<TIncoming>():
            break;
        }
      },
      onError: onConnectionError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }
}

/// implemented by [WsMessageEvent], [WsErrorEvent], and [WsRawEvent]
sealed class WsEvent<T> {
  factory WsEvent.fromString(String input, T Function(String data) parser) {
    final event = WsRawEvent<T>.fromString(input);
    switch (event.type) {
      case "message":
        return WsMessageEvent(parser(event.data));
      case "error":
        return WsErrorEvent(ArriError.fromString(event.data));
      default:
        return event;
    }
  }
}

class WsMessageEvent<T> implements WsEvent<T> {
  final T data;
  const WsMessageEvent(this.data);
}

class WsErrorEvent<T> implements WsEvent<T> {
  final ArriError data;
  const WsErrorEvent(this.data);
}

class WsRawEvent<T> implements WsEvent<T> {
  final String type;
  final String data;
  const WsRawEvent({required this.type, required this.data});

  factory WsRawEvent.fromString(String input) {
    final lines = input.split("\n");
    String type = "unknown";
    String data = "";
    for (final line in lines) {
      if (line.startsWith("type:")) {
        type = line.replaceFirst("type:", "").trim();
        continue;
      }
      if (line.startsWith("data:")) {
        data = line.replaceFirst("data:", "");
        continue;
      }
    }
    return WsRawEvent(type: type, data: data);
  }
}
