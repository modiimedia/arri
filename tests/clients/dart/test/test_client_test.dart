import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:arri_client/arri_client.dart';
import "package:test/test.dart";
import 'package:test_client_dart/test_client.g.dart';
// ignore: depend_on_referenced_packages
import 'package:http/io_client.dart';

const baseUrl = "http://127.0.0.1:2020";

Future<void> main() async {
  final client =
      TestClient(baseUrl: baseUrl, headers: () => {"x-test-header": 'test'});
  final httpClient =
      HttpClient(context: SecurityContext(withTrustedRoots: true));
  final ioClient = IOClient(httpClient);
  final clientWCustomHttpClient = TestClient(
    baseUrl: baseUrl,
    httpClient: ioClient,
    headers: () => {"x-test-header": 'test'},
  );

  test("supports RPCs with no params", () async {
    try {
      await client.tests.emptyParamsGetRequest();
      await client.tests.emptyParamsPostRequest();
    } catch (err) {
      print("ERROR: ${err.toString()}");
      expect(false, equals(true));
    }
  });
  test("supports RPCs with no response", () async {
    try {
      await client.tests.emptyResponseGetRequest(
        DefaultPayload(message: "ok"),
      );
      await client.tests.emptyResponsePostRequest(
        DefaultPayload(message: "ok"),
      );
    } catch (err) {
      print("ERROR ${err.toString()}");
      expect(false, equals(true));
    }
  });

  final targetDate = DateTime.parse("2001-01-01T16:36:00.000Z");
  final input = ObjectWithEveryType(
      any: {"hello": "world", "goodbye": "world"},
      boolean: true,
      string: "",
      timestamp: targetDate,
      float32: 1,
      float64: 1,
      int8: 1,
      uint8: 1,
      int16: 1,
      uint16: 1,
      int32: 1,
      uint32: 1,
      int64: BigInt.from(1),
      uint64: BigInt.from(1),
      enumerator: ObjectWithEveryTypeEnumerator.a,
      array: [true, false],
      object: ObjectWithEveryTypeObject(
        boolean: true,
        string: "",
        timestamp: targetDate,
      ),
      record: {
        "A": BigInt.from(1),
        "B": BigInt.from(0),
        "\"C\"\t": BigInt.from(1),
      },
      discriminator: ObjectWithEveryTypeDiscriminatorA(title: "Hello World"),
      nestedObject: ObjectWithEveryTypeNestedObject(
        id: "",
        timestamp: targetDate,
        data: ObjectWithEveryTypeNestedObjectData(
            id: "",
            timestamp: targetDate,
            data: ObjectWithEveryTypeNestedObjectDataData(
              id: "",
              timestamp: targetDate,
            )),
      ),
      nestedArray: [
        [
          ObjectWithEveryTypeNestedArrayElementElement(
            id: "",
            timestamp: targetDate,
          )
        ]
      ]);
  test("can send/receive objects with every field type", () async {
    final result = await client.tests.sendObject(input);
    expect(result, equals(input));
    final input2 = input.copyWith(int16: 999);
    final result2 = await client.tests.sendObject(input2);
    expect(result2, equals(input2));
    expect(input == input2, equals(false));
  });
  test("can send/receive objects with snake_case keys", () async {
    final payload = ObjectWithSnakeCaseKeys(
      createdAt: targetDate,
      displayName: "testing 123",
      phoneNumber: "211-211-2111",
      emailAddress: "johndoe@gmail",
    );
    final result = await client.tests.sendObjectWithSnakeCaseKeys(payload);
    expect(result, equals(payload));
  });
  test("can send/receive objects with PascalCase keys", () async {
    final payload = ObjectWithPascalCaseKeys(
      createdAt: targetDate,
      displayName: "testing 123",
      phoneNumber: null,
    );
    final result = await client.tests.sendObjectWithPascalCaseKeys(payload);
    expect(result, equals(payload));
    final payload2 = payload.copyWith(
      phoneNumber: () => "2112112111",
      emailAddress: () => "johndoe@gmail.com",
    );
    final result2 = await client.tests.sendObjectWithPascalCaseKeys(payload2);
    expect(result2, equals(payload2));
  });
  test("supports injecting custom http clients", () async {
    final result = await clientWCustomHttpClient.tests.sendObject(input);
    expect(result.array.length, equals(input.array.length));
    expect(result.int64, equals(input.int64));
    expect(result.uint64, equals(input.uint64));
  });
  test("supports async header functions", () async {
    final asyncHeaderClient = TestClient(
      baseUrl: baseUrl,
      headers: () async {
        await Future.delayed(Duration(milliseconds: 100));
        return {"x-test-header": "async-test"};
      },
    );
    final result = await asyncHeaderClient.tests.sendObject(input);
    expect(result.array.length, equals(input.array.length));
    expect(result.int64, equals(input.int64));
    expect(result.uint64, equals(input.uint64));
  });
  test("unauthenticated RPC requests return a 401 error", () async {
    bool firedOnErr = false;
    final unauthenticatedClient = TestClient(
      baseUrl: baseUrl,
      onError: (_) {
        firedOnErr = true;
      },
    );
    try {
      await unauthenticatedClient.tests.sendObject(input);
      expect(false, equals(true));
    } catch (err) {
      if (err is ArriError) {
        expect(err.code, equals(401));
        return;
      }
      expect(false, equals(true));
    }
    expect(firedOnErr, equals(true));
  });
  test("can send/receive objects with partial fields", () async {
    final input = ObjectWithEveryOptionalType(
      int16: 0,
      int64: BigInt.zero,
      nestedArray: [
        [
          ObjectWithEveryOptionalTypeNestedArrayElementElement(
            id: "",
            timestamp: DateTime.now(),
          )
        ]
      ],
    );
    final result = await client.tests.sendPartialObject(input);
    expect(result.string, equals(null));
    expect(result.int16, equals(0));
    expect(result.int64, equals(BigInt.zero));
    expect(result.nestedArray?[0][0].id, equals(""));
  });
  test("can send/receive objects with nullable fields", () async {
    final input = ObjectWithEveryNullableType(
      any: null,
      boolean: null,
      string: null,
      timestamp: null,
      float32: null,
      float64: null,
      int8: null,
      uint8: null,
      int16: null,
      uint16: null,
      int32: null,
      uint32: null,
      int64: null,
      uint64: null,
      enumerator: null,
      array: null,
      object: null,
      record: null,
      discriminator: null,
      nestedObject: null,
      nestedArray: null,
    );
    final result = await client.tests.sendObjectWithNullableFields(input);
    expect(result.string, equals(null));
    expect(result.array, equals(null));
    final input2 = ObjectWithEveryNullableType(
      any: {"hello": "world", "goodbye": "world"},
      boolean: true,
      string: "",
      timestamp: DateTime.now(),
      float32: 1,
      float64: 1,
      int8: 1,
      uint8: 1,
      int16: 1,
      uint16: 1,
      int32: 1,
      uint32: 1,
      int64: BigInt.from(1),
      uint64: BigInt.from(1),
      enumerator: ObjectWithEveryNullableTypeEnumerator.a,
      array: [true, false],
      object: ObjectWithEveryNullableTypeObject(
          boolean: true, string: "", timestamp: DateTime.now()),
      record: {
        "A": BigInt.from(1),
        "B": BigInt.from(0),
      },
      discriminator:
          ObjectWithEveryNullableTypeDiscriminatorA(title: "Hello World"),
      nestedObject: ObjectWithEveryNullableTypeNestedObject(
        id: "",
        timestamp: DateTime.now(),
        data: ObjectWithEveryNullableTypeNestedObjectData(
            id: "",
            timestamp: DateTime.now(),
            data: ObjectWithEveryNullableTypeNestedObjectDataData(
              id: "",
              timestamp: DateTime.now(),
            )),
      ),
      nestedArray: [
        [
          ObjectWithEveryNullableTypeNestedArrayElementElement(
            id: "",
            timestamp: DateTime.now(),
          )
        ]
      ],
    );
    final result2 = await client.tests.sendObjectWithNullableFields(input2);
    expect(result2.nestedArray?.length, equals(1));
    expect(result2.nestedArray?.length, equals(1));
    expect(result2.nestedArray?[0]?[0]?.id, equals(""));
    expect(result2.nestedObject?.data?.id, equals(""));
    expect(result2.int64, equals(BigInt.from(1)));
    expect(
      result2.discriminator is ObjectWithEveryNullableTypeDiscriminatorA,
      equals(true),
    );
  });
  test("can send/receive recursive objects", () async {
    final input = RecursiveObject(
      left: RecursiveObject(
        left: RecursiveObject(
          left: null,
          right: null,
          value: "depth2",
        ),
        right: null,
        value: "depth1",
      ),
      right: RecursiveObject(
        left: null,
        right: null,
        value: "depth1,",
      ),
      value: "depth0",
    );
    final result = await client.tests.sendRecursiveObject(input);
    expect(result.left?.left?.left, equals(null));
    expect(result.left?.left?.value, equals("depth2"));
  });
  test("can send/receive recursive unions", () async {
    final input = RecursiveUnionChildren(
      data: [
        RecursiveUnionChild(
          data: RecursiveUnionText(
            data: "hello world",
          ),
        ),
        RecursiveUnionShape(
          data: RecursiveUnionShapeData(
            width: 1,
            height: 1,
            color: "blue",
          ),
        ),
      ],
    );
    final result = await client.tests.sendRecursiveUnion(input);
    expect(result is RecursiveUnionChildren, equals(true));
    expect((result as RecursiveUnionChildren).data.length, equals(2));
    expect((result.data[0] as RecursiveUnionChild).data is RecursiveUnionText,
        equals(true));
  });

  test("onError hook fires", () async {
    bool onErrFired = false;
    final customClient = TestClient(
      baseUrl: baseUrl,
      onError: (err) {
        onErrFired = true;
        expect(err is ArriError, equals(true));
      },
    );
    try {
      await customClient.tests.sendObject(input);
    } catch (_) {}
    expect(onErrFired, equals(true));
  });

  test("[SSE] supports server sent events", () async {
    int messageCount = 0;
    final completer = Completer();
    final eventSource = client.tests.streamMessages(
      ChatMessageParams(channelId: "12345"),
      onMessage: (data, es) {
        messageCount++;
        switch (data) {
          case ChatMessageText():
            expect(data.channelId, equals('12345'));
            expect(data.messageType, equals("TEXT"));
            break;
          case ChatMessageImage():
            expect(data.channelId, equals("12345"));
            expect(data.messageType, equals("IMAGE"));
            break;
          case ChatMessageUrl():
            expect(data.channelId, equals("12345"));
            expect(data.messageType, equals("URL"));
            break;
        }
        if (messageCount >= 15) es.close();
      },
      onClose: (_) {
        completer.complete();
      },
      onError: (err, _) {
        completer.completeError(err);
      },
    );
    await completer.future;
    expect(messageCount, equals(15));
    expect(eventSource.isClosed, equals(true));
  });
  test("[SSE] supports converting server sent events to a Dart 'Stream'",
      () async {
    int messageCount = 0;
    final eventSource =
        client.tests.streamMessages(ChatMessageParams(channelId: "12345"));
    final listener = eventSource.toStream().listen((message) {
      messageCount++;
      switch (message) {
        case ChatMessageText():
          expect(message.channelId, equals('12345'));
          expect(message.messageType, equals("TEXT"));
          break;
        case ChatMessageImage():
          expect(message.channelId, equals("12345"));
          expect(message.messageType, equals("IMAGE"));
          break;
        case ChatMessageUrl():
          expect(message.channelId, equals("12345"));
          expect(message.messageType, equals("URL"));
          break;
      }
    });
    await Future.delayed(Duration(milliseconds: 500));
    await listener.cancel();
    expect(messageCount >= 1, equals(true));
    expect(eventSource.isClosed, equals(true));
  });
  test("[SSE] closes connection when receiving 'done' event", () async {
    int messageCount = 0;
    int errorCount = 0;
    final completer = Completer();
    final eventSource = client.tests.streamTenEventsThenEnd(
      onMessage: (data, connection) {
        messageCount++;
      },
      onError: (_, __) {
        errorCount++;
      },
      onClose: (_) {
        completer.complete();
      },
    );
    await completer.future;
    expect(messageCount, equals(10));
    expect(errorCount, equals(0));
    expect(eventSource.isClosed, equals(true));
  });
  test("[SSE] auto-reconnects when connection is closed by server", () async {
    int connectionCount = 0;
    int messageCount = 0;
    int errorCount = 0;
    final completer = Completer();

    final eventSource = client.tests.streamAutoReconnect(
        AutoReconnectParams(messageCount: 10), onOpen: (_, __) {
      connectionCount++;
    }, onMessage: (data, es) {
      messageCount++;
      expect(data.count > 0, equals(true));
      if (messageCount >= 30) es.close();
    }, onError: (_, __) {
      errorCount++;
    }, onClose: (_) {
      completer.complete();
    });
    await completer.future;
    expect(connectionCount > 0, equals(true));
    expect(messageCount > 10, equals(true));
    expect(errorCount, equals(0));
    expect(eventSource.isClosed, equals(true));
  });
  test(
    "[SSE] can handle receiving large messages",
    () async {
      var openCount = 0;
      var msgCount = 0;
      var errorCount = 0;
      final completer = Completer();
      client.tests.streamLargeObjects(onOpen: (_, __) {
        openCount++;
      }, onMessage: (data, controller) {
        msgCount++;
        if (msgCount > 2) controller.close();
      }, onError: (_, __) {
        errorCount++;
      }, onClose: (_) {
        completer.complete();
      });
      await completer.future;
      expect(openCount, equals(1));
      expect(msgCount > 2, equals(true));
      expect(errorCount, equals(0));
    },
    timeout: Timeout(Duration(seconds: 10)),
  );

  test("[SSE] auto-retry when initial connection fails", () async {
    var openCount = 0;
    var errorCount = 0;
    var msgCount = 0;
    final List<ArriError> errors = [];
    final statusCode = 555;
    final statusMessage = "test_message";
    final eventSource = client.tests.streamConnectionErrorTest(
      StreamConnectionErrorTestParams(
        statusCode: statusCode,
        statusMessage: statusMessage,
      ),
      onOpen: (_, __) {
        openCount++;
      },
      onMessage: (data, _) {
        msgCount++;
      },
      onError: (err, _) {
        errorCount++;
        errors.add(err);
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    eventSource.close();
    expect(openCount > 0, equals(true));
    expect(msgCount, equals(0));
    expect(errorCount > 0, equals(true));
    expect(
      errors.every(
        (element) =>
            element.code == statusCode && element.message == statusMessage,
      ),
      equals(true),
    );
  });
  test("[SSE] can retry with new credentials", () async {
    final tokensUsed = <String>[];
    final dynamicClient = TestClient(
      baseUrl: baseUrl,
      headers: () {
        final token = Random.secure().nextInt(4294967296).toString();
        tokensUsed.add(token);
        return {"x-test-header": "dart_$token"};
      },
    );
    var msgCount = 0;
    var openCount = 0;
    final completer = Completer();

    final eventSource = dynamicClient.tests.streamRetryWithNewCredentials(
      onMessage: (data, connection) {
        msgCount++;
        if (msgCount >= 40) connection.close();
      },
      onOpen: (response, connection) {
        openCount++;
      },
      onError: (err, connection) {
        expect(err.code, equals(403));
      },
      onClose: (_) {
        completer.complete();
      },
    );
    await completer.future;
    expect(eventSource.isClosed, equals(true));
    expect(tokensUsed.isNotEmpty, equals(true));
    expect(tokensUsed.length, equals(4));
    expect(msgCount, equals(40));
    expect(openCount, equals(4));
  });

  group("[SSE] heartbeat headers", () {
    test(
      'reconnects when no heartbeat is received',
      () async {
        var msgCount = 0;
        var openCount = 0;
        final completer = Completer();
        final eventSource = client.tests.streamHeartbeatDetectionTest(
          StreamHeartbeatDetectionTestParams(heartbeatEnabled: false),
          onMessage: (msg, connection) {
            msgCount++;
            if (msgCount >= 15) connection.close();
          },
          onOpen: (_, __) {
            openCount++;
          },
          onClose: (_) {
            completer.complete();
          },
          onError: (err, _) {
            completer.completeError(err);
          },
        );
        await completer.future;
        expect(eventSource.isClosed, equals(true));
        expect(openCount, equals(3));
        expect(msgCount, equals(15));
      },
      timeout: Timeout(Duration(seconds: 30)),
    );
    test('keeps connection alive when heartbeat is received', () async {
      var msgCount = 0;
      var openCount = 0;
      final completer = Completer();
      final eventSource = client.tests.streamHeartbeatDetectionTest(
        StreamHeartbeatDetectionTestParams(heartbeatEnabled: true),
        onMessage: (msg, connection) {
          msgCount++;
          if (msgCount >= 8) connection.close();
        },
        onOpen: (v, __) {
          openCount++;
        },
        onClose: (_) {
          completer.complete();
        },
        onError: (err, _) {
          completer.completeError(err);
        },
      );
      await completer.future;
      expect(eventSource.isClosed, equals(true));
      expect(openCount, equals(1));
      expect(msgCount, equals(8));
    }, timeout: Timeout(Duration(seconds: 30)));
  });
}
