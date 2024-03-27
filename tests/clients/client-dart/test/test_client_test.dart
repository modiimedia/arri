import 'dart:io';

import 'package:arri_client/arri_client.dart';
import "package:test/test.dart";
import 'package:test_client_dart/test_client.rpc.dart';
// ignore: depend_on_referenced_packages
import 'package:http/io_client.dart';

Future<void> main() async {
  final client = TestClient(
      baseUrl: "http://127.0.0.1:2020", headers: {"x-test-header": 'test'});
  final unauthenticatedClient = TestClient(baseUrl: "http://127.0.0.1:2020");
  final httpClient =
      HttpClient(context: SecurityContext(withTrustedRoots: true));
  final ioClient = IOClient(httpClient);
  final clientWCustomHttpClient = TestClient(
    baseUrl: "http://127.0.0.1:2020",
    httpClient: ioClient,
    headers: {"x-test-header": 'test'},
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

  final input = ObjectWithEveryType(
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
      enumerator: ObjectWithEveryTypeEnumerator.a,
      array: [true, false],
      object: ObjectWithEveryTypeObject(
          boolean: true, string: "", timestamp: DateTime.now()),
      record: {
        "A": true,
        "B": false,
      },
      discriminator: ObjectWithEveryTypeDiscriminatorA(title: "Hello World"),
      nestedObject: ObjectWithEveryTypeNestedObject(
        id: "",
        timestamp: DateTime.now(),
        data: ObjectWithEveryTypeNestedObjectData(
            id: "",
            timestamp: DateTime.now(),
            data: ObjectWithEveryTypeNestedObjectDataData(
              id: "",
              timestamp: DateTime.now(),
            )),
      ),
      nestedArray: [
        [
          ObjectWithEveryTypeNestedArrayItemItem(
              id: "", timestamp: DateTime.now())
        ]
      ]);
  test("can send/receive objects with every field type", () async {
    final result = await client.tests.sendObject(input);
    expect(result.any["hello"], equals(input.any["hello"]));
    expect(result.array.length, equals(input.array.length));
    expect(result.array[0], equals(input.array[0]));
    expect(result.boolean, equals(input.boolean));
    expect(result.discriminator.type, equals(input.discriminator.type));
    expect(result.enumerator.value, equals(input.enumerator.value));
    expect(result.float32, equals(input.float32));
    expect(result.float64, equals(input.float64));
    expect(result.int16, equals(input.int16));
    expect(result.int64, equals(input.int64));
    expect(result.object.boolean, equals(input.object.boolean));
    expect(result.record["A"], equals(input.record["A"]));
    expect(
      result.nestedObject.data.data.timestamp.microsecond,
      equals(result.nestedObject.data.data.timestamp.microsecond),
    );
    final input2 = input.copyWith(int16: 999);
    final result2 = await client.tests.sendObject(input2);
    expect(result2.int16, equals(999));
  });
  test("supports injecting custom http clients", () async {
    final result = await clientWCustomHttpClient.tests.sendObject(input);
    expect(result.array.length, equals(input.array.length));
    expect(result.int64, equals(input.int64));
    expect(result.uint64, equals(input.uint64));
  });
  test("unauthenticated RPC requests return a 401 error", () async {
    try {
      await unauthenticatedClient.tests.sendObject(input);
      expect(false, equals(true));
    } catch (err) {
      if (err is ArriRequestError) {
        expect(err.statusCode, equals(401));
        return;
      }
      expect(false, equals(true));
    }
  });
  test("can send/receive objects with partial fields", () async {
    final input = ObjectWithEveryOptionalType(
      int16: 0,
      int64: BigInt.zero,
      nestedArray: [
        [
          ObjectWithEveryOptionalTypeNestedArrayItemItem(
              id: "", timestamp: DateTime.now())
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
    final input2 = input.copyWith(
      int64: BigInt.zero,
      discriminator: ObjectWithEveryNullableTypeDiscriminatorA(title: null),
      nestedObject: ObjectWithEveryNullableTypeNestedObject(
        id: null,
        timestamp: null,
        data: ObjectWithEveryNullableTypeNestedObjectData(
            id: "", timestamp: null, data: null),
      ),
      nestedArray: [null],
    );
    final result2 = await client.tests.sendObjectWithNullableFields(input2);
    expect(result2.nestedArray?[0], equals(null));
    expect(result2.nestedObject?.data?.id, equals(""));
    expect(result2.int64, equals(BigInt.zero));
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

  test("[SSE] supports server sent events", () async {
    int messageCount = 0;
    final eventSource = client.tests.streamMessages(
      ChatMessageParams(channelId: "12345"),
      onData: (data, _) {
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
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    eventSource.close();
    expect(messageCount > 0, equals(true));
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
  test("[SSE] parses both 'message' and 'error' events", () async {
    int messageCount = 0;
    int errorCount = 0;
    final eventSource = client.tests.streamTenEventsThenError(
      onData: (data, connection) {
        messageCount++;
        expect(data.messageType.isNotEmpty, equals(true));
      },
      onError: (error, connection) {
        errorCount++;
        connection.close();
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    expect(messageCount, equals(10));
    expect(errorCount, equals(1));
    expect(eventSource.isClosed, equals(true));
  });
  test("[SSE] closes connection when receiving 'done' event", () async {
    int messageCount = 0;
    int errorCount = 0;
    final eventSource = client.tests.streamTenEventsThenEnd(
      onData: (data, connection) {
        messageCount++;
      },
      onError: (_, __) {
        errorCount++;
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    expect(messageCount, equals(10));
    expect(errorCount, equals(0));
    expect(eventSource.isClosed, equals(true));
  });
  test("[SSE] auto-reconnects when connection is closed by server", () async {
    int connectionCount = 0;
    int messageCount = 0;
    int errorCount = 0;
    final eventSource = client.tests.streamAutoReconnect(
      AutoReconnectParams(messageCount: 10),
      onOpen: (_, __) {
        connectionCount++;
      },
      onData: (data, _) {
        messageCount++;
        expect(data.count > 0, equals(true));
      },
      onError: (_, __) {
        errorCount++;
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    eventSource.close();
    expect(connectionCount > 0, equals(true));
    expect(messageCount > 10, equals(true));
    expect(errorCount, equals(0));
  });
  test("[SSE] can handle receiving large messages", () async {
    var openCount = 0;
    var msgCount = 0;
    var errorCount = 0;
    final eventSource = client.tests.streamLargeObjects(
      onOpen: (_, __) {
        openCount++;
      },
      onData: (data, _) {
        msgCount++;
      },
      onError: (_, __) {
        errorCount++;
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    eventSource.close();
    expect(openCount, equals(1));
    expect(msgCount > 2, equals(true));
    expect(errorCount, equals(0));
  });

  test("[SSE] auto-retry when initial connection fails", () async {
    var openCount = 0;
    var errorCount = 0;
    var connectionErrorCount = 0;
    var msgCount = 0;
    final List<ArriRequestError> errors = [];
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
      onData: (data, _) {
        msgCount++;
      },
      onError: (err, _) {
        errorCount++;
      },
      onConnectionError: (err, _) {
        connectionErrorCount++;
        errors.add(err);
      },
    );
    await Future.delayed(Duration(milliseconds: 500));
    eventSource.close();
    expect(openCount > 0, equals(true));
    expect(errorCount, equals(0));
    expect(msgCount, equals(0));
    expect(connectionErrorCount > 0, equals(true));
    expect(
      errors.every(
        (element) =>
            element.statusCode == statusCode &&
            element.statusMessage == statusMessage,
      ),
      equals(true),
    );
  });
}
