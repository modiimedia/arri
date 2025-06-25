import 'dart:async';

import 'package:arri_client/arri_client.dart';

class WsDispatcher implements Dispatcher {
  final String connectionUrl;

  WsDispatcher({required this.connectionUrl});

  @override
  EventStream handleEventStreamRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required EventStreamHookOnMessage<TOutput>? onMessage,
    required EventStreamHookOnOpen? onOpen,
    required EventStreamHookOnClose? onClose,
    required EventStreamHookOnError? onError,
    required EventStreamHooks<TOutput> hooks,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? maxRetryCount,
    required Duration? maxRetryDelay,
    required double? heartbeatTimeoutMultiplier,
    required String? lastEventId,
  }) {
    // TODO: implement handleEventStreamRpc
    throw UnimplementedError();
  }

  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel, TOutput>(
      {required RpcRequest<TInput> req,
      required TOutput Function(String input) responseDecoder,
      required Duration? timeout,
      required int? retry,
      required Duration? retryDelay,
      required OnErrorHook? onError}) {
    // TODO: implement handleRpc
    throw UnimplementedError();
  }

  @override
  // TODO: implement transport
  String get transport => throw UnimplementedError();
}
