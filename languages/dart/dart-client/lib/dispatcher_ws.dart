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
      onError: (err) {
        print("ERROR $err");
      },
      onDone: () {
        print("DONE");
      },
    );
    await _channel!.ready;
  }

  _handleMessage(dynamic data) {
    if (data is! String) return;
    final msg = ServerMessage.fromString(data).unwrap();
    if (msg == null || msg.reqId == null) return;
    _messageHandlers[msg.reqId]?.call(msg);
  }

  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
    int? retryCount,
  }) async {
    final actualRetryCount = retryCount ?? 0;
    try {
      if (req.reqId == null || req.reqId!.isEmpty) {
        req.reqId = Ulid().toString();
      }
      await setupConnection();
      final completer = Completer<TOutput>();
      final timerDuration = timeout ?? Duration(seconds: 30);
      final timer = Timer(timerDuration, () {
        if (completer.isCompleted) return;
        completer.completeError(
          TimeoutException("Timeout exceeded", timerDuration),
        );
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
      final payload = ClientMessage(
        rpcName: req.procedure,
        reqId: req.reqId,
        method: null,
        path: req.path,
        contentType: ContentType.json,
        clientVersion: req.clientVersion,
        customHeaders: await req.customHeaders?.call() ?? {},
        body: req.data,
      );
      _channel?.sink.add(payload.encodeString());
      final result = await completer.future;
      _messageHandlers.remove(req.reqId);
      return result;
    } catch (err) {
      if (err is TimeoutException) {
        onError?.call(req, err);
        rethrow;
      }
      if (retry != null && actualRetryCount < retry) {
        if (timeout != null) await Future.delayed(timeout);
        return handleRpc(
          req: req,
          responseDecoder: responseDecoder,
          timeout: timeout,
          retry: retry,
          retryDelay: retryDelay,
          onError: onError,
          retryCount: actualRetryCount + 1,
        );
      }
      onError?.call(req, err);
      rethrow;
    }
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
