import 'dart:async';

import 'package:arri_client/dispatcher.dart';
import 'package:arri_client/errors.dart';
import 'package:arri_client/model.dart';
import 'package:arri_client/request.dart';
import 'package:arri_client/dispatcher_http_sse.dart';
import 'package:http/http.dart' as http;

class HttpDispatcher implements Dispatcher {
  final String _baseUrl;
  late final http.Client _httpClient;

  HttpDispatcher({
    http.Client? httpClient,
    required String baseUrl,
  })  : _httpClient = httpClient ?? http.Client(),
        _baseUrl = baseUrl;

  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
  }) async {
    final response = await _handleHttpRequest(
      httpClient: _httpClient,
      req: req,
      baseUrl: _baseUrl,
      timeout: timeout ?? timeoutDefault,
      retryCount: 0,
      retry: retry ?? 0,
      retryDelay: retryDelay,
      onError: onError,
    );
    final parsedResponse = responseDecoder(response.body);
    return parsedResponse;
  }

  @override
  EventStream<TOutput> handleEventStreamRpc<TInput extends ArriModel, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required EventStreamHooks<TOutput> hooks,
    required DispatcherOptions options,
    String? lastEventId,
  }) {
    final url = _baseUrl + req.path;
    return EventSource<TOutput>(
      httpClient: _httpClient,
      url: url,
      method: req.method ?? HttpMethod.post,
      decoder: responseDecoder,
      params: req.data,
      headers: () async {
        final result = await req.customHeaders?.call() ?? {};
        if (req.clientVersion != null && req.clientVersion!.isNotEmpty) {
          result["client-version"] = req.clientVersion!;
        }
        if (req.reqId != null && req.reqId!.isNotEmpty) {
          result["req-id"] = req.reqId!;
        }
        return result;
      },
      heartbeatTimeoutMultiplier: options.heartbeatTimeoutMultiplier,
      retryDelay: Duration.zero,
      maxRetryCount: options.maxRetryCount,
      lastEventId: lastEventId,
      onOpen: hooks.onOpen,
      onMessage: hooks.onMessage,
      onClose: hooks.onClose,
      onError: hooks.onError,
      timeout: options.timeout,
    );
  }

  @override
  String get transport => 'http';
}

Future<http.Response> _handleHttpRequest<T extends ArriModel>({
  required http.Client httpClient,
  required RpcRequest<T> req,
  required String baseUrl,
  required Duration timeout,
  required int? retryCount,
  required int retry,
  required Duration? retryDelay,
  required OnErrorHook? onError,
}) async {
  final currentRetryCount = retryCount ?? 0;
  final url = baseUrl + req.path;
  String defaultErrorMsg =
      "Placeholder request. If you see this that means a request was never sent to the server.";
  http.Response response = http.Response(
    """{"statusCode": 400,"statusMessage":"$defaultErrorMsg"}""",
    400,
  );
  final finalHeaders = await req.customHeaders?.call() ?? {};
  if (req.clientVersion != null && req.clientVersion!.isNotEmpty) {
    finalHeaders["client-version"] = req.clientVersion!;
  }
  if (req.reqId != null && req.reqId!.isNotEmpty) {
    finalHeaders["req-id"] = req.reqId!;
  }
  String? bodyInput;
  if (req.method != HttpMethod.get &&
      req.method != HttpMethod.head &&
      req.data != null) {
    finalHeaders["Content-Type"] = "application/json";
    bodyInput = req.data?.toJsonString();
  }
  switch (req.method) {
    case HttpMethod.get:
      final paramsInput = req.data?.toUrlQueryParams() ?? "";
      final uri = Uri.parse("$url?$paramsInput");
      response = await httpClient
          .get(
            uri,
            headers: finalHeaders,
          )
          .timeout(timeout);
      break;
    case HttpMethod.patch:
      response = await httpClient
          .patch(
            Uri.parse(url),
            headers: finalHeaders,
            body: bodyInput,
          )
          .timeout(timeout);
      break;
    case HttpMethod.put:
      response = await httpClient
          .put(
            Uri.parse(url),
            headers: finalHeaders,
            body: bodyInput,
          )
          .timeout(timeout);
      break;
    case HttpMethod.post:
      response = await httpClient
          .post(
            Uri.parse(url),
            headers: finalHeaders,
            body: bodyInput,
          )
          .timeout(timeout);
      break;
    case HttpMethod.head:
      final paramsInput = req.data?.toUrlQueryParams() ?? "";
      final uri = Uri.parse("$url?$paramsInput");
      response = await httpClient
          .head(
            uri,
            headers: finalHeaders,
          )
          .timeout(timeout);
      break;
    case HttpMethod.delete:
      response = await httpClient
          .delete(
            Uri.parse(url),
            headers: finalHeaders,
            body: bodyInput,
          )
          .timeout(timeout);
      break;
    // ignore: unreachable_switch_default
    default:
      final err = ArriError(
        code: 0,
        message: "Unsupported HTTP Method ${req.method}",
      );
      onError?.call(req, err);
      throw err;
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    if (currentRetryCount < retry) {
      if (retryDelay != null) await Future.delayed(retryDelay);
      return _handleHttpRequest(
        httpClient: httpClient,
        req: req,
        baseUrl: baseUrl,
        timeout: timeout,
        retryCount: currentRetryCount + 1,
        retry: retry,
        retryDelay: retryDelay,
        onError: onError,
      );
    }
    final err = ArriError.fromResponse(response);
    onError?.call(req, err);
    throw err;
  }
  return response;
}
