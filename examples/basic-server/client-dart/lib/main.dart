import 'package:client_dart/example_client.rpc.dart';

main() async {
  final client = ExampleClient(baseUrl: "http://127.0.0.1:3000");
  final response = await client.users.getUsers(UsersGetUsersParams(limit: 99));
  print(response.total);
  print(response.items);
}
