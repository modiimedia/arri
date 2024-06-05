import 'dart:async';
import 'dart:core';
import 'package:collection/collection.dart';
import 'package:macros/macros.dart';


final _arriSchema = Uri.parse("package:arri_schema/arri_schema.dart");
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
    final schema = await builder.resolveIdentifier(_arriSchema, "Schema");
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
    final references = await getReferences(builder);
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

Future<SchemaReferences> getReferences(TypeDefinitionBuilder builder) async {
  final typeValue = await builder.resolveIdentifier(_arriSchema, "TypeValues");
  final metadata = await builder.resolveIdentifier(_arriSchema, "SchemaMetadata");
  final type = await builder.resolveIdentifier(_arriSchema, "TypeSchema");
  final enumerator = await builder.resolveIdentifier(_arriSchema, "EnumSchema");
  final properties = await builder.resolveIdentifier(_arriSchema, "PropertiesSchema");
  final elements = await builder.resolveIdentifier(_arriSchema, "ElementsSchema");
  final record = await builder.resolveIdentifier(_arriSchema, "ValuesSchema");
  final discriminator = await builder.resolveIdentifier(_arriSchema, "DiscriminatorSchema");
  final ref = await builder.resolveIdentifier(_arriSchema, "RefSchema");
  final any = await builder.resolveIdentifier(_arriSchema, "EmptySchema");

  return SchemaReferences(
    typeValue: ImportRef.fromIdentifier(typeValue),
    metadata: ImportRef.fromIdentifier(metadata),
    type: ImportRef.fromIdentifier(type),
    properties: ImportRef.fromIdentifier(properties),
    elements: ImportRef.fromIdentifier(elements),
    record: ImportRef.fromIdentifier(record),
    enumerator: ImportRef.fromIdentifier(enumerator),
    discriminator: ImportRef.fromIdentifier(discriminator),
    ref: ImportRef.fromIdentifier(ref),
    any: ImportRef.fromIdentifier(any),
  );
}


class SchemaReferences {
  final ImportRef typeValue;
  final ImportRef metadata;
  final ImportRef type;
  final ImportRef properties;
  final ImportRef elements;
  final ImportRef record;
  final ImportRef discriminator;
  final ImportRef enumerator;
  final ImportRef ref;
  final ImportRef any;
  const SchemaReferences({
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

class ImportRef {
  final Identifier identifier;
  final NamedTypeAnnotationCode code;
  const ImportRef({
    required this.identifier,
    required this.code,
  });

  factory ImportRef.fromIdentifier(Identifier identifier) {
    return ImportRef(
      identifier: identifier,
      code: NamedTypeAnnotationCode(name: identifier),
    );
  }
}