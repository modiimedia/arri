import 'dart:convert';

import 'package:arri_client/arri_client.dart';
import 'package:test/test.dart';

main() {
  final nonExistentUrl = "http://thisurldoesntexist.blah";

  test('auto retry sse', () async {
    int errCount = 0;
    int closeCount = 0;
    HttpArriEventSource(
        url: nonExistentUrl,
        method: HttpMethod.get,
        decoder: (input) => input,
        onError: (err, event) {
          errCount++;
          if (errCount >= 5) {
            event.close();
          }
        },
        onClose: (_) {
          closeCount++;
        });
    await Future.delayed(Duration(seconds: 5));
    expect(errCount, equals(5));
    expect(closeCount, equals(1));
  });

  test("SSE Line Result", () {
    final idInputs = ["id:1", "id: 1"];
    for (final input in idInputs) {
      final result = SseLineResult.fromString(input);
      expect(result.type, equals(SseLineResultType.id));
      expect(result.value, equals("1"));
    }
    final eventInputs = ["event:foo", "event: foo"];
    for (final input in eventInputs) {
      final result = SseLineResult.fromString(input);
      expect(result.type, equals(SseLineResultType.event));
      expect(result.value, "foo");
    }
    final dataResults = ["data:foo", "data: foo"];
    for (final input in dataResults) {
      final result = SseLineResult.fromString(input);
      expect(result.type, equals(SseLineResultType.data));
      expect(result.value, "foo");
    }
    final retryResults = ["retry:150", "retry: 150"];
    for (final input in retryResults) {
      final result = SseLineResult.fromString(input);
      expect(result.type, equals(SseLineResultType.retry));
      expect(result.value, '150');
    }
  });

  group("Parsing SSE Messages", () {
    group("Standard SSE messages", () {
      final standardSsePayload = [
        "id: 1",
        "data: hello world",
        "",
        "id: 2",
        "data: hello world",
        "",
        ""
      ];
      test("with \\n separator", () {
        final result = parseSseEvents(standardSsePayload.join("\n"), (input) {
          return input;
        });
        expect(result.events.length, equals(2));
        expect(result.events[0].id, equals("1"));
        expect(result.events[1].id, equals("2"));
        expect(
          result.events.every((el) =>
              el is SseMessageEvent<String> && el.data == "hello world"),
          equals(true),
        );
        expect(result.leftoverData, equals(""));
      });
      test("with \r\n separator", () {
        final result =
            parseSseEvents(standardSsePayload.join("\r\n"), (input) => input);
        expect(result.events.length, equals(2));
        expect(result.events[0].id, equals("1"));
        expect(result.events[1].id, equals("2"));
        expect(
          result.events.every((el) =>
              el is SseMessageEvent<String> && el.data == "hello world"),
          equals(true),
        );
        expect(result.leftoverData, equals(""));
      });
      test("with \r separator", () {
        final result =
            parseSseEvents(standardSsePayload.join("\r"), (input) => input);
        expect(result.events.length, equals(2));
        expect(result.events[0].id, equals("1"));
        expect(result.events[1].id, equals("2"));
        expect(
          result.events.every((el) =>
              el is SseMessageEvent<String> && el.data == "hello world"),
          equals(true),
        );
        expect(result.leftoverData, equals(""));
      });
    });
  });

  test("parsing sse messages", () {
    final streamedTxt = """id: 1
data: hello world

id: 2
data: hello world

""";

    final result = parseSseEvents(streamedTxt, (input) {
      return input;
    });

    expect(result.events.length, equals(2));
    expect(result.leftoverData, equals(""));
    expect(
      result.events.every((element) =>
          element is SseMessageEvent<String> && element.data == "hello world"),
      equals(true),
    );
  });

  test("partial sse message", () {
    final streamedTxt = """id: 1
data: {"hello":"wo""";
    final result = parseSseEvents(streamedTxt, (input) {
      final data = json.decode(input);
      if (data is Map<String, dynamic>) {
        return data;
      }
      throw Exception("Error parsing input");
    });
    expect(result.events.isEmpty, equals(true));
    expect(result.leftoverData, equals("id: 1\ndata: {\"hello\":\"wo"));
  });

  test(
    "parsing partial sse messages",
    () {
      var streamedTxt = """data: hello world

event: message
data: {"hello": "world"}

event: ping
data:

data: {"hello":""";
      final result = parseSseEvents(streamedTxt, (input) {
        final data = json.decode(input);
        if (data is Map<String, dynamic>) {
          return data;
        }
        throw Exception("Unable to parse data");
      });
      expect(result.events.length, equals(3));
      expect(result.leftoverData, equals("data: {\"hello\":"));
      final msg1 = result.events[0];
      switch (msg1) {
        case SseRawEvent<Map<String, dynamic>>():
          expect(msg1.data, equals("hello world"));
          expect(msg1.id, equals(null));
          break;
        default:
          throw Exception("Expected a SseRawEvent");
      }
      final msg2 = result.events[1];
      switch (msg2) {
        case SseMessageEvent<Map<String, dynamic>>():
          expect(msg2.data["hello"], equals("world"));
          break;
        default:
          throw Exception("Expected SseMessageEvent.");
      }
      final msg3 = result.events[2];
      switch (msg3) {
        case SseRawEvent<Map<String, dynamic>>():
          expect(msg3.data, equals(""));
          expect(msg3.event, equals("ping"));
          break;
        default:
          throw Exception("Expected SseRawEvent");
      }
    },
  );
}
