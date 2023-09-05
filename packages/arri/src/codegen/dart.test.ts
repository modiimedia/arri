import { execSync } from "child_process";
import { writeFileSync } from "fs";
import path from "path";
import { Type } from "@sinclair/typebox";
import { test } from "vitest";
import {
    dartServiceFromServiceDefinition,
    dartModelFromJsonSchema,
    createDartClient,
} from "./dart";
import { type ApplicationDef, normalizeWhitespace } from "./utils";

describe("Dart Tests", () => {
    test("Service Generation", () => {
        const result = dartServiceFromServiceDefinition(
            "UserService",
            {
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
            },
            { clientName: "" },
        );
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class UserService {
  final String _baseUrl;
  final Map<String, String> _headers;
  const UserService({
    String baseUrl = "",
    Map<String, String> headers = const {},
  }): _baseUrl = baseUrl,
  _headers = headers;
  UserSettingsService get settings {
    return UserSettingsService(
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
class UserSettingsService {
  final String _baseUrl;
  final Map<String, String> _headers;
  const UserSettingsService({
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
        const result = dartServiceFromServiceDefinition(
            "PostsService",
            {
                getPost: {
                    path: "/posts/get-post",
                    method: "get",
                    params: undefined,
                    response: undefined,
                },
            },
            { clientName: "" },
        );
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
            _metadata: Type.String(),
            id: Type.String(),
            email: Type.Optional(Type.String()),
            createdAt: Type.Integer(),
            lastSignedIn: Type.Optional(Type.Integer()),
            rating: Type.Number(),
            weightedRating: Type.Optional(Type.Number()),
            followedUsers: Type.Array(Type.String()),
            recentlyFollowedUsers: Type.Array(
                Type.Object(
                    {
                        id: Type.String(),
                        email: Type.String(),
                    },
                    {
                        $id: "FollowedUser",
                    },
                ),
            ),
            followedHashtags: Type.Optional(Type.Array(Type.String())),
            settings: Type.Object({
                enablePushNotifications: Type.Boolean(),
                isPrivate: Type.Boolean(),
            }),
            category: Type.Object(
                {
                    id: Type.String(),
                    title: Type.String(),
                    description: Type.String(),
                },
                { $id: "Category" },
            ),
            role: Type.Union([
                Type.Literal("standard"),
                Type.Literal("admin"),
                Type.Literal("mod"),
                Type.Literal("anonymous-user"),
            ]),
            miscData: Type.Record(Type.String(), Type.Any()),
        });

        const result = dartModelFromJsonSchema("User", schema as any, {
            clientName: "",
        });
        expect(normalizeWhitespace(result)).toBe(
            normalizeWhitespace(`class User {
  final String metadata;
  final String id;
  final String? email;
  final int createdAt;
  final int? lastSignedIn;
  final double rating;
  final double? weightedRating;
  final List<String> followedUsers;
  final List<FollowedUser> recentlyFollowedUsers;
  final List<String>? followedHashtags;
  final UserSettings settings;
  final Category category;
  final UserRole role;
  final Map<dynamic, dynamic> miscData;
  const User({
    required this.metadata,
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
    required this.category,
    required this.role,
    required this.miscData,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      metadata: typeFromDynamic<String>(json["_metadata"], ""),
      id: typeFromDynamic<String>(json["id"], ""),
      email: nullableTypeFromDynamic<String>(json["email"]),
      createdAt: intFromDynamic(json["createdAt"], 0),
      lastSignedIn: nullableIntFromDynamic(json["lastSignedIn"]),
      rating: doubleFromDynamic(json["rating"], 0.0),
      weightedRating: nullableDoubleFromDynamic(json["weightedRating"]),
      followedUsers: json["followedUsers"] is List<String> ? json["followedUsers"] : [],
      recentlyFollowedUsers: json["recentlyFollowedUsers"] is List ?
        (json["recentlyFollowedUsers"] as List<Map<String, dynamic>>)
          .map((val) => FollowedUser.fromJson(val)).toList() : [],
      followedHashtags: json["followedHashtags"] is List<String> ? json["followedHashtags"] : null,
      settings: UserSettings.fromJson(json["settings"]),
      category: Category.fromJson(json["category"]),
      role: UserRole.fromJson(json["role"]),
      miscData: json["miscData"] is Map ? json["miscData"] : {},
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "_metadata": metadata,
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
      "category": category.toJson(),
      "role": role.toJson(),
      "miscData": miscData,
    };
  }
  User copyWith({
    String? metadata,
    String? id,
    String? email,
    int? createdAt,
    int? lastSignedIn,
    double? rating,
    double? weightedRating,
    List<String>? followedUsers,
    List<FollowedUser>? recentlyFollowedUsers,
    List<String>? followedHashtags,
    UserSettings? settings,
    Category? category,
    UserRole? role,
    Map<dynamic, dynamic>? miscData,
  }) {
    return User(
      metadata: metadata ?? this.metadata,
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
      category: category ?? this.category,
      role: role ?? this.role,
      miscData: miscData ?? this.miscData,
    );
  }
}

class FollowedUser {
  final String id;
  final String email;
  const FollowedUser({
    required this.id,
    required this.email,
  });
  factory FollowedUser.fromJson(Map<String, dynamic> json) {
    return FollowedUser(
      id: typeFromDynamic<String>(json["id"], ""),
      email: typeFromDynamic<String>(json["email"], ""),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
    };
  }
  FollowedUser copyWith({
    String? id,
    String? email,
  }) {
    return FollowedUser(
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
      enablePushNotifications: typeFromDynamic<bool>(json["enablePushNotifications"], false),
      isPrivate: typeFromDynamic<bool>(json["isPrivate"], false),
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

class Category {
  final String id;
  final String title;
  final String description;
  const Category({
    required this.id,
    required this.title,
    required this.description,
  });
  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: typeFromDynamic<String>(json["id"], ""),
      title: typeFromDynamic<String>(json["title"], ""),
      description: typeFromDynamic<String>(json["description"], ""),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "title": title,
      "description": description,
    };
  }
  Category copyWith({
    String? id,
    String? title,
    String? description,
  }) {
    return Category(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
    );
  }
}

enum UserRole implements Comparable<UserRole> {
  standard("standard"),
  admin("admin"),
  mod("mod"),
  anonymousUser("anonymous-user");
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
    const apiDef: ApplicationDef = {
        arriSchemaVersion: "0.0.1",
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
            sayHello: {
                path: "/say-hello",
                method: "get",
                params: undefined,
                response: "SayHelloResponse",
            },
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
            SayHelloResponse: Type.Object({
                message: Type.String(),
            }),
            User: Type.Object({
                _metadata: Type.String(),
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
                        systemDefault: "system-default",
                    }),
                ),
                miscData: Type.Record(Type.String(), Type.Any()),
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
    };
    const result = createDartClient(apiDef, {
        clientName: "Client",
    });
    const outputPath = path.resolve(
        __dirname,
        "../../../arri-client-dart/example/example.dart",
    );
    writeFileSync(outputPath, result);
    execSync(`dart format ${outputPath}`);
});
