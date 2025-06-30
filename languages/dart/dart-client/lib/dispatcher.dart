import 'dart:async';

import 'package:arri_core/arri_core.dart';
import 'package:arri_client/request.dart';

typedef OnErrorHook = FutureOr<void> Function(
    RpcRequest<dynamic> req, Object err);

abstract class Dispatcher {
  String get transport;

  FutureOr<TOutput> handleRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
  });
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
  });
}

class DispatcherOptions {
  final String? transport;
  final Duration? timeout;
  final int? maxRetryCount;
  final Duration? maxRetryInterval;
  final FutureOr<void> Function(RpcRequest<dynamic> req, Object err)? onError;
  final double? heartbeatTimeoutMultiplier;
  const DispatcherOptions({
    this.transport,
    this.timeout,
    this.maxRetryCount,
    this.maxRetryInterval,
    this.onError,
    this.heartbeatTimeoutMultiplier,
  });
}

abstract class EventStream<T> {
  final T Function(String) decoder;

  const EventStream({required this.decoder});

  void close();
  void reconnect();
  Stream<T> toStream();
  bool get isClosed;
}

typedef EventStreamHookOnMessage<T> = Function(T msg, EventStream stream);
typedef EventStreamHookOnOpen = Function(EventStream stream);
typedef EventStreamHookOnClose = Function(EventStream stream);
typedef EventStreamHookOnError = Function(Object err, EventStream stream);

class EventStreamHooks<T> {
  final EventStreamHookOnMessage<T>? onMessage;
  final EventStreamHookOnOpen? onOpen;
  final EventStreamHookOnClose? onClose;
  final EventStreamHookOnError? onError;
  const EventStreamHooks({
    this.onMessage,
    this.onOpen,
    this.onClose,
    this.onError,
  });
}

final timeoutDefault = Duration(seconds: 30);
