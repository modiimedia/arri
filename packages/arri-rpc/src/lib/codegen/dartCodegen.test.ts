import { Type } from "@sinclair/typebox";
import { test } from "vitest";
import {
    dartServiceFromServiceDefinition,
    dartModelFromJsonSchema,
    type ApplicationDefinition,
    createDartClient,
} from "./dartCodegen";
import { normalizeWhitespace } from "./utils";
import { writeFileSync } from "fs";
import path from "path";

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
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class UserService {
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
}`)
        );
    });

    test("Service with No Params", () => {
        const result = dartServiceFromServiceDefinition("PostsService", {
            getPost: {
                path: "/posts/get-post",
                method: "get",
                params: "",
                response: "",
            },
        });
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class PostsService {
        final String baseUrl;
        final Map<String, String> headers;
        const PostsService({
          this.baseUrl = "",
          this.headers = const {},
        });
        Future<String> getPost() {
          return parsedRequest(
            "$baseUrl/posts/get-post",
            method: HttpMethod.get,
            headers: headers,
            params: null,
            parser: (body) => body,
          );
        }
      }`)
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
                })
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
                Type.Literal(0),
                Type.Literal(0.5),
            ]),
        });

        const result = dartModelFromJsonSchema("User", schema);
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
  mod("mod"),
  num0(0),
  num0Point5(0.5);
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
}`)
        );
    });
});

test("Dart client test", () => {
    const apiDef: ApplicationDefinition = {
        services: {
            users: {
                getUser: {
                    path: "/users/get-user",
                    method: "get",
                    params: "UserParams",
                    response: "User",
                },
                getUsers: {
                    path: "/users/get-users",
                    method: "get",
                    params: "UserListParams",
                    response: "UsersGetUsersResponse",
                },
            },
            posts: {
                getPost: {
                    path: "/posts/get-post",
                    method: "get",
                    params: "PostParams",
                    response: "Post",
                },
                updatePost: {
                    path: "/posts/update-post",
                    method: "post",
                    params: "PostsUpdatePostParams",
                    response: "Post",
                },
                deletePost: {
                    path: "/posts/delete-posts",
                    method: "delete",
                    params: "PostParams",
                    response: "",
                },
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
                    other: 0.5,
                    other2: 0,
                }),
                preferredTheme: Type.Optional(
                    Type.Enum({
                        light: "light",
                        dark: "dark",
                    })
                ),
            }),
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
    };
    const result = createDartClient(apiDef, "Backend");
    writeFileSync(
        path.resolve(
            __dirname,
            "../../../../arri-client-dart/lib/example.dart"
        ),
        result
    );
});
