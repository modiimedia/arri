import { type SchemaFormRef } from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    isNullable,
    kotlinClassName,
    type KotlinProperty,
} from './_common';

export function kotlinRefFromSchema(
    schema: SchemaFormRef,
    context: CodegenContext,
): KotlinProperty {
    const typeName = kotlinClassName(schema.ref);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? 'null' : `${prefixedTypeName}.new()`;
    return {
        typeName,
        prefixedTypeName: prefixedTypeName,
        isNullable: nullable,
        defaultValue,
        fromJson(input, key) {
            return `when (${input}) {
                is JsonObject -> ${prefixedTypeName}.fromJsonElement(
                    ${input}!!,
                    "$instancePath/${key}",
                )
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += ${input}?.toJson()`;
            }
            return `${target} += ${input}.toJson()`;
        },
        toQueryString() {
            return `__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
}
