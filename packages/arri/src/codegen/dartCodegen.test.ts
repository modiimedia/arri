import { Type } from "@sinclair/typebox";
import { test } from "vitest";
import {
    dartServiceFromServiceDefinition,
    dartModelFromJsonSchema,
    createDartClient,
} from "./dartCodegen";
import { type ApplicationDefinition, normalizeWhitespace } from "./utils";
import { writeFileSync } from "fs";
import path from "path";
import { execSync } from "child_process";

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
            settings: {
                getUserSettings: {
                    path: "/users/settings/get-user-settings",
                    method: "get",
                    params: "UserSettingsGetUserSettingsParams",
                    response: "UserSettingsGetUserSettingsResponse",
                },
            },
        });
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class UserService {
  final String _baseUrl;
  final Map<String, String> _headers;
  const UserService({
    String baseUrl = "",
    Map<String, String> headers = const {},
  }): _baseUrl = baseUrl,
  _headers = headers;
  UserServiceSettingsService get settings {
    return UserServiceSettingsService(
      baseUrl: _baseUrl,
      headers: _headers,
    );
  }
  Future<User> getUser(UsersGetUserParams params) {
    return parsedArriRequest(
      "$_baseUrl/users/get-user",
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(json.decode(body)),
    );
  }
  Future<User> updateUser(UserUpdateData params) {
    return parsedArriRequest(
      "$_baseUrl/users/update-user",
      method: HttpMethod.post,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(json.decode(body)),
    );
  }
}
class UserServiceSettingsService {
  final String _baseUrl;
  final Map<String, String> _headers;
  const UserServiceSettingsService({
    String baseUrl = "",
    Map<String, String> headers = const {},
  }): _baseUrl = baseUrl,
  _headers = headers;
  Future<UserSettingsGetUserSettingsResponse> getUserSettings(UserSettingsGetUserSettingsParams params) {
    return parsedArriRequest(
      "$_baseUrl/users/settings/get-user-settings",
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => UserSettingsGetUserSettingsResponse.fromJson(json.decode(body)),
    );
  }
}`),
        );
    });

    test("Service with No Params", () => {
        const result = dartServiceFromServiceDefinition("PostsService", {
            getPost: {
                path: "/posts/get-post",
                method: "get",
                params: undefined,
                response: undefined,
            },
        });
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class PostsService {
        final String _baseUrl;
        final Map<String, String> _headers;
        const PostsService({
          String baseUrl = "",
          Map<String, String> headers = const {},
        }): _baseUrl = baseUrl,
            _headers = headers;

        Future<void> getPost() {
          return parsedArriRequest(
            "$_baseUrl/posts/get-post",
            method: HttpMethod.get,
            headers: _headers,
            params: null,
            parser: (body) {},
          );
        }
      }`),
        );
    });

    test("Model Generation", () => {
        const schema = Type.Object({
            id: Type.String(),
            email: Type.Optional(Type.String()),
            createdAt: Type.Integer(),
            lastSignedIn: Type.Optional(Type.Integer()),
            rating: Type.Number(),
            weightedRating: Type.Optional(Type.Number()),
            followedUsers: Type.Array(Type.String()),
            recentlyFollowedUsers: Type.Array(
                Type.Object({
                    id: Type.String(),
                    email: Type.String(),
                }),
            ),
            followedHashtags: Type.Optional(Type.Array(Type.String())),
            settings: Type.Object({
                enablePushNotifications: Type.Boolean(),
                isPrivate: Type.Boolean(),
            }),
            role: Type.Union([
                Type.Literal("standard"),
                Type.Literal("admin"),
                Type.Literal("mod"),
            ]),
        });

        const result = dartModelFromJsonSchema("User", schema as any);
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class User {
  final String id;
  final String? email;
  final int createdAt;
  final int? lastSignedIn;
  final double rating;
  final double? weightedRating;
  final List<String> followedUsers;
  final List<UserRecentlyFollowedUsersItem> recentlyFollowedUsers;
  final List<String>? followedHashtags;
  final UserSettings settings;
  final UserRole role;
  const User({
    required this.id,
    this.email,
    required this.createdAt,
    this.lastSignedIn,
    required this.rating,
    this.weightedRating,
    required this.followedUsers,
    required this.recentlyFollowedUsers,
    this.followedHashtags,
    required this.settings,
    required this.role,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"] is String ? json["id"] : "",
      email: json["email"] is String ? json["email"] : null,
      createdAt: json["createdAt"] is int ? json["createdAt"] : 0,
      lastSignedIn: json["lastSignedIn"] is int ? json["lastSignedIn"] : null,
      rating: json["rating"] is double ? json["rating"] : 0.0,
      weightedRating: json["weightedRating"] is double ? json["weightedRating"] : null,
      followedUsers: json["followedUsers"] is List<String> ? json["followedUsers"] : [],
      recentlyFollowedUsers: json["recentlyFollowedUsers"] is List<Map<String, dynamic>> ?
        (json["recentlyFollowedUsers"] as List<Map<String, dynamic>>)
          .map((val) => UserRecentlyFollowedUsersItem.fromJson(val)).toList() : [],
      followedHashtags: json["followedHashtags"] is List<String> ? json["followedHashtags"] : null,
      settings: UserSettings.fromJson(json["settings"]),
      role: UserRole.fromJson(json["role"]),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
      "createdAt": createdAt,
      "lastSignedIn": lastSignedIn,
      "rating": rating,
      "weightedRating": weightedRating,
      "followedUsers": followedUsers,
      "recentlyFollowedUsers": recentlyFollowedUsers.map((val) => val.toJson()).toList(),
      "followedHashtags": followedHashtags,
      "settings": settings.toJson(),
      "role": role.toJson(),
    };
  }
  User copyWith({
    String? id,
    String? email,
    int? createdAt,
    int? lastSignedIn,
    double? rating,
    double? weightedRating,
    List<String>? followedUsers,
    List<UserRecentlyFollowedUsersItem>? recentlyFollowedUsers,
    List<String>? followedHashtags,
    UserSettings? settings,
    UserRole? role,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
      lastSignedIn: lastSignedIn ?? this.lastSignedIn,
      rating: rating ?? this.rating,
      weightedRating: weightedRating ?? this.weightedRating,
      followedUsers: followedUsers ?? this.followedUsers,
      recentlyFollowedUsers: recentlyFollowedUsers ?? this.recentlyFollowedUsers,
      followedHashtags: followedHashtags ?? this.followedHashtags,
      settings: settings ?? this.settings,
      role: role ?? this.role,
    );
  }
}

class UserRecentlyFollowedUsersItem {
  final String id;
  final String email;
  const UserRecentlyFollowedUsersItem({
    required this.id,
    required this.email,
  });
  factory UserRecentlyFollowedUsersItem.fromJson(Map<String, dynamic> json) {
    return UserRecentlyFollowedUsersItem(
      id: json["id"] is String ? json["id"] : "",
      email: json["email"] is String ? json["email"] : "",
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
    };
  }
  UserRecentlyFollowedUsersItem copyWith({
    String? id,
    String? email,
  }) {
    return UserRecentlyFollowedUsersItem(
      id: id ?? this.id,
      email: email ?? this.email,
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

enum UserRole implements Comparable<UserRole> {
  standard("standard"),
  admin("admin"),
  mod("mod");
  const UserRole(this.value);
  final dynamic value;

  @override
  compareTo(UserRole other) => name.compareTo(other.name);

  factory UserRole.fromJson(dynamic input) {
    for(final val in values) {
      if(val.value == input) {
        return val;
      }
    }
    return standard;
  }

  dynamic toJson() {
    return value;
  }
}`),
        );
    });
});

test("Dart client test", () => {
    const apiDef: ApplicationDefinition = {
        errors: {
            type: "object",
            properties: {
                name: { type: "string" },
                statusCode: { type: "integer" },
                statusMessage: { type: "string" },
                message: { type: "string" },
                data: {},
            },
            required: ["name", "statusCode", "statusMessage", "message"],
        },
        procedures: {
            "v1.users.getUser": {
                path: "/v1/users/get-user",
                method: "get",
                params: "UserParams",
                response: "User",
            },
            "v1.users.getUsers": {
                path: "/v1/users/get-users",
                method: "get",
                params: "UserListParams",
                response: "UsersGetUsersResponse",
            },
            "v1.posts.getPost": {
                path: "/v1/posts/get-post",
                method: "get",
                params: "PostParams",
                response: "Post",
            },
            "v1.posts.updatePost": {
                path: "/v1/posts/update-post",
                method: "post",
                params: "PostsUpdatePostParams",
                response: "Post",
            },
            "v1.posts.deletePost": {
                path: "/v1/posts/delete-posts",
                method: "delete",
                params: "PostParams",
                response: undefined,
            },
            "v2.users.getUser": {
                path: "/v2/users/get-user",
                method: "get",
                params: "UserParams",
                response: "UserV2",
            },
        },
        models: {
            User: Type.Object({
                id: Type.String(),
                email: Type.Optional(Type.String()),
                createdAt: Type.Integer(),
                updatedAt: Type.Date(),
                role: Type.Enum({
                    standard: "standard",
                    admin: "admin",
                }),
                preferredTheme: Type.Optional(
                    Type.Enum({
                        light: "light",
                        dark: "dark",
                    }),
                ),
            }) as any,
            UserV2: Type.Object({
                id: Type.String(),
                email: Type.String(),
                username: Type.String(),
                createdAt: Type.Date(),
                updatedAt: Type.Date(),
                role: Type.Enum({
                    standard: "standard",
                    admin: "admin",
                    moderator: "moderator",
                }),
            }) as any,
            UserParams: Type.Object({
                id: Type.String(),
                email: Type.String(),
            }),
            UserListParams: Type.Object({
                limit: Type.Integer(),
                skip: Type.Optional(Type.Integer()),
            }),
            UsersGetUsersResponse: Type.Object({
                items: Type.Object({
                    id: Type.String(),
                    email: Type.String(),
                }),
            }),
            Post: Type.Object({
                id: Type.String(),
                title: Type.String(),
                content: Type.String(),
            }),
            PostParams: Type.Object({
                postId: Type.String(),
            }),
            PostsUpdatePostParams: Type.Object({
                postId: Type.String(),
                data: Type.Object({
                    title: Type.String(),
                    content: Type.String(),
                }),
            }),
        },
        schemaVersion: "0.0.1",
        description: "",
    };
    const result = createDartClient(apiDef, "Blah");
    const outputPath = path.resolve(
        __dirname,
        "../../../arri-client-dart/lib/example.dart",
    );
    writeFileSync(outputPath, result);
    execSync(`dart format ${outputPath}`);
});
