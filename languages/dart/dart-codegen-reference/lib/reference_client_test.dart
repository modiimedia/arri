import "dart:convert";

import "package:test/test.dart";
import "dart:io";
import "reference_client.dart";

void main() {
  group("EmptyObject", () {
    test("JSON", () async {
      final reference =
          await File(
            "../../../tests/test-files/EmptyObject.json",
          ).readAsString();
      expect(
        EmptyObject.fromJsonString(reference),
        equals(EmptyObject.empty()),
      );
      expect(EmptyObject.empty().toJsonString(), equals(reference));
    });
    test("toUrlQueryParams()", () {
      expect(EmptyObject.empty().toUrlQueryParams(), equals(""));
    });
    test("hashCode", () {
      expect(EmptyObject().hashCode, equals(EmptyObject.empty().hashCode));
    });
  });

  group("RecursiveObject", () {
    final input = RecursiveObject(
      left: RecursiveObject(
        left: RecursiveObject(
          left: null,
          right: RecursiveObject(left: null, right: null),
        ),
        right: null,
      ),
      right: RecursiveObject(left: null, right: null),
    );
    late String reference;
    setUpAll(() async {
      reference =
          await File(
            "../../../tests/test-files/RecursiveObject.json",
          ).readAsString();
    });
    test("fromJsonString()", () {
      expect(RecursiveObject.fromJsonString(reference), equals(input));
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(reference));
    });
    test("empty()", () {
      expect(
        RecursiveObject.empty(),
        equals(RecursiveObject(left: null, right: null)),
      );
    });
    test("== operator and hashCode", () {
      final copy = RecursiveObject.fromJsonString(reference);
      expect(copy, equals(input));
      expect(copy.hashCode, equals(input.hashCode));
      expect(input.copyWith(left: () => null) == input, equals(false));
    });
  });

  group("Book", () {
    final input = Book(
      id: "1",
      name: "The Adventures of Tom Sawyer",
      createdAt: DateTime.parse("2001-01-01T16:00:00.000Z"),
      updatedAt: DateTime.parse("2001-01-01T16:00:00.000Z"),
    );
    late String reference;

    setUpAll(() async {
      reference =
          await File("../../../tests/test-files/Book.json").readAsString();
    });
    test("toJson()", () {
      expect(input.toJsonString(), equals(reference));
    });
    test("fromJson()", () {
      expect(Book.fromJsonString(reference), equals(input));
    });
    test("toUrlQueryParams()", () {
      expect(
        input.toUrlQueryParams(),
        equals(
          "id=1&name=The+Adventures+of+Tom+Sawyer&createdAt=2001-01-01T16%3A00%3A00.000Z&updatedAt=2001-01-01T16%3A00%3A00.000Z",
        ),
      );
    });
    test("== operator", () {
      expect(input.copyWith(createdAt: DateTime.now()) == input, equals(false));
      expect(input.copyWith(), equals(input));
    });
    test("hashCode", () {
      expect(input.copyWith().hashCode, equals(input.hashCode));
      expect({input, input.copyWith()}.length, equals(1));
    });
    test("invalid timestamps fall back instead of throwing", () {
      final result = Book.fromJson({
        "id": "1",
        "name": "foo",
        "createdAt": "hello world",
        "updatedAt": "",
      });
      expect(result.id, equals("1"));
      final epoch = DateTime.parse("1970-01-01T00:00:00.000Z");
      expect(result.createdAt, equals(epoch));
      expect(result.updatedAt, equals(epoch));
      expect(Book.empty().createdAt, equals(epoch));
      expect(
        Book.empty().toJson()["createdAt"],
        equals("1970-01-01T00:00:00.000Z"),
      );
    });
  });

  group("NestedObject", () {
    final input = NestedObject(id: "1", content: "hello world");
    final specialCharsInput = NestedObject(
      id: "1",
      content:
          "double-quote: \" | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000",
    );
    late final String noSpecialCharsReference;
    late final String specialCharsReference;
    setUpAll(() async {
      noSpecialCharsReference =
          await File(
            "../../../tests/test-files/NestedObject_NoSpecialChars.json",
          ).readAsString();
      specialCharsReference =
          await File(
            "../../../tests/test-files/NestedObject_SpecialChars.json",
          ).readAsString();
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(noSpecialCharsReference));
      expect(specialCharsInput.toJsonString(), equals(specialCharsReference));
    });
    test("fromJsonString()", () {
      expect(
        NestedObject.fromJsonString(noSpecialCharsReference),
        equals(input),
      );
      expect(
        NestedObject.fromJsonString(specialCharsReference),
        equals(specialCharsInput),
      );
    });
    test("toUrlQueryParams()", () {
      expect(input.toUrlQueryParams(), equals("id=1&content=hello+world"));
      expect(
        Uri.splitQueryString(specialCharsInput.toUrlQueryParams()),
        equals({"id": "1", "content": specialCharsInput.content}),
      );
      expect(
        Uri.splitQueryString(
          NestedObject(id: "1", content: "a b&c=d/?#+").toUrlQueryParams(),
        ),
        equals({"id": "1", "content": "a b&c=d/?#+"}),
      );
    });
    test("== operator", () {
      expect(input.copyWith(content: "hello world!") == input, equals(false));
      expect(NestedObject(id: "1", content: "hello world"), equals(input));
    });
  });

  group("ObjectWithEveryType", () {
    final input = ObjectWithEveryType(
      string: "",
      boolean: false,
      timestamp: DateTime.parse("2001-01-01T16:00:00.000Z"),
      float32: 1.5,
      float64: 1.5,
      int8: 1,
      uint8: 1,
      int16: 10,
      uint16: 10,
      int32: 100,
      uint32: 100,
      int64: BigInt.from(1000),
      uint64: BigInt.from(1000),
      k_enum: Enumerator.baz,
      object: NestedObject(id: "1", content: "hello world"),
      array: [true, false, false],
      record: {"A": true, "B": false},
      unionExternal: UnionExternalArray(value: ["hello", "world"]),
      unionInternal: UnionInternalCircle(radius: 2.5),
      unionAdjacent: UnionAdjacentNullableTimestamp(
        data: DateTime.parse("2001-01-01T16:00:00.000Z"),
      ),
      any: "hello world",
    );
    late final String reference;
    final String emptyReference = "{}";
    setUpAll(() async {
      reference =
          await File(
            "../../../tests/test-files/ObjectWithEveryType.json",
          ).readAsString();
    });
    test("fromJsonString()", () {
      final now = DateTime.now();
      expect(ObjectWithEveryType.fromJsonString(reference), equals(input));
      expect(
        ObjectWithEveryType.fromJsonString(
          emptyReference,
        ).copyWith(timestamp: now),
        equals(ObjectWithEveryType.empty().copyWith(timestamp: now)),
      );
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(reference));
    });
    test("record order does not affect equality", () async {
      final normal = ObjectWithEveryType.fromJsonString(
        await File(
          "../../../tests/test-files/ObjectWithEveryType.json",
        ).readAsString(),
      );
      final reversed = ObjectWithEveryType.fromJsonString(
        await File(
          "../../../tests/test-files/ObjectWithEveryType_ReversedRecord.json",
        ).readAsString(),
      );
      expect(reversed, equals(normal));
      expect(reversed.hashCode, equals(normal.hashCode));
      expect({normal, reversed}.length, equals(1));
    });
  });
  group("ObjectWithOptionalFields", () {
    final noUndefinedInput = ObjectWithOptionalFields(
      string: "",
      boolean: false,
      timestamp: DateTime.parse("2001-01-01T16:00:00.000Z"),
      float32: 1.5,
      float64: 1.5,
      int8: 1,
      uint8: 1,
      int16: 10,
      uint16: 10,
      int32: 100,
      uint32: 100,
      int64: BigInt.from(1000),
      uint64: BigInt.from(1000),
      k_enum: Enumerator.baz,
      object: NestedObject(id: "1", content: "hello world"),
      array: [true, false, false],
      record: {"A": true, "B": false},
      unionExternal: UnionExternalArray(value: ["hello", "world"]),
      unionInternal: UnionInternalCircle(radius: 2.5),
      unionAdjacent: UnionAdjacentNullableTimestamp(
        data: DateTime.parse("2001-01-01T16:00:00.000Z"),
      ),
      any: "hello world",
    );
    late String allUndefinedReference;
    late String noUndefinedReference;
    setUpAll(() async {
      allUndefinedReference =
          await File(
            "../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json",
          ).readAsString();
      noUndefinedReference =
          await File(
            "../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json",
          ).readAsString();
    });
    test("fromJsonString()", () {
      expect(
        ObjectWithOptionalFields.fromJsonString(allUndefinedReference),
        equals(ObjectWithOptionalFields.empty()),
      );
      expect(
        ObjectWithOptionalFields.fromJsonString(noUndefinedReference),
        equals(noUndefinedInput),
      );
    });
    test("toJson()", () {
      expect(
        json.encode(ObjectWithOptionalFields.empty().toJson()),
        equals(allUndefinedReference),
      );
      expect(
        json.encode(noUndefinedInput.toJson()),
        equals(noUndefinedReference),
      );
    });
    test("toJsonString()", () {
      expect(
        ObjectWithOptionalFields.empty().toJsonString(),
        equals(allUndefinedReference),
      );
      expect(noUndefinedInput.toJsonString(), equals(noUndefinedReference));
    });
    test("== operator", () {
      expect(
        ObjectWithOptionalFields.empty(),
        equals(ObjectWithOptionalFields.empty()),
      );
      final newInput = ObjectWithOptionalFields(
        string: "",
        boolean: false,
        timestamp: DateTime.parse("2001-01-01T16:00:00.000Z"),
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: BigInt.from(1000),
        uint64: BigInt.from(1000),
        k_enum: Enumerator.baz,
        object: NestedObject(id: "1", content: "hello world"),
        array: [true, false, false],
        record: {"A": true, "B": false},
        unionExternal: UnionExternalArray(value: ["hello", "world"]),
        unionInternal: UnionInternalCircle(radius: 2.5),
        unionAdjacent: UnionAdjacentNullableTimestamp(
          data: DateTime.parse("2001-01-01T16:00:00.000Z"),
        ),
        any: "hello world",
      );
      expect(noUndefinedInput, equals(newInput));
      expect(
        noUndefinedInput == newInput.copyWith(any: () => "hello world again"),
        equals(false),
      );
      expect(
        noUndefinedInput == newInput.copyWith(array: () => [true, true, true]),
        equals(false),
      );
    });
    test("toUrlQueryParams()", () {
      expect(ObjectWithOptionalFields.empty().toUrlQueryParams(), equals(""));
      final params = Uri.splitQueryString(noUndefinedInput.toUrlQueryParams());
      expect(params["string"], equals(noUndefinedInput.string));
      expect(
        params["timestamp"],
        equals(noUndefinedInput.timestamp?.toUtc().toIso8601String()),
      );
      expect(params["enum"], equals(noUndefinedInput.k_enum?.serialValue));
    });
    test("record order does not affect equality", () async {
      final normal = ObjectWithOptionalFields.fromJsonString(
        await File(
          "../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json",
        ).readAsString(),
      );
      final reversed = ObjectWithOptionalFields.fromJsonString(
        await File(
          "../../../tests/test-files/ObjectWithOptionalFields_NoUndefined_ReversedRecord.json",
        ).readAsString(),
      );
      expect(reversed, equals(normal));
      expect(reversed.hashCode, equals(normal.hashCode));
      expect({normal, reversed}.length, equals(1));
    });
  });

  group("ObjectWithNullableFields", () {
    final noNullInput = ObjectWithNullableFields(
      string: "",
      boolean: true,
      timestamp: DateTime.parse("2001-01-01T16:00:00.000Z"),
      float32: 1.5,
      float64: 1.5,
      int8: 1,
      uint8: 1,
      int16: 10,
      uint16: 10,
      int32: 100,
      uint32: 100,
      int64: BigInt.from(1000),
      uint64: BigInt.from(1000),
      k_enum: Enumerator.baz,
      object: NestedObject(id: "", content: ""),
      array: [true, false, false],
      record: {"A": true, "B": false},
      unionExternal: UnionExternalArray(value: ["hello", "world"]),
      unionInternal: UnionInternalCircle(radius: 2.5),
      unionAdjacent: UnionAdjacentBoolean(data: true),
      any: {"message": "hello world"},
    );
    late String allNullReference;
    late String noNullReference;
    setUpAll(() async {
      allNullReference =
          await File(
            "../../../tests/test-files/ObjectWithNullableFields_AllNull.json",
          ).readAsString();
      noNullReference =
          await File(
            "../../../tests/test-files/ObjectWithNullableFields_NoNull.json",
          ).readAsString();
    });
    test("fromJsonString()", () {
      expect(
        ObjectWithNullableFields.fromJsonString(allNullReference),
        equals(ObjectWithNullableFields.empty()),
      );
      expect(
        ObjectWithNullableFields.fromJsonString(noNullReference),
        equals(noNullInput),
      );
    });
    test("toJsonString()", () {
      expect(
        ObjectWithNullableFields.empty().toJsonString(),
        equals(allNullReference),
      );
      expect(noNullInput.toJsonString(), equals(noNullReference));
    });
    test("toUrlQueryParams()", () {
      final nullParams = Uri.splitQueryString(
        ObjectWithNullableFields.empty().toUrlQueryParams(),
      );
      expect(nullParams["string"], equals("null"));
      expect(nullParams["timestamp"], equals("null"));
      expect(nullParams["enum"], equals("null"));
      final params = Uri.splitQueryString(noNullInput.toUrlQueryParams());
      expect(params["string"], equals(noNullInput.string));
      expect(
        params["timestamp"],
        equals(noNullInput.timestamp?.toUtc().toIso8601String()),
      );
      expect(params["enum"], equals(noNullInput.k_enum?.serialValue));
    });
    test("record order does not affect equality", () async {
      final normal = ObjectWithNullableFields.fromJsonString(
        await File(
          "../../../tests/test-files/ObjectWithNullableFields_NoNull.json",
        ).readAsString(),
      );
      final reversed = ObjectWithNullableFields.fromJsonString(
        await File(
          "../../../tests/test-files/ObjectWithNullableFields_NoNull_ReversedRecord.json",
        ).readAsString(),
      );
      expect(reversed, equals(normal));
      expect(reversed.hashCode, equals(normal.hashCode));
      expect({normal, reversed}.length, equals(1));
    });
    test("invalid timestamps fall back to null instead of throwing", () {
      final result = ObjectWithNullableFields.fromJson({
        "timestamp": "hello world",
      });
      expect(result.timestamp, equals(null));
    });
  });

  group("UnionExternal", () {
    final inputs = <String, UnionExternal>{
      "UnionExternal_Object.json": UnionExternalObject(
        value: NestedObject(id: "1", content: "hello world"),
      ),
      "UnionExternal_Array.json": UnionExternalArray(value: ["hello", "world"]),
      "UnionExternal_Boolean.json": UnionExternalBoolean(value: true),
      "UnionExternal_Timestamp.json": UnionExternalNullableTimestamp(
        value: DateTime.parse("2001-01-01T16:00:00.000Z"),
      ),
      "UnionExternal_TimestampNull.json": UnionExternalNullableTimestamp(
        value: null,
      ),
    };
    final references = <String, String>{};
    setUpAll(() async {
      for (final filename in inputs.keys) {
        references[filename] =
            await File("../../../tests/test-files/$filename").readAsString();
      }
    });
    test("fromJsonString()", () {
      for (final entry in inputs.entries) {
        expect(
          UnionExternal.fromJsonString(references[entry.key]!),
          equals(entry.value),
        );
      }
    });
    test("toJsonString()", () {
      for (final entry in inputs.entries) {
        expect(entry.value.toJsonString(), equals(references[entry.key]));
      }
    });
    test("unknown variant falls back to the first variant", () {
      expect(
        UnionExternal.fromJsonString('{"triangle":{"base":10}}'),
        equals(UnionExternal.empty()),
      );
      expect(
        UnionExternal.empty(),
        equals(UnionExternalObject(value: NestedObject.empty())),
      );
    });
    test("== operator", () {
      expect(
        UnionExternalBoolean(value: true) == UnionExternalBoolean(value: false),
        equals(false),
      );
      expect(
        UnionExternalArray(value: ["a"]),
        equals(UnionExternalArray(value: ["a"])),
      );
    });
    test("copyWith()", () {
      final input = UnionExternalBoolean(value: true);
      expect(input.copyWith(value: false).value, equals(false));
      expect(input.copyWith(), equals(input));
    });
    test("hashCode", () {
      final input = UnionExternalBoolean(value: true);
      expect(input.copyWith().hashCode, equals(input.hashCode));
    });
    test("invalid variant values fall back", () {
      expect(
        UnionExternal.fromJson({"object": 5}),
        equals(UnionExternal.empty()),
      );
      expect(
        UnionExternal.fromJson({"array": "hello world"}),
        equals(UnionExternalArray(value: [])),
      );
    });
  });

  group("UnionInternal", () {
    final input = UnionInternalRectangle(width: 10.7, height: 5.3);
    late String reference;
    setUpAll(() async {
      reference =
          await File(
            "../../../tests/test-files/UnionInternal_Rectangle.json",
          ).readAsString();
    });
    test("fromJsonString()", () {
      expect(UnionInternal.fromJsonString(reference), equals(input));
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(reference));
    });
    test("toUrlQueryParams()", () {
      expect(
        input.toUrlQueryParams(),
        equals("shape=rectangle&width=10.7&height=5.3"),
      );
    });
    test("unknown variant falls back to the first variant", () {
      expect(
        UnionInternal.fromJsonString(
          '{"shape":"triangle","base":10,"height":5}',
        ),
        equals(UnionInternalRectangle.empty()),
      );
      expect(
        UnionInternal.fromJsonString('{"width":10}'),
        equals(UnionInternalRectangle.empty()),
      );
    });
    test("copyWith()", () {
      expect(input.copyWith(width: 1).width, equals(1));
      expect(input.copyWith(width: 1).height, equals(input.height));
      expect(input.copyWith(), equals(input));
    });
    test("hashCode", () {
      expect(input.copyWith().hashCode, equals(input.hashCode));
    });
    test("non-string tags fall back", () {
      expect(
        UnionInternal.fromJson({"shape": 5}),
        equals(UnionInternal.empty()),
      );
    });
  });

  group("UnionAdjacent", () {
    final inputs = <String, UnionAdjacent>{
      "UnionAdjacent_Object.json": UnionAdjacentObject(
        data: NestedObject(id: "1", content: "hello world"),
      ),
      "UnionAdjacent_TimestampNull.json": UnionAdjacentNullableTimestamp(
        data: null,
      ),
    };
    final references = <String, String>{};
    setUpAll(() async {
      for (final filename in inputs.keys) {
        references[filename] =
            await File("../../../tests/test-files/$filename").readAsString();
      }
    });
    test("fromJsonString()", () {
      for (final entry in inputs.entries) {
        expect(
          UnionAdjacent.fromJsonString(references[entry.key]!),
          equals(entry.value),
        );
      }
    });
    test("toJsonString()", () {
      for (final entry in inputs.entries) {
        expect(entry.value.toJsonString(), equals(references[entry.key]));
      }
    });
    test("kind getter", () {
      expect(UnionAdjacentBoolean(data: true).kind, equals("boolean"));
      expect(
        UnionAdjacentNullableTimestamp(data: null).kind,
        equals("nullable-timestamp"),
      );
    });
    test("unknown variant falls back to the first variant", () {
      expect(
        UnionAdjacent.fromJsonString('{"kind":"triangle","data":{"base":10}}'),
        equals(UnionAdjacentObject(data: NestedObject.empty())),
      );
      expect(
        UnionAdjacent.fromJsonString('{"data":true}'),
        equals(UnionAdjacentObject(data: NestedObject.empty())),
      );
    });
    test("copyWith()", () {
      final input = UnionAdjacentBoolean(data: true);
      expect(input.copyWith(data: false).data, equals(false));
      expect(input.copyWith(), equals(input));
    });
    test("hashCode", () {
      final input = UnionAdjacentBoolean(data: true);
      expect(input.copyWith().hashCode, equals(input.hashCode));
    });
    test("invalid variant values fall back", () {
      expect(
        UnionAdjacent.fromJson({"kind": "object", "data": 5}),
        equals(UnionAdjacent.empty()),
      );
    });
  });

  group("LegacyDiscriminator", () {
    final input = LegacyDiscriminatorC(
      id: "1",
      name: "John Doe",
      date: DateTime.parse("2001-01-01T16:00:00.000Z"),
    );
    late String reference;
    setUpAll(() async {
      reference =
          await File(
            "../../../tests/test-files/LegacyDiscriminator.json",
          ).readAsString();
    });
    test("fromJsonString()", () {
      expect(LegacyDiscriminator.fromJsonString(reference), equals(input));
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(reference));
    });
  });
}
