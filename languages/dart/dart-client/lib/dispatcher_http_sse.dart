import 'dart:async';
import 'dart:convert';

import 'package:arri_client/arri_client.dart';
import 'package:http/http.dart' as http;

class EventSource<T> implements EventStream<T> {
  late final http.Client _httpClient;
  final String url;
  final HttpMethod method;
  final ArriModel? _params;
  final FutureOr<Map<String, String>> Function()? _headers;
  String? lastEventId;
  StreamController<T>? _streamController;
  StreamSubscription<List<int>>? _requestStream;
  int _retryDelay = 0;
  int _retryInterval = 0;
  final int? _maxRetryCount;
  final int _maxRetryInterval;

  bool _closedByClient = false;
  Timer? _heartbeatTimer;
  int? _heartbeatTimerMs;
  final double _heartbeatTimerMultiplier;
  final Duration _timeout;

  @override
  T Function(String data) decoder;

  // hooks
  late final void Function(T data) _onMessage;
  late final void Function(ArriError error) _onError;
  late final void Function(http.StreamedResponse response) _onOpen;
  late final void Function() _onClose;

  EventSource({
    required this.url,
    required this.decoder,
    http.Client? httpClient,
    this.method = HttpMethod.get,
    ArriModel? params,
    FutureOr<Map<String, String>> Function()? headers,
    Duration maxRetryInterval = const Duration(milliseconds: 30000),
    int? maxRetryCount,
    // hooks
    EventStreamHookOnMessage<T>? onMessage,
    EventStreamHookOnOpen? onOpen,
    EventStreamHookOnClose? onClose,
    EventStreamHookOnError? onError,
    double? heartbeatTimeoutMultiplier,
    this.lastEventId,
    Duration? timeout,
  })  : _headers = headers,
        _params = params,
        _maxRetryInterval = maxRetryInterval.inMilliseconds,
        _maxRetryCount = maxRetryCount,
        _heartbeatTimerMultiplier = heartbeatTimeoutMultiplier ?? 2,
        _timeout = timeout ?? timeoutDefault {
    assert(_heartbeatTimerMultiplier >= 1);
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
      onOpen?.call(this);
    };
    _onClose = () {
      onClose?.call(this);
    };
    _connect();
  }

  _resetHeartbeatCheck() {
    _heartbeatTimer?.cancel();
    if (_heartbeatTimerMs == null || _heartbeatTimerMs! <= 0) return;
    _heartbeatTimer = Timer(
        Duration(
          milliseconds:
              (_heartbeatTimerMs! * _heartbeatTimerMultiplier).round(),
        ),
        () => _connect());
  }

  Future<void> _connect({bool isRetry = false}) async {
    if (isRetry) {
      _retryInterval++;
    }
    String parsedUrl = url;
    String body = "";
    if (_params != null) {
      switch (method) {
        case HttpMethod.get:
        case HttpMethod.head:
          parsedUrl += "?${_params.toUrlQueryParams()}";
          break;
        default:
          body = _params.toJsonString();
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
      final response = await _httpClient.send(request).timeout(_timeout);
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
      _retryInterval = 0;
      _retryDelay = 100;

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
          final eventResult = parseSseEvents(pendingData + input, decoder);
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
          if (_maxRetryCount != null && _maxRetryCount <= _retryInterval) {
            _httpClient.close();
            _onClose();
            return;
          }
          if (_closedByClient) return;
          await Future.delayed(Duration(milliseconds: _retryDelay));
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
    if (_maxRetryCount != null && _maxRetryCount <= _retryInterval) {
      close();
      return;
    }
    // exponential backoff maxing out at 60 seconds
    if (_retryInterval > 10 && _retryDelay == 0) {
      _retryDelay = 100;
    } else {
      _retryDelay = _retryDelay * 2;
    }
    if (_retryDelay > _maxRetryInterval) {
      _retryDelay = _maxRetryInterval;
    }
    Timer(Duration(milliseconds: _retryDelay), () => _connect(isRetry: true));
  }

  @override
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

  @override
  void reconnect() {
    _closedByClient = false;
    _connect(isRetry: true);
  }

  @override
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
