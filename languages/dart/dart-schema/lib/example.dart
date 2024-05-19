import 'package:arri_schema/arri_macro.dart';
import 'package:arri_schema/arri_schema.dart';

@ArriCodable()
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
  print(user.toTypeDefinition());
}

final userSchema = ArriPropertiesSchema(
  metadata: ArriSchemaMetadata(id: "User"),
  properties: {
    "id": ArriTypeSchema(type: ArriType.string),
    "name": ArriTypeSchema(type: ArriType.string),
    "email": ArriTypeSchema(type: ArriType.string),
    "role": ArriEnumSchema(
      enumValues: ["STANDARD", "ADMIN", "MODERATOR"],
    ),
    "createdAt": ArriTypeSchema(type: ArriType.timestamp),
    "numFollowers": ArriTypeSchema(type: ArriType.int64),
    "messages": ArriElementsSchema(
      elements: ArriDiscriminatorSchema(
        metadata: ArriSchemaMetadata(id: "UserMessage"),
        discriminator: "type",
        mapping: {
          "TEXT": ArriPropertiesSchema(properties: {
            "id": ArriTypeSchema(type: ArriType.string),
            "text": ArriTypeSchema(type: ArriType.string),
          }),
          "IMAGE": ArriPropertiesSchema(
            properties: {
              "id": ArriTypeSchema(type: ArriType.string),
              "imageUrl": ArriTypeSchema(type: ArriType.string),
            },
          )
        },
      ),
    ),
  },
);
