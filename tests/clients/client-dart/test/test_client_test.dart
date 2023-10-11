import 'package:arri_client/arri_client.dart';
import "package:test/test.dart";
import 'package:test_client_dart/test_client.rpc.dart';

Future<void> main() async {
  final client = TestClient(
      baseUrl: "http://127.0.0.1:2020", headers: {"x-test-header": 'test'});
  final unauthenticatedClient = TestClient(baseUrl: "http://127.0.0.1:2020");
  test("getPost()", () async {
    final result = await client.posts.getPost(PostParams(postId: "12345"));
    expect(result.id, equals("12345"));
  });
  test("getPosts()", () async {
    final result1 = await client.posts.getPosts(PostListParams(limit: 100));
    expect(result1.items.length, equals(100));
    final result2 = await client.posts
        .getPosts(PostListParams(limit: 55, type: PostType.video));
    expect(result2.items.length, 55);
    expect(result2.items.every((element) => element.type == PostType.video),
        equals(true));
    try {
      await client.posts.getPosts(PostListParams(limit: 10000000000));
      expect(false, equals(true));
    } catch (err) {
      if (err is ArriRequestError) {
        expect(err.statusCode, equals(400));
      } else {
        expect(false, equals(true));
      }
    }
  });
  test("updatePost()", () async {
    try {
      final result = await client.posts.updatePost(UpdatePostParams(
          postId: 'test',
          data: UpdatePostParamsData(
            title: "Hello World",
            tags: ["1", "2", "3"],
          )));
      expect(result.id, equals("test"));
      expect(result.title, equals("Hello World"));
      expect(result.tags[0], equals('1'));
      expect(result.tags[1], equals('2'));
      expect(result.tags[2], equals('3'));
    } catch (err) {
      if (err is ArriRequestError) {
        print("${err.statusCode} ${err.statusMessage}");
      } else {
        print(err.toString());
      }
      expect(false, equals(true));
    }
  });

  test("unauthenticated requests", () async {
    try {
      await unauthenticatedClient.posts.getPost(PostParams(postId: "12345"));
      expect(false, equals(true));
    } catch (err) {
      if (err is ArriRequestError) {
        expect(err.statusCode, equals(401));
        return;
      }
      expect(false, equals(true));
    }
  });
}
