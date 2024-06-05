import 'dart:convert';

class SchemaMetadata {
  final String? id;
  final String? description;
  final bool? isDeprecated;

  const SchemaMetadata({
    this.id,
    this.description,
    this.isDeprecated,
  });

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{};
    if (id != null) result["id"] = id;
    if (description != null) result["description"] = description;
    if (isDeprecated != null) result["isDeprecated"] = isDeprecated;
    return result;
  }

  String toJsonString() {
    return json.encode(toJson());
  }
}

sealed class Schema {
  final bool? nullable;
  final SchemaMetadata? metadata;
  const Schema({
    this.nullable,
    this.metadata,
  });

  Map<String, dynamic> toJson();
  String toJsonString();
}

class TypeSchema implements Schema {
  final TypeValues type;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const TypeSchema({
    required this.type,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{
      "type": type.serialValue,
    };
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

enum TypeValues implements Comparable<TypeValues> {
  string("string"),
  boolean("boolean"),
  timestamp("timestamp"),
  int8("int8"),
  uint8("uint8"),
  int16("int16"),
  uint16("uint16"),
  int32("int32"),
  uint32("uint32"),
  int64("int64"),
  uint64("uint64");

  const TypeValues(this.serialValue);
  final String serialValue;

  @override
  int compareTo(TypeValues other) {
    return name.compareTo(other.name);
  }
}

class EnumSchema implements Schema {
  final List<String> enumValues;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const EnumSchema({
    required this.enumValues,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"enum": enumValues};
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

class PropertiesSchema implements Schema {
  final Map<String, Schema> properties;
  final Map<String, Schema>? optionalProperties;
  final bool additionalProperties;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const PropertiesSchema({
    required this.properties,
    this.optionalProperties,
    this.additionalProperties = true,
    this.metadata,
    this.nullable,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    final propertiesJson = <String, dynamic>{};
    for (final entry in properties.entries) {
      propertiesJson[entry.key] = entry.value.toJson();
    }
    json["properties"] = propertiesJson;
    if (optionalProperties != null) {
      final optionalPropertiesJson = <String, dynamic>{};
      for (final entry in optionalProperties!.entries) {
        optionalPropertiesJson[entry.key] = entry.value.toJson();
      }
      json["optionalProperties"] = optionalPropertiesJson;
    }
    json["additionalProperties"] = additionalProperties;
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

class ElementsSchema implements Schema {
  final Schema elements;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const ElementsSchema({
    required this.elements,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"elements": elements.toJson()};
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

class ValuesSchema implements Schema {
  final Schema values;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const ValuesSchema({
    required this.values,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"values": values.toJson()};
    if (nullable != null) json["nullable"] = json;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

class DiscriminatorSchema implements Schema {
  final String discriminator;
  final Map<String, PropertiesSchema> mapping;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const DiscriminatorSchema({
    required this.discriminator,
    required this.mapping,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"discriminator": discriminator};
    final mappingJson = <String, dynamic>{};
    for (final entry in mapping.entries) {
      mappingJson[entry.key] = entry.value.toJson();
    }
    json["mapping"] = mappingJson;
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

class RefSchema implements Schema {
  final String ref;
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const RefSchema({
    required this.ref,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"ref": ref};
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}

class EmptySchema implements Schema {
  @override
  final bool? nullable;
  @override
  final SchemaMetadata? metadata;
  const EmptySchema({
    this.nullable,
    this.metadata,
  });
  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (nullable != null) json["nullable"] = nullable;
    if (metadata != null) json["metadata"] = metadata!.toJson();
    return json;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }
}
