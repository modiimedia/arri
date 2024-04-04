import 'dart:convert';

import 'package:arri_client/arri_client.dart';
import 'package:test/test.dart';

main() {
  final nonExistentUrl = "http://thisurldoesntexist.blah";

  test("invalid url", () async {
    final response =
        await parsedArriRequestSafe(nonExistentUrl, parser: (data) {});
    if (response.error != null) {
      expect(response.error!.code, equals(500));
    }
  });

  test('auto retry sse', () async {
    int errCount = 0;
    int closeCount = 0;
    parsedArriSseRequest(nonExistentUrl,
        method: HttpMethod.get,
        parser: (input) => input,
        onConnectionError: (err, event) {
          errCount++;
          if (errCount == 5) {
            event.close();
          }
        },
        onClose: (_) {
          closeCount++;
        });
    await Future.delayed(Duration(seconds: 3));
    expect(errCount, equals(5));
    expect(closeCount, equals(1));
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

  test("parsing partial sse messages", () {
    var streamedTxt = """data: hello world

event: message
data: {"hello": "world"}

event: error
data: {"code": 500, "message": "Unknown Error"}

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
    expect(result.events.length, equals(4));
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
      case SseErrorEvent<Map<String, dynamic>>():
        expect(msg3.data.code, equals(500));
        expect(msg3.data.message, equals("Unknown Error"));
        expect(msg3.data.data, equals(null));
        expect(msg3.data.stack, equals(null));
      default:
        throw Exception("Expected SseErrorEvent");
    }
    final msg4 = result.events[3];
    switch (msg4) {
      case SseRawEvent<Map<String, dynamic>>():
        expect(msg4.data, equals(""));
        expect(msg4.event, equals("ping"));
        break;
      default:
        throw Exception("Expected SseRawEvent");
    }
  });
}
