import 'dart:async';
import 'dart:core';
import 'package:collection/collection.dart';
import 'package:macros/macros.dart';


final _schemas = Uri.parse("package:arri_schema/schemas.dart");
final _dartCore = Uri.parse("dart:core");

macro class ArriModel implements ClassDeclarationsMacro, ClassDefinitionMacro {
  final bool strict;
  final List<String> recursiveRefs;
  const ArriModel({
    this.strict = false,
    this.recursiveRefs = const [],
  });

  @override
  FutureOr<void> buildDeclarationsForClass(ClassDeclaration clazz, MemberDeclarationBuilder builder) async {
   builder.declareInType(
      DeclarationCode.fromString(
        "external void sayHello();"
      )
    );
    final schema = await builder.resolveIdentifier(_schemas, "Schema");
    final schemaType = NamedTypeAnnotationCode(name: schema);
    final bool = await builder.resolveIdentifier(_dartCore, "bool");
    final boolType = NamedTypeAnnotationCode(name: bool).asNullable;
    builder.declareInType(DeclarationCode.fromParts([" external ", schemaType ," toTypeDefinition({", boolType ," nullable});"]));
  }

  @override
  FutureOr<void> buildDefinitionForClass(
    ClassDeclaration clazz,
    TypeDefinitionBuilder builder,
  ) async {
    final fields = (await builder.fieldsOf(clazz));
    final methods = await builder.methodsOf(clazz);
    final sayHello = methods.firstWhereOrNull(
      (m) => m.identifier.name == 'sayHello',
    );
    if(sayHello == null) return;
    final sayHelloMethod = await builder.buildMethod(sayHello.identifier);
    final printCode = await builder.resolveIdentifier(_dartCore, "print");
    final printRef = NamedTypeAnnotationCode(name: printCode);
    sayHelloMethod.augment(FunctionBodyCode.fromParts(["{\n    ", printRef, "(\"hello world!\");\n", "  }"]));
    final toTypeDefinition = methods.firstWhereOrNull((m) => m.identifier.name == 'toTypeDefinition');
    if(toTypeDefinition == null) return;
    final toTypeDefMethod = await builder.buildMethod(toTypeDefinition.identifier);
    final fieldNames = <String>[];
    final fieldParts = <String>[];
    for(final field in fields) {
      final type = field.type;
      fieldNames.add(field.identifier.name);
      switch (type) {
        case NamedTypeAnnotation():
          if(type.typeArguments.isNotEmpty) {
            final parts = <String>[
              type.identifier.name
            ];
            for(final arg in type.typeArguments) {
              if(arg is NamedTypeAnnotation) {
                parts.add(arg.identifier.name);
              }
            }
            fieldParts.add(parts.join("+"));
            break;
          }
          fieldParts.add(type.identifier.name);
          break;
        case FunctionTypeAnnotation():
          throw Exception("Error at field \"${field.identifier.name}\". Functions are not a support field type.");
      }
    }
        final fieldResults = <String>[];
        for(var i = 0; i < fieldNames.length; i++) {
          final name = fieldNames[i];
          final type = fieldParts[i];
          fieldResults.add("$name ($type)");
        }
    final references = await _getReferences(builder);
    final parts = <Object>[
      "{\n",
      "    // ${fieldResults.join(', ')}\n",
      "    return ",
      references.properties.code,
      "(\n",
      "      properties: {\n",
    ];
    // TODO add all properties
    // placeholder example start
    parts.addAll([
      "        \"id\": ",
      references.type.code,
      "(type: ",
      references.typeValue.code,
      ".string),\n",
      "        \"name\": ",
      references.type.code,
      "(type: ",
      references.typeValue.code,
      ".boolean),\n"
    ]);
    // placeholder example end

    parts.add("      },\n");
    parts.addAll([
      "      additionalProperties: ${!strict},\n",
      "      nullable: nullable,\n",
      "      metadata: ",
      references.metadata.code,
      "(id: \"${clazz.identifier.name}\"),\n"
      "    );\n",
      "  }"
    ]);
    toTypeDefMethod.augment(FunctionBodyCode.fromParts(parts));
  }
}

Future<_SchemaReferences> _getReferences(TypeDefinitionBuilder builder) async {
  final typeValue = await builder.resolveIdentifier(_schemas, "TypeValues");
  final metadata = await builder.resolveIdentifier(_schemas, "SchemaMetadata");
  final type = await builder.resolveIdentifier(_schemas, "TypeSchema");
  final enumerator = await builder.resolveIdentifier(_schemas, "EnumSchema");
  final properties = await builder.resolveIdentifier(_schemas, "PropertiesSchema");
  final elements = await builder.resolveIdentifier(_schemas, "ElementsSchema");
  final record = await builder.resolveIdentifier(_schemas, "ValuesSchema");
  final discriminator = await builder.resolveIdentifier(_schemas, "DiscriminatorSchema");
  final ref = await builder.resolveIdentifier(_schemas, "RefSchema");
  final any = await builder.resolveIdentifier(_schemas, "EmptySchema");

  return _SchemaReferences(
    typeValue: _ImportRef.fromIdentifier(typeValue),
    metadata: _ImportRef.fromIdentifier(metadata),
    type: _ImportRef.fromIdentifier(type),
    properties: _ImportRef.fromIdentifier(properties),
    elements: _ImportRef.fromIdentifier(elements),
    record: _ImportRef.fromIdentifier(record),
    enumerator: _ImportRef.fromIdentifier(enumerator),
    discriminator: _ImportRef.fromIdentifier(discriminator),
    ref: _ImportRef.fromIdentifier(ref),
    any: _ImportRef.fromIdentifier(any),
  );
}


class _SchemaReferences {
  final _ImportRef typeValue;
  final _ImportRef metadata;
  final _ImportRef type;
  final _ImportRef properties;
  final _ImportRef elements;
  final _ImportRef record;
  final _ImportRef discriminator;
  final _ImportRef enumerator;
  final _ImportRef ref;
  final _ImportRef any;
  const _SchemaReferences({
    required this.typeValue,
    required this.type,
    required this.metadata,
    required this.properties,
    required this.elements,
    required this.record,
    required this.discriminator,
    required this.enumerator,
    required this.ref,
    required this.any,
  });
}

class _ImportRef {
  final Identifier identifier;
  final NamedTypeAnnotationCode code;
  const _ImportRef({
    required this.identifier,
    required this.code,
  });

  factory _ImportRef.fromIdentifier(Identifier identifier) {
    return _ImportRef(
      identifier: identifier,
      code: NamedTypeAnnotationCode(name: identifier),
    );
  }
}