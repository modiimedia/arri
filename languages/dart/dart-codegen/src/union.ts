import {
    isSchemaFormProperties,
    Schema,
    SchemaFormProperties,
    SchemaFormUnion,
} from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    DartProperty,
    getCodeComments,
    getDartClassName,
    outputIsNullable,
    validDartClassName,
    validDartIdentifier,
} from './_common';
import { dartTypeFromSchema } from './_index';
import { dartClassFromSchema } from './object';

export function dartUnionFromSchema(
    schema: SchemaFormUnion,
    context: CodegenContext,
): DartProperty {
    if (schema.tagKey && !schema.valueKey) {
        for (const key of Object.keys(schema.union)) {
            if (!isSchemaFormProperties(schema.union[key])) {
                throw new Error(
                    `Error at ${context.schemaPath}/union/${key}: All union variants must be an object when tagKey is specified without a valueKey`,
                );
            }
        }
        return dartInternallyTaggedSealedClass(
            schema,
            schema.tagKey,
            schema.union as Record<string, SchemaFormProperties>,
            'union',
            context,
        );
    }
    return dartWrappedUnionFromSchema(schema, context);
}

/**
 * Shared by discriminator schemas and internally tagged union schemas.
 * Each variant becomes a subclass that injects the tag into its JSON output.
 */
