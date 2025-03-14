import "dart:convert";

import "package:test/test.dart";
import "dart:io";
import "reference_client.dart";

void main() {
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
          "id=1&name=The Adventures of Tom Sawyer&createdAt=2001-01-01T16:00:00.000Z&updatedAt=2001-01-01T16:00:00.000Z",
        ),
      );
    });
    test("== operator", () {
      expect(input.copyWith(createdAt: DateTime.now()) == input, equals(false));
      expect(input.copyWith(), equals(input));
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
      expect(input.toUrlQueryParams(), equals("id=1&content=hello world"));
      expect(
        specialCharsInput.toUrlQueryParams(),
        equals(
          "id=1&content=double-quote: \" | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000",
        ),
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
      discriminator: DiscriminatorC(
        id: "",
        name: "",
        date: DateTime.parse("2001-01-01T16:00:00.000Z"),
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
        ObjectWithEveryType.fromJsonString(emptyReference).copyWith(
          timestamp: now,
          discriminator: DiscriminatorC.empty().copyWith(date: now),
        ),
        equals(
          ObjectWithEveryType.empty().copyWith(
            timestamp: now,
            discriminator: DiscriminatorC.empty().copyWith(date: now),
          ),
        ),
      );
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(reference));
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
      discriminator: DiscriminatorC(
        id: "",
        name: "",
        date: DateTime.parse("2001-01-01T16:00:00.000Z"),
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
        discriminator: DiscriminatorC(
          id: "",
          name: "",
          date: DateTime.parse("2001-01-01T16:00:00.000Z"),
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
  });
}
