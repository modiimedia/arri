import 'dart:async';
import 'dart:convert';

import 'package:arri_client/errors.dart';
import 'package:arri_client/request.dart';
import 'package:http/http.dart' as http;

typedef SseHookOnData<T> = void Function(T data, EventSource<T> connection);
typedef SseHookOnError<T> = void Function(
    ArriError error, EventSource<T> connection);
typedef SseHookOnConnectionError<T> = void Function(
    ArriError error, EventSource<T> connection);
typedef SseHookOnOpen<T> = void Function(
    http.StreamedResponse response, EventSource<T> connection);
typedef SseHookOnClose<T> = void Function(EventSource<T> connection);

Future<EventSource<T>> parsedArriSseRequest<T>(
  String url, {
  http.Client? httpClient,
  required HttpMethod method,
  required T Function(String data) parser,
  Map<String, dynamic>? params,
  FutureOr<Map<String, String>> Function()? headers,
  Duration? retryDelay,
  int? maxRetryCount,
  SseHookOnData<T>? onData,
  SseHookOnError<T>? onError,
  SseHookOnConnectionError<T>? onConnectionError,
  SseHookOnOpen<T>? onOpen,
  SseHookOnClose<T>? onClose,
  String? lastEventId,
  String? clientVersion,
}) async {
  return EventSource(
    httpClient: httpClient,
    url: url,
    method: method,
    parser: parser,
    params: params,
    headers: () async {
      final result = await headers?.call() ?? {};
      if (clientVersion != null && clientVersion.isNotEmpty) {
        result["client-version"] = clientVersion;
      }
      return result;
    },
    retryDelay: retryDelay ?? Duration.zero,
    maxRetryCount: maxRetryCount,
    onData: onData,
    onError: onError,
    onConnectionError: onConnectionError,
    onClose: onClose,
    onOpen: onOpen,
    lastEventId: lastEventId,
  );
}

class EventSource<T> {
  late final http.Client _httpClient;
  final String url;
  final HttpMethod method;
  final Map<String, dynamic>? _params;
  final FutureOr<Map<String, String>> Function()? _headers;
  String? lastEventId;
  StreamController<T>? _streamController;
  final Duration _retryDelay;
  int _internalRetryDelay = 100;
  final int? _maxRetryCount;
  int _retryCount = 0;
  T Function(String data) parser;
  bool _closedByClient = false;

  // hooks
  late final void Function(T data) _onData;
  late final void Function(ArriError error) _onError;
  late final void Function(ArriError error) _onConnectionError;
  late final void Function(http.StreamedResponse response) _onOpen;
  late final void Function() _onClose;

  EventSource({
    required this.url,
    required this.parser,
    http.Client? httpClient,
    this.method = HttpMethod.get,
    Map<String, dynamic>? params,
    FutureOr<Map<String, String>> Function()? headers,
    Duration retryDelay = Duration.zero,
    int? maxRetryCount,
    // hooks
    SseHookOnData<T>? onData,
    SseHookOnError<T>? onError,
    SseHookOnConnectionError<T>? onConnectionError,
    SseHookOnClose<T>? onClose,
    SseHookOnOpen<T>? onOpen,
    this.lastEventId,
  })  : _headers = headers,
        _params = params,
        _retryDelay = retryDelay,
        _maxRetryCount = maxRetryCount {
    this._httpClient = httpClient ?? http.Client();

    // set hooks
    _onData = (data) {
      onData?.call(data, this);
      _streamController?.add(data);
    };
    _onError = (err) {
      onError?.call(err, this);
      _streamController?.addError(err);
    };
    _onConnectionError = (err) {
      onConnectionError?.call(err, this);
      _streamController?.addError(err);
    };
    _onOpen = (response) {
      onOpen?.call(response, this);
    };
    _onClose = () {
      onClose?.call(this);
    };
    _connect();
  }

  Future<void> _connect({bool isRetry = false}) async {
    if (isRetry) {
      _retryCount++;
    }
    String parsedUrl = url;
    String body = "";
    if (_params != null) {
      switch (method) {
        case HttpMethod.get:
        case HttpMethod.head:
          final queryParts = <String>[];
          _params?.forEach((key, value) {
            queryParts.add("$key=$value");
          });
          parsedUrl += "?${queryParts.join("&")}";
          break;
        default:
          body = json.encode(_params);
          break;
      }
    }
    final uri = Uri.parse(parsedUrl);
    final request = http.Request(method.value, uri);
    request.headers["Content-Type"] = "text/event-stream";
    if (lastEventId != null) {
      request.headers["Last-Event-ID"] = lastEventId!;
    }
    if (body.isNotEmpty) {
      request.body = body;
    }
    (await _headers?.call())?.forEach((key, value) {
      request.headers[key] = value;
    });
    if (lastEventId != null) {
      request.headers["Last-Event-ID"] = lastEventId!;
    }
    try {
      final response = await _httpClient.send(request);
      _onOpen(response);
      if (response.statusCode < 200 || response.statusCode > 299) {
        final body = await utf8.decodeStream(response.stream);
        Map<String, dynamic>? parsedJson;
        try {
          parsedJson = json.decode(body);
        } catch (_) {}
        if (parsedJson != null) {
          throw ArriError.fromJson(parsedJson);
        }
        throw ArriError(
          code: response.statusCode,
          message: response.reasonPhrase ?? "Unknown error connection to $url",
        );
      }
      if (response.statusCode != 200) {
        throw http.ClientException(
          "Server must return statusCode 200. Instead got ${response.statusCode}",
        );
      }
      String pendingData = "";

      // reset retry count when connection is successful
      _retryCount = 0;
      _internalRetryDelay = 100;

      response.stream.listen(
        (value) {
          final input = utf8.decode(value);
          final eventResult = parseSseEvents(pendingData + input, parser);
          pendingData = eventResult.leftoverData;
          for (final event in eventResult.events) {
            if (event.id != null) {
              lastEventId = event.id;
            }
            switch (event) {
              case SseRawEvent<T>():
                break;
              case SseMessageEvent<T>():
                _onData(event.data);
                break;
              case SseErrorEvent<T>():
                _onError(event.data);
                break;
              case SseDoneEvent<T>():
                close();
                break;
            }
          }
        },
        onError: _handleError,
        onDone: () async {
          if (_maxRetryCount != null && _maxRetryCount! <= _retryCount) {
            _httpClient.close();
            _onClose();
            return;
          }
          Timer(_retryDelay, () => _connect(isRetry: true));
        },
      );
    } catch (err) {
      _handleError(err);
    }
  }

