import 'dart:async';
import 'dart:core';
import 'package:macros/macros.dart';
import 'package:collection/collection.dart';


final _arriSchema = Uri.parse("package:arri_schema/arri_schema.dart");
final _dartCore = Uri.parse("dart:core");

macro class ArriModel implements ClassDeclarationsMacro, ClassDefinitionMacro {
  const ArriModel();

  @override
  FutureOr<void> buildDeclarationsForClass(ClassDeclaration clazz, MemberDeclarationBuilder builder) async {
   builder.declareInType(
      DeclarationCode.fromString(
        "external void sayHello();"
      )
    );
    final schema = await builder.resolveIdentifier(_arriSchema, "ArriSchema");
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
    sayHelloMethod.augment(FunctionBodyCode.fromParts(["{\n", printRef, "(\"hello world!\");\n", "}"]));
    final toTypeDefinition = methods.firstWhereOrNull((m) => m.identifier.name == 'toTypeDefinition');
    if(toTypeDefinition == null) return;
    final toTypeDefMethod = await builder.buildMethod(toTypeDefinition.identifier);
    final fieldParts = <String>[];
    for(final field in fields) {
      final type = field.type;
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
          break;
      }
    }
    final typeSchema = await builder.resolveIdentifier(_arriSchema, "ArriTypeSchema");
    final type = await builder.resolveIdentifier(_arriSchema, "ArriType");
    final metadata = await builder.resolveIdentifier(_arriSchema, "ArriSchemaMetadata");

    final typeSchemaRef = NamedTypeAnnotationCode(name: typeSchema);
    final typeRef = NamedTypeAnnotationCode(name: type);
    final metadataRef = NamedTypeAnnotationCode(name: metadata);
    toTypeDefMethod.augment(FunctionBodyCode.fromParts([
      "{\n",
      "    return ",
      typeSchemaRef,
      "(type: ",
      typeRef,
      ".string, nullable: nullable, metadata: ",
      metadataRef,
      "(id: \"${clazz.identifier.name}\"),"
      ");\n",
      "}"
    ]));
  }
}


