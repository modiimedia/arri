import 'dart:convert';

import 'package:arri_schema/schemas.dart';

class AppDefinition {
  final String arriSchemaVersion;
  final AppDefinitionInfo? info;
  final Map<String, dynamic> procedures;
  final Map<String, Schema> definitions;

  const AppDefinition({
    required this.arriSchemaVersion,
    this.info,
    required this.procedures,
    required this.definitions,
  });

  Map<String, dynamic> toJson() {
    final output = <String, dynamic>{
      "arriSchemaVersion": arriSchemaVersion,
    };
    if (info != null) output["info"] = info!.toJson();
    output["procedures"] = <String, dynamic>{};
    for (final entry in procedures.entries) {
      output["procedures"][entry.key] = entry.value;
    }
    output["definitions"] = <String, dynamic>{};
    for (final entry in definitions.entries) {
      output["definitions"][entry.key] = entry.value.toJson();
    }
    return output;
  }

  String toJsonString() {
    return json.encode(toJson());
  }
}

class AppDefinitionInfo {
  final String? title;
  final String? description;
  final String? version;

  const AppDefinitionInfo({
    this.title,
    this.description,
    this.version,
  });

  Map<String, dynamic> toJson() {
    final output = <String, dynamic>{};
    if (title != null) output["title"] = title;
    if (description != null) output["description"] = description;
    if (version != null) output["version"] = version;
    return output;
  }

  String toJsonString() {
    return json.encode(toJson());
  }
}
