// this file was autogenerated by arri
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
    final result = <String, dynamic>{
      "message": message,
    };
    return result;
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
  final List<UserRecentNotificationsItem> recentNotifications;
  final Map<String, UserBookmarksValue> bookmarks;
  final Map<String, dynamic> metadata;
  final List<dynamic> randomList;
  final String? bio;
  const User({
    required this.id,
    required this.role,
    required this.photo,
    required this.createdAt,
    required this.numFollowers,
    required this.settings,
    required this.recentNotifications,
    required this.bookmarks,
    required this.metadata,
    required this.randomList,
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
      recentNotifications: json["recentNotifications"] is List
          ?
          // ignore: unnecessary_cast
          (json["recentNotifications"] as List)
              .map((item) => UserRecentNotificationsItem.fromJson(item))
              .toList() as List<UserRecentNotificationsItem>
          : <UserRecentNotificationsItem>[],
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
      bio: nullableTypeFromDynamic<String>(json["bio"]),
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "id": id,
      "role": role.value,
      "photo": photo?.toJson(),
      "createdAt": createdAt.toUtc().toIso8601String(),
      "numFollowers": numFollowers,
      "settings": settings.toJson(),
      "recentNotifications":
          recentNotifications.map((item) => item.toJson()).toList(),
      "bookmarks": bookmarks.map((key, value) => MapEntry(key, value.toJson())),
      "metadata": metadata.map((key, value) => MapEntry(key, value)),
      "randomList": randomList.map((item) => item).toList(),
    };
    if (bio != null) {
      result["bio"] = bio;
    }
    return result;
  }

  User copyWith({
    String? id,
    UserRole? role,
    UserPhoto? photo,
    DateTime? createdAt,
    int? numFollowers,
    UserSettings? settings,
    List<UserRecentNotificationsItem>? recentNotifications,
    Map<String, UserBookmarksValue>? bookmarks,
    Map<String, dynamic>? metadata,
    List<dynamic>? randomList,
    String? bio,
  }) {
    return User(
      id: id ?? this.id,
      role: role ?? this.role,
      photo: photo ?? this.photo,
      createdAt: createdAt ?? this.createdAt,
      numFollowers: numFollowers ?? this.numFollowers,
      settings: settings ?? this.settings,
      recentNotifications: recentNotifications ?? this.recentNotifications,
      bookmarks: bookmarks ?? this.bookmarks,
      metadata: metadata ?? this.metadata,
      randomList: randomList ?? this.randomList,
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
    final result = <String, dynamic>{
      "url": url,
      "width": width,
      "height": height,
      "bytes": bytes.toString(),
      "nanoseconds": nanoseconds.toString(),
    };
    return result;
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
    final result = <String, dynamic>{
      "notificationsEnabled": notificationsEnabled,
      "preferredTheme": preferredTheme.value,
    };
    return result;
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

sealed class UserRecentNotificationsItem {
  final String notificationType;
  const UserRecentNotificationsItem({
    required this.notificationType,
  });

  factory UserRecentNotificationsItem.fromJson(Map<String, dynamic> json) {
    if (json["notificationType"] is! String) {
      throw Exception(
        "Unable to decode UserRecentNotificationsItem. Expected String from \"notificationType\". Received ${json["notificationType"]}}",
      );
    }
    switch (json["notificationType"]) {
      case "POST_LIKE":
        return UserRecentNotificationsItemPostLike.fromJson(json);
      case "POST_COMMENT":
        return UserRecentNotificationsItemPostComment.fromJson(json);
    }
    throw Exception(
      "Unable to decode UserRecentNotificationsItem. \"${json["notificationType"]}\" doesn't match any of the accepted discriminator values.",
    );
  }

  Map<String, dynamic> toJson();
}

class UserRecentNotificationsItemPostLike
    implements UserRecentNotificationsItem {
  @override
  final String notificationType = "POST_LIKE";
  final String postId;
  final String userId;
  const UserRecentNotificationsItemPostLike({
    required this.postId,
    required this.userId,
  });

  factory UserRecentNotificationsItemPostLike.fromJson(
      Map<String, dynamic> json) {
    return UserRecentNotificationsItemPostLike(
      postId: typeFromDynamic<String>(json["postId"], ""),
      userId: typeFromDynamic<String>(json["userId"], ""),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "notificationType": notificationType,
      "postId": postId,
      "userId": userId,
    };
    return result;
  }

  UserRecentNotificationsItemPostLike copyWith({
    String? postId,
    String? userId,
  }) {
    return UserRecentNotificationsItemPostLike(
      postId: postId ?? this.postId,
      userId: userId ?? this.userId,
    );
  }
}

class UserRecentNotificationsItemPostComment
    implements UserRecentNotificationsItem {
  @override
  final String notificationType = "POST_COMMENT";
  final String postId;
  final String userId;
  final String commentText;
  const UserRecentNotificationsItemPostComment({
    required this.postId,
    required this.userId,
    required this.commentText,
  });

  factory UserRecentNotificationsItemPostComment.fromJson(
      Map<String, dynamic> json) {
    return UserRecentNotificationsItemPostComment(
      postId: typeFromDynamic<String>(json["postId"], ""),
      userId: typeFromDynamic<String>(json["userId"], ""),
      commentText: typeFromDynamic<String>(json["commentText"], ""),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "notificationType": notificationType,
      "postId": postId,
      "userId": userId,
      "commentText": commentText,
    };
    return result;
  }

  UserRecentNotificationsItemPostComment copyWith({
    String? postId,
    String? userId,
    String? commentText,
  }) {
    return UserRecentNotificationsItemPostComment(
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
    final result = <String, dynamic>{
      "postId": postId,
      "userId": userId,
    };
    return result;
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
    final result = <String, dynamic>{
      "userId": userId,
    };
    return result;
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
    final result = <String, dynamic>{
      "id": id,
      "photo": photo?.toJson(),
    };
    if (bio != null) {
      result["bio"] = bio;
    }
    return result;
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
