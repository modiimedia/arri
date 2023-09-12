import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { normalizeWhitespace } from "arri-codegen-utils";
import { a } from "arri-validate";
import path from "pathe";
import { test } from "vitest";
import { TestService } from "./_test_model";
import {
    dartServiceFromDefinition,
    dartClassFromJtdSchema,
    createDartClient,
} from "./dart";

describe("Service Generation", () => {
    test("Service Generation", () => {
        const result = dartServiceFromDefinition(
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
            { clientName: "", outputFile: "" },
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
        const result = dartServiceFromDefinition(
            "PostsService",
            {
                getPost: {
                    path: "/posts/get-post",
                    method: "get",
                    params: undefined,
                    response: undefined,
                },
            },
            { clientName: "", outputFile: "" },
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
});

describe("Model Generation", () => {
    it("Generates a basic class with scalar fields", () => {
        const User = a.object({
            id: a.string(),
            name: a.string(),
            email: a.optional(a.string()),
            count: a.int32(),
            createdAt: a.timestamp(),
            lastSignedIn: a.nullable(a.timestamp()),
        });
        const result = dartClassFromJtdSchema("User", User, false);
        expect(normalizeWhitespace(result.content)).toBe(
            normalizeWhitespace(`
      class User {
        final String id;
        final String name;
        final int count;
        final DateTime createdAt;
        final DateTime? lastSignedIn;
        final String? email;
        const User({
          required this.id,
          required this.name,
          required this.count,
          required this.createdAt,
          required this.lastSignedIn,
          this.email,
        });
        factory User.fromJson(Map<String, dynamic> json) {
          return User(
            id: typeFromDynamic<String>(json["id"]),
            name: typeFromDynamic<String>(json["name"]),
            count: intFromDynamic(json["count"]),
            createdAt: dateTimeFromDynamic(json["createdAt"]),
            lastSignedIn: nullableDateTimeFromDynamic(json["lastSignedIn"]),
            email: nullableTypeFromDynamic<String>(json["email"]),
          );
        }
        static List<User> fromJsonList(List<dynamic> json) {
          final result = <User>[];
          for (final item in json) {
            result.add(User.fromJson(item));
          }
          return result;
        }
        Map<String, dynamic> toJson() {
          final output = {
            "id": id,
            "name": name,
            "count": count,
            "createdAt": createdAt.toUtc().toIso8601String(),
            "lastSignedIn": lastSignedIn?.toUtc().toIso8601String(),
          };
          if (email != null) {
            output["email"] = email;
          }
          return output;
        }
        User copyWith({
          String? id,
          String? name,
          int? count,
          DateTime?: createdAt,
          DateTime?: lastSignedIn,
        }) {
          return User(
            id: id ?? this.id,
            name: name ?? this.name,
            count: count ?? this.count,
            createdAt: createdAt ?? this.createdAt,
            lastSignedIn: lastSignedIn ?? this.lastSignedIn,
          )
        }
      }
      `),
        );
    });

    it("Generates Classes with Nested Objects and Arrays", () => {
        const User = a.object({
            id: a.string(),
            createdAt: a.timestamp(),
            followers: a.array(
                a.object({
                    id: a.string(),
                    followedTime: a.timestamp(),
                }),
            ),
            settings: a.object({
                notifications: a.boolean(),
                theme: a.stringEnum([
                    "dark-mode",
                    "light-mode",
                    "system-default",
                ]),
            }),
        });
        const result = dartClassFromJtdSchema("User", User, false);
        expect(normalizeWhitespace(result.content)).toBe(
            normalizeWhitespace(`
        class User {
          final String id;
          final DateTime createdAt;
          final List<UserFollowersItem> followers;
          final UserSettings settings;
          const User({
            required this.id,
            required this.createdAt,
            required this.followers,
            required this.settings,
          });
          factory User.fromJson(Map<String, dynamic> json) {
            return User(
              id: typeFromDynamic<String>(json["id"]),
              createdAt: dateTimeFromDynamic(json["createdAt"]),
            )
          }
        }
        class UserFollowersItem {
          final String id;
          final DateTime createdAt;
          const UserFollowersItem({
            required this.id,
            required this.createdAt,
          });
          
        }`),
        );
    });
});

it("Matches the dart example client", () => {
    const tmpDir = path.resolve(__dirname, ".temp");
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir);
    }
    const outputFilePath = path.resolve(tmpDir, "dart_client.rpc.dart");
    const result = createDartClient(TestService, {
        clientName: "Client",
        outputFile: "",
    });
    writeFileSync(outputFilePath, result);
    execSync(`dart format ${outputFilePath}`);
    const targetResult = readFileSync(outputFilePath, { encoding: "utf-8" });
    const expectedResult = readFileSync(
        path.resolve(__dirname, "./dart_example_client.dart"),
        { encoding: "utf-8" },
    );
    expect(targetResult).toBe(expectedResult);
});