  void _handleError(dynamic err) {
    if (_closedByClient) {
      return;
    }
    if (err is ArriError) {
      _onConnectionError.call(err);
    } else if (err is http.ClientException) {
      _onConnectionError(
        ArriError(
          code: 0,
          message: err.message,
          data: err,
        ),
      );
    } else {
      _onConnectionError.call(
        ArriError(
          code: 0,
          message: "Unknown error connecting to $url",
        ),
      );
    }
    if (_maxRetryCount != null && _maxRetryCount! <= _retryCount) {
      close();
      return;
    }
    // exponential backoff maxing out at 60 seconds
    if (_retryCount > 10 &&
        _retryDelay.inMilliseconds == Duration.zero.inMilliseconds) {
      _internalRetryDelay = _internalRetryDelay * 2;
      if (_internalRetryDelay > 60000) {
        _internalRetryDelay = 60000;
      }
      Timer(
        Duration(milliseconds: _internalRetryDelay),
        () => _connect(isRetry: true),
      );
      return;
    }
    Timer(_retryDelay, () => _connect(isRetry: true));
  }

  void close() {
    _closedByClient = true;
    _httpClient.close();
    _onClose();
  }

  bool get isClosed {
    return _closedByClient;
  }

  Stream<T> toStream() {
    _streamController ??= StreamController<T>(onCancel: () {
      close();
    });
    return _streamController!.stream;
  }
}

class ParseSseEventsResult<T> {
  final List<SseEvent<T>> events;
  final String leftoverData;
  const ParseSseEventsResult({
    required this.events,
    required this.leftoverData,
  });
}

ParseSseEventsResult<T> parseSseEvents<T>(
  String input,
  T Function(String) dataParser,
) {
  final stringParts = input.split("\n\n");
  final endingPart = stringParts.removeLast();
  final result = <SseEvent<T>>[];
  for (final part in stringParts) {
    final event = parseSseEvent(part);
    if (event == null) {
      print("WARN: Invalid message data $event");
      continue;
    }
    result.add(SseEvent<T>.fromString(part, dataParser));
  }
  return ParseSseEventsResult(
    events: result,
    leftoverData: endingPart,
  );
}

SseRawEvent<TData>? parseSseEvent<TData>(String input) {
  try {
    return SseRawEvent.fromString(input);
  } catch (_) {
    return null;
  }
}

sealed class SseEvent<TData> {
  final String? id;
  final String? event;
  const SseEvent({
    this.id,
    this.event,
  });

  factory SseEvent.fromString(
    String input,
    TData Function(String) parser,
  ) {
    final sse = SseRawEvent<TData>.fromString(input);
    try {
      switch (sse.event) {
        case "message":
          return SseMessageEvent.fromRawSseEvent(sse, parser);
        case "error":
          return SseErrorEvent.fromRawSseEvent(sse);
        case "done":
          return SseDoneEvent.fromRawSseEvent(sse);
        default:
          return SseMessageEvent.fromRawSseEvent(sse, parser);
      }
    } catch (err) {
      return sse;
    }
  }
}

class SseRawEvent<TData> extends SseEvent<TData> {
  final String data;
  const SseRawEvent({super.id, super.event, required this.data});

  factory SseRawEvent.fromString(String input) {
    final lines = input.split("\n");
    String? id;
    String? event;
    String data = '';
    for (final line in lines) {
      if (line.startsWith("id:")) {
        id = line.replaceFirst("id:", "").trim();
        continue;
      }
      if (line.startsWith("event:")) {
        event = line.replaceFirst("event:", "").trim();
        continue;
      }
      if (line.startsWith("data:")) {
        data = line.replaceFirst("data:", "").trim();
        continue;
      }
    }
    return SseRawEvent(id: id, event: event, data: data);
  }
}

class SseMessageEvent<TData> extends SseEvent<TData> {
  final TData data;
  const SseMessageEvent({super.id, super.event, required this.data});

  factory SseMessageEvent.fromRawSseEvent(
      SseRawEvent event, TData Function(String) parser) {
    return SseMessageEvent(
      id: event.id,
      event: "message",
      data: parser(event.data),
    );
  }
}

class SseErrorEvent<TData> extends SseEvent<TData> {
  final ArriError data;
  const SseErrorEvent({super.id, super.event, required this.data});

  factory SseErrorEvent.fromRawSseEvent(SseRawEvent event) {
    return SseErrorEvent(
      id: event.id,
      event: event.event,
      data: ArriError.fromString(event.data),
    );
  }
}

class SseDoneEvent<TData> extends SseEvent<TData> {
  final String data = "";
  const SseDoneEvent({super.id, super.event});
  factory SseDoneEvent.fromRawSseEvent(SseRawEvent event) {
    return SseDoneEvent(
      id: event.id,
      event: "done",
    );
  }
}
