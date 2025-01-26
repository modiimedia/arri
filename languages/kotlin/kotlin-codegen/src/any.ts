import { type SchemaFormEmpty } from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    isNullable,
    type KotlinProperty,
} from './_common';

export function kotlinAnyFromSchema(
    schema: SchemaFormEmpty,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? 'null' : 'JsonNull';
    return {
        typeName: 'JsonElement',
        prefixedTypeName: 'JsonElement',
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (context.isOptional) {
                return `when (${input}) {
                    null -> null
                    else -> ${input} 
                }`;
            }
            if (schema.nullable) {
                return `when (${input}) {
                    JsonNull -> null
                    null -> null
                    else -> ${input}
                }`;
            }
            return `when (${input}) {
                is JsonElement -> ${input}!!
                else -> JsonNull
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += when (${input}) {
                    null -> "null"
                    else -> JsonInstance.encodeToString(${input})
                }`;
            }
            return `${target} += JsonInstance.encodeToString(${input})`;
        },
        toQueryString() {
            return `__logError("[WARNING] any's cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
}
