import 'dart:convert';

import 'package:arri_schema/app_definition.dart';
import 'package:arri_schema/schemas.dart';
import 'package:arri_schema/macros.dart';

@ArriModel()
class User {
  final String id;
  final String name;
  final String email;
  final List<String> messages;
  final Map<String, bool> settings;
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.messages,
    required this.settings,
  });
}

void main(List<String> args) {
  final user = User(
    id: "1",
    name: "Josh",
    email: "josh@josh.com",
    messages: [],
    settings: {},
  );
  print(json.encode(user.toTypeDefinition().toJson()));
  final appDef = AppDefinition(
    arriSchemaVersion: "0.0.4",
    procedures: {
      "getUser": {
        "transport": "http",
        "path": "/get-user",
        "method": "get",
        "params": "User",
        "response": "User",
      }
    },
    definitions: {
      "User": user.toTypeDefinition(),
    },
  );
  print("\n");
  print(appDef.toJsonString());
}

final userSchema = PropertiesSchema(
  metadata: SchemaMetadata(id: "User"),
  properties: {
    "id": TypeSchema(type: TypeValues.string),
    "name": TypeSchema(type: TypeValues.string),
    "email": TypeSchema(type: TypeValues.string),
    "role": EnumSchema(
      enumValues: ["STANDARD", "ADMIN", "MODERATOR"],
    ),
    "createdAt": TypeSchema(type: TypeValues.timestamp),
    "numFollowers": TypeSchema(type: TypeValues.int64),
    "messages": ElementsSchema(
      elements: DiscriminatorSchema(
        metadata: SchemaMetadata(id: "UserMessage"),
        discriminator: "type",
        mapping: {
          "TEXT": PropertiesSchema(properties: {
            "id": TypeSchema(type: TypeValues.string),
            "text": TypeSchema(type: TypeValues.string),
          }),
          "IMAGE": PropertiesSchema(
            properties: {
              "id": TypeSchema(type: TypeValues.string),
              "imageUrl": TypeSchema(type: TypeValues.string),
            },
          )
        },
      ),
    ),
  },
);
