import 'dart:async';

import 'package:arri_client/dispatcher.dart';
import 'package:arri_client/model.dart';
import 'package:arri_client/request.dart';

class HttpDispatcher implements Dispatcher {
  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required DispatcherOptions options,
    int? retryCount,
  }) {
    throw UnimplementedError();
  }

  @override
  EventStream handleEventStreamRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required EventStreamHooks<TOutput> hooks,
  }) {
    throw UnimplementedError();
  }

  @override
  String get transport => 'http';
}
