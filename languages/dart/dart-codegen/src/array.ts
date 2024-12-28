import { SchemaFormElements } from '@arrirpc/codegen-utils';

import { CodegenContext, DartProperty, outputIsNullable } from './_common';
import { dartTypeFromSchema } from './_index';

export function dartListFromSchema(
    schema: SchemaFormElements,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const innerType = dartTypeFromSchema(schema.elements, {
        clientName: context.clientName,
        modelPrefix: context.modelPrefix,
        generatedTypes: context.generatedTypes,
        instancePath: `${context.instancePath}/[Element]`,
        schemaPath: `${context.schemaPath}/elements`,
        clientVersion: context.clientVersion,
    });
    const typeName = isNullable
        ? `List<${innerType.typeName}>?`
        : `List<${innerType.typeName}>`;
    const defaultValue = isNullable ? 'null' : '[]';
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input) {
            if (isNullable) {
                return `${input} is List
                ? (${input} as List)
                    .map((_el_) => ${innerType.fromJson(`_el_`)})
                    .toList()
                : null`;
            }
            return `${input} is List
            ? (${input} as List)
                .map((_el_) => ${innerType.fromJson(`_el_`)})
                .toList()
            : <${innerType.typeName}>[]`;
        },
        toJson(input) {
            if (context.isOptional) {
                return `${input}!.map((_el_) => ${innerType.toJson('_el_', '', '')}).toList()`;
            }
            if (schema.nullable) {
                return `${input}?.map((_el_) => ${innerType.toJson('_el_', '', '')}).toList()`;
            }
            return `${input}.map((_el_) => ${innerType.toJson('_el_', '', '')}).toList()`;
        },
        toQueryString() {
            return `print(
        "[WARNING] arrays cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: innerType.content,
    };
}
