import 'dart:async';
import 'dart:convert';

import 'package:arri_client/arri_client.dart';
import 'package:http/http.dart' as http;

class SseEvent {
  final String? id;
  final String? event;
  final String data;
  const SseEvent({this.id, this.event, required this.data});

  factory SseEvent.fromString(String input) {
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
    return SseEvent(id: id, event: event, data: data);
  }
}

sealed class SseEventPayload {}

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
        print("---NEW_DATA---\n$value");
      }, onError: (err, s) {}, onDone: () {});
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

main() async {
  final event = EventSource<SseEvent>(
    url: 'http://hello-world',
    parser: (data) {
      return json.decode(data);
    },
  );
  final listener = event.stream.listen((event) {});
}
