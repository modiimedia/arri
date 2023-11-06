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

  group("miscTests", () {
    test("sendObject()", () async {
      final input = ObjectWithEveryType(
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
          enumerator: ObjectWithEveryTypeEnumerator.a,
          array: [true, false],
          object: ObjectWithEveryTypeObject(
              boolean: true, string: "", timestamp: DateTime.now()),
          record: {
            "A": true,
            "B": false,
          },
          discriminator:
              ObjectWithEveryTypeDiscriminatorA(title: "Hello World"),
          nestedObject: ObjectWithEveryTypeNestedObject(
            id: "",
            timestamp: DateTime.now(),
            data: ObjectWithEveryTypeNestedObjectData(
                id: "",
                timestamp: DateTime.now(),
                data: ObjectWithEveryTypeNestedObjectDataData(
                  id: "",
                  timestamp: DateTime.now(),
                )),
          ),
          nestedArray: [
            [
              ObjectWithEveryTypeNestedArrayItemItem(
                  id: "", timestamp: DateTime.now())
            ]
          ]);
      final result = await client.miscTests.sendObject(input);
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
      expect(
        result.nestedObject.data.data.timestamp.microsecond,
        equals(result.nestedObject.data.data.timestamp.microsecond),
      );
      final input2 = input.copyWith(int16: 999);
      final result2 = await client.miscTests.sendObject(input2);
      expect(result2.int16, equals(999));
    });
    test("sendPartialObject()", () async {
      final input = ObjectWithEveryOptionalType(
        int16: 0,
        int64: BigInt.zero,
        nestedArray: [
          [
            ObjectWithEveryOptionalTypeNestedArrayItemItem(
                id: "", timestamp: DateTime.now())
          ]
        ],
      );
      final result = await client.miscTests.sendPartialObject(input);
      expect(result.string, equals(null));
      expect(result.int16, equals(0));
      expect(result.int64, equals(BigInt.zero));
      expect(result.nestedArray?[0][0].id, equals(""));
    });
    test("sendObjectWithNullableFields()", () async {
      final input = ObjectWithEveryNullableType(
        any: null,
        boolean: null,
        string: null,
        timestamp: null,
        float32: null,
        float64: null,
        int8: null,
        uint8: null,
        int16: null,
        uint16: null,
        int32: null,
        uint32: null,
        int64: null,
        uint64: null,
        enumerator: null,
        array: null,
        object: null,
        record: null,
        discriminator: null,
        nestedObject: null,
        nestedArray: null,
      );
      final result = await client.miscTests.sendObjectWithNullableFields(input);
      expect(result.string, equals(null));
      expect(result.array, equals(null));
      final input2 = input.copyWith(
        int64: BigInt.zero,
        discriminator: ObjectWithEveryNullableTypeDiscriminatorA(title: null),
        nestedObject: ObjectWithEveryNullableTypeNestedObject(
          id: null,
          timestamp: null,
          data: ObjectWithEveryNullableTypeNestedObjectData(
              id: "", timestamp: null, data: null),
        ),
        nestedArray: [null],
      );
      final result2 =
          await client.miscTests.sendObjectWithNullableFields(input2);
      expect(result2.nestedArray?[0], equals(null));
      expect(result2.nestedObject?.data?.id, equals(""));
      expect(result2.int64, equals(BigInt.zero));
      expect(
        result2.discriminator is ObjectWithEveryNullableTypeDiscriminatorA,
        equals(true),
      );
    });
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
