import 'package:arri_client/arri_client.dart';
import 'package:test/test.dart';

main() {
  final nonExistentUrl = "http://thisurldoesntexist.blah";

  test("invalid url", () async {
    final response =
        await parsedArriRequestSafe(nonExistentUrl, parser: (data) {});
    if (response.error != null) {
      expect(response.error!.statusCode, equals(500));
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
    expect(errCount, equals(10));
    expect(closeCount, equals(1));
  });
}
