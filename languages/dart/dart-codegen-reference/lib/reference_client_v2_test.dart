import "package:test/test.dart";
import "dart:io";
import "./reference_client_v2.dart";

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
            "id=1&name=The Adventures of Tom Sawyer&createdAt=2001-01-01T16:00:00.000Z&updatedAt=2001-01-01T16:00:00.000Z"),
      );
    });
    test("== operator", () {
      expect(input.copyWith(createdAt: DateTime.now()) == input, equals(false));
      expect(
        input.copyWith(),
        equals(input),
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
      noSpecialCharsReference = await File(
              "../../../tests/test-files/NestedObject_NoSpecialChars.json")
          .readAsString();
      specialCharsReference =
          await File("../../../tests/test-files/NestedObject_SpecialChars.json")
              .readAsString();
    });
    test("toJsonString()", () {
      expect(input.toJsonString(), equals(noSpecialCharsReference));
      expect(specialCharsInput.toJsonString(), equals(specialCharsReference));
    });
    test("fromJsonString()", () {
      expect(
          NestedObject.fromJsonString(noSpecialCharsReference), equals(input));
      expect(NestedObject.fromJsonString(specialCharsReference),
          equals(specialCharsInput));
    });
    test("toUrlQueryParams()", () {
      expect(input.toUrlQueryParams(), equals("id=1&content=hello world"));
      expect(
        specialCharsInput.toUrlQueryParams(),
        equals(
            "id=1&content=double-quote: \" | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000"),
      );
    });
    test("== operator", () {
      expect(input.copyWith(content: "hello world!") == input, equals(false));
      expect(NestedObject(id: "1", content: "hello world"), equals(input));
    });
  });
}
