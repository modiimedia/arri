import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:arri_client/arri_client.dart';
import 'package:test/test.dart';

class TestParams implements ArriModel {
  final bool heartbeatEnabled;
  const TestParams({required this.heartbeatEnabled});

  @override
  Map<String, dynamic> toMap() {
    return {"heartbeatEnabled": heartbeatEnabled};
  }

  @override
  String toJson() {
    return "{\"heartbeatEnabled\":$heartbeatEnabled}";
  }

  @override
  String toUrlQueryParams() {
    return "heartbeatEnabled=$heartbeatEnabled";
  }

  @override
  List<Object?> get props => [heartbeatEnabled];
}

class TestResponse {
  final String message;
  const TestResponse({required this.message});

  factory TestResponse.fromJson(Map<String, dynamic> input) {
    return TestResponse(message: input["message"] ?? "");
  }

  factory TestResponse.fromJsonString(String input) {
    final parsed = json.decode(input);
    return TestResponse.fromJson(parsed);
  }
}

main() {
  group("it respects the heartbeat header", () {
    final dispatcher = HttpDispatcher(baseUrl: "http://localhost:2020");
    test(
      "it reconnects when no heartbeat is received",
      () async {
        var msgCount = 0;
        var openCount = 0;
        final completer = Completer();
        final stream = dispatcher.handleOutputStreamRpc(
            req: RpcRequest(
              procedure: "heartbeatTest",
              reqId: Random().nextInt(9999).toString(),
              path: "/heartbeat-test",
              method: HttpMethod.get,
              clientVersion: "22",
              customHeaders: null,
              data: TestParams(
                heartbeatEnabled: false,
              ),
            ),
            responseDecoder: (input) => TestResponse.fromJsonString(input),
            onData: (_, stream) {
              msgCount++;
              if (msgCount >= 15) {
                stream.close();
                completer.complete();
              }
            },
            onOpen: (_) {
              openCount++;
            },
            onError: (err, stream) {
              stream.close();
              completer.completeError(err);
            });
        await completer.future;
        expect(stream.isClosed, equals(true));
        expect(openCount, equals(3));
        expect(msgCount, equals(15));
      },
    );
    test(
      "it keeps the connection alive when heartbeat is received",
      () async {
        var msgCount = 0;
        var openCount = 0;
        final completer = Completer();
        final stream = dispatcher.handleOutputStreamRpc(
            req: RpcRequest(
              procedure: "heartbeatTest",
              reqId: Random().nextInt(9999).toString(),
              path: "/heartbeat-test",
              method: HttpMethod.get,
              clientVersion: "22",
              customHeaders: null,
              data: TestParams(
                heartbeatEnabled: true,
              ),
            ),
            responseDecoder: (input) => TestResponse.fromJsonString(input),
            onData: (_, stream) {
              msgCount++;
              if (msgCount >= 15) {
                stream.close();
                completer.complete();
              }
            },
            onOpen: (_) {
              openCount++;
            },
            onError: (err, stream) {
              stream.close();
              completer.completeError(err);
            });
        await completer.future;
        expect(stream.isClosed, equals(true));
        expect(openCount, equals(1));
        expect(msgCount, equals(15));
      },
    );
  });
}
