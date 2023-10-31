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

  test("miscTests.testEveryType()", () async {
    final input = ProcessEveryTypeParams(
        any: {"hello": "world", "goodbye": "world"},
        boolean: true,
        string: "",
        timestamp: DateTime.now(),
        float32: 1,
        float64: 1,
        int8: 1,
        uint8: 1,
        int16: 1,
        uint16: 1,
        int32: 1,
        uint32: 1,
        int64: BigInt.from(1),
        uint64: BigInt.from(1),
        enumerator: ProcessEveryTypeParamsEnumerator.a,
        array: [true, false],
        object: ProcessEveryTypeParamsObject(
            boolean: true, string: "", timestamp: DateTime.now()),
        record: {
          "A": true,
          "B": false,
        },
        discriminator:
            ProcessEveryTypeParamsDiscriminatorA(title: "Hello World"),
        nestedObject: ProcessEveryTypeParamsNestedObject(
          id: "",
          timestamp: DateTime.now(),
          data: ProcessEveryTypeParamsNestedObjectData(
              id: "",
              timestamp: DateTime.now(),
              data: ProcessEveryTypeParamsNestedObjectDataData(
                id: "",
                timestamp: DateTime.now(),
              )),
        ),
        nestedArray: [
          [
            ProcessEveryTypeParamsNestedArrayItemItem(
                id: "", timestamp: DateTime.now())
          ]
        ]);
    final result = await client.miscTests.testEveryType(input);
    expect(result.any["hello"], equals(input.any["hello"]));
    expect(result.array.length, equals(input.array.length));
    expect(result.array[0], equals(input.array[0]));
    expect(result.boolean, equals(input.boolean));
    expect(result.discriminator.type, equals(input.discriminator.type));
    expect(result.enumerator.value, equals(input.enumerator.value));
    expect(result.float32, equals(input.float32));
    expect(result.float64, equals(input.float64));
    expect(result.int16, equals(input.int16));
    expect(result.int64, equals(input.int64));
    expect(result.object.boolean, equals(input.object.boolean));
    expect(result.record["A"], equals(input.record["A"]));
    expect(result.nestedObject.data.data.timestamp.microsecond,
        equals(result.nestedObject.data.data.timestamp.microsecond));
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

  group("large integer requests", () {
    test("get request", () async {
      final result = await client.videos
          .getAnnotation(AnnotationId(id: "2", version: "1"));
      expect(result.annotationId.id, equals('2'));
      expect(result.annotationId.version, equals("1"));
    });
    test("post request", () async {
      final result =
          await client.videos.updateAnnotation(UpdateAnnotationParams(
        annotationId: "12345",
        annotationIdVersion: '3',
        data: UpdateAnnotationData(
          boxTypeRange: UpdateAnnotationParamsDataBoxTypeRange(
            startTimeInNanoSec: BigInt.parse("123456789"),
            endTimeInNanoSec: BigInt.parse("1234567890"),
          ),
        ),
      ));
      expect(result.annotationId.id, equals("12345"));
      expect(result.annotationId.version, "3");
      expect(result.boxTypeRange.startTimeInNanoSec,
          equals(BigInt.parse("123456789")));
      expect(result.boxTypeRange.endTimeInNanoSec,
          equals(BigInt.parse("1234567890")));
    });
  });
}
