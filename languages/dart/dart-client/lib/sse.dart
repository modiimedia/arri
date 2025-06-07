import 'dart:async';
import 'dart:convert';

import 'package:arri_client/errors.dart';
import 'package:arri_client/request.dart';
import 'package:http/http.dart' as http;

typedef SseHookOnMessage<T> = void Function(T data, EventSource<T> connection);
typedef SseHookOnError<T> = void Function(
    ArriError error, EventSource<T> connection);
typedef SseHookOnOpen<T> = void Function(
    http.StreamedResponse response, EventSource<T> connection);
typedef SseHookOnClose<T> = void Function(EventSource<T> connection);

EventSource<T> parsedArriSseRequest<T>(
  String url, {
  http.Client? httpClient,
  required HttpMethod method,
  required T Function(String data) parser,
  Map<String, dynamic>? params,
  FutureOr<Map<String, String>> Function()? headers,
  Duration? retryDelay,
  int? maxRetryCount,
  SseHookOnMessage<T>? onMessage,
  SseHookOnOpen<T>? onOpen,
  SseHookOnClose<T>? onClose,
  SseHookOnError<T>? onError,
  String? lastEventId,
  String? clientVersion,
}) {
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
    lastEventId: lastEventId,
    onMessage: onMessage,
    onOpen: onOpen,
    onClose: onClose,
    onError: onError,
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
  StreamSubscription<List<int>>? _requestStream;
  final Duration _retryDelay;
  int _internalRetryDelay = 100;
  final int? _maxRetryCount;
  int _retryCount = 0;
  T Function(String data) parser;
  bool _closedByClient = false;
  Timer? _heartbeatTimer;
  int? _heartbeatTimerMs;

  // hooks
  late final void Function(T data) _onMessage;
  late final void Function(ArriError error) _onError;
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
    SseHookOnMessage<T>? onMessage,
    SseHookOnOpen<T>? onOpen,
    SseHookOnClose<T>? onClose,
    SseHookOnError<T>? onError,
    this.lastEventId,
  })  : _headers = headers,
        _params = params,
        _retryDelay = retryDelay,
        _maxRetryCount = maxRetryCount {
    this._httpClient = httpClient ?? http.Client();

    // set hooks
    _onMessage = (data) {
      onMessage?.call(data, this);
      _streamController?.add(data);
    };
    _onError = (err) {
      onError?.call(err, this);
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

  _resetHeartbeatCheck() {
    _heartbeatTimer?.cancel();
    if (_heartbeatTimerMs == null || _heartbeatTimerMs! <= 0) return;
    _heartbeatTimer =
        Timer(Duration(milliseconds: _heartbeatTimerMs! * 2), () => _connect());
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
          _params.forEach((key, value) {
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
      await _requestStream?.cancel();
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
      final heartbeatIntervalHeader =
          int.tryParse(response.headers["heartbeat-interval"] ?? "0");
      if (heartbeatIntervalHeader != null && heartbeatIntervalHeader > 0) {
        _heartbeatTimerMs = heartbeatIntervalHeader;
      }
      _resetHeartbeatCheck();
      String pendingData = "";

      // reset retry count when connection is successful
      _retryCount = 0;
      _internalRetryDelay = 100;

      List<int>? pendingBytes;

      _requestStream = response.stream.listen(
        (value) {
          String input;
          try {
            if (pendingBytes != null) {
              input = utf8.decode([...pendingBytes!, ...value]);
            } else {
              input = utf8.decode(value);
            }
            pendingBytes = null;
          } catch (err) {
            pendingBytes = value;
            return;
          }
          final eventResult = parseSseEvents(pendingData + input, parser);
          pendingData = eventResult.leftoverData;
          for (final event in eventResult.events) {
            _resetHeartbeatCheck();
            if (event.id != null) {
              lastEventId = event.id;
            }
            switch (event) {
              case SseRawEvent<T>():
                break;
              case SseMessageEvent<T>():
                _onMessage(event.data);
                break;
              case SseDoneEvent<T>():
                close();
                break;
            }
          }
        },
        onError: _handleError,
        onDone: () async {
          if (_maxRetryCount != null && _maxRetryCount <= _retryCount) {
            _httpClient.close();
            _onClose();
            return;
          }
          if (_closedByClient) return;
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
      _onError.call(err);
    } else if (err is http.ClientException) {
      _onError(
        ArriError(
          code: 0,
          message: err.message,
          data: err,
        ),
      );
    } else {
      _onError.call(
        ArriError(
          code: 0,
          message: "Unknown error connecting to $url",
        ),
      );
    }
    if (_maxRetryCount != null && _maxRetryCount <= _retryCount) {
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
    _heartbeatTimer?.cancel();
    try {
      _requestStream?.cancel();
    } catch (_) {}
    _httpClient.close();
    _onClose();
  }

  bool get isClosed {
    return _closedByClient;
  }

  void reconnect() {
    _closedByClient = false;
    _connect(isRetry: true);
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
  final List<SseEvent<T>> events = [];
  String? id;
  String? event;
  String? data;
  int? retry;
  final splitter = LineSplitter();
  final lines = splitter.convert(input);
  int? lastIndex = 0;
  for (var i = 0; i < lines.length; i++) {
    final line = lines[i];
    final isEnd = line == "";
    if (line.isNotEmpty) {
      final lineResult = SseLineResult.fromString(line);
      switch (lineResult.type) {
        case SseLineResultType.id:
          id = lineResult.value;
          break;
        case SseLineResultType.event:
          event = lineResult.value;
          break;
        case SseLineResultType.data:
          data = lineResult.value;
          break;
        case SseLineResultType.retry:
          retry = int.tryParse(lineResult.value);
          break;
        case SseLineResultType.none:
          break;
      }
    }
    if (isEnd) {
      if (data != null) {
        events.add(
          SseEvent.fromSseRawEvent(
            SseRawEvent(
              id: id,
              event: event ?? "message",
              data: data,
              retry: retry,
            ),
            dataParser,
          ),
        );
      }
      id = null;
      event = null;
      data = null;
      retry = null;
      lastIndex = i + 1 < lines.length ? i + 1 : null;
    }
  }

  return ParseSseEventsResult(
    events: events,
    leftoverData: lastIndex != null
        ? lines.getRange(lastIndex, lines.length).join("\n")
        : "",
  );
}

class SseLineResult {
  final SseLineResultType type;
  final String value;
  const SseLineResult({required this.type, required this.value});
  factory SseLineResult.fromString(String input) {
    if (input.startsWith("id:")) {
      return SseLineResult(
        type: SseLineResultType.id,
        value: input.substring(3).trim(),
      );
    }
    if (input.startsWith("event:")) {
      return SseLineResult(
        type: SseLineResultType.event,
        value: input.substring(6).trim(),
      );
    }
    if (input.startsWith("data:")) {
      return SseLineResult(
        type: SseLineResultType.data,
        value: input.substring(5).trim(),
      );
    }
    if (input.startsWith("retry:")) {
      return SseLineResult(
        type: SseLineResultType.retry,
        value: input.substring(6).trim(),
      );
    }
    return SseLineResult(
      type: SseLineResultType.none,
      value: "",
    );
  }
}

enum SseLineResultType {
  id,
  event,
  data,
  retry,
  none;
}

sealed class SseEvent<TData> {
  final String? id;
  final String event;
  final int? retry;
  const SseEvent({
    this.id,
    required this.event,
    this.retry,
  });

  factory SseEvent.fromSseRawEvent(
    SseRawEvent<TData> event,
    TData Function(String) parser,
  ) {
    try {
      switch (event.event) {
        case "done":
          return SseDoneEvent.fromRawSseEvent(event);
        case "message":
          return SseMessageEvent.fromRawSseEvent(event, parser);
        default:
          return event;
      }
    } catch (err) {
      return event;
    }
  }
}

class SseRawEvent<TData> extends SseEvent<TData> {
  final String data;
  const SseRawEvent({
    super.id,
    required super.event,
    required this.data,
    super.retry,
  });
}

class SseMessageEvent<TData> extends SseEvent<TData> {
  final TData data;

  const SseMessageEvent({
    super.id,
    required this.data,
    super.retry,
  }) : super(event: "message");

  factory SseMessageEvent.fromRawSseEvent(
      SseRawEvent event, TData Function(String) parser) {
    return SseMessageEvent(
      id: event.id,
      data: parser(event.data),
      retry: event.retry,
    );
  }
}

class SseDoneEvent<TData> extends SseEvent<TData> {
  final String data = "";

  const SseDoneEvent({
    super.id,
    super.retry,
  }) : super(event: "done");

  factory SseDoneEvent.fromRawSseEvent(SseRawEvent event) {
    return SseDoneEvent(
      id: event.id,
      retry: event.retry,
    );
  }
}
