import { type SchemaFormValues } from "@arrirpc/codegen-utils";
import {
    type CodegenContext,
    type KotlinProperty,
    isNullable,
} from "./_common";
import { kotlinTypeFromSchema } from "./_index";

export function kotlinMapFromSchema(
    schema: SchemaFormValues,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const subType = kotlinTypeFromSchema(schema.values, {
        modelPrefix: context.modelPrefix,
        clientName: context.clientName,
        clientVersion: context.clientVersion,
        instancePath: `${context.instancePath}/[value]`,
        schemaPath: `${context.schemaPath}/values`,
        existingTypeIds: context.existingTypeIds,
    });

    const typeName = `MutableMap<String, ${subType.typeName}${subType.isNullable ? "?" : ""}>`;
    const defaultValue = nullable ? "null" : "mutableMapOf()";
    return {
        typeName,
        isNullable: nullable,
        defaultValue,
        fromJson(input, key) {
            return `when (${input}) {
                is JsonObject -> {
                    val __value: ${typeName} = mutableMapOf()
                    for (__entry in ${input}!!.jsonObject.entries) {
                        __value[__entry.key] = ${subType.fromJson("__entry.value", key)}
                    }
                    __value
                }

                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `if (${input} == null) {
                    ${target} += "null"
                } else {
                    ${target} += "{"
                    for ((__index, __entry) in ${input}.entries.withIndex()) {
                        if (__index != 0) {
                            ${target} += ","
                        }
                        ${target} += "\\"\${__entry.key}\\":"
                        ${subType.toJson("__entry.value", target)}
                    }
                    ${target} += "}"
                }`;
            }
            return `${target} += "{"
            for ((__index, __entry) in ${input}.entries.withIndex()) {
                if (__index != 0) {
                    ${target} += ","
                }
                ${target} += "\\"\${__entry.key}\\":"
                ${subType.toJson("__entry.value", target)}
            }
            ${target} += "}"`;
        },
        toQueryString() {
            return `__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: subType.content,
    };
}
