import 'dart:async';
import 'dart:core';
import 'package:macros/macros.dart';
import 'package:collection/collection.dart';

macro class ArriCodable implements ClassDeclarationsMacro, ClassDefinitionMacro {
  const ArriCodable();

  @override
  FutureOr<void> buildDeclarationsForClass(ClassDeclaration clazz, MemberDeclarationBuilder builder) {
   builder.declareInType(
      DeclarationCode.fromString(
        "external void sayHello();"
      )
    );
    builder.declareInLibrary(DeclarationCode.fromString("import 'package:arri_schema/arri_schema.dart';"));
    builder.declareInType(DeclarationCode.fromString("external ArriSchema toTypeDefinition();"));
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
    sayHelloMethod.augment(FunctionBodyCode.fromString("""{
      print("hello world!");
      print("I have the following fields: [${fields.join(", ")}]");
    }"""));

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

    toTypeDefMethod.augment(FunctionBodyCode.fromString("""{
      // ${fieldParts.join(", ")}
      // ${(toTypeDefinition.returnType.code.parts.first as Identifier).name}
      return ArriTypeSchema(type: ArriType.string);
    }"""));
  }
}


