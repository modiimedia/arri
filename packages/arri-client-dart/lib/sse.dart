import 'dart:async';
import 'dart:convert';

import 'package:arri_client/errors.dart';
import 'package:arri_client/request.dart';
import 'package:http/http.dart' as http;

EventSource<T> parsedArriSseRequest<T>(
  String url, {
  required HttpMethod method,
  required T Function(String data) parser,
  Map<String, dynamic> params = const {},
  Map<String, String> headers = const {},
  Duration? retryDelay,
  int? maxRetryCount,
}) {
  return EventSource(
    url: url,
    method: method,
    parser: parser,
    params: params,
    headers: headers,
    retryDelay: retryDelay ?? Duration.zero,
    maxRetryCount: maxRetryCount,
  );
}

class EventSource<TData> {
  late final http.Client httpClient;
  final String url;
  final HttpMethod method;
  final Map<String, dynamic> params;
  final Map<String, String> headers;
  String? lastEventId;
  late final StreamController<TData> _streamController;
  final Duration retryDelay;
  final int? maxRetryCount;
  int retryCount = 0;
  TData Function(String data) parser;

  EventSource({
    required this.url,
    required this.parser,
    http.Client? httpClient,
    this.method = HttpMethod.get,
    this.params = const {},
    this.headers = const {},
    this.retryDelay = Duration.zero,
    this.maxRetryCount,
  }) {
    this.httpClient = httpClient ?? http.Client();
    this._streamController =
        StreamController<TData>(onCancel: () => this.httpClient.close());
    _connect();
  }

  _connect() async {
    String parsedUrl = url;
    switch (method) {
      case HttpMethod.get:
      case HttpMethod.head:
        final queryParts = <String>[];
        params.forEach((key, value) {
          queryParts.add("$key=$value");
        });
        parsedUrl += "?${queryParts.join("&")}";
        break;
      default:
        break;
    }
    final uri = Uri.parse(parsedUrl);
    final request = http.Request(method.value, uri);
    request.headers["Content-Type"] = "text/event-stream";
    headers.forEach((key, value) {
      request.headers[key] = value;
    });
    if (lastEventId != null) {
      request.headers["Last-Event-ID"] = lastEventId!;
    }
    try {
      final response = await httpClient.send(request);
      if (response.statusCode < 200 || response.statusCode > 299) {
        throw ArriRequestError(
          statusCode: response.statusCode,
          statusMessage:
              response.reasonPhrase ?? "Unknown error connecting to $url",
          data: response.toString(),
        );
      }
      if (response.statusCode != 200) {
        throw ArriRequestError(
          statusCode: 500,
          statusMessage:
              "Server must return statusCode 200. Instead got ${response.statusCode}",
        );
      }
      response.stream.listen((value) {
        final input = utf8.decode(value);
        print("---NEW_DATA---\n$value");
        final events = parseSseEvents(input, parser);
        for (final event in events) {
          if (event.id != null) {
            lastEventId = event.id;
          }
          switch (event) {
            case SseRawEvent<TData>():
              break;
            case SseMessageEvent<TData>():
              _streamController.add(event.data);
              break;
            case SseErrorEvent<TData>():
              _streamController.addError(event.data);
              break;
          }
        }
      }, onError: (err, s) {
        print("---NEW_ERROR---");
        print(err);
        print(s);
        if (maxRetryCount != null && maxRetryCount! <= retryCount) {
          throw err;
        }
        Timer(retryDelay, () => _connect());
      }, onDone: () async {
        if (maxRetryCount != null && maxRetryCount! <= retryCount) {
          await _streamController.close();
          httpClient.close();
          return;
        }
        Timer(retryDelay, () => _connect());
      });
    } catch (err) {
      if (maxRetryCount != null && maxRetryCount! <= retryCount) {
        rethrow;
      }
      Timer(retryDelay, () => _connect());
    }
  }

  Stream<TData> get stream {
    return this._streamController.stream;
  }
}

List<SseEvent<T>> parseSseEvents<T>(
  String input,
  T Function(String) dataParser,
) {
  final stringParts = input.split("\n\n");
  final result = <SseEvent<T>>[];
  for (final part in stringParts) {
    result.add(SseEvent<T>.fromString(part, dataParser));
  }
  return result;
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
    switch (sse.event) {
      case "message":
        return SseMessageEvent.fromRawSseEvent(sse, parser);
      case "error":
        return SseErrorEvent.fromRawSseEvent(sse);
      default:
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
      event: event.event,
      data: parser(event.data),
    );
  }
}

class SseErrorEvent<TData> extends SseEvent<TData> {
  final ArriRequestError data;
  const SseErrorEvent({super.id, super.event, required this.data});

  factory SseErrorEvent.fromRawSseEvent(SseRawEvent event) {
    return SseErrorEvent(
      id: event.id,
      event: event.event,
      data: ArriRequestError.fromString(event.data),
    );
  }
}
