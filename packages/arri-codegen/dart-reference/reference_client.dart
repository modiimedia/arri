// this file was autogenerated by arri
// ignore_for_file: type=lint
import "dart:convert";
import "package:arri_client/arri_client.dart";
import "package:http/http.dart" as http;

class TestClient {
  final http.Client? _httpClient;
  final String _baseUrl;
  late final Map<String, String> _headers;
  TestClient({
    http.Client? httpClient,
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _httpClient = httpClient,
        _baseUrl = baseUrl {
    _headers = {"client-version": "11", ...headers};
  }

  Future<GetStatusResponse> getStatus() {
    return parsedArriRequest(
      "$_baseUrl/status",
      httpClient: _httpClient,
      method: HttpMethod.get,
      headers: _headers,
      params: null,
      parser: (body) => GetStatusResponse.fromJson(
        json.decode(body),
      ),
    );
  }

  TestClientUsersService get users {
    return TestClientUsersService(
      httpClient: _httpClient,
      baseUrl: _baseUrl,
      headers: _headers,
    );
  }
}

class TestClientUsersService {
  final http.Client? _httpClient;
  final String _baseUrl;
  late final Map<String, String> _headers;
  TestClientUsersService({
    http.Client? httpClient,
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _httpClient = httpClient,
        _baseUrl = baseUrl {
    _headers = {"client-version": "11", ...headers};
  }

  TestClientUsersSettingsService get settings {
    return TestClientUsersSettingsService(
      httpClient: _httpClient,
      baseUrl: _baseUrl,
      headers: _headers,
    );
  }

  /// Get a user by id
  Future<User> getUser(UserParams params) {
    return parsedArriRequest(
      "$_baseUrl/users/get-user",
      httpClient: _httpClient,
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(
        json.decode(body),
      ),
    );
  }

  /// Update a user
  Future<User> updateUser(UpdateUserParams params) {
    return parsedArriRequest(
      "$_baseUrl/users/update-user",
      httpClient: _httpClient,
      method: HttpMethod.post,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(
        json.decode(body),
      ),
    );
  }

  /// Watch a user
  EventSource<User> watchUser(
    UserParams params, {
    SseHookOnData<User>? onData,
    SseHookOnError<User>? onError,
    SseHookOnConnectionError<User>? onConnectionError,
    SseHookOnOpen<User>? onOpen,
    SseHookOnClose<User>? onClose,
    String? lastEventId,
  }) {
    return parsedArriSseRequest<User>(
      "$_baseUrl/users/watch-user",
      httpClient: _httpClient,
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => User.fromJson(
        json.decode(body),
      ),
      onData: onData,
      onError: onError,
      onConnectionError: onConnectionError,
      onOpen: onOpen,
      onClose: onClose,
      lastEventId: lastEventId,
    );
  }
}

class TestClientUsersSettingsService {
  final http.Client? _httpClient;
  final String _baseUrl;
  late final Map<String, String> _headers;
  TestClientUsersSettingsService({
    http.Client? httpClient,
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _httpClient = httpClient,
        _baseUrl = baseUrl {
    _headers = {"client-version": "11", ...headers};
  }

  @deprecated
  Future<void> getUserSettings() {
    return parsedArriRequest(
      "$_baseUrl/users/settings/get-user-settings",
      httpClient: _httpClient,
      method: HttpMethod.get,
      headers: _headers,
      params: null,
      parser: (body) {},
    );
  }
}

class GetStatusResponse {
  final String message;
  const GetStatusResponse({
    required this.message,
  });

  factory GetStatusResponse.fromJson(Map<String, dynamic> json) {
    return GetStatusResponse(
      message: typeFromDynamic<String>(json["message"], ""),
    );
  }

  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "message": message,
    };
    return __result;
  }

  GetStatusResponse copyWith({
    String? message,
  }) {
    return GetStatusResponse(
      message: message ?? this.message,
    );
  }
}

class User {
  final String id;
  final UserRole role;

  /// A profile picture
  final UserPhoto? photo;
  final DateTime createdAt;
  final int numFollowers;
  final UserSettings settings;
  final UserNotification? lastNotification;
  final List<UserNotification> recentNotifications;
  final Map<String, UserBookmarksValue> bookmarks;
  final Map<String, dynamic> metadata;
  final List<dynamic> randomList;
  final BinaryTree binaryTree;
  final String? bio;
  const User({
    required this.id,
    required this.role,
    required this.photo,
    required this.createdAt,
    required this.numFollowers,
    required this.settings,
    required this.lastNotification,
    required this.recentNotifications,
    required this.bookmarks,
    required this.metadata,
    required this.randomList,
    required this.binaryTree,
    this.bio,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: typeFromDynamic<String>(json["id"], ""),
      role: UserRole.fromJson(json["role"]),
      photo: json["photo"] is Map<String, dynamic>
          ? UserPhoto.fromJson(json["photo"])
          : null,
      createdAt: dateTimeFromDynamic(
        json["createdAt"],
        DateTime.fromMillisecondsSinceEpoch(0),
      ),
      numFollowers: intFromDynamic(json["numFollowers"], 0),
      settings: UserSettings.fromJson(json["settings"]),
      lastNotification: json["lastNotification"] is Map<String, dynamic>
          ? UserNotification.fromJson(json["lastNotification"])
          : null,
      recentNotifications: json["recentNotifications"] is List
          ?
          // ignore: unnecessary_cast
          (json["recentNotifications"] as List)
              .map((item) => UserNotification.fromJson(item))
              .toList() as List<UserNotification>
          : <UserNotification>[],
      bookmarks: json["bookmarks"] is Map<String, dynamic>
          ? (json["bookmarks"] as Map<String, dynamic>).map(
              (key, value) => MapEntry(key, UserBookmarksValue.fromJson(value)))
          : <String, UserBookmarksValue>{},
      metadata: json["metadata"] is Map<String, dynamic>
          ? (json["metadata"] as Map<String, dynamic>)
              .map((key, value) => MapEntry(key, value))
          : <String, dynamic>{},
      randomList: json["randomList"] is List
          ?
          // ignore: unnecessary_cast
          (json["randomList"] as List).map((item) => item).toList()
              as List<dynamic>
          : <dynamic>[],
      binaryTree: BinaryTree.fromJson(json["binaryTree"]),
      bio: nullableTypeFromDynamic<String>(json["bio"]),
    );
  }

  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "id": id,
      "role": role.value,
      "photo": photo?.toJson(),
      "createdAt": createdAt.toUtc().toIso8601String(),
      "numFollowers": numFollowers,
      "settings": settings.toJson(),
      "lastNotification": lastNotification?.toJson(),
      "recentNotifications":
          recentNotifications.map((item) => item.toJson()).toList(),
      "bookmarks": bookmarks.map((key, value) => MapEntry(key, value.toJson())),
      "metadata": metadata.map((key, value) => MapEntry(key, value)),
      "randomList": randomList.map((item) => item).toList(),
      "binaryTree": binaryTree.toJson(),
    };
    if (bio != null) {
      __result["bio"] = bio;
    }
    return __result;
  }

  User copyWith({
    String? id,
    UserRole? role,
    UserPhoto? photo,
    DateTime? createdAt,
    int? numFollowers,
    UserSettings? settings,
    UserNotification? lastNotification,
    List<UserNotification>? recentNotifications,
    Map<String, UserBookmarksValue>? bookmarks,
    Map<String, dynamic>? metadata,
    List<dynamic>? randomList,
    BinaryTree? binaryTree,
    String? bio,
  }) {
    return User(
      id: id ?? this.id,
      role: role ?? this.role,
      photo: photo ?? this.photo,
      createdAt: createdAt ?? this.createdAt,
      numFollowers: numFollowers ?? this.numFollowers,
      settings: settings ?? this.settings,
      lastNotification: lastNotification ?? this.lastNotification,
      recentNotifications: recentNotifications ?? this.recentNotifications,
      bookmarks: bookmarks ?? this.bookmarks,
      metadata: metadata ?? this.metadata,
      randomList: randomList ?? this.randomList,
      binaryTree: binaryTree ?? this.binaryTree,
      bio: bio ?? this.bio,
    );
  }
}

enum UserRole implements Comparable<UserRole> {
  standard("standard"),
  admin("admin");

  const UserRole(this.value);
  final String value;

  factory UserRole.fromJson(dynamic json) {
    for (final v in values) {
      if (v.value == json) {
        return v;
      }
    }
    return standard;
  }

  @override
  compareTo(UserRole other) => name.compareTo(other.name);
}

/// A profile picture
class UserPhoto {
  final String url;
  final double width;
  final double height;
  final BigInt bytes;

  /// When the photo was last updated in nanoseconds
  final BigInt nanoseconds;
  const UserPhoto({
    required this.url,
    required this.width,
    required this.height,
    required this.bytes,
    required this.nanoseconds,
  });
  factory UserPhoto.fromJson(Map<String, dynamic> json) {
    return UserPhoto(
      url: typeFromDynamic<String>(json["url"], ""),
      width: doubleFromDynamic(json["width"], 0),
      height: doubleFromDynamic(json["height"], 0),
      bytes: bigIntFromDynamic(json["bytes"], BigInt.zero),
      nanoseconds: bigIntFromDynamic(json["nanoseconds"], BigInt.zero),
    );
  }

  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "url": url,
      "width": width,
      "height": height,
      "bytes": bytes.toString(),
      "nanoseconds": nanoseconds.toString(),
    };
    return __result;
  }

