class ArriSchemaMetadata {
  final String? id;
  final String? description;
  final bool? isDeprecated;

  const ArriSchemaMetadata({
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
}

sealed class ArriSchema {
  final bool? nullable;
  final ArriSchemaMetadata? metadata;
  const ArriSchema({
    this.nullable,
    this.metadata,
  });

  Map<String, dynamic> toJson();
}

class ArriTypeSchema implements ArriSchema {
  final ArriType type;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriTypeSchema({
    required this.type,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{
      "type": type.serialValue,
    };
    if (nullable != null) {
      json["nullable"] = nullable;
    }
    if (metadata != null) {
      json["metadata"] = metadata!.toJson();
    }
    return json;
  }
}

enum ArriType implements Comparable<ArriType> {
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

  const ArriType(this.serialValue);
  final String serialValue;

  @override
  int compareTo(ArriType other) {
    return name.compareTo(other.name);
  }
}

class ArriEnumSchema implements ArriSchema {
  final List<String> enumValues;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriEnumSchema({
    required this.enumValues,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"enum": enumValues};
    return json;
  }
}

class ArriPropertiesSchema implements ArriSchema {
  final Map<String, ArriSchema> properties;
  final Map<String, ArriSchema>? optionalProperties;
  final bool additionalProperties;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriPropertiesSchema({
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
}

class ArriElementsSchema implements ArriSchema {
  final ArriSchema elements;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriElementsSchema({
    required this.elements,
    this.nullable,
    this.metadata,
  });

  @override
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{"elements": elements.toJson()};
    return json;
  }
}

class ArriValuesSchema implements ArriSchema {
  final ArriSchema values;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriValuesSchema({
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
}

class ArriDiscriminatorSchema implements ArriSchema {
  final String discriminator;
  final Map<String, ArriPropertiesSchema> mapping;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriDiscriminatorSchema({
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
}

class ArriRefSchema implements ArriSchema {
  final String ref;
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriRefSchema({
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
}

class ArriEmptySchema implements ArriSchema {
  @override
  final bool? nullable;
  @override
  final ArriSchemaMetadata? metadata;
  const ArriEmptySchema({
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
}
