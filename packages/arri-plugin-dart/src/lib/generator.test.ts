import {
    type JsonSchemaObjectDefinition,
    jsonSchemaObjectToDart,
} from "./generator";

describe("jsonSchemaObjectToDart", () => {
    test("Basic Object", () => {
        const user: JsonSchemaObjectDefinition = {
            type: "object",
            required: ["id", "name", "created"],
            properties: {
                id: {
                    type: "string",
                },
                name: {
                    type: "string",
                },
                created: {
                    type: "integer",
                },
            },
        };
        const expectedResult = `class User {
  final String id;
  final String name;
  final int created;
  const User({
    required this.id,
    required this.name,
    required this.created,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"] is String ? json["id"] : "",
      name: json["name"] is String ? json["name"] : "",
      created: json["created"] is int ? json["created"] : 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "created": created,
    };
  }
}`;
        expect(jsonSchemaObjectToDart("User", user)).toBe(expectedResult);
    });
    test("Basic object with Nullable Fields", () => {
        const user: JsonSchemaObjectDefinition = {
            type: "object",
            required: ["id"],
            properties: {
                id: {
                    type: "string",
                },
                name: {
                    type: "string",
                },
                created: {
                    type: "integer",
                },
            },
        };
        const expectedResult = `class User {
  final String id;
  final String? name;
  final int? created;
  const User({
    required this.id,
    required this.name,
    required this.created,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"] is String ? json["id"] : "",
      name: json["name"] is String ? json["name"] : null,
      created: json["created"] is int ? json["created"] : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "created": created,
    };
  }
}`;
        expect(jsonSchemaObjectToDart("User", user)).toBe(expectedResult);
    });
});
