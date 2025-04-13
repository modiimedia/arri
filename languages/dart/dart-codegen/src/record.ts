import { SchemaFormValues } from '@arrirpc/codegen-utils';

import { CodegenContext, DartProperty, outputIsNullable } from './_common';
import { dartTypeFromSchema } from './_index';

export function dartMapFromSchema(
    schema: SchemaFormValues,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const innerType = dartTypeFromSchema(schema.values, {
        clientName: context.clientName,
        modelPrefix: context.modelPrefix,
        generatedTypes: context.generatedTypes,
        instancePath: `${context.instancePath}/[entry]`,
        schemaPath: `${context.schemaPath}/values`,
        clientVersion: context.clientVersion,
    });
    const typeName = isNullable
        ? `Map<String, ${innerType.typeName}>?`
        : `Map<String, ${innerType.typeName}>`;
    const defaultValue = isNullable ? 'null' : '{}';
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input) {
            if (isNullable) {
                return `${input} is Map<String, dynamic>
                    ? (${input} as Map<String, dynamic>).map(
                        (_key_, _val_) => MapEntry(
                          _key_,
                          ${innerType.fromJson('_val_')},
                        ),
                      )
                    : null`;
            }
            return `${input} is Map<String, dynamic>
                ? (${input} as Map<String, dynamic>).map(
                    (_key_, _val_) => MapEntry(
                      _key_,
                      ${innerType.fromJson('_val_')},
                    ),
                  )
                : <String, ${innerType.typeName}>{}`;
        },
        toJson(input) {
            if (context.isOptional) {
                return `${input}!.map((_key_, _val_) => MapEntry(_key_, ${innerType.toJson('_val_', '', '')},),)`;
            }
            if (schema.isNullable) {
                return `${input}?.map((_key_, _val_) => MapEntry(_key_, ${innerType.toJson('_val_', '', '')},),)`;
            }
            return `${input}.map((_key_, _val_) => MapEntry(_key_, ${innerType.toJson('_val_', '', '')},),)`;
        },
        toQueryString() {
            return `print(
        "[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: innerType.content,
    };
}
