import 'dart:async';

import 'package:arri_core/arri_core.dart';
import 'package:arri_client/dispatcher.dart';
import 'package:arri_client/request.dart';

class WsDispatcher implements Dispatcher {
  final String _connectionUrl;
  final double _heartbeatTimeoutMultiplier;

  const WsDispatcher({
    required String connectionUrl,
    double? heartbeatTimeoutMultiplier,
  })  : _connectionUrl = connectionUrl,
        _heartbeatTimeoutMultiplier = heartbeatTimeoutMultiplier ?? 2;

  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
  }) {
    // TODO: implement handleRpc
    throw UnimplementedError();
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
