import { type SchemaFormElements } from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    indentTail,
    isNullable,
    type KotlinProperty,
} from './_common';
import { kotlinTypeFromSchema } from './_index';

export function kotlinArrayFromSchema(
    schema: SchemaFormElements,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? 'null' : 'mutableListOf()';
    const subType = kotlinTypeFromSchema(schema.elements, {
        typePrefix: context.typePrefix,
        clientName: context.clientName,
        clientVersion: context.clientVersion,
        instancePath: `${context.instancePath}/[Element]`,
        schemaPath: `${context.schemaPath}/elements`,
        existingTypeIds: context.existingTypeIds,
    });
    const typeName = `MutableList<${subType.prefixedTypeName}${subType.isNullable ? '?' : ''}>`;
    return {
        typeName,
        prefixedTypeName: typeName,
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            return `when (${input}) {
    is JsonArray -> {
        val __value: ${typeName} = mutableListOf()
        for (__element in ${input}!!.jsonArray) {
            __value.add(
                ${indentTail(subType.fromJson('__element'), 16)}
            )
        }
        __value
    }

    else -> ${defaultValue}
}`;
        },
        toJson(input, target) {
            const elementToJson = indentTail(
                subType.toJson('__element', target),
                4,
            );
            if (schema.isNullable) {
                return `if (${input} == null) {
    ${target} += "null"
} else {
    ${target} += "["
    for ((__index, __element) in ${input}.withIndex()) {
        if (__index != 0) {
            ${target} += ","
        }
        ${indentTail(elementToJson, 4)}
    }
    ${target} += "]"
}`;
            }
            return `${target} += "["
for ((__index, __element) in ${input}.withIndex()) {
    if (__index != 0) {
        ${target} += ","
    }
    ${elementToJson}
}
${target} += "]"`;
        },
        toQueryString() {
            return `__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: subType.content,
    };
}
