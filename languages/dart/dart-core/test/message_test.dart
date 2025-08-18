import 'dart:io';

import 'package:test/test.dart';

import '../lib/arri_core.dart';

void main() {
  test("parseHeaderLine()", () {
    final testCases = <(String input, String expectedKey, String expectedVal)>[
      (
        "foo: foo",
        "foo",
        "foo",
      ),
      (
        "url:  https://www.google.com",
        "url",
        "https://www.google.com",
      ),
      (
        "message:My name is: \"Jeff\".\\nI like ice cream!",
        "message",
        "My name is: \"Jeff\".\\nI like ice cream!"
      )
    ];
    for (final (input, expectedKey, expectedVal) in testCases) {
      final (key, val) = parseHeaderLine(input);
      expect(key, equals(expectedKey));
      expect(val, equals(expectedVal));
    }
  });

  group("InvocationMessage", () {
    final withBody = InvocationMessage(
      rpcName: "foo.fooFoo",
      reqId: "12345",
      path: null,
      method: null,
      contentType: ContentType.json,
      clientVersion: "1.2.5",
      customHeaders: {"foo": "hello foo"},
      body: "{\"message\":\"hello world\"}",
    );
    final withBodyEncoded =
        File("../../../tests/test-files/InvocationMessage_WithBody.txt")
            .readAsStringSync();

    final withoutBody = InvocationMessage(
      rpcName: "foo.fooFoo",
      reqId: "54321",
      path: null,
      method: null,
      contentType: ContentType.json,
      clientVersion: null,
      customHeaders: {"foo": "hello foo", "bar": "hello bar"},
      body: null,
    );
    final withoutBodyEncoded =
        File("../../../tests/test-files/InvocationMessage_WithoutBody.txt")
            .readAsStringSync();
    test("parsing", () {
      final withBodyResult = Message.fromString(withBodyEncoded);
      switch (withBodyResult) {
        case Ok<Message, String>():
          expect(withBodyResult.value is InvocationMessage, equals(true));
          expect(withBodyResult.value, equals(withBody));
          break;
        case Err<Message, String>():
          fail(withBodyResult.error);
      }
      final withoutBodyResult = Message.fromString(withoutBodyEncoded);
      switch (withoutBodyResult) {
        case Ok<Message, String>():
          expect(withoutBodyResult.value, equals(withoutBody));
          break;
        case Err<Message, String>():
          fail(withoutBodyResult.error);
      }

      final malformedResult = Message.fromString("HTTP/1 " + withBodyEncoded);
      switch (malformedResult) {
        case Ok<Message, String>():
          print("RESULT: ${malformedResult.value}");
          fail("Should not parse successfully");
        case Err<Message, String>():
          expect(malformedResult.error.isNotEmpty, equals(true));
          break;
      }
    });
    test("encoding", () {
      expect(withBody.encodeString(), equals(withBodyEncoded));
      expect(withoutBody.encodeString(), equals(withoutBodyEncoded));
    });
  });

  group("OkMessage", () {
    final withBody = OkMessage(
      reqId: "12345",
      contentType: ContentType.json,
      customHeaders: {},
      body: "{\"message\":\"hello world\"}",
    );
    final withBodyEncoded =
        File("../../../tests/test-files/OkMessage_WithBody.txt")
            .readAsStringSync();
    final withoutBody = OkMessage(
      reqId: "54321",
      contentType: ContentType.json,
      customHeaders: {"foo": "foo"},
      body: null,
    );
    final withoutBodyEncoded =
        File("../../../tests/test-files/OkMessage_WithoutBody.txt")
            .readAsStringSync();
    test("parsing", () {
      final withBodyResult = Message.fromString(withBodyEncoded);
      switch (withBodyResult) {
        case Ok<Message, String>():
          switch (withBodyResult.value) {
            case OkMessage():
              expect(withBodyResult.value, equals(withBody));
              break;
            case ErrorMessage():
            case InvocationMessage():
            case HeartbeatMessage():
            case ConnectionStartMessage():
            case StreamDataMessage():
            case StreamEndMessage():
            case StreamCancelMessage():
              fail(
                "Parsed to wrong message. Should be ServerSuccessMessage()",
              );
          }
        case Err<Message, String>():
          fail(withBodyResult.error);
      }
      final withoutBodyResult = Message.fromString(withoutBodyEncoded);
      switch (withoutBodyResult) {
        case Ok<Message, String>():
          switch (withoutBodyResult.value) {
            case OkMessage():
              expect(withoutBodyResult.value, equals(withoutBody));
              break;
            case ErrorMessage():
            case InvocationMessage():
            case HeartbeatMessage():
            case ConnectionStartMessage():
            case StreamDataMessage():
            case StreamEndMessage():
            case StreamCancelMessage():
              fail(
                "Parsed to wrong message. Should be ServerSuccessMessage()",
              );
          }
        case Err<Message, String>():
          fail(withoutBodyResult.error);
      }
    });
    test("encoding", () {
      expect(withBody.encodeString(), equals(withBodyEncoded));
      expect(withoutBody.encodeString(), equals(withoutBodyEncoded));
    });
  });
  group("ErrorMessage", () {
    final msgWithBody = ErrorMessage(
      reqId: "12345",
      code: 54321,
      message: "This is an error",
      contentType: ContentType.json,
      customHeaders: {"foo": "foo"},
      body: "{\"data\":[],\"trace\":[\"foo\",\"bar\",\"baz\"]}",
    );
    final msgWithBodyEncoded =
        File("../../../tests/test-files/ErrorMessage_WithBody.txt")
            .readAsStringSync();
    final msgWithoutBody = ErrorMessage(
      reqId: "12345",
      contentType: ContentType.json,
      customHeaders: {"foo": "foo"},
      code: 54321,
      message: "This is an error",
      body: null,
    );
    final msgWithoutBodyEncoded =
        File("../../../tests/test-files/ErrorMessage_WithoutBody.txt")
            .readAsStringSync();
    test("parsing", () {
      var result = Message.fromString(msgWithBodyEncoded);
      switch (result) {
        case Ok<Message, String>():
          switch (result.value) {
            case ErrorMessage():
              expect(result.value, equals(msgWithBody));
              break;
            default:
              fail("Expected ErrorMessage. Got ${result.value.runtimeType}");
          }
          break;
        case Err<Message, String>():
          fail(result.error);
      }
      result = Message.fromString(msgWithoutBodyEncoded);
      switch (result) {
        case Ok<Message, String>():
          switch (result.value) {
            case ErrorMessage():
              expect(result.value, equals(msgWithoutBody));
              break;
            default:
              fail(
                "Parsed to wrong message. Should be ErrorMessage().",
              );
          }
        case Err<Message, String>():
          fail(result.error);
      }
    });
    test("encoding", () {
      expect(msgWithBody.encodeString(), equals(msgWithBodyEncoded));
      expect(msgWithoutBody.encodeString(), equals(msgWithoutBodyEncoded));
    });
  });
  group("HeartbeatMessage", () {
    final msgWithInterval = HeartbeatMessage(heartbeatInterval: 155);
    final msgWithIntervalEncoded =
        File("../../../tests/test-files/HeartbeatMessage_WithInterval.txt")
            .readAsStringSync();
    final msgWithoutInterval = HeartbeatMessage(heartbeatInterval: null);
    final msgWithoutIntervalEncoded =
        File("../../../tests/test-files/HeartbeatMessage_WithoutInterval.txt")
            .readAsStringSync();
    test("parse", () {
      var result = Message.fromString(msgWithIntervalEncoded);
      expect(result.unwrap(), equals(msgWithInterval));
      result = Message.fromString(msgWithoutIntervalEncoded);
      expect(result.unwrap(), equals(msgWithoutInterval));
    });
    test("encode", () {
      expect(msgWithInterval.encodeString(), equals(msgWithIntervalEncoded));
      expect(
          msgWithoutInterval.encodeString(), equals(msgWithoutIntervalEncoded));
    });
  });
  group("Connection Start Message", () {
    final msg = ConnectionStartMessage(heartbeatInterval: 1510);
    final msgEncoded =
        "ARRIRPC/$arriVersion CONNECTION_START\nheartbeat-interval: 1510\n\n";

    test("parse", () {
      final result = Message.fromString(msgEncoded);
      switch (result) {
        case Ok<Message, String>():
          switch (result.value) {
            case ConnectionStartMessage():
              expect(result.value, equals(msg));
              break;
            case HeartbeatMessage():
            case InvocationMessage():
            case OkMessage():
            case ErrorMessage():
            case StreamDataMessage():
            case StreamEndMessage():
            case StreamCancelMessage():
              fail(
                  "Parsed to wrong message. Should be ServerConnectionStartMessage().");
          }
          break;
        case Err<Message, String>():
          fail(result.error);
      }
    });
    test("encode", () {
      expect(msg.encodeString(), equals(msgEncoded));
    });
  });
}
