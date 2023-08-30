import 'package:client_dart/example_client.rpc.dart';

main() async {
  final client = ExampleClient();
  final getUserResult =
      await client.users.getUser(UsersGetUserParams(userId: "1"));
  print(getUserResult.toJson());

  final updateUserResult = await client.users.updateUser(UsersUpdateUserParams(
    userId: "1",
    data: UserUpdateData(
      name: "Suzy Q",
      email: "suzyq@gmail.com",
    ),
  ));
  print(updateUserResult.toJson());
}
