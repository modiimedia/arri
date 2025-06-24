import 'dart:async';

import 'package:arri_client/model.dart';
import 'package:arri_client/request.dart';

abstract class Dispatcher {
  String get transport;

  FutureOr<TOutput> handleRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required DispatcherOptions options,
  });
  EventStream handleEventStreamRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required EventStreamHooks<TOutput> hooks,
    required TOutput Function(String input) responseDecoder,
    required DispatcherOptions options,
    String? lastEventId,
  });
}

class DispatcherOptions {
  final Map<String, String>? headers;
  final Duration? timeout;
  final int? maxRetryCount;
  final int? maxRetryInterval;
  final FutureOr<void> Function(RpcRequest<dynamic> req, Object err)? onError;
  final double? heartbeatTimeoutMultiplier;
  const DispatcherOptions({
    this.headers,
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
