import 'package:arri_client/arri_client.dart';
import 'package:test/test.dart';

main() {
  test("invalid url", () async {
    final response = await parsedArriRequestSafe(
        "http://thisurldoesntexist.blah",
        parser: (data) {});
    if (response.error != null) {
      print(response.error);
      expect(response.error!.statusCode, equals(500));
    }
  });
}
