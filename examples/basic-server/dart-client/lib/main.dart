import 'dart:convert';
import 'package:arri_client/arri_client.dart';

main() async {
  final response = await parsedArriRequest(
    "http://localhost:3000/example/hello-world",
    method: HttpMethod.post,
    params: {"message": "Hi There!"},
    parser: (body) {
      final data = json.decode(body);
      return data['message'];
    },
  );
  print(response);
}
