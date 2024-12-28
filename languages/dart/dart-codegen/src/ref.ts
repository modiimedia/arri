import { pascalCase, SchemaFormRef } from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    DartProperty,
    outputIsNullable,
    sanitizeIdentifier,
} from './_common';

export function dartRefFromSchema(
    schema: SchemaFormRef,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const className = sanitizeIdentifier(
        pascalCase(schema.ref, { normalize: true }),
    );
    const finalClassName = `${context.modelPrefix}${className}`;
    const typeName = isNullable ? `${finalClassName}?` : finalClassName;
    const defaultValue = isNullable ? `null` : `${finalClassName}.empty()`;
    return {
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
}
