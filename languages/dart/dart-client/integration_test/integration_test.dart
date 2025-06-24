import 'package:test/test.dart';

main() {
  group("it respects the heartbeat header", () {
    test(
      "it reconnects when no heartbeat is received",
      () async {},
    );
    test(
      "it keeps the connection alive when heartbeat is received",
      () async {},
    );
  });
}