  UserPhoto copyWith({
    String? url,
    double? width,
    double? height,
    BigInt? bytes,
    BigInt? nanoseconds,
  }) {
    return UserPhoto(
      url: url ?? this.url,
      width: width ?? this.width,
      height: height ?? this.height,
      bytes: bytes ?? this.bytes,
      nanoseconds: nanoseconds ?? this.nanoseconds,
    );
  }
}

class UserSettings {
  final bool notificationsEnabled;
  @deprecated
  final UserSettingsPreferredTheme preferredTheme;
  const UserSettings({
    required this.notificationsEnabled,
    required this.preferredTheme,
  });
  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      notificationsEnabled:
          typeFromDynamic<bool>(json["notificationsEnabled"], false),
      preferredTheme:
          UserSettingsPreferredTheme.fromJson(json["preferredTheme"]),
    );
  }

  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "notificationsEnabled": notificationsEnabled,
      "preferredTheme": preferredTheme.value,
    };
    return __result;
  }

  UserSettings copyWith({
    bool? notificationsEnabled,
    UserSettingsPreferredTheme? preferredTheme,
  }) {
    return UserSettings(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      preferredTheme: preferredTheme ?? this.preferredTheme,
    );
  }
}

@deprecated
enum UserSettingsPreferredTheme
    implements Comparable<UserSettingsPreferredTheme> {
  darkMode("dark-mode"),
  lightMode("light-mode"),
  system("system");

  const UserSettingsPreferredTheme(this.value);
  final String value;

  factory UserSettingsPreferredTheme.fromJson(dynamic json) {
    for (final v in values) {
      if (v.value == json) {
        return v;
      }
    }
    return darkMode;
  }

  @override
  compareTo(UserSettingsPreferredTheme other) => name.compareTo(other.name);
}

