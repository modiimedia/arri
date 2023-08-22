import 'dart:convert';

import 'package:http/http.dart' as http;

class Client {
  final String baseUrl;
  Client({required this.baseUrl});

  UsersService get users {
    return UsersService(baseUrl: baseUrl);
  }
}

main() async {
  final client = Client(baseUrl: "https://www.youtube.com");
  await client.users.getUser(userId: "12345");
  await client.users.updateUser(
    userId: "12345",
    firstName: "John",
    lastName: "Doe",
  );
}

class UsersService {
  final String baseUrl;
  const UsersService({required this.baseUrl});

  Future<User> getUser({required String userId}) async {
    await http.get(Uri.parse("$baseUrl/users/get-user"));
    return User(id: "", firstName: "", lastName: "");
  }

  Future<User> updateUser({
    required String userId,
    required String firstName,
    required String lastName,
  }) async {
    await http.post(Uri.parse("$baseUrl/users/update-user"),
        body: json.encode({
          'userId': userId,
          'firstName': firstName,
          'lastName': lastName,
        }));
    return User(id: userId, firstName: firstName, lastName: lastName);
  }
}

class User {
  final String id;
  final String firstName;
  final String lastName;
  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
  });
}
