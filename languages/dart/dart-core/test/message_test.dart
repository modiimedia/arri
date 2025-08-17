import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';

import '../lib/arri_core.dart';

class MessageBody implements ArriModel {
  final String message;
  const MessageBody({required this.message});

  @override
  List<Object?> get props => [message];

  @override
  Map<String, dynamic> toJson() {
    return {"message": message};
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    return "message=$message";
  }

  @override
  bool operator ==(Object other) {
    return other is MessageBody && message == other.message;
  }
}

MessageBody messageBodyParser(String input) {
  final values = json.decode(input);
  return MessageBody(
    message: values["message"] is String ? values["message"] : "",
  );
}

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

  group("ClientMessage", () {
    final withBody = ClientMessage<MessageBody>(
      rpcName: "foo.fooFoo",
      reqId: "12345",
      path: null,
      method: null,
      contentType: ContentType.json,
      clientVersion: "1.2.5",
      customHeaders: {"foo": "foo"},
      body: MessageBody(message: "hello world"),
    );
    final withBodyEncoded =
        File("../../../tests/test-files/InvocationMessage_WithBody.txt")
            .readAsStringSync();

    final withoutBody = ClientMessage<MessageBody>(
      rpcName: "foo.fooFoo",
      reqId: "54321",
      path: null,
      method: null,
      contentType: ContentType.json,
      clientVersion: null,
      customHeaders: {"foo": "foo", "bar": "bar"},
      body: null,
    );
    final withoutBodyEncoded =
        File("../../../tests/test-files/InvocationMessage_WithoutBody.txt")
            .readAsStringSync();
    test("parsing", () {
      final withBodyResult = ClientMessage.fromString(
        withBodyEncoded,
        messageBodyParser,
      );
      switch (withBodyResult) {
        case Ok<ClientMessage<MessageBody>, String>():
          expect(withBodyResult.value, equals(withBody));
          break;
        case Err<ClientMessage<MessageBody>, String>():
          fail(withBodyResult.error);
      }
      final withoutBodyResult = ClientMessage.fromString(
        withoutBodyEncoded,
        messageBodyParser,
      );
      switch (withoutBodyResult) {
        case Ok<ClientMessage<MessageBody>, String>():
          expect(withoutBodyResult.value, equals(withoutBody));
          break;
        case Err<ClientMessage<MessageBody>, String>():
          fail(withoutBodyResult.error);
      }

      final malformedResult = ClientMessage.fromString(
        "HTTP/1 " + withBodyEncoded,
        messageBodyParser,
      );
      switch (malformedResult) {
        case Ok<ClientMessage<MessageBody>, String>():
          print("RESULT: ${malformedResult.value}");
          fail("Should not parse successfully");
        case Err<ClientMessage<MessageBody>, String>():
          expect(malformedResult.error.isNotEmpty, equals(true));
          break;
      }
    });
    test("encoding", () {
      expect(withBody.encodeString(), equals(withBodyEncoded));
      expect(withoutBody.encodeString(), equals(withoutBodyEncoded));
    });
  });

  group("ServerMessages", () {
    group("Success Message", () {
      final withBody = OkMessage(
        reqId: "12345",
        contentType: ContentType.json,
        customHeaders: {},
        body: MessageBody(message: "hello world").toJsonString(),
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
    group("Failure Message", () {
      final msg = ErrorMessage(
        reqId: "12345",
        contentType: ContentType.json,
        customHeaders: {"foo": "foo"},
        code: 54321,
        message: "This is an error",
        body: null,
      );
      final msgEncoded =
          File("../../../tests/test-files/ErrorMessage_WithoutBody.txt")
              .readAsStringSync();
      test("parsing", () {
        final result = Message.fromString(msgEncoded);
        switch (result) {
          case Ok<Message, String>():
            switch (result.value) {
              case ErrorMessage():
                expect(result.value, equals(msg));
                break;
              case OkMessage():
              case InvocationMessage():
              case HeartbeatMessage():
              case ConnectionStartMessage():
              case StreamDataMessage():
              case StreamEndMessage():
              case StreamCancelMessage():
                fail(
                  "Parsed to wrong message. Should be ServerFailureMessage().",
                );
            }
          case Err<Message, String>():
            fail(result.error);
        }
      });
      test("encoding", () {
        expect(msg.encodeString(), equals(msgEncoded));
      });
    });
    group("Heartbeat Message", () {
      final msg = HeartbeatMessage(heartbeatInterval: 150);
      final msgEncoded =
          "ARRIRPC/$arriVersion HEARTBEAT\nheartbeat-interval: 150\n\n";
      test("parse", () {
        final result = Message.fromString(msgEncoded);
        switch (result) {
          case Ok<Message, String>():
            switch (result.value) {
              case HeartbeatMessage():
                expect(result.value, equals(msg));
                break;
              case OkMessage():
              case ErrorMessage():
              case InvocationMessage():
              case ConnectionStartMessage():
              case StreamDataMessage():
              case StreamEndMessage():
              case StreamCancelMessage():
                fail(
                    "Parsed to wrong message. Should be ServerHeartbeatMessage().");
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
  });
}
