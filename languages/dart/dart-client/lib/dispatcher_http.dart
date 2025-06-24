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
    required DispatcherOptions options,
  }) async {
    final response = await _handleHttpRequest(
      httpClient: _httpClient,
      req: req,
      baseUrl: _baseUrl,
      timeout: options.timeout ?? timeoutDefault,
      retryCount: 0,
      retryInterval: 100,
      maxRetryCount: options.maxRetryCount ?? 0,
      maxRetryInterval: options.maxRetryInterval ?? 30000,
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
  required int retryInterval,
  required int maxRetryCount,
  required int maxRetryInterval,
}) async {
  final currentRetryCount = retryCount ?? 0;
  final currentRetryInterval =
      retryInterval < maxRetryInterval ? retryInterval : maxRetryInterval;
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
      throw ArriError(
        code: 0,
        message: "Unsupported HTTP Method ${req.method}",
      );
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    if (currentRetryCount < maxRetryCount) {
      await Future.delayed(Duration(milliseconds: currentRetryInterval));
      return _handleHttpRequest(
        httpClient: httpClient,
        req: req,
        baseUrl: baseUrl,
        timeout: timeout,
        retryCount: currentRetryCount + 1,
        retryInterval: currentRetryInterval * 2,
        maxRetryCount: maxRetryCount,
        maxRetryInterval: maxRetryInterval,
      );
    }
    throw ArriError.fromResponse(response);
  }
  return response;
}
