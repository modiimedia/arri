// this file was autogenerated by arri
import "dart:convert";
import "package:arri_client/arri_client.dart";

class TestClient {
  final String _baseUrl;
  final Map<String, String> _headers;
  const TestClient({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl,
        _headers = headers;

  TestClientPostsService get posts {
    return TestClientPostsService(
      baseUrl: _baseUrl,
      headers: _headers,
    );
  }
}

class TestClientPostsService {
  final String _baseUrl;
  final Map<String, String> _headers;
  const TestClientPostsService({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl,
        _headers = headers;

  Future<Post> getPost(PostParams params) {
    return parsedArriRequest(
      "$_baseUrl/rpcs/posts/get-post",
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => Post.fromJson(
        json.decode(body),
      ),
    );
  }

  Future<PostListResponse> getPosts(PostListParams params) {
    return parsedArriRequest(
      "$_baseUrl/rpcs/posts/get-posts",
      method: HttpMethod.get,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => PostListResponse.fromJson(
        json.decode(body),
      ),
    );
  }

  Future<Post> updatePost(UpdatePostParams params) {
    return parsedArriRequest(
      "$_baseUrl/rpcs/posts/update-post",
      method: HttpMethod.post,
      headers: _headers,
      params: params.toJson(),
      parser: (body) => Post.fromJson(
        json.decode(body),
      ),
    );
  }
}

class PostParams {
  final String postId;
  const PostParams({
    required this.postId,
  });
  factory PostParams.fromJson(Map<String, dynamic> json) {
    return PostParams(
      postId: typeFromDynamic<String>(json["postId"], ""),
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "postId": postId,
    };

    return result;
  }

  PostParams copyWith({
    String? postId,
  }) {
    return PostParams(
      postId: postId ?? this.postId,
    );
  }
}

class Post {
  final String id;
  final String title;
  final PostType type;
  final String? description;
  final String content;
  final List<String> tags;
  final String authorId;
  final Author author;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Post({
    required this.id,
    required this.title,
    required this.type,
    required this.description,
    required this.content,
    required this.tags,
    required this.authorId,
    required this.author,
    required this.createdAt,
    required this.updatedAt,
  });
  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: typeFromDynamic<String>(json["id"], ""),
      title: typeFromDynamic<String>(json["title"], ""),
      type: PostType.fromJson(json["type"]),
      description: nullableTypeFromDynamic<String>(json["description"]),
      content: typeFromDynamic<String>(json["content"], ""),
      tags: json["tags"] is List
          ? (json["tags"] as List)
              .map((item) => typeFromDynamic<String>(item, ""))
              .toList()
          : [],
      authorId: typeFromDynamic<String>(json["authorId"], ""),
      author: Author.fromJson(json["author"]),
      createdAt: dateTimeFromDynamic(
        json["createdAt"],
        DateTime.fromMillisecondsSinceEpoch(0),
      ),
      updatedAt: dateTimeFromDynamic(
        json["updatedAt"],
        DateTime.fromMillisecondsSinceEpoch(0),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "id": id,
      "title": title,
      "type": type.value,
      "description": description,
      "content": content,
      "tags": tags.map((item) => item).toList(),
      "authorId": authorId,
      "author": author.toJson(),
      "createdAt": createdAt.toUtc().toIso8601String(),
      "updatedAt": updatedAt.toUtc().toIso8601String(),
    };

    return result;
  }

  Post copyWith({
    String? id,
    String? title,
    PostType? type,
    String? description,
    String? content,
    List<String>? tags,
    String? authorId,
    Author? author,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Post(
      id: id ?? this.id,
      title: title ?? this.title,
      type: type ?? this.type,
      description: description ?? this.description,
      content: content ?? this.content,
      tags: tags ?? this.tags,
      authorId: authorId ?? this.authorId,
      author: author ?? this.author,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

enum PostType implements Comparable<PostType> {
  text("text"),
  image("image"),
  video("video");

  const PostType(this.value);
  final String value;

  factory PostType.fromJson(dynamic json) {
    for (final v in values) {
      if (v.value == json) {
        return v;
      }
    }
    return text;
  }

  @override
  compareTo(PostType other) => name.compareTo(other.name);
}

class Author {
  final String id;
  final String name;
  final String? bio;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Author({
    required this.id,
    required this.name,
    required this.bio,
    required this.createdAt,
    required this.updatedAt,
  });
  factory Author.fromJson(Map<String, dynamic> json) {
    return Author(
      id: typeFromDynamic<String>(json["id"], ""),
      name: typeFromDynamic<String>(json["name"], ""),
      bio: nullableTypeFromDynamic<String>(json["bio"]),
      createdAt: dateTimeFromDynamic(
        json["createdAt"],
        DateTime.fromMillisecondsSinceEpoch(0),
      ),
      updatedAt: dateTimeFromDynamic(
        json["updatedAt"],
        DateTime.fromMillisecondsSinceEpoch(0),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "id": id,
      "name": name,
      "bio": bio,
      "createdAt": createdAt.toUtc().toIso8601String(),
      "updatedAt": updatedAt.toUtc().toIso8601String(),
    };

    return result;
  }

  Author copyWith({
    String? id,
    String? name,
    String? bio,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Author(
      id: id ?? this.id,
      name: name ?? this.name,
      bio: bio ?? this.bio,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class PostListParams {
  final int limit;
  final PostType? type;
  const PostListParams({
    required this.limit,
    this.type,
  });
  factory PostListParams.fromJson(Map<String, dynamic> json) {
    return PostListParams(
      limit: intFromDynamic(json["limit"], 0),
      type: json["type"] is Map<String, dynamic>
          ? PostType.fromJson(json["type"])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "limit": limit,
    };
    if (type != null) {
      result["type"] = type?.value;
    }
    return result;
  }

  PostListParams copyWith({
    int? limit,
    PostType? type,
  }) {
    return PostListParams(
      limit: limit ?? this.limit,
      type: type ?? this.type,
    );
  }
}

class PostListResponse {
  final int total;
  final List<Post> items;
  const PostListResponse({
    required this.total,
    required this.items,
  });
  factory PostListResponse.fromJson(Map<String, dynamic> json) {
    return PostListResponse(
      total: intFromDynamic(json["total"], 0),
      items: json["items"] is List
          ? (json["items"] as List).map((item) => Post.fromJson(item)).toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "total": total,
      "items": items.map((item) => item.toJson()).toList(),
    };

    return result;
  }

  PostListResponse copyWith({
    int? total,
    List<Post>? items,
  }) {
    return PostListResponse(
      total: total ?? this.total,
      items: items ?? this.items,
    );
  }
}

class UpdatePostParams {
  final String postId;
  final UpdatePostParamsData data;
  const UpdatePostParams({
    required this.postId,
    required this.data,
  });
  factory UpdatePostParams.fromJson(Map<String, dynamic> json) {
    return UpdatePostParams(
      postId: typeFromDynamic<String>(json["postId"], ""),
      data: UpdatePostParamsData.fromJson(json["data"]),
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      "postId": postId,
      "data": data.toJson(),
    };

    return result;
  }

  UpdatePostParams copyWith({
    String? postId,
    UpdatePostParamsData? data,
  }) {
    return UpdatePostParams(
      postId: postId ?? this.postId,
      data: data ?? this.data,
    );
  }
}

class UpdatePostParamsData {
  final String? title;
  final String? description;
  final String? content;
  final List<String>? tags;
  const UpdatePostParamsData({
    this.title,
    this.description,
    this.content,
    this.tags,
  });
  factory UpdatePostParamsData.fromJson(Map<String, dynamic> json) {
    return UpdatePostParamsData(
      title: nullableTypeFromDynamic<String>(json["title"]),
      description: nullableTypeFromDynamic<String>(json["description"]),
      content: nullableTypeFromDynamic<String>(json["content"]),
      tags: json["tags"] is List
          ? (json["tags"] as List)
              .map((item) => typeFromDynamic<String>(item, ""))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{};
    if (title != null) {
      result["title"] = title;
    }
    if (description != null) {
      result["description"] = description;
    }
    if (content != null) {
      result["content"] = content;
    }
    if (tags != null) {
      result["tags"] = tags?.map((item) => item).toList();
    }
    return result;
  }

  UpdatePostParamsData copyWith({
    String? title,
    String? description,
    String? content,
    List<String>? tags,
  }) {
    return UpdatePostParamsData(
      title: title ?? this.title,
      description: description ?? this.description,
      content: content ?? this.content,
      tags: tags ?? this.tags,
    );
  }
}