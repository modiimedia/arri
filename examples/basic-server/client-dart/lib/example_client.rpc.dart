// This code was autogenerated by Arri. Do not modify directly.
// For additional documentation visit http://github.com/modiimedia/arri
import "dart:convert";
import "package:arri_client/arri_client.dart";

class ExampleClient {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ExampleClient({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _headers = headers,
        _baseUrl = baseUrl;

  ExampleClientUsersService get users {
    return ExampleClientUsersService(
      baseUrl: _baseUrl,
      headers: _headers,
    );
  }
}

class ExampleClientUsersService {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ExampleClientUsersService({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl,
        _headers = headers;

  Future<User> getUser(UsersGetUserParams params) {
    return parsedArriRequest(
      "$_baseUrl/users/get-user",
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(json.decode(body)),
    );
  }

  Future<User> updateUser(UsersUpdateUserParams params) {
    return parsedArriRequest(
      "$_baseUrl/users/update-user",
      method: HttpMethod.post,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(json.decode(body)),
    );
  }
}

class UsersGetUserParams {
  final String userId;
  const UsersGetUserParams({
    required this.userId,
  });
  factory UsersGetUserParams.fromJson(Map<String, dynamic> json) {
    return UsersGetUserParams(
      userId: json["userId"] is String ? json["userId"] : "",
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "userId": userId,
    };
  }

  UsersGetUserParams copyWith({
    String? userId,
  }) {
    return UsersGetUserParams(
      userId: userId ?? this.userId,
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final int createdAt;
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"] is String ? json["id"] : "",
      name: json["name"] is String ? json["name"] : "",
      email: json["email"] is String ? json["email"] : "",
      createdAt: json["createdAt"] is int ? json["createdAt"] : 0,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "email": email,
      "createdAt": createdAt,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    int? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class UsersUpdateUserParams {
  final String userId;
  final UserUpdateData data;
  const UsersUpdateUserParams({
    required this.userId,
    required this.data,
  });
  factory UsersUpdateUserParams.fromJson(Map<String, dynamic> json) {
    return UsersUpdateUserParams(
      userId: json["userId"] is String ? json["userId"] : "",
      data: UserUpdateData.fromJson(json["data"]),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "userId": userId,
      "data": data.toJson(),
    };
  }

  UsersUpdateUserParams copyWith({
    String? userId,
    UserUpdateData? data,
  }) {
    return UsersUpdateUserParams(
      userId: userId ?? this.userId,
      data: data ?? this.data,
    );
  }
}

class UserUpdateData {
  final String name;
  final String email;
  final int createdAt;
  const UserUpdateData({
    required this.name,
    required this.email,
    required this.createdAt,
  });
  factory UserUpdateData.fromJson(Map<String, dynamic> json) {
    return UserUpdateData(
      name: json["name"] is String ? json["name"] : "",
      email: json["email"] is String ? json["email"] : "",
      createdAt: json["createdAt"] is int ? json["createdAt"] : 0,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "name": name,
      "email": email,
      "createdAt": createdAt,
    };
  }

  UserUpdateData copyWith({
    String? name,
    String? email,
    int? createdAt,
  }) {
    return UserUpdateData(
      name: name ?? this.name,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

enum ExampleClientEndpoints
    implements Comparable<ExampleClientEndpoints>, ArriEndpoint {
  usersGetUser(
    path: "/users/get-user",
    method: HttpMethod.get,
  ),
  usersUpdateUser(
    path: "/users/update-user",
    method: HttpMethod.post,
  );

  const ExampleClientEndpoints({
    required this.path,
    required this.method,
  });
  @override
  final String path;
  @override
  final HttpMethod method;

  @override
  compareTo(ExampleClientEndpoints other) => name.compareTo(other.name);
}