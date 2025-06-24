import 'dart:async';

import 'package:arri_client/model.dart';
import 'package:arri_client/request.dart';

abstract class Dispatcher {
  String get transport;
  FutureOr<TOutput> handleRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required DispatcherOptions options,
    int? retryCount,
  });
  EventStream handleEventStreamRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required EventStreamHooks<TOutput> hooks,
  });
}

class DispatcherOptions {
  final Map<String, String>? headers;
  final Duration? timeout;
  final int? retry;
  final int? retryDelay;
  final List<int>? retryErrorCodes;
  final FutureOr<void> Function(RpcRequest<dynamic> req, Object err)? onError;
  final double? heartbeatTimeoutMultiplier;
  const DispatcherOptions({
    this.headers,
    this.timeout,
    this.retry,
    this.retryDelay,
    this.retryErrorCodes,
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

class EventStreamHooks<T> {
  final void Function(T msg, EventStream stream)? onMessage;
  final void Function(EventStream stream)? onOpen;
  final void Function(EventStream stream)? onClose;
  final void Function(Object err, EventStream stream)? onError;
  const EventStreamHooks({
    this.onMessage,
    this.onOpen,
    this.onClose,
    this.onError,
  });
}
