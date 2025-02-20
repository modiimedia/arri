// import 'dart:async';

// import 'package:arri_client/arri_client.dart';
// import 'package:web_socket_channel/web_socket_channel.dart';
// import 'package:web_socket_channel/status.dart' as status;

// Future<ArriWebsocketController<TServerMessage, TClientMessage>>
//     arriWebsocketRequest<TServerMessage, TClientMessage>(
//   String url, {
//   FutureOr<Map<String, String>> Function()? headers,
//   required TServerMessage Function(String msg) parser,
//   required String Function(TClientMessage msg) serializer,
//   Function(Object)? onError,
//   String? clientVersion,
// }) async {
//   var finalUrl =
//       url.replaceAll("http://", "ws://").replaceAll("https://", "wss://");

//   if (headers != null || clientVersion?.isNotEmpty == true) {
//     final queryParts = <String>[];
//     for (final entry
//         in (await headers?.call())?.entries ?? <MapEntry<String, String>>[]) {
//       queryParts.add("${entry.key}=${entry.value}");
//     }
//     if (clientVersion != null) {
//       queryParts.add("client-version=$clientVersion");
//     }
//     finalUrl = "$finalUrl?${queryParts.join("&")}";
//   }
//   final uri = Uri.parse(finalUrl);
//   final channel = WebSocketChannel.connect(uri);
//   await channel.ready;
//   return ArriWebsocketController<TServerMessage, TClientMessage>(
//     channel: channel,
//     parser: parser,
//     serializer: serializer,
//   );
// }

// typedef WsMessageHandler<T> = Function(T data);
// typedef MessageParser<T> = T Function(String data);
// typedef MessageSerializer<T> = String Function(T data);

// class ArriWebsocketController<TIncoming, TOutgoing> {
//   final WebSocketChannel channel;
//   final MessageParser<TIncoming> parser;
//   final MessageSerializer<TOutgoing> serializer;

//   bool isClosed = false;
//   ArriWebsocketController({
//     required this.channel,
//     required this.parser,
//     required this.serializer,
//   });

//   void send(TOutgoing msg) {
//     channel.sink.add(serializer(msg));
//   }

//   void close([int? statusCode = status.normalClosure, String? reason]) {
//     channel.sink.close(statusCode, reason);
//   }

//   StreamSubscription listen({
//     /**
//      * Fires when receiving a "message" event from the server
//      */
//     required Function(TIncoming message) onMessage,
//     /**
//      * Fires when receiving an "error" event from the server
//      */
//     Function(ArriError error)? onErrorMessage,
//     /**
//      * Fires when receiving any event from the server
//      */
//     Function(WsEvent<TIncoming> event)? onEvent,
//     Function(Object?)? onConnectionError,
//     Function()? onDone,
//     bool? cancelOnError,
//   }) {
//     return channel.stream.listen(
//       (message) {
//         if (message is! String) {
//           return;
//         }
//         final event = WsEvent.fromString(message, parser);
//         onEvent?.call(event);
//         switch (event) {
//           case WsMessageEvent<TIncoming>():
//             onMessage(event.data);
//             break;
//           case WsErrorEvent<TIncoming>():
//             onErrorMessage?.call(event.data);
//             break;
//           case WsRawEvent<TIncoming>():
//             break;
//         }
//       },
//       onError: onConnectionError,
//       onDone: onDone,
//       cancelOnError: cancelOnError,
//     );
//   }
// }

// /// implemented by [WsMessageEvent], [WsErrorEvent], and [WsRawEvent]
// sealed class WsEvent<T> {
//   factory WsEvent.fromString(String input, T Function(String data) parser) {
//     final evt = WsRawEvent<T>.fromString(input);
//     switch (evt.event) {
//       case "message":
//         return WsMessageEvent(parser(evt.data));
//       case "error":
//         return WsErrorEvent(ArriError.fromString(evt.data));
//       default:
//         return evt;
//     }
//   }
// }

// class WsMessageEvent<T> implements WsEvent<T> {
//   final T data;
//   const WsMessageEvent(this.data);
// }

// class WsErrorEvent<T> implements WsEvent<T> {
//   final ArriError data;
//   const WsErrorEvent(this.data);
// }

// class WsRawEvent<T> implements WsEvent<T> {
//   final String event;
//   final String data;
//   const WsRawEvent({required this.event, required this.data});

//   factory WsRawEvent.fromString(String input) {
//     final lines = input.split("\n");
//     String event = "unknown";
//     String data = "";
//     for (final line in lines) {
//       if (line.startsWith("event: ")) {
//         event = line.replaceFirst("event: ", "").trim();
//         continue;
//       }
//       if (line.startsWith("data:")) {
//         data = line.replaceFirst("data:", "").trim();
//         continue;
//       }
//     }
//     return WsRawEvent(event: event, data: data);
//   }
// }