sealed class UserNotification {
  final String notificationType;
  const UserNotification({
    required this.notificationType,
  });

  factory UserNotification.fromJson(Map<String, dynamic> json) {
    if (json["notificationType"] is! String) {
      throw Exception(
        "Unable to decode UserNotification. Expected String from \"notificationType\". Received ${json["notificationType"]}}",
      );
    }
    switch (json["notificationType"]) {
      case "POST_LIKE":
        return UserNotificationPostLike.fromJson(json);
      case "POST_COMMENT":
        return UserNotificationPostComment.fromJson(json);
    }
    throw Exception(
      "Unable to decode UserNotification. \"${json["notificationType"]}\" doesn't match any of the accepted discriminator values.",
    );
  }

  Map<String, dynamic> toJson();
}

class UserNotificationPostLike implements UserNotification {
  @override
  final String notificationType = "POST_LIKE";
  final String postId;
  final String userId;
  const UserNotificationPostLike({
    required this.postId,
    required this.userId,
  });

  factory UserNotificationPostLike.fromJson(Map<String, dynamic> json) {
    return UserNotificationPostLike(
      postId: typeFromDynamic<String>(json["postId"], ""),
      userId: typeFromDynamic<String>(json["userId"], ""),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "notificationType": notificationType,
      "postId": postId,
      "userId": userId,
    };
    return __result;
  }

