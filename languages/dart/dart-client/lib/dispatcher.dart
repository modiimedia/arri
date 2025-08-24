import 'dart:async';
import 'dart:typed_data';

import 'package:arri_core/arri_core.dart';
import 'package:arri_client/request.dart';

typedef OnErrorHook = FutureOr<void> Function(
    RpcRequest<dynamic> req, Object err);

abstract class Dispatcher {
  String get transport;

  FutureOr<TOutput> handleRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(Uint8List input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
    int? retryCount,
  });
  ArriEventSource<TOutput>
      handleOutputStreamRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(Uint8List input) responseDecoder,
    required String? lastEventId,
    required ArriEventSourceHookOnData<TOutput>? onData,
    required ArriEventSourceHookOnRawData<TOutput>? onRawData,
    required ArriEventSourceHookOnOpen<TOutput>? onOpen,
    required ArriEventSourceHookOnClose<TOutput>? onClose,
    required ArriEventSourceHookOnError<TOutput>? onError,
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

abstract class ArriEventSource<T> {
  final ArriModelValidator<T> validator;

  const ArriEventSource({required this.validator});

  void close();
  void reconnect();
  Stream<T> toStream();
  bool get isClosed;
}

typedef ArriEventSourceHookOnData<T> = Function(
    T data, ArriEventSource<T> eventSource);
typedef ArriEventSourceHookOnRawData<T> = Function(
    Uint8List rawData, ArriEventSource<T> eventSource);
typedef ArriEventSourceHookOnOpen<T> = Function(ArriEventSource<T> eventSource);
typedef ArriEventSourceHookOnClose<T> = Function(
    ArriEventSource<T> eventSource);
typedef ArriEventSourceHookOnError<T> = Function(
    Object err, ArriEventSource<T> eventSource);

class ArriEventSourceHooks<T> {
  final ArriEventSourceHookOnData<T>? onData;
  final ArriEventSourceHookOnRawData<T>? onRawData;
  final ArriEventSourceHookOnOpen<T>? onOpen;
  final ArriEventSourceHookOnClose<T>? onClose;
  final ArriEventSourceHookOnError<T>? onError;
  const ArriEventSourceHooks({
    this.onData,
    this.onRawData,
    this.onOpen,
    this.onClose,
    this.onError,
  });
}

final timeoutDefault = Duration(seconds: 30);
