import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    DartProperty,
    getDartClassName,
    outputIsNullable,
    validDartIdentifier,
} from './_common';
import { dartClassFromSchema } from './object';

export function dartSealedClassFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const className = getDartClassName(schema, context);
    const finalClassName = `${context.modelPrefix}${className}`;
    const typeName = isNullable ? `${finalClassName}?` : finalClassName;
    const defaultValue = isNullable ? `null` : `${finalClassName}.empty()`;
    const discriminatorKey = schema.discriminator;
    const subTypeParts: { name: string; value: string }[] = [];
    const subContentParts: string[] = [];
    for (const key of Object.keys(schema.mapping)) {
        const subSchema = schema.mapping[key]!;
        const discriminatorValue = key;
        const subTypeResult = dartClassFromSchema(subSchema, {
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/mapping/${key}`,
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
    const discriminatorProp = validDartIdentifier(schema.discriminator);
    result.content = `sealed class ${finalClassName} implements ArriModel {
    String get ${discriminatorProp};
    const ${finalClassName}();

    factory ${finalClassName}.empty() {
        return ${subTypeParts[0]?.name}.empty();
    }

    factory ${finalClassName}.fromJson(Map<String, dynamic> _input_) {
        final ${discriminatorProp} = typeFromDynamic<String>(_input_["${schema.discriminator}"], "");
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