export function dartInternallyTaggedSealedClass(
    schema: Schema,
    tagKey: string,
    variants: Record<string, SchemaFormProperties>,
    variantsSchemaKey: string,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const className = getDartClassName(schema, context);
    const finalClassName = `${context.modelPrefix}${className}`;
    const typeName = isNullable ? `${finalClassName}?` : finalClassName;
    const defaultValue = isNullable ? `null` : `${finalClassName}.empty()`;
    const discriminatorKey = tagKey;
    const subTypeParts: { name: string; value: string }[] = [];
    const subContentParts: string[] = [];
    for (const key of Object.keys(variants)) {
        const subSchema = variants[key]!;
        const discriminatorValue = key;
        const subTypeResult = dartClassFromSchema(subSchema, {
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/${variantsSchemaKey}/${key}`,
            discriminatorKey,
            discriminatorValue,
            discriminatorParentId: className,
            clientVersion: context.clientVersion,
        });
        subTypeParts.push({
            name: subTypeResult.typeName,
            value: discriminatorValue,
        });
        if (subTypeResult.content) {
            subContentParts.push(subTypeResult.content);
        }
    }
    const result: DartProperty = {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input) {
            if (isNullable) {
                return `${input} is Map<String, dynamic> ? ${finalClassName}.fromJson(${input}) : null`;
            }
            return `${input} is Map<String, dynamic> ? ${finalClassName}.fromJson(${input}) : ${finalClassName}.empty()`;
        },
        toJson(input) {
            if (context.isOptional) {
                return `${input}!.toJson()`;
            }
            if (schema.isNullable) {
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
    const discriminatorProp = validDartIdentifier(tagKey);
    result.content = `sealed class ${finalClassName} implements ArriModel {
    String get ${discriminatorProp};
    const ${finalClassName}();

    factory ${finalClassName}.empty() {
        return ${subTypeParts[0]?.name}.empty();
    }

    factory ${finalClassName}.fromJson(Map<String, dynamic> _input_) {
        final ${discriminatorProp} = typeFromDynamic<String>(_input_["${tagKey}"], "");
        switch (${discriminatorProp}) {
${subTypeParts
    .map(
        (type) => `      case "${type.value}":
        return ${type.name}.fromJson(_input_);`,
    )
    .join('\n')}
          default:
            return ${finalClassName}.empty();
        }
    }
    
    factory ${finalClassName}.fromJsonString(String input) {
        return ${finalClassName}.fromJson(json.decode(input));
    }
}
    
${subContentParts.join('\n\n')}`;
    context.generatedTypes.push(className);
    return result;
}

/**
 * Externally tagged unions (no tagKey) and adjacently tagged unions (tagKey + valueKey).
 * Both wrap the variant value in an object, so each variant becomes a subclass holding a single value field.
 */
function dartWrappedUnionFromSchema(
    schema: SchemaFormUnion,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const className = getDartClassName(schema, context);
    const finalClassName = `${context.modelPrefix}${className}`;
    const typeName = isNullable ? `${finalClassName}?` : finalClassName;
    const defaultValue = isNullable ? `null` : `${finalClassName}.empty()`;
    const result: DartProperty = {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input) {
            if (isNullable) {
                return `${input} is Map<String, dynamic> ? ${finalClassName}.fromJson(${input}) : null`;
            }
            return `${input} is Map<String, dynamic> ? ${finalClassName}.fromJson(${input}) : ${finalClassName}.empty()`;
        },
        toJson(input) {
            if (context.isOptional) {
                return `${input}!.toJson()`;
            }
            if (schema.isNullable) {
                return `${input}?.toJson()`;
            }
            return `${input}.toJson()`;
        },
        toQueryString() {
            return `print(
        "[WARNING] nested unions cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(className)) {
        return result;
    }
    const tagKey = schema.tagKey;
    const tagProp = tagKey ? validDartIdentifier(tagKey) : undefined;
    const valueKey = schema.valueKey ?? 'value';
    const valueProp = validDartIdentifier(valueKey);
    const variants: { key: string; className: string }[] = [];
    const variantContentParts: string[] = [];
    const subContentParts: string[] = [];
    for (const key of Object.keys(schema.union)) {
        const subSchema = schema.union[key]!;
        const variantClassName = `${context.modelPrefix}${validDartClassName(`${className}_${key}`, context.modelPrefix)}`;
        const valueType = dartTypeFromSchema(subSchema, {
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${className}/${key}/${valueKey}`,
            schemaPath: `${context.schemaPath}/union/${key}`,
            clientVersion: context.clientVersion,
        });
        if (valueType.content) {
            subContentParts.push(valueType.content);
        }
        variants.push({ key, className: variantClassName });
        // externally tagged unions use the variant key as the JSON key for the value
        const jsonValueKey = tagKey ? valueKey : key;
        const tagGetter = tagProp
            ? `
  @override
  String get ${tagProp} => "${key}";
`
            : '';
        const toJsonParts = tagProp
            ? `      "${tagKey}": ${tagProp},
      "${jsonValueKey}": ${valueType.toJson(valueProp, '_output_', jsonValueKey)},`
            : `      "${jsonValueKey}": ${valueType.toJson(valueProp, '_output_', jsonValueKey)},`;
        const copyWithParam = valueType.isNullable
            ? `${valueType.typeName} Function()? ${valueProp}`
            : `${valueType.typeName}${valueType.typeName !== 'dynamic' ? '?' : ''} ${valueProp}`;
        const copyWithReturn = valueType.isNullable
            ? `${valueProp}: ${valueProp} != null ? ${valueProp}() : this.${valueProp}`
            : `${valueProp}: ${valueProp} ?? this.${valueProp}`;
        variantContentParts.push(`class ${variantClassName} implements ${finalClassName} {
  final ${valueType.typeName} ${valueProp};
  const ${variantClassName}({
    required this.${valueProp},
  });
${tagGetter}
  factory ${variantClassName}.empty() {
    return ${variantClassName}(
      ${valueProp}: ${valueType.defaultValue},
    );
  }

  factory ${variantClassName}.fromJson(Map<String, dynamic> _input_) {
    final ${valueProp} = ${valueType.fromJson(`_input_["${jsonValueKey}"]`, jsonValueKey)};
    return ${variantClassName}(
      ${valueProp}: ${valueProp},
    );
  }

  factory ${variantClassName}.fromJsonString(String input) {
    return ${variantClassName}.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
${toJsonParts}
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    print(
        "[WARNING] unions cannot be serialized to query params. Skipping ${variantClassName}.");
    return "";
  }

  @override
  ${variantClassName} copyWith({
    ${copyWithParam},
  }) {
    return ${variantClassName}(
      ${copyWithReturn},
    );
  }

  @override
  List<Object?> get props => [
        ${valueProp},
      ];

  @override
  bool operator ==(Object other) {
    return other is ${variantClassName} &&
      listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);

  @override
  String toString() {
    return "${variantClassName} \${toJsonString()}";
  }
}`);
    }
    let fromJsonBody: string;
    if (tagKey && tagProp) {
        fromJsonBody = `    final ${tagProp} = typeFromDynamic<String>(_input_["${tagKey}"], "");
    switch (${tagProp}) {
${variants
    .map(
        (variant) => `      case "${variant.key}":
        return ${variant.className}.fromJson(_input_);`,
    )
    .join('\n')}
      default:
        return ${finalClassName}.empty();
    }`;
    } else {
        fromJsonBody = `${variants
            .map(
                (variant) => `    if (_input_.containsKey("${variant.key}")) {
      return ${variant.className}.fromJson(_input_);
    }`,
            )
            .join('\n')}
    return ${finalClassName}.empty();`;
    }
    result.content = `${getCodeComments(schema.metadata)}sealed class ${finalClassName} implements ArriModel {${tagProp ? `\n  String get ${tagProp};` : ''}
  const ${finalClassName}();

  factory ${finalClassName}.empty() {
    return ${variants[0]?.className}.empty();
  }

  factory ${finalClassName}.fromJson(Map<String, dynamic> _input_) {
${fromJsonBody}
  }

  factory ${finalClassName}.fromJsonString(String input) {
    return ${finalClassName}.fromJson(json.decode(input));
  }
}

${variantContentParts.join('\n\n')}

${subContentParts.join('\n\n')}`;
    context.generatedTypes.push(className);
    return result;
}
