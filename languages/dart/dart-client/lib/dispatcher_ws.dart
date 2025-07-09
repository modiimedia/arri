import 'dart:async';

import 'package:arri_core/arri_core.dart';
import 'package:arri_client/dispatcher.dart';
import 'package:arri_client/request.dart';
import 'package:ulid/ulid.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class WsDispatcher implements Dispatcher {
  final String _connectionUrl;
  final double _heartbeatTimeoutMultiplier;

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _streamSubscription;

  final Map<String, Function(ServerMessage)> _messageHandlers = {};

  WsDispatcher({
    required String connectionUrl,
    double? heartbeatTimeoutMultiplier,
  })  : _connectionUrl = connectionUrl,
        _heartbeatTimeoutMultiplier = heartbeatTimeoutMultiplier ?? 2;

  Future<void> setupConnection({bool? forceReconnect}) async {
    if (_streamSubscription != null && forceReconnect != true) return;
    if (forceReconnect == true) {
      _streamSubscription?.cancel();
      _channel?.sink.close();
    }
    _channel = WebSocketChannel.connect(Uri.parse(_connectionUrl));
    _streamSubscription = _channel?.stream.listen(
      _handleMessage,
      onError: (err) {},
      onDone: () {},
    );
  }

  _handleMessage(dynamic msg) {
    print("GOT_MESSAGE. Type: ${msg.runtimeType}");
    print(msg);
  }

  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
  }) {
    if (req.reqId == null || req.reqId!.isEmpty) req.reqId = Ulid().toString();
    final completer = Completer<TOutput>();
    final timer = Timer(timeout ?? Duration(seconds: 30), () {
      if (completer.isCompleted) return;
      completer.completeError(ArriError(code: 0, message: "Timeout exceeded"));
    });
    _messageHandlers[req.reqId!] = (msg) {
      switch (msg) {
        case ServerSuccessMessage():
          final result = responseDecoder(msg.body ?? "");
          timer.cancel();
          completer.complete(result);
          return;
        case ServerFailureMessage():
          timer.cancel();
          completer.completeError(
            msg.error ??
                ArriError(
                  code: 0,
                  message: 'Received error response from server',
                ),
          );
          return;
        case ServerHeartbeatMessage():
        case ServerConnectionStartMessage():
          return;
      }
    };
    return completer.future;
  }

  @override
  EventStream<TOutput>
      handleEventStreamRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required String? lastEventId,
    required EventStreamHookOnMessage<TOutput>? onMessage,
    required EventStreamHookOnOpen? onOpen,
    required EventStreamHookOnClose? onClose,
    required EventStreamHookOnError? onError,
    required Duration? timeout,
    required int? maxRetryCount,
    required Duration? maxRetryInterval,
    required double? heartbeatTimeoutMultiplier,
  }) {
    // TODO: implement handleEventStreamRpc
    throw UnimplementedError();
  }

  @override
  String get transport => "ws";
}
