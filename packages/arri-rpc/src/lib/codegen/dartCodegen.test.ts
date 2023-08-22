import { Type } from "@sinclair/typebox";
import { test } from "vitest";
import {
    dartServiceFromServiceDefinition,
    dartModelFromJsonSchema,
} from "./dartCodegen";

describe("Dart Tests", () => {
    test("Service Generation", () => {
        const result = dartServiceFromServiceDefinition("UserService", {
            getUser: {
                path: "/users/get-user",
                method: "get",
                params: "UsersGetUserParams",
                response: "User",
            },
            updateUser: {
                path: "/users/update-user",
                method: "post",
                params: "UserUpdateData",
                response: "User",
            },
        });
        expect(result).toBe(`class UserService {
  final String baseUrl;
  final Map<String, String> headers;
  const UserService({
    this.baseUrl = "",
    this.headers = const {},
  });
  Future<User> getUser(UsersGetUserParams params) {
    return parsedRequest(
      "$baseUrl/users/get-user",
      method: HttpMethod.get,
      headers: headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(json.decode(body)),
    );
  }
  Future<User> updateUser(UserUpdateData params) {
    return parsedRequest(
      "$baseUrl/users/update-user",
      method: HttpMethod.post,
      headers: headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(json.decode(body)),
    );
  }
}`);
    });

    test("Model Generation", () => {
        const schema = Type.Object({
            id: Type.String(),
            firstName: Type.Optional(Type.String()),
            lastName: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            createdAt: Type.Integer(),
            lastSignedIn: Type.Optional(Type.Integer()),
            rating: Type.Number(),
            followedUsers: Type.Array(Type.String()),
            settings: Type.Object({
                enablePushNotifications: Type.Boolean(),
                isPrivate: Type.Boolean(),
            }),
        });
        console.log("SCHEMA");
        console.log(schema);

        const result = dartModelFromJsonSchema("User", schema);
        expect(result).toBe(`class User {
  final String id;
  final String? firstName;
  final String? lastName;
  final String? email;
  final int createdAt;
  final int? lastSignedIn;
  final double rating;
  final List<String> followedUsers;
  final UserSettings settings;
  const User({
    required this.id,
    this.firstName,
    this.lastName,
    this.email,
    required this.createdAt,
    this.lastSignedIn,
    required this.rating,
    required this.followedUsers,
    required this.settings,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"] is String ? json["id"] : "",
      firstName: json["firstName"] is String ? json["firstName"] : null,
      lastName: json["lastName"] is String ? json["lastName"] : null,
      email: json["email"] is String ? json["email"] : null,
      createdAt: json["createdAt"] is int ? json["createdAt"] : 0,
      lastSignedIn: json["lastSignedIn"] is int ? json["lastSignedIn"] : null,
      rating: json["rating"] is double ? json["rating"] : 0.0,
      followedUsers: json["followedUsers"] is List<String> ? json["followedUsers"] : [],
      settings: UserSettings.fromJson(json["settings"]),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "createdAt": createdAt,
      "lastSignedIn": lastSignedIn,
      "rating": rating,
      "followedUsers": followedUsers,
      "settings": settings.toJson(),
    };
  }
  User copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    int? createdAt,
    int? lastSignedIn,
    double? rating,
    List<String>? followedUsers,
    UserSettings? settings,
  }) {
    return User(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
      lastSignedIn: lastSignedIn ?? this.lastSignedIn,
      rating: rating ?? this.rating,
      followedUsers: followedUsers ?? this.followedUsers,
      settings: settings ?? this.settings,
    );
  }
}

class UserSettings {
  final bool enablePushNotifications;
  final bool isPrivate;
  const UserSettings({
    required this.enablePushNotifications,
    required this.isPrivate,
  });
  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      enablePushNotifications: json["enablePushNotifications"] is bool ? json["enablePushNotifications"] : false,
      isPrivate: json["isPrivate"] is bool ? json["isPrivate"] : false,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "enablePushNotifications": enablePushNotifications,
      "isPrivate": isPrivate,
    };
  }
  UserSettings copyWith({
    bool? enablePushNotifications,
    bool? isPrivate,
  }) {
    return UserSettings(
      enablePushNotifications: enablePushNotifications ?? this.enablePushNotifications,
      isPrivate: isPrivate ?? this.isPrivate,
    );
  }
}

`);
    });
});