  UserNotificationPostLike copyWith({
    String? postId,
    String? userId,
  }) {
    return UserNotificationPostLike(
      postId: postId ?? this.postId,
      userId: userId ?? this.userId,
    );
  }
}

class UserNotificationPostComment implements UserNotification {
  @override
  final String notificationType = "POST_COMMENT";
  final String postId;
  final String userId;
  final String commentText;
  const UserNotificationPostComment({
    required this.postId,
    required this.userId,
    required this.commentText,
  });

  factory UserNotificationPostComment.fromJson(Map<String, dynamic> json) {
    return UserNotificationPostComment(
      postId: typeFromDynamic<String>(json["postId"], ""),
      userId: typeFromDynamic<String>(json["userId"], ""),
      commentText: typeFromDynamic<String>(json["commentText"], ""),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "notificationType": notificationType,
      "postId": postId,
      "userId": userId,
      "commentText": commentText,
    };
    return __result;
  }

  UserNotificationPostComment copyWith({
    String? postId,
    String? userId,
    String? commentText,
  }) {
    return UserNotificationPostComment(
      postId: postId ?? this.postId,
      userId: userId ?? this.userId,
      commentText: commentText ?? this.commentText,
    );
  }
}

class UserBookmarksValue {
  final String postId;
  final String userId;
  const UserBookmarksValue({
    required this.postId,
    required this.userId,
  });
  factory UserBookmarksValue.fromJson(Map<String, dynamic> json) {
    return UserBookmarksValue(
      postId: typeFromDynamic<String>(json["postId"], ""),
      userId: typeFromDynamic<String>(json["userId"], ""),
    );
  }
  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "postId": postId,
      "userId": userId,
    };
    return __result;
  }

  UserBookmarksValue copyWith({
    String? postId,
    String? userId,
  }) {
    return UserBookmarksValue(
      postId: postId ?? this.postId,
      userId: userId ?? this.userId,
    );
  }
}

class BinaryTree {
  final BinaryTree? left;
  final BinaryTree? right;
  const BinaryTree({
    required this.left,
    required this.right,
  });
  factory BinaryTree.fromJson(Map<String, dynamic> json) {
    return BinaryTree(
      left: json["left"] is Map<String, dynamic>
          ? BinaryTree.fromJson(json["left"])
          : null,
      right: json["right"] is Map<String, dynamic>
          ? BinaryTree.fromJson(json["right"])
          : null,
    );
  }
  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "left": left?.toJson(),
      "right": right?.toJson(),
    };
    return __result;
  }

  BinaryTree copyWith({
    BinaryTree? left,
    BinaryTree? right,
  }) {
    return BinaryTree(
      left: left ?? this.left,
      right: right ?? this.right,
    );
  }
}

class UserParams {
  final String userId;
  const UserParams({
    required this.userId,
  });
  factory UserParams.fromJson(Map<String, dynamic> json) {
    return UserParams(
      userId: typeFromDynamic<String>(json["userId"], ""),
    );
  }

  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "userId": userId,
    };
    return __result;
  }

  UserParams copyWith({
    String? userId,
  }) {
    return UserParams(
      userId: userId ?? this.userId,
    );
  }
}

class UpdateUserParams {
  final String id;

  /// A profile picture
  final UserPhoto? photo;
  final String? bio;
  const UpdateUserParams({
    required this.id,
    required this.photo,
    this.bio,
  });
  factory UpdateUserParams.fromJson(Map<String, dynamic> json) {
    return UpdateUserParams(
      id: typeFromDynamic<String>(json["id"], ""),
      photo: json["photo"] is Map<String, dynamic>
          ? UserPhoto.fromJson(json["photo"])
          : null,
      bio: nullableTypeFromDynamic<String>(json["bio"]),
    );
  }

  Map<String, dynamic> toJson() {
    final __result = <String, dynamic>{
      "id": id,
      "photo": photo?.toJson(),
    };
    if (bio != null) {
      __result["bio"] = bio;
    }
    return __result;
  }

  UpdateUserParams copyWith({
    String? id,
    UserPhoto? photo,
    String? bio,
  }) {
    return UpdateUserParams(
      id: id ?? this.id,
      photo: photo ?? this.photo,
      bio: bio ?? this.bio,
    );
  }
}
