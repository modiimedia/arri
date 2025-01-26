import { SchemaFormProperties } from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    DartProperty,
    getCodeComments,
    getDartClassName,
    outputIsNullable,
    validDartIdentifier,
} from './_common';
import { dartTypeFromSchema } from './_index';

export function dartClassFromSchema(
    schema: SchemaFormProperties,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const className = getDartClassName(schema, context);
    const finalClassName = `${context.modelPrefix}${className}`;
    const typeName = isNullable ? `${finalClassName}?` : finalClassName;
    const defaultValue = isNullable ? 'null' : `${finalClassName}.empty()`;
    const result: DartProperty = {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input) {
            if (isNullable) {
                return `${input} is Map<String, dynamic>
                ? ${finalClassName}.fromJson(${input})
                : null`;
            }
            return `${input} is Map<String, dynamic>
            ? ${finalClassName}.fromJson(${input})
            : ${finalClassName}.empty()`;
        },
        toJson(input) {
            if (context.isOptional) {
                return `${input}!.toJson()`;
            }
            if (schema.nullable) {
                return `${input}?.toJson()`;
            }
            return `${input}.toJson()`;
        },
        toQueryString() {
            return `print(
        "[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(className)) {
        return result;
    }
    const propNames: string[] = [];
    const fieldParts: string[] = [];
    const constructorParts: string[] = [];
    const defaultParts: string[] = [];
    const fromJsonParts: string[] = [];
    const toJsonRequiredParts: string[] = [];
    if (context.discriminatorKey && context.discriminatorValue) {
        toJsonRequiredParts.push(
            `      "${context.discriminatorKey}": ${validDartIdentifier(context.discriminatorKey)},`,
        );
    }
    const toJsonOptionalParts: string[] = [];
    const toUrlQueryParts: string[] = [];
    if (context.discriminatorKey && context.discriminatorValue) {
        toUrlQueryParts.push(
            `_queryParts_.add("${context.discriminatorKey}=$${validDartIdentifier(context.discriminatorKey)}");`,
        );
    }
    const copyWithParamParts: string[] = [];
    const copyWithReturnParts: string[] = [];
    const subContentParts: string[] = [];
    for (const key of Object.keys(schema.properties)) {
        const innerSchema = schema.properties[key]!;
        const typeResult = dartTypeFromSchema(innerSchema, {
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${className}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            clientVersion: context.clientVersion,
        });

        const propName = validDartIdentifier(key);
        propNames.push(propName);
        fieldParts.push(
            `${getCodeComments(
                innerSchema.metadata,
                '  ',
            )}  final ${typeResult.typeName} ${propName};`,
        );
        constructorParts.push(`    required this.${propName},`);
        defaultParts.push(`      ${propName}: ${typeResult.defaultValue},`);
        fromJsonParts.push(
            `    final ${propName} = ${typeResult.fromJson(`_input_["${key}"]`, key)};`,
        );
        toJsonRequiredParts.push(
            `      "${key}": ${typeResult.toJson(propName, '', key)},`,
        );
        toUrlQueryParts.push(
            `    ${typeResult.toQueryString(propName, '_queryParts_', key)};`,
        );
        if (typeResult.isNullable) {
            copyWithParamParts.push(
                `    ${typeResult.typeName} Function()? ${propName},`,
            );
            copyWithReturnParts.push(
                `      ${propName}: ${propName} != null ? ${propName}() : this.${propName},`,
            );
        } else {
            copyWithParamParts.push(
                `    ${typeResult.typeName}${typeResult.typeName !== 'dynamic' ? '?' : ''} ${propName},`,
            );
            copyWithReturnParts.push(
                `      ${propName}: ${propName} ?? this.${propName},`,
            );
        }
        if (typeResult.content) {
            subContentParts.push(typeResult.content);
        }
    }
    for (const key of Object.keys(schema.optionalProperties ?? {})) {
        const innerSchema = schema.optionalProperties![key]!;
        const typeResult = dartTypeFromSchema(innerSchema, {
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${className}/${key}`,
            schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
            isOptional: true,
            clientVersion: context.clientVersion,
        });

        const propName = validDartIdentifier(key);
        propNames.push(propName);
        fieldParts.push(
            `${getCodeComments(innerSchema.metadata, '  ')}  final ${typeResult.typeName} ${propName};`,
        );
        constructorParts.push(`    this.${propName},`);
        fromJsonParts.push(
            `    final ${propName} = ${typeResult.fromJson(`_input_["${key}"]`, key)};`,
        );
        toJsonOptionalParts.push(
            `    if (${propName} != null) _output_["${key}"] = ${typeResult.toJson(propName, '_output_', key)};`,
        );
        toUrlQueryParts.push(
            `    ${typeResult.toQueryString(propName, '_queryParts_', key)};`,
        );
        copyWithParamParts.push(
            `  ${typeResult.typeName} Function()? ${propName},`,
        );
        copyWithReturnParts.push(
            `      ${propName}: ${propName} != null ? ${propName}() : this.${propName},`,
        );
        if (typeResult.content) {
            subContentParts.push(typeResult.content);
        }
    }
    let discriminatorPart = '';
    if (context.discriminatorKey && context.discriminatorValue) {
        discriminatorPart = `
    @override
    String get ${validDartIdentifier(context.discriminatorKey)} => "${context.discriminatorValue}";
`;
    }

    result.content = `${getCodeComments(schema.metadata)}class ${finalClassName} implements ${context.discriminatorParentId ? `${context.modelPrefix}${context.discriminatorParentId}` : 'ArriModel'} {
${fieldParts.join('\n')}
  const ${finalClassName}({
${constructorParts.join('\n')}
  });
${discriminatorPart}
  factory ${finalClassName}.empty() {
    return ${finalClassName}(
    ${defaultParts.join('\n')}
    );
  }

  factory ${finalClassName}.fromJson(Map<String, dynamic> _input_) {
${fromJsonParts.join('\n')}
    return ${finalClassName}(
${propNames.map((prop) => `      ${prop}: ${prop},`).join('\n')}
    );
  }

  factory ${finalClassName}.fromJsonString(String input) {
    return ${finalClassName}.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
${toJsonRequiredParts.join('\n')}
    };
${toJsonOptionalParts.join('\n')}
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
${toUrlQueryParts.join('\n')}
    return _queryParts_.join("&");
  }

  @override
  ${finalClassName} copyWith({
${copyWithParamParts.join('\n')}
  }) {
    return ${finalClassName}(
${copyWithReturnParts.join('\n')}
    );
  }

  @override
  List<Object?> get props => [
${propNames.map((prop) => `        ${prop},`).join('\n')}
      ];

  @override
  bool operator ==(Object other) {
    return other is ${finalClassName} &&
      listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);

  @override
  String toString() {
    return "${finalClassName} \${toJsonString()}";
  }
}
  
${subContentParts.join('\n\n')}`;
    context.generatedTypes.push(className);
    return result;
}
